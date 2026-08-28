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
  expect(clipboard).toContain("Ollama");
  await context.close();
});

test("@claim:demo-private makes no remote request and stores no demo data", async ({ page }) => {
  const remote: string[] = [];
  page.on("request", (request) => { if (new URL(request.url()).origin !== "http://127.0.0.1:4173") remote.push(request.url()); });
  await page.goto("/demo");
  await page.getByRole("button", { name: "Reset demo" }).click();
  await page.getByRole("button", { name: "Copy diagnostic" }).click();
  expect(remote).toEqual([]);
  expect(await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith("demo:")))).toEqual([]);
});

test("@claim:free-no-account exposes the sample without a sign-in", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Try it with sample data" }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.locator("input[type=email], input[type=password]")).toHaveCount(0);
  await expect(page.getByText("Sample workspace").first()).toBeVisible();
});

test("@claim:installer-checksum serves checksum-verifying installers", async ({ request }) => {
  const shell = await (await request.get("/install.sh")).text();
  expect(shell).toContain('sha256sum "$work_dir/$asset_name"');
  expect(shell).toContain('[ "$actual" = "$expected" ]');
  const powershell = await (await request.get("/install.ps1")).text();
  expect(powershell).toContain("Get-FileHash -Algorithm SHA256");
  expect(powershell).toContain("if ($actual -ne $expected) { Remove-Item $destination;");
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
