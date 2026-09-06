import { describe, expect, it } from "vitest";
import { retainRecentEvents } from "./dashboard";
import { bytes, deriveEvents, makeDiagnostic } from "./diagnostics";
import { sampleEvents, sampleScan } from "./sample";
import type { ResidencyEvent } from "./types";

describe("diagnostics", () => {
  it("formats memory without false precision", () => expect(bytes(5_231_411_712)).toBe("4.87 GB"));
  it("creates prompt-free diagnostics", () => {
    const report = makeDiagnostic(sampleScan, sampleEvents);
    expect(report).toContain("Prompts and replies: not collected");
    expect(report).toContain("Ollama");
    expect(report).toContain("process RAM 0.57 GB");
  });
  it("finds unload changes", () => {
    const next = { ...sampleScan, models: sampleScan.models.slice(1) };
    expect(deriveEvents(sampleScan, next)[0].kind).toBe("unloaded");
  });
  it("recognises a model returning after an unload", () => {
    const before = { ...sampleScan, models: sampleScan.models.slice(1) };
    expect(deriveEvents(before, sampleScan, sampleEvents)[0].kind).toBe("reloaded");
  });
  it("@claim:event-transitions records an unload and the later reload from scan results", () => {
    const withoutOllama = { ...sampleScan, models: sampleScan.models.slice(1), scannedAt: "2026-08-28T09:48:00.000Z" };
    const unloaded = deriveEvents(sampleScan, withoutOllama);
    expect(unloaded).toHaveLength(1);
    expect(unloaded[0]).toMatchObject({ kind: "unloaded", model: "llama3.2:8b-instruct-q4_K_M", runtime: "Ollama" });
    const restored = deriveEvents(withoutOllama, sampleScan, unloaded);
    expect(restored).toHaveLength(1);
    expect(restored[0]).toMatchObject({ kind: "reloaded", model: "llama3.2:8b-instruct-q4_K_M", runtime: "Ollama" });
  });
  it("@claim:local-history retains the latest 100 residency events", () => {
    const history: ResidencyEvent[] = Array.from({ length: 100 }, (_, index) => ({
      id: `old-${index}`,
      at: "2026-08-28T09:00:00.000Z",
      kind: "loaded",
      model: `old-model-${index}`,
      runtime: "Ollama",
      detail: "Recorded earlier."
    }));
    const latest: ResidencyEvent = { id: "newest", at: "2026-08-28T10:00:00.000Z", kind: "unloaded", model: "latest-model", runtime: "LM Studio", detail: "No longer reported." };
    const retained = retainRecentEvents(history, [latest]);
    expect(retained).toHaveLength(100);
    expect(retained[0]).toEqual(latest);
    expect(retained.some((event) => event.id === "old-0")).toBe(true);
    expect(retained.some((event) => event.id === "old-99")).toBe(false);
  });
});
