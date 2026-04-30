import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import RootLayout from "@/app/layout";

vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "geist-sans" }),
  Geist_Mono: () => ({ variable: "geist-mono" }),
}));

vi.mock("@/components/public-background", () => ({
  PublicBackground: () => <div data-testid="global-background" />,
}));

vi.mock("@/components/providers", () => ({
  Providers: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/navbar", () => ({
  Navbar: () => <div data-testid="navbar" />,
}));

vi.mock("@/components/ui/sonner", () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

vi.mock("@/components/structured-data", () => ({
  StructuredData: () => <div data-testid="structured-data" />,
}));

describe("RootLayout", () => {
  test("mounts the shared animated background from the root layout", () => {
    render(
      <RootLayout>
        <div>App content</div>
      </RootLayout>
    );

    expect(screen.getByTestId("global-background")).toBeInTheDocument();
    expect(screen.getByText("App content")).toBeInTheDocument();
  });
});
