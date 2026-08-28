import { describe, expect, it } from "vitest";
import { bytes, deriveEvents, makeDiagnostic } from "./diagnostics";
import { sampleEvents, sampleScan } from "./sample";

describe("diagnostics", () => {
  it("formats memory without false precision", () => expect(bytes(5_231_411_712)).toBe("4.87 GB"));
  it("creates prompt-free diagnostics", () => {
    const report = makeDiagnostic(sampleScan, sampleEvents);
    expect(report).toContain("Prompts and replies: not collected");
    expect(report).toContain("Ollama");
  });
  it("finds unload changes", () => {
    const next = { ...sampleScan, models: sampleScan.models.slice(1) };
    expect(deriveEvents(sampleScan, next)[0].kind).toBe("unloaded");
  });
  it("recognises a model returning after an unload", () => {
    const before = { ...sampleScan, models: sampleScan.models.slice(1) };
    expect(deriveEvents(before, sampleScan, sampleEvents)[0].kind).toBe("reloaded");
  });
});
