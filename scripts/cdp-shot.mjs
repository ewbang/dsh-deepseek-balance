// CDP driver: open the live DSH GUI headlessly, collect console errors,
// dump the sidebar footer DOM, and save a screenshot.
// Run: node scripts/cdp-shot.mjs <url>
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";

const url = process.argv[2] ?? "http://127.0.0.1:3080";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9333;

const chrome = spawn(CHROME, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  "--window-size=1440,900",
  "--user-data-dir=C:/Users/admin/Desktop/testCode/.chrome-tmp",
  `--remote-debugging-port=${PORT}`,
  "about:blank"
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitForJson(path, tries = 60) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}${path}`);
      if (res.ok) return res.json();
    } catch { /* not up yet */ }
    await sleep(500);
  }
  throw new Error(`CDP ${path} not reachable`);
}

let ws;
let nextId = 1;
const pending = new Map();
const consoleMessages = [];
function send(method, params = {}) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

try {
  const targets = await waitForJson("/json/list");
  const page = targets.find((t) => t.type === "page");
  if (!page) throw new Error("no page target");
  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
      return;
    }
    if (msg.method === "Runtime.consoleAPICalled") {
      const args = (msg.params.args ?? []).map((a) => a.value ?? a.description ?? "").join(" ");
      consoleMessages.push(`[console.${msg.params.type}] ${args}`);
    }
    if (msg.method === "Runtime.exceptionThrown") {
      consoleMessages.push(`[exception] ${msg.params.exceptionDetails?.text ?? ""} ${msg.params.exceptionDetails?.exception?.description ?? ""}`);
    }
  };

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Page.navigate", { url });
  await sleep(18000); // let the app boot and settle

  const evalResult = await send("Runtime.evaluate", {
    expression: `(() => {
      const foot = document.querySelector('[data-slot="sidebar.footer.action"]');
      const sidebar = document.querySelector('[data-slot="sidebar"]');
      const all = document.querySelectorAll('[data-slot]');
      return {
        readyState: document.readyState,
        boot: window.__DSH_BOOT__ ? { rev: window.__DSH_BOOT__.rev, entries: window.__DSH_BOOT__.entries.map(e => e.id) } : null,
        slots: [...all].map((el) => el.getAttribute("data-slot")),
        sidebarHtml: sidebar ? sidebar.outerHTML.slice(0, 3000) : null,
        footerHtml: foot ? foot.outerHTML : null,
        bodySnippet: document.body ? document.body.innerText.slice(0, 400) : null
      };
    })()`,
    returnByValue: true
  });
  const info = evalResult.result.value;
  console.log("=== boot graph ===");
  console.log(JSON.stringify(info.boot, null, 2));
  console.log("=== slots ===");
  console.log(info.slots.join(", "));
  console.log("=== footer slot DOM ===");
  console.log(info.footerHtml ?? "(no sidebar.footer.action slot found)");
  console.log("=== body text (first 400) ===");
  console.log(info.bodySnippet);
  console.log("=== console messages ===");
  console.log(consoleMessages.length ? consoleMessages.join("\n") : "(none)");

  const shot = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync("C:/Users/admin/Desktop/testCode/gui-shot.png", Buffer.from(shot.data, "base64"));
  console.log("=== screenshot saved: gui-shot.png ===");
} finally {
  try { ws?.close(); } catch { /* ignore */ }
  chrome.kill();
}
