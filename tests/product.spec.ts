import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("@claim:runtime-status shows model ownership and memory", async ({ page }) => {
  await page.goto("/demo");
  await expect(page.getByText("llama3.2:8b-instruct-q4_K_M").first()).toBeVisible();
  await expect(page.getByText("Ollama owns this load")).toBeVisible();
  await expect(page.getByText("4.49 GB", { exact: true })).toBeVisible();
  await expect(page.getByText("Process RAM")).toBeVisible();
  await expect(page.getByText("0.57 GB", { exact: true })).toBeVisible();
});

test("@claim:partial-attribution marks unreported LM Studio GPU memory as partial", async ({ page }) => {
  await page.goto("/demo");
  await page.getByRole("button", { name: /qwen2\.5-coder-7b-instruct/i }).click();
  const evidence = page.locator(".evidence");
  await expect(evidence.getByText("GPU memory", { exact: true })).toBeVisible();
  await expect(evidence.getByText("Not reported", { exact: true })).toBeVisible();
  await expect(evidence.getByText("partial attribution")).toBeVisible();
  await expect(evidence).toContainText("Per-model GPU memory was not reported.");
});

test("@claim:event-source names the reload source", async ({ page }) => {
  await page.goto("/demo");
  const event = page.locator(".event-reloaded");
  await expect(event).toContainText("llama3.2:8b-instruct-q4_K_M");
  await expect(event).toContainText("by Ollama");
});

test("@claim:prompt-free creates a prompt-free diagnostic", async ({ browser }) => {
  const context = await browser.newContext({ permissions: ["clipboard-read", "clipboard-write"] });
  const page = await context.newPage();
  await page.goto("/demo");
  await page.getByRole("button", { name: "Copy diagnostic" }).click();
  await expect(page.getByRole("button", { name: "Diagnostic copied" })).toBeVisible();
  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboard).toContain("Prompts and replies: not collected");
  expect(clipboard).toContain("GPU Not reported");
  expect(clipboard).toContain("Ollama");
  await context.close();
});

test("@claim:diagnostic-copy changes the clipboard only after Copy diagnostic", async ({ browser }) => {
  const context = await browser.newContext({ permissions: ["clipboard-read", "clipboard-write"] });
  const page = await context.newPage();
  await page.goto("/demo");
  await page.evaluate(() => navigator.clipboard.writeText("unchanged until copy"));
  await page.getByRole("button", { name: /qwen2\.5-coder-7b-instruct/i }).click();
  await page.getByRole("button", { name: "Reset demo" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("unchanged until copy");
  await page.getByRole("button", { name: "Copy diagnostic" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("Local Model Residency diagnostic");
  await context.close();
});

test("@claim:demo-private makes no remote request and leaves real storage unchanged", async ({ page }) => {
  const remote: string[] = [];
  page.on("request", (request) => { if (new URL(request.url()).origin !== "http://127.0.0.1:4173") remote.push(request.url()); });
  await page.addInitScript(() => localStorage.setItem("lmr:residency-events:v1", "real-events-must-stay"));
  await page.goto("/demo");
  await page.getByRole("button", { name: "Reset demo" }).click();
  await page.getByRole("button", { name: "Copy diagnostic" }).click();
  expect(remote).toEqual([]);
  expect(await page.evaluate(() => localStorage.getItem("lmr:residency-events:v1"))).toBe("real-events-must-stay");
  expect(await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith("demo:")))).toEqual([]);
  expect(await page.context().cookies()).toEqual([]);
});

test("@claim:free-no-account exposes the free sample without an account or payment action", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Try it with sample data" }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.locator("input[type=email], input[type=password]")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /buy|subscribe|pay/i })).toHaveCount(0);
  await expect(page.getByText("Sample workspace").first()).toBeVisible();
});

test("@claim:no-model-control presents diagnostic controls without model-management actions", async ({ page }) => {
  await page.goto("/demo");
  const controls = await page.locator("#demo-dashboard button, #demo-dashboard a").allTextContents();
  expect(controls.join(" ")).toMatch(/Copy diagnostic/);
  expect(controls.join(" ")).not.toMatch(/serve model|download model|stop model|delete model/i);
});

const releaseFixture = {
  tag_name: "v0.1.0",
  html_url: "https://github.com/B-Divyesh/sf-local-model-residency/releases/tag/v0.1.0",
  assets: [
    { name: "Local.Model.Residency_0.1.0_aarch64.dmg", browser_download_url: "https://downloads.example/aarch64.dmg" },
    { name: "Local.Model.Residency_0.1.0_x86_64.dmg", browser_download_url: "https://downloads.example/x86_64.dmg" },
    { name: "Local.Model.Residency_0.1.0_x64.msi", browser_download_url: "https://downloads.example/windows.msi" },
    { name: "Local.Model.Residency_0.1.0_amd64.AppImage", browser_download_url: "https://downloads.example/linux.AppImage" }
  ]
};

test("@claim:platform-downloads asks Mac visitors to choose the matching architecture", async ({ browser }) => {
  const context = await browser.newContext({ userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 Chrome/130 Safari/537.36" });
  const page = await context.newPage();
  await page.route("https://api.github.com/repos/B-Divyesh/sf-local-model-residency/releases?per_page=1", (route) => route.fulfill({ json: [releaseFixture] }));
  await page.goto("/");
  await expect(page.getByText("Choose your Mac:")).toBeVisible();
  await expect(page.getByRole("link", { name: "Apple silicon" })).toHaveAttribute("href", /aarch64\.dmg$/);
  await expect(page.getByRole("link", { name: "Intel Mac" })).toHaveAttribute("href", /x86_64\.dmg$/);
  await context.close();
});

test("mobile visitors are not offered a desktop Mac installer", async ({ browser }) => {
  const context = await browser.newContext({ userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1" });
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.getByText("Use a macOS, Windows, or Linux computer to install the app.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Download for macOS" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Apple silicon" })).toHaveCount(0);
  await context.close();
});

test("routes have one heading and no serious accessibility findings", async ({ page }) => {
  for (const path of ["/", "/demo", "/privacy", "/terms", "/missing-page"]) {
    await page.goto(path);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((item) => ["serious", "critical"].includes(item.impact ?? ""))).toEqual([]);
  }
});

test("dark treatment has no serious accessibility findings", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
  for (const path of ["/", "/demo"]) {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((item) => ["serious", "critical"].includes(item.impact ?? ""))).toEqual([]);
  }
});

test("back navigation restores the route heading focus", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Try it with sample data" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
});

test("pages load without browser errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  for (const path of ["/", "/demo", "/privacy", "/terms", "/missing-page"]) await page.goto(path);
  expect(errors).toEqual([]);
});

test("keyboard navigation reaches the primary demo action", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  let reached = false;
  for (let index = 0; index < 9; index += 1) {
    await page.keyboard.press("Tab");
    reached ||= await page.getByRole("link", { name: "Try it with sample data" }).evaluate((element) => element === document.activeElement);
  }
  expect(reached).toBe(true);
});

test("mobile demo has no horizontal overflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile project only");
  await page.goto("/demo");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("mobile pages reflow at 200% text size and keep required targets usable", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile project only");
  await page.goto("/demo");
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  for (const selector of [".wordmark", ".demo-banner button", ".demo-banner a", ".footer-links a"]) {
    const boxes = await page.locator(selector).evaluateAll((elements) => elements.map((element) => {
      const box = element.getBoundingClientRect();
      return { width: box.width, height: box.height };
    }));
    expect(boxes.length).toBeGreaterThan(0);
    for (const box of boxes) {
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  }
});
