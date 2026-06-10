import type { ReactNode } from "react";
import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { HomeHero } from "@/components/home-hero";

vi.mock("gsap", () => ({
  default: {
    registerPlugin: vi.fn(),
    set: vi.fn(),
    to: vi.fn(),
    timeline: vi.fn(() => ({
      fromTo: vi.fn().mockReturnThis(),
    })),
    quickTo: vi.fn(() => vi.fn()),
    utils: {
      clamp: vi.fn((min: number, max: number, value: number) =>
        Math.min(max, Math.max(min, value))
      ),
    },
  },
}));

vi.mock("@gsap/react", () => ({
  useGSAP: vi.fn((fn: () => void) => {
    fn();
  }),
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/components/countdown-timer", () => ({
  CountdownTimer: () => <div>Countdown</div>,
}));

describe("HomeHero", () => {
  test("keeps rendering the homepage content", () => {
    render(<HomeHero />);

    expect(screen.getByText("Quiniela Mundial")).toBeInTheDocument();
    expect(screen.getByText("Quiniela del Mundial de Fútbol")).toBeInTheDocument();
  });

  test("does not render background ownership inside HomeHero anymore", () => {
    render(<HomeHero />);

    expect(screen.queryByTestId("hero-point-field")).not.toBeInTheDocument();
    expect(screen.queryByTestId("hero-cursor-glow")).not.toBeInTheDocument();
  });
});
