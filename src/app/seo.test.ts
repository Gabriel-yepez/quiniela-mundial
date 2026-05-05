import { describe, test, expect, vi, beforeEach } from "vitest";

vi.mock("next/og", () => ({
  ImageResponse: class {},
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    match: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

// ─── robots.txt ───────────────────────────────────────────────────────────────

import robots from "@/app/robots";

describe("robots.txt", () => {
  test("allows all public paths", () => {
    const result = robots();
    expect(result.rules[0].allow).toBe("/");
  });

  test("disallows /admin", () => {
    const result = robots();
    expect(result.rules[0].disallow).toContain("/admin");
  });

  test("disallows /api/", () => {
    const result = robots();
    expect(result.rules[0].disallow).toContain("/api/");
  });

  test("includes a sitemap URL", () => {
    const result = robots();
    expect(result.sitemap).toMatch(/\/sitemap\.xml$/);
  });
});

// ─── sitemap ──────────────────────────────────────────────────────────────────

import sitemap from "@/app/sitemap";
import { prisma } from "@/lib/prisma";

const mockedFindMany = vi.mocked(prisma.match.findMany);

describe("sitemap", () => {
  beforeEach(() => {
    mockedFindMany.mockResolvedValue([]);
  });

  test("includes all required static pages", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    // Homepage URL is the bare domain (no trailing slash)
    expect(urls.some((u) => !new URL(u).pathname || new URL(u).pathname === "/")).toBe(true);
    const pathSuffixes = ["/matches", "/leaderboard", "/rules", "/sign-in"];
    for (const suffix of pathSuffixes) {
      expect(urls.some((u) => u.endsWith(suffix))).toBe(true);
    }
  });

  test("rules page uses a fixed lastModified date (not today)", async () => {
    const entries = await sitemap();
    const rules = entries.find((e) => e.url.endsWith("/rules"));
    expect(rules).toBeDefined();
    const mod = new Date(rules!.lastModified as Date);
    expect(mod.getFullYear()).toBeLessThan(2026);
  });

  test("sign-in page uses a fixed lastModified date (not today)", async () => {
    const entries = await sitemap();
    const signIn = entries.find((e) => e.url.endsWith("/sign-in"));
    expect(signIn).toBeDefined();
    const mod = new Date(signIn!.lastModified as Date);
    expect(mod.getFullYear()).toBeLessThan(2026);
  });

  test("sign-in page has lower priority than rules", async () => {
    const entries = await sitemap();
    const rules = entries.find((e) => e.url.endsWith("/rules"));
    const signIn = entries.find((e) => e.url.endsWith("/sign-in"));
    expect(signIn!.priority).toBeLessThan(rules!.priority!);
  });

  test("includes dynamic match pages from the database", async () => {
    const futureDate = new Date("2026-06-15");
    mockedFindMany.mockResolvedValue([
      { id: "match-abc", dateTime: futureDate },
      { id: "match-xyz", dateTime: futureDate },
    ]);

    const entries = await sitemap();
    const matchUrls = entries.filter((e) => e.url.includes("/matches/"));
    expect(matchUrls).toHaveLength(2);
    expect(matchUrls.map((e) => e.url)).toEqual(
      expect.arrayContaining([
        expect.stringContaining("/matches/match-abc"),
        expect.stringContaining("/matches/match-xyz"),
      ])
    );
  });

  test("returns only static pages when the database errors", async () => {
    mockedFindMany.mockRejectedValue(new Error("DB unavailable"));

    const entries = await sitemap();
    expect(entries.length).toBeGreaterThanOrEqual(5);
    expect(entries.filter((e) => e.url.includes("/matches/"))).toHaveLength(0);
  });
});

// ─── Open Graph image exports ─────────────────────────────────────────────────

import * as ogImage from "@/app/opengraph-image";

describe("opengraph-image", () => {
  test("dimensions are 1200×630", () => {
    expect(ogImage.size).toEqual({ width: 1200, height: 630 });
  });

  test("content type is image/png", () => {
    expect(ogImage.contentType).toBe("image/png");
  });

  test("alt text is set", () => {
    expect(ogImage.alt).toBe("Quiniela Mundial");
  });

  test("uses edge runtime", () => {
    expect(ogImage.runtime).toBe("edge");
  });
});

// ─── /rules page metadata ─────────────────────────────────────────────────────

import { metadata as rulesMetadata } from "@/app/(public)/rules/layout";

describe("/rules metadata", () => {
  test("title is 'Reglas'", () => {
    expect(rulesMetadata.title).toBe("Reglas");
  });

  test("description is set", () => {
    expect(rulesMetadata.description).toBeTruthy();
  });

  test("canonical points to /rules", () => {
    expect(rulesMetadata.alternates?.canonical).toBe("/rules");
  });
});

// ─── /sign-in page metadata ───────────────────────────────────────────────────

import { metadata as signInMetadata } from "@/app/sign-in/layout";

describe("/sign-in metadata", () => {
  test("is not indexed by search engines", () => {
    const robotsDirective = signInMetadata.robots as { index: boolean };
    expect(robotsDirective.index).toBe(false);
  });

  test("canonical points to /sign-in", () => {
    expect(signInMetadata.alternates?.canonical).toBe("/sign-in");
  });

  test("title is set", () => {
    expect(signInMetadata.title).toBeTruthy();
  });
});
