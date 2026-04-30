import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import PublicLayout from "@/app/(public)/layout";
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

vi.mock("@/components/aurora-background", () => ({
  AuroraBackground: () => null,
}));

describe("PublicLayout", () => {
  test("renders public page content without owning the shared background", () => {
    render(
      <PublicLayout>
        <div>Public content</div>
      </PublicLayout>
    );

    expect(screen.getByText("Public content")).toBeInTheDocument();
  });

  test("public layout can host homepage content", () => {
    render(
      <PublicLayout>
        <HomeHero />
      </PublicLayout>
    );

    expect(screen.getByText("Quiniela Mundial")).toBeInTheDocument();
    expect(screen.queryByTestId("public-background")).not.toBeInTheDocument();
  });
});
