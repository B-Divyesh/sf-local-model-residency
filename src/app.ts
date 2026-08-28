import "./styles.css";
import { mountDashboard } from "./dashboard";
import type { ScanResult } from "./types";

const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `<header class="app-header"><a class="wordmark" href="#main" aria-label="Local Model Residency home"><span class="wordmark-mark" aria-hidden="true"></span><span>Local Model<br><b>Residency</b></span></a><span class="local-badge">Local only</span></header>
<main id="main" class="desktop-main"><div class="app-intro"><div><span class="eyebrow">Memory observatory</span><h1>See what keeps your models loaded</h1><p>For local-model users who need to find memory use and reload churn.</p></div></div><div id="notice" class="notice" hidden role="alert"></div><div id="dashboard"></div></main>`;

const scanner = async (): Promise<ScanResult> => {
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<ScanResult>("scan_local_runtimes");
};
const dashboard = document.querySelector<HTMLElement>("#dashboard")!;
mountDashboard(dashboard, { scanner, autoScan: true });
dashboard.addEventListener("dashboard-error", (event) => {
  const notice = document.querySelector<HTMLElement>("#notice")!;
  notice.hidden = false;
  notice.textContent = `The scan could not finish. ${String((event as CustomEvent).detail)} Check that the runtime is open, then scan again.`;
});
dashboard.addEventListener("demo-started", () => {
  const notice = document.querySelector<HTMLElement>("#notice")!;
  notice.hidden = false;
  notice.classList.add("notice-demo");
  notice.textContent = "Demo — sample data, nothing is saved. Close and reopen the app to return to your computer.";
});
