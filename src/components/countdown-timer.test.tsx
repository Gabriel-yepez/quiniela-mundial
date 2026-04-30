import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CountdownTimer } from "@/components/countdown-timer";

vi.mock("gsap", () => ({
  default: {
    registerPlugin: vi.fn(),
    to: vi.fn(),
    fromTo: vi.fn(),
  },
}));

vi.mock("@gsap/react", () => ({
  useGSAP: vi.fn((fn: () => void) => {
    fn();
  }),
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
    const numerals = screen.getAllByText(/^\d{2}$/);
    expect(numerals.length).toBeGreaterThanOrEqual(4);
  });
});
