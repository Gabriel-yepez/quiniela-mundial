import { render, screen } from "@testing-library/react";

vi.mock("@/components/matches-client", () => ({
  MatchesClient: () => <div data-testid="matches-client" />,
}));

describe("/matches page", () => {
  test("renders heading, metadata and the client loader shell", async () => {
    const pageModule = await import("@/app/(public)/matches/page");

    expect(pageModule.metadata.title).toBe("Partidos");
    expect(pageModule.metadata.alternates?.canonical).toBe("/matches");

    const Page = pageModule.default;
    render(Page());

    expect(screen.getByRole("heading", { name: "Partidos" })).toBeInTheDocument();
    expect(screen.getByTestId("matches-client")).toBeInTheDocument();
  });
});
