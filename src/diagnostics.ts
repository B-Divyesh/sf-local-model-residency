import type { ResidencyEvent, ScanResult } from "./types";

export function bytes(value: number): string {
  if (!value) return "Not reported";
  const gb = value / 1024 ** 3;
  return `${gb.toFixed(gb >= 10 ? 1 : 2)} GB`;
}

export function makeDiagnostic(scan: ScanResult, events: ResidencyEvent[]): string {
  const lines = [
    "Local Model Residency diagnostic",
    `Scanned: ${scan.scannedAt}`,
    "Prompts and replies: not collected",
    "",
    "Resident models"
  ];
  if (!scan.models.length) lines.push("- None reported");
  for (const model of scan.models) {
    lines.push(`- ${model.id} | ${model.runtime} | model ${bytes(model.sizeBytes)} | GPU ${bytes(model.vramBytes)} | process RAM ${bytes(model.processRamBytes ?? 0)} | process ${model.processName ?? "unknown"} ${model.pid ?? "unknown PID"} | attribution ${model.confidence}`);
  }
  lines.push("", "Runtime checks");
  for (const runtime of scan.runtimes) lines.push(`- ${runtime.name}: ${runtime.state} — ${runtime.detail}`);
  lines.push("", "Recent residency events");
  if (!events.length) lines.push("- No changes recorded yet");
  for (const event of events.slice(0, 20)) lines.push(`- ${event.at} | ${event.kind} | ${event.model} | ${event.runtime} | ${event.detail}`);
  lines.push("", "Attribution is based on runtime status and matching OS processes. Shared GPU memory and client request ownership may be incomplete.");
  return lines.join("\n");
}

export function deriveEvents(previous: ScanResult | null, next: ScanResult, history: ResidencyEvent[] = []): ResidencyEvent[] {
  if (!previous) return next.models.map((model) => ({
    id: crypto.randomUUID(), at: next.scannedAt, kind: "loaded", model: model.id,
    runtime: model.runtime, detail: "First seen during this watch."
  }));
  const before = new Map(previous.models.map((model) => [`${model.runtime}:${model.id}`, model]));
  const after = new Map(next.models.map((model) => [`${model.runtime}:${model.id}`, model]));
  const events: ResidencyEvent[] = [];
  for (const [key, model] of after) {
    if (!before.has(key)) {
      const priorUnload = history.find((event) => event.kind === "unloaded" && event.model === model.id && event.runtime === model.runtime);
      events.push({
        id: crypto.randomUUID(), at: next.scannedAt, kind: priorUnload ? "reloaded" : "loaded", model: model.id, runtime: model.runtime,
        detail: priorUnload ? `Returned after ${model.runtime} unloaded it.` : "Appeared since the last scan."
      });
    }
  }
  for (const [key, model] of before) {
    if (!after.has(key)) events.push({ id: crypto.randomUUID(), at: next.scannedAt, kind: "unloaded", model: model.id, runtime: model.runtime, detail: "No longer appears in the runtime status." });
  }
  return events;
}
