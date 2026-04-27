import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CountdownTimer } from "@/components/countdown-timer";

vi.mock("gsap", () => ({
  default: {
    context: vi.fn((fn: () => void) => {
      fn();
      return { revert: vi.fn() };
    }),
    set: vi.fn(),
    to: vi.fn(),
    fromTo: vi.fn(),
    utils: { random: vi.fn(() => 0) },
  },
}));

describe("CountdownTimer", () => {
  test("renders all four countdown unit labels", () => {
    render(<CountdownTimer />);
    expect(screen.getByText("Dias")).toBeInTheDocument();
    expect(screen.getByText("Horas")).toBeInTheDocument();
    expect(screen.getByText("Min")).toBeInTheDocument();
    expect(screen.getByText("Seg")).toBeInTheDocument();
  });

  test("renders 'Faltan' heading", () => {
    render(<CountdownTimer />);
    expect(screen.getByText("Faltan")).toBeInTheDocument();
  });

  test("renders four numeric values", () => {
    render(<CountdownTimer />);
    // Each unit shows a zero-padded 2-digit number (00–99)
    const numerals = screen.getAllByText(/^\d{2}$/);
    expect(numerals.length).toBeGreaterThanOrEqual(4);
  });
});
