import { describe, expect, it } from "bun:test";

import { mergeSurfaceFindings } from "@/lib/agents/audit";

describe("mergeSurfaceFindings", () => {
  it("merges multiple submit_findings calls (the vibepass bug)", () => {
    // Reproduces prod: the model split into 3 calls and the LAST one was empty,
    // which previously clobbered the real landing finding → 0 surfaces.
    const merged = mergeSurfaceFindings([
      {
        surfaces: [
          {
            key: "landing",
            present: true,
            files: ["vibepass/src/app/(home)/page.tsx"],
            rationale: "Hero + Explore Events CTA.",
          },
        ],
      },
      { surfaces: [{ key: "onboarding", present: false, files: [], rationale: "none" }] },
      { surfaces: [] },
    ]);

    const landing = merged.find((s) => s.key === "landing");
    expect(landing?.present).toBe(true);
    expect(landing?.files).toEqual(["vibepass/src/app/(home)/page.tsx"]);
  });

  it("handles a single call with all surfaces (the juely all-absent case)", () => {
    const merged = mergeSurfaceFindings([
      {
        surfaces: [
          { key: "landing", present: false, files: [], rationale: "mobile app" },
          { key: "onboarding", present: false, files: [], rationale: "no signup" },
          { key: "paywall", present: false, files: [], rationale: "no pricing" },
        ],
      },
    ]);
    expect(merged).toHaveLength(3);
    expect(merged.every((s) => !s.present)).toBe(true);
  });

  it("keeps the strongest signal per surface (present+files > present > absent)", () => {
    const merged = mergeSurfaceFindings([
      { surfaces: [{ key: "paywall", present: false, files: [], rationale: "" }] },
      { surfaces: [{ key: "paywall", present: true, files: ["app/pricing/page.tsx"], rationale: "" }] },
      { surfaces: [{ key: "paywall", present: true, files: [], rationale: "" }] },
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0]).toMatchObject({
      key: "paywall",
      present: true,
      files: ["app/pricing/page.tsx"],
    });
  });

  it("ignores empty calls and unknown keys, and normalizes missing fields", () => {
    const merged = mergeSurfaceFindings([
      { surfaces: [] },
      {},
      // @ts-expect-error — exercise a malformed key from the model
      { surfaces: [{ key: "checkout", present: true, files: ["x"], rationale: "" }] },
      // @ts-expect-error — exercise missing files/rationale from the model
      { surfaces: [{ key: "landing", present: true }] },
    ]);
    expect(merged).toHaveLength(1);
    expect(merged[0]).toMatchObject({ key: "landing", present: true, files: [], rationale: "" });
  });
});
