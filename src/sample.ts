import type { ResidencyEvent, ScanResult } from "./types";

export const sampleScan: ScanResult = {
  scannedAt: "2026-08-28T09:42:18.000Z",
  models: [
    {
      id: "llama3.2:8b-instruct-q4_K_M",
      runtime: "Ollama",
      sizeBytes: 5_231_411_712,
      vramBytes: 4_821_114_880,
      expiresAt: "2026-08-28T09:47:18.000Z",
      processName: "ollama",
      pid: 4812,
      processRamBytes: 612_368_384,
      confidence: "confirmed",
      evidence: "Listed by Ollama /api/ps and matched to the Ollama process."
    },
    {
      id: "qwen2.5-coder-7b-instruct",
      runtime: "LM Studio",
      sizeBytes: 4_684_382_208,
      vramBytes: 4_102_995_968,
      expiresAt: null,
      processName: "LM Studio",
      pid: 7731,
      processRamBytes: 1_284_177_920,
      confidence: "partial",
      evidence: "Listed as loaded by LM Studio. Shared memory can make the process total larger."
    }
  ],
  runtimes: [
    { name: "Ollama", endpoint: "127.0.0.1:11434", state: "connected", detail: "2.0.5 responded in 18 ms" },
    { name: "LM Studio", endpoint: "127.0.0.1:1234", state: "connected", detail: "Local server responded in 11 ms" },
    { name: "Jan", endpoint: "127.0.0.1:1337", state: "unavailable", detail: "No local server answered" }
  ]
};

export const sampleEvents: ResidencyEvent[] = [
  {
    id: "event-1",
    at: "2026-08-28T09:41:52.000Z",
    kind: "reloaded",
    model: "llama3.2:8b-instruct-q4_K_M",
    runtime: "Ollama",
    detail: "Returned 14 seconds after Ollama unloaded it."
  },
  {
    id: "event-2",
    at: "2026-08-28T09:37:21.000Z",
    kind: "unloaded",
    model: "llama3.2:8b-instruct-q4_K_M",
    runtime: "Ollama",
    detail: "Its keep-alive time ended."
  },
  {
    id: "event-3",
    at: "2026-08-28T09:29:04.000Z",
    kind: "loaded",
    model: "qwen2.5-coder-7b-instruct",
    runtime: "LM Studio",
    detail: "First seen during this watch."
  }
];
