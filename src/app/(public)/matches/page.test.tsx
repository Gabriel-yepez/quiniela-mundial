import { render, screen } from "@testing-library/react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    match: {
      findMany: vi.fn(),
    },
    prediction: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/components/match-card", () => ({
  MatchCard: ({ match, prediction }: {
    match: { id: string; homeTeam: { name: string } | null; awayTeam: { name: string } | null };
    prediction?: { homeScore: number; awayScore: number; points: number | null } | null;
  }) => (
    <div data-testid="match-card">
      <span>{match.homeTeam?.name ?? "Por definir"}</span>
      <span>{match.awayTeam?.name ?? "Por definir"}</span>
      {prediction ? <span>{`${prediction.homeScore}-${prediction.awayScore}`}</span> : null}
    </div>
  ),
}));

vi.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <button type="button" data-value={value}>
      {children}
    </button>
  ),
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockedAuth = vi.mocked(auth);
const mockedMatchFindMany = vi.mocked(prisma.match.findMany);
const mockedPredictionFindMany = vi.mocked(prisma.prediction.findMany);

describe("/matches page", () => {
  test("renders the public matches index with metadata and user predictions", async () => {
    mockedAuth.mockResolvedValue({
      user: { id: "user-1", name: "Gabriel", email: "test@example.com" },
      expires: "2099-01-01T00:00:00.000Z",
    });

    mockedMatchFindMany.mockResolvedValue([
      {
        id: "match-1",
        matchNumber: 1,
        stage: "group",
        group: "A",
        dateTime: new Date("2026-06-11T18:00:00.000Z"),
        venue: "Estadio Azteca",
        homeScore: null,
        awayScore: null,
        status: "scheduled",
        homeTeam: { name: "Mexico", code: "MEX", flagUrl: null },
        awayTeam: { name: "Canada", code: "CAN", flagUrl: null },
      },
    ]);

    mockedPredictionFindMany.mockResolvedValue([
      {
        id: "prediction-1",
        userId: "user-1",
        matchId: "match-1",
        homeScore: 2,
        awayScore: 1,
        points: null,
        createdAt: new Date("2026-06-01T00:00:00.000Z"),
        updatedAt: new Date("2026-06-01T00:00:00.000Z"),
      },
    ]);

    const pageModule = await import("@/app/(public)/matches/page");

    expect(pageModule.metadata.title).toBe("Partidos");
    expect(pageModule.metadata.alternates?.canonical).toBe("/matches");

    const Page = pageModule.default;
    render(await Page());

    expect(screen.getByRole("heading", { name: "Partidos" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Grupo A" })).toBeInTheDocument();
    expect(screen.getByText("Mexico")).toBeInTheDocument();
    expect(screen.getByText("Canada")).toBeInTheDocument();
    expect(screen.getByText("2-1")).toBeInTheDocument();
    expect(mockedPredictionFindMany).toHaveBeenCalledWith({ where: { userId: "user-1" } });
  });
});
