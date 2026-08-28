export type ModelRecord = {
  id: string;
  runtime: string;
  sizeBytes: number;
  vramBytes: number;
  expiresAt: string | null;
  processName: string | null;
  pid: number | null;
  processRamBytes: number | null;
  confidence: "confirmed" | "partial";
  evidence: string;
};

export type RuntimeRecord = {
  name: string;
  endpoint: string;
  state: "connected" | "limited" | "unavailable";
  detail: string;
};

export type ResidencyEvent = {
  id: string;
  at: string;
  kind: "loaded" | "unloaded" | "reloaded";
  model: string;
  runtime: string;
  detail: string;
};

export type ScanResult = {
  scannedAt: string;
  models: ModelRecord[];
  runtimes: RuntimeRecord[];
};
