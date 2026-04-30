import { useLayoutEffect } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { PublicBackground } from "@/components/public-background";

const gsapMocks = vi.hoisted(() => {
  const glowXTo = vi.fn();
  const glowYTo = vi.fn();

  return {
    glowXTo,
    glowYTo,
    registerPlugin: vi.fn(),
    set: vi.fn(),
    to: vi.fn(),
    quickTo: vi.fn((_: Element, property: string) => {
      return property === "x" ? glowXTo : glowYTo;
    }),
    matchMediaRevert: vi.fn(),
    matchMediaAdd: vi.fn((_: unknown, callback: (context: unknown) => void) => {
      callback({
        conditions: {
          finePointer: true,
          reduceMotion: false,
        },
      });
    }),
  };
});

vi.mock("gsap", () => ({
  default: {
    registerPlugin: gsapMocks.registerPlugin,
    set: gsapMocks.set,
    to: gsapMocks.to,
    quickTo: gsapMocks.quickTo,
    matchMedia: vi.fn(() => ({
      add: gsapMocks.matchMediaAdd,
      revert: gsapMocks.matchMediaRevert,
    })),
  },
}));

vi.mock("@gsap/react", () => ({
  useGSAP: vi.fn(
    (
      callback: (
        context: unknown,
        contextSafe: <T extends (...args: never[]) => void>(handler: T) => T
      ) => void
    ) => {
      useLayoutEffect(() => {
        callback({}, (handler) => handler);
      }, [callback]);
    }
  ),
}));

vi.mock("@/components/aurora-background", () => ({
  AuroraBackground: () => null,
}));

describe("PublicBackground", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
  });

  test("reacts to global pointer movement so the cursor glow still works behind app content", () => {
    render(<PublicBackground />);

    const background = screen.getByTestId("public-background");

    vi.spyOn(background, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      width: 1200,
      height: 800,
      right: 1200,
      bottom: 800,
      toJSON: () => ({}),
    });

    fireEvent.pointerMove(window, { clientX: 320, clientY: 180 });

    expect(gsapMocks.to).toHaveBeenCalledWith(
      expect.any(HTMLDivElement),
      expect.objectContaining({
        opacity: 0.75,
        duration: 0.24,
        ease: "power2.out",
      })
    );
    expect(gsapMocks.glowXTo).toHaveBeenCalledWith(320);
    expect(gsapMocks.glowYTo).toHaveBeenCalledWith(180);
  });
});
