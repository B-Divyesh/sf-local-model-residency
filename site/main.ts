import "./site.css";
import { mountDashboard } from "../src/dashboard";

const app = document.querySelector<HTMLDivElement>("#app")!;
const repoUrl = "https://github.com/B-Divyesh/sf-local-model-residency";

const header = () => `<header class="site-header"><a class="wordmark" href="/" data-link aria-label="Local Model Residency home"><span class="wordmark-mark" aria-hidden="true"></span><span>Local Model<br><b>Residency</b></span></a><nav class="site-nav" aria-label="Main navigation"><a href="/demo" data-link>Demo</a><a href="/#how">How it works</a><a href="/privacy" data-link>Privacy</a><a href="/#download" class="button button-quiet">Download</a></nav></header>`;
const footer = () => `<footer class="site-footer"><p>Local model memory, explained in plain words.</p><nav class="footer-links" aria-label="Legal"><a href="/privacy" data-link>Privacy</a><a href="/terms" data-link>Terms</a></nav><p>Built by Param Factory · original generated art · v0.1.0</p></footer>`;

function homePage() {
  return `${header()}<main id="main">
    <section class="hero">
      <div class="hero-copy"><span class="eyebrow">A local desktop utility</span><h1 tabindex="-1">See what keeps your models loaded</h1><p class="hero-lede">For local-model users who need to find memory use and reload churn.</p>
        <div class="hero-actions"><a class="button button-primary" href="/demo" data-link>Try it with sample data</a><small>It opens a private sample workspace. Nothing is saved.</small></div>
        <ul class="plain-facts"><li>Reads local runtime status</li><li>Never reads prompts or replies</li><li>Free, with no account</li></ul>
      </div>
      <div class="hero-art"><picture><source media="(max-width: 620px)" srcset="/assets/hero-ceramics-720.webp"><img src="/assets/hero-ceramics.webp" width="1200" height="800" fetchpriority="high" alt="Three ceramic vessels rest inside ice while one small vessel sits outside." /></picture><span class="art-note">Stable models stay nested. A reload breaks the quiet.</span></div>
    </section>
    <section class="preview-section" aria-labelledby="preview-title"><div class="preview-wrap"><div class="section-heading"><div><span class="eyebrow">The product</span><h2 id="preview-title">One view for every local load</h2></div><p>See runtime ownership, GPU memory, process memory, and recent changes together.</p></div><div id="preview-dashboard"></div></div></section>
    <section class="how" id="how" aria-labelledby="how-title"><div class="section-inner"><span class="eyebrow">How it works</span><h2 id="how-title">Follow the load, not the guess</h2><ol class="step-list"><li><h3>Open your runtimes</h3><p>Keep Ollama, LM Studio, or Jan running as usual.</p></li><li><h3>Scan local status</h3><p>The app matches reported models to runtime processes on your computer.</p></li><li><h3>Read the changes</h3><p>Loads and unloads show which runtime changed and when.</p></li></ol></div></section>
    <section class="walkthrough" aria-labelledby="walkthrough-title"><div class="section-inner"><span class="eyebrow">Desktop walkthrough</span><h2 id="walkthrough-title">From empty view to clear evidence</h2><div class="frames"><figure class="frame"><div class="frame-shot"><img src="/assets/walkthrough-empty.webp" width="960" height="600" loading="lazy" alt="The empty desktop app before its first runtime scan." /></div><figcaption><strong>1. Start with a clean watch.</strong>No process or model appears before a scan.</figcaption></figure><figure class="frame"><div class="frame-shot"><img src="/assets/walkthrough-resident.webp" width="960" height="600" loading="lazy" alt="The desktop app showing two resident models and their memory use." /></div><figcaption><strong>2. Select a resident model.</strong>Read the runtime, memory, process, and evidence.</figcaption></figure><figure class="frame"><div class="frame-shot"><img src="/assets/walkthrough-events.webp" width="960" height="600" loading="lazy" alt="The desktop app showing reload and unload events." /></div><figcaption><strong>3. Find the reload source.</strong>The event list names the model and runtime.</figcaption></figure></div></div></section>
    <section class="boundaries" aria-labelledby="boundaries-title"><div class="section-inner boundary-grid"><div><span class="eyebrow">Clear limits</span><h2 id="boundaries-title">It watches memory, not conversations</h2></div><ul class="boundary-list"><li><div><strong>No prompt or reply access</strong><p>The app asks only local status endpoints and OS process lists.</p></div></li><li><div><strong>No model downloads</strong><p>Use your current model runner to add or remove models.</p></div></li><li><div><strong>No hidden certainty</strong><p>Shared memory and missing client ownership are marked as partial.</p></div></li></ul></div></section>
    <section class="download-section" id="download" aria-labelledby="download-title"><div class="download-panel"><div><span class="eyebrow">Free desktop app</span><h2 id="download-title">Watch your own computer</h2><p>Choose your platform. Builds are unsigned until the release certificates are added.</p></div><div class="download-actions"><a id="download-button" class="button button-primary" href="${repoUrl}/releases">View desktop releases</a><span id="download-status" class="download-status">Checking published builds…</span></div></div></section>
  </main>${footer()}`;
}

function demoPage() {
  return `<div class="demo-banner" role="status"><strong>Demo — sample data, nothing is saved</strong><button id="reset-demo">Reset demo</button><a href="/#download">Start for real</a></div>${header()}<main id="main" class="demo-page"><div class="demo-intro"><div><span class="eyebrow">Sample workspace</span><h1 tabindex="-1">Find the source of a model reload</h1></div><p>Select each model to see its memory evidence. Then copy the prompt-free diagnostic.</p></div><div id="demo-dashboard"></div></main>${footer()}`;
}

function privacyPage() {
  return `${header()}<main id="main" class="legal"><span class="eyebrow">Privacy</span><h1 tabindex="-1">Your model activity stays on your computer</h1><p>Local Model Residency reads runtime status from loopback addresses. It reads matching process names, IDs, and memory totals from your operating system.</p><h2>What the app does not read</h2><p>The app does not read prompts, replies, model files, chat history, or account data. It has no analytics or telemetry.</p><h2>What the app stores</h2><p>The desktop app stores up to 100 residency events on your computer. A copied diagnostic leaves the app only when you paste or share it.</p><p>The website stores release metadata for up to one hour. Demo data stays in memory and disappears when you leave the page.</p><h2>Network access</h2><p>The desktop app contacts supported runtimes only on your loopback network. The download page asks the public GitHub API for release files. No other service receives product activity.</p><p>Questions: <a href="mailto:privacy@sociobot.in">privacy@sociobot.in</a>.</p></main>${footer()}`;
}

function termsPage() {
  return `${header()}<main id="main" class="legal"><span class="eyebrow">Terms</span><h1 tabindex="-1">Use the diagnostic as supporting evidence</h1><p>Local Model Residency is free software provided under the MIT License. You may use, inspect, change, and redistribute it under that license.</p><h2>Attribution has limits</h2><p>Runtime and operating-system reports can be incomplete. Shared GPU memory can differ from process memory. Confirm important decisions with your runtime's own tools.</p><h2>No model control</h2><p>The app observes status. It does not serve, download, stop, or delete models.</p><h2>No warranty</h2><p>The software is provided “as is,” without warranty. The full license is included with every source release.</p></main>${footer()}`;
}

function notFoundPage() {
  return `${header()}<main id="main" class="not-found"><span class="not-found-mark" aria-hidden="true"></span><span class="eyebrow">404 · Nothing resident here</span><h1 tabindex="-1">This page has unloaded</h1><p>The address does not match a page in this app.</p><p><a class="button button-primary" href="/" data-link>Return home</a></p></main>${footer()}`;
}

const routeMeta: Record<string, [string, string]> = {
  "/": ["Local Model Residency — Find model memory use", "See which local runtime holds each model, how much memory it uses, and when it reloads. No prompts collected."],
  "/demo": ["Demo — Local Model Residency", "Try model memory diagnostics with private sample data."],
  "/privacy": ["Privacy — Local Model Residency", "What Local Model Residency reads, stores, and sends."],
  "/terms": ["Terms — Local Model Residency", "Terms for the Local Model Residency desktop app."]
};

async function setupDownloads() {
  const button = document.querySelector<HTMLAnchorElement>("#download-button");
  const status = document.querySelector<HTMLElement>("#download-status");
  if (!button || !status) return;
  const os = /Mac/i.test(navigator.userAgent) ? "macOS" : /Win/i.test(navigator.userAgent) ? "Windows" : "Linux";
  const matcher = os === "macOS" ? /\.(dmg|app\.tar\.gz)$/i : os === "Windows" ? /\.(msi|exe)$/i : /\.(AppImage|deb)$/i;
  try {
    const cached = localStorage.getItem("lmr:release:v1");
    let release: { savedAt: number; tag_name: string; html_url: string; assets: { name: string; browser_download_url: string }[] } | null = cached ? JSON.parse(cached) : null;
    if (!release || Date.now() - release.savedAt > 3_600_000) {
      const response = await fetch("https://api.github.com/repos/B-Divyesh/sf-local-model-residency/releases?per_page=1", { headers: { Accept: "application/vnd.github+json" } });
      if (!response.ok) throw new Error("Release check unavailable");
      const data = await response.json();
      if (!Array.isArray(data) || !data[0]) throw new Error("No release");
      release = { ...data[0], savedAt: Date.now() }; localStorage.setItem("lmr:release:v1", JSON.stringify(release));
    }
    const asset = release.assets.find((item) => matcher.test(item.name));
    if (!asset) throw new Error("Platform build pending");
    button.href = asset.browser_download_url; button.textContent = `Download for ${os}`; status.textContent = `${release.tag_name} · ${asset.name}`;
  } catch {
    button.href = `${repoUrl}/releases`; button.textContent = "View desktop releases"; status.textContent = `The ${os} download is being published.`;
  }
}

function bindLinks() {
  document.querySelectorAll<HTMLAnchorElement>("a[data-link]").forEach((link) => link.addEventListener("click", (event) => {
    if (link.origin !== location.origin) return;
    event.preventDefault(); history.pushState({}, "", link.pathname + link.search + link.hash); render(true);
  }));
}

function render(focusHeading = false) {
  const path = location.pathname.replace(/\/$/, "") || "/";
  const known = Object.hasOwn(routeMeta, path);
  app.innerHTML = path === "/" ? homePage() : path === "/demo" ? demoPage() : path === "/privacy" ? privacyPage() : path === "/terms" ? termsPage() : notFoundPage();
  const meta = routeMeta[path] ?? ["Page not found — Local Model Residency", "This page could not be found."];
  document.title = meta[0];
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute("content", meta[1]);
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute("href", `https://local-model-residency.sociobot.in${known ? path : "/404"}`);
  bindLinks();
  if (path === "/") { mountDashboard(document.querySelector<HTMLElement>("#preview-dashboard")!, { demo: true, embedded: true }); void setupDownloads(); }
  if (path === "/demo") {
    const controller = mountDashboard(document.querySelector<HTMLElement>("#demo-dashboard")!, { demo: true });
    document.querySelector<HTMLButtonElement>("#reset-demo")?.addEventListener("click", () => controller.resetDemo());
  }
  requestAnimationFrame(() => {
    const h1 = document.querySelector<HTMLElement>("h1");
    if (focusHeading) h1?.focus({ preventScroll: true });
    document.querySelector<HTMLElement>("#route-status")!.textContent = document.title;
  });
}

addEventListener("popstate", () => render(true));
render();
if ("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => undefined));
