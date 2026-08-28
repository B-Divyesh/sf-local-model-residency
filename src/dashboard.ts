import { bytes, deriveEvents, makeDiagnostic } from "./diagnostics";
import { sampleEvents, sampleScan } from "./sample";
import type { ResidencyEvent, ScanResult } from "./types";

type DashboardOptions = {
  demo?: boolean;
  embedded?: boolean;
  autoScan?: boolean;
  scanner?: () => Promise<ScanResult>;
};

const escapeHtml = (value: string) => value.replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]!);

function modelTemplate(model: ScanResult["models"][number], active: boolean): string {
  const percent = Math.min(100, Math.max(10, Math.round(model.vramBytes / 8_589_934_592 * 10) * 10));
  return `<button class="model-row${active ? " is-active" : ""}" data-model="${escapeHtml(model.id)}" aria-pressed="${active}">
    <span class="model-glyph fill-${percent}" aria-hidden="true"><i></i></span>
    <span class="model-name"><strong>${escapeHtml(model.id)}</strong><small>${escapeHtml(model.runtime)} · ${bytes(model.vramBytes)} GPU</small></span>
    <span class="state-word"><span aria-hidden="true">●</span> Resident</span>
  </button>`;
}

function runtimeTemplate(runtime: ScanResult["runtimes"][number]): string {
  return `<li><span class="runtime-state runtime-${runtime.state}" aria-hidden="true"></span><span><strong>${escapeHtml(runtime.name)}</strong><small>${escapeHtml(runtime.endpoint)} · ${escapeHtml(runtime.detail)}</small></span><b>${runtime.state}</b></li>`;
}

function eventTemplate(event: ResidencyEvent): string {
  const time = new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit" }).format(new Date(event.at));
  return `<li class="event event-${event.kind}"><span class="event-mark" aria-hidden="true"></span><div><strong>${escapeHtml(event.model)}</strong><p><span>${escapeHtml(event.kind)}</span> by ${escapeHtml(event.runtime)} · ${escapeHtml(event.detail)}</p></div><time datetime="${event.at}">${time}</time></li>`;
}

export function mountDashboard(host: HTMLElement, options: DashboardOptions = {}) {
  let demo = Boolean(options.demo || options.embedded);
  let scan: ScanResult | null = demo ? structuredClone(sampleScan) : null;
  let events: ResidencyEvent[] = demo ? structuredClone(sampleEvents) : [];
  let selected = scan?.models[0]?.id ?? null;
  let busy = false;
  const storageKey = "lmr:residency-events:v1";

  if (!demo && !options.embedded) {
    try { events = JSON.parse(localStorage.getItem(storageKey) || "[]") as ResidencyEvent[]; } catch { events = []; }
  }

  const render = () => {
    const selectedModel = scan?.models.find((model) => model.id === selected) ?? scan?.models[0];
    const desktopDemo = demo && !options.demo && !options.embedded;
    host.innerHTML = `${desktopDemo ? `<div class="in-app-demo" role="status"><strong>Demo — sample data, nothing is saved</strong><span><button data-action="reset">Reset demo</button><button data-action="real">Start for real</button></span></div>` : ""}<section class="observatory${options.embedded ? " observatory-embedded" : ""}" aria-label="Model residency monitor">
      ${!options.embedded ? `<div class="observatory-tools">
        <div><span class="eyebrow">Local watch</span><strong>${demo ? "Sample workspace" : "This computer"}</strong></div>
        <div class="tool-actions">
          ${!demo ? '<button class="button button-primary" data-action="scan">Scan runtimes</button>' : ''}
          ${!demo ? '<button class="button button-quiet" data-action="sample">Load sample project</button>' : ''}
          <button class="button button-quiet" data-action="copy" ${scan ? "" : "disabled"}>Copy diagnostic</button>
        </div>
      </div>` : ""}
      <div class="status-line" role="status" aria-live="polite">
        <span><i class="status-dot"></i>${busy ? "Scanning local runtimes…" : scan ? `${scan.models.length} resident models found` : "No scan yet"}</span>
        <small>${scan ? `Checked ${new Intl.DateTimeFormat("en", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(scan.scannedAt))}` : "Run a scan or load the sample project."}</small>
      </div>
      <div class="observatory-grid">
        <section class="resident-pane" aria-labelledby="resident-title">
          <div class="pane-heading"><div><span class="eyebrow">Now</span><h2 id="resident-title">Resident models</h2></div><span class="count">${scan?.models.length ?? 0}</span></div>
          <div class="model-list">${scan?.models.length ? scan.models.map((model) => modelTemplate(model, model.id === (selectedModel?.id ?? ""))).join("") : `<div class="empty-state"><span class="empty-vessel" aria-hidden="true"></span><h3>No resident models yet</h3><p>Scan the runtimes running on this computer. Loaded models will appear here.</p>${!options.embedded ? '<button class="text-button" data-action="scan">Scan runtimes</button>' : ""}</div>`}</div>
          ${selectedModel ? `<div class="evidence" aria-live="polite">
            <span class="eyebrow">Why we think this</span>
            <h3>${escapeHtml(selectedModel.runtime)} owns this load</h3>
            <dl><div><dt>Model memory</dt><dd>${bytes(selectedModel.sizeBytes)}</dd></div><div><dt>GPU memory</dt><dd>${bytes(selectedModel.vramBytes)}</dd></div><div><dt>Process RAM</dt><dd>${bytes(selectedModel.processRamBytes ?? 0)}</dd></div><div><dt>OS process</dt><dd>${escapeHtml(selectedModel.processName ?? "Not matched")}${selectedModel.pid ? ` · PID ${selectedModel.pid}` : ""}</dd></div></dl>
            <p><span class="confidence confidence-${selectedModel.confidence}">${selectedModel.confidence} attribution</span> ${escapeHtml(selectedModel.evidence)}</p>
          </div>` : ""}
        </section>
        <section class="event-pane" aria-labelledby="event-title">
          <div class="pane-heading"><div><span class="eyebrow">Changes</span><h2 id="event-title">Residency events</h2></div><span class="count count-warm">${events.length}</span></div>
          ${events.length ? `<ol class="event-list">${events.map(eventTemplate).join("")}</ol>` : `<div class="empty-state"><span class="empty-rings" aria-hidden="true"></span><h3>No changes recorded</h3><p>Keep the app open. Loads and unloads will appear after each scan.</p></div>`}
          ${scan ? `<div class="runtime-checks"><h3>Runtime checks</h3><ul>${scan.runtimes.map(runtimeTemplate).join("")}</ul><p>Missing client ownership is marked as partial. The app never guesses silently.</p></div>` : ""}
        </section>
      </div>
    </section>`;
    bind();
  };

  const runScan = async () => {
    if (busy || !options.scanner || demo) return;
    busy = true; render();
    try {
      const next = await options.scanner();
      const changes = deriveEvents(scan, next, events);
      events = [...changes, ...events].slice(0, 100);
      scan = next;
      selected = next.models[0]?.id ?? null;
      try { localStorage.setItem(storageKey, JSON.stringify(events)); } catch { /* The live view still works when storage is unavailable. */ }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      host.dispatchEvent(new CustomEvent("dashboard-error", { detail: message }));
    } finally { busy = false; render(); }
  };

  const copyReport = async () => {
    if (!scan) return;
    const report = makeDiagnostic(scan, events);
    try { await navigator.clipboard.writeText(report); }
    catch {
      const area = document.createElement("textarea"); area.value = report; document.body.append(area); area.select(); document.execCommand("copy"); area.remove();
    }
    const button = host.querySelector<HTMLButtonElement>('[data-action="copy"]');
    if (button) { button.textContent = "Diagnostic copied"; setTimeout(() => { button.textContent = "Copy diagnostic"; }, 1800); }
  };

  const bind = () => {
    host.querySelectorAll<HTMLButtonElement>("[data-model]").forEach((button) => button.addEventListener("click", () => { selected = button.dataset.model ?? null; render(); }));
    host.querySelectorAll<HTMLButtonElement>('[data-action="scan"]').forEach((button) => button.addEventListener("click", runScan));
    host.querySelector<HTMLButtonElement>('[data-action="sample"]')?.addEventListener("click", () => { demo = true; scan = structuredClone(sampleScan); events = structuredClone(sampleEvents); selected = scan.models[0].id; render(); host.dispatchEvent(new CustomEvent("demo-started")); });
    host.querySelector<HTMLButtonElement>('[data-action="reset"]')?.addEventListener("click", resetDemo);
    host.querySelector<HTMLButtonElement>('[data-action="real"]')?.addEventListener("click", () => {
      demo = false;
      scan = null;
      selected = null;
      try { events = JSON.parse(localStorage.getItem(storageKey) || "[]") as ResidencyEvent[]; } catch { events = []; }
      render();
      host.dispatchEvent(new CustomEvent("demo-ended"));
      void runScan();
    });
    host.querySelector<HTMLButtonElement>('[data-action="copy"]')?.addEventListener("click", copyReport);
  };

  const resetDemo = () => { demo = true; scan = structuredClone(sampleScan); events = structuredClone(sampleEvents); selected = scan.models[0].id; render(); };
  render();
  if (options.autoScan && options.scanner) {
    window.setTimeout(runScan, 500);
    window.setInterval(runScan, 12_000);
  }
  return { resetDemo };
}
