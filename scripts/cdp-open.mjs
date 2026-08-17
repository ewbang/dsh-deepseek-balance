// CDP interaction probe: click the balance trigger, then measure the popover.
// Run: node scripts/cdp-open.mjs
import { spawn } from "node:child_process";

const url = process.argv[2] ?? "http://127.0.0.1:3080";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9335;

const chrome = spawn(CHROME, [
  "--headless=new", "--disable-gpu", "--hide-scrollbars", "--window-size=1440,900",
  "--user-data-dir=C:/Users/admin/Desktop/testCode/.chrome-tmp",
  `--remote-debugging-port=${PORT}`, "about:blank"
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitForJson(path, tries = 60) {
  for (let i = 0; i < tries; i++) {
    try { const res = await fetch(`http://127.0.0.1:${PORT}${path}`); if (res.ok) return res.json(); } catch {}
    await sleep(500);
  }
  throw new Error("CDP not reachable");
}

let ws;
let nextId = 1;
const pending = new Map();
const errors = [];
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
  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message)); else resolve(msg.result);
      return;
    }
    if (msg.method === "Runtime.exceptionThrown") {
      errors.push(msg.params.exceptionDetails?.exception?.description ?? msg.params.exceptionDetails?.text ?? "");
    }
  };
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Page.navigate", { url });
  await sleep(16000);

  const collapsedFirst = process.argv[3] === "collapse";
  if (collapsedFirst) {
    const collapsed = await send("Runtime.evaluate", {
      expression: `(() => {
        const toggle = document.querySelector('[aria-label="收起侧边栏"], [aria-label="Collapse sidebar"], .hHd-Xa_toggle');
        if (!toggle) return { ok: false, reason: 'no toggle' };
        toggle.click();
        return { ok: true };
      })()`,
      returnByValue: true
    });
    console.log("collapse toggle:", JSON.stringify(collapsed.result.value));
    await sleep(600);
  }

  const clicked = await send("Runtime.evaluate", {
    expression: `(() => {
      const trigger = document.querySelector('.dsb-trigger');
      if (!trigger) return { ok: false, reason: 'no trigger' };
      trigger.click();
      return { ok: true };
    })()`,
    returnByValue: true
  });
  console.log("click:", JSON.stringify(clicked.result.value));
  await sleep(800);

  const evalResult = await send("Runtime.evaluate", {
    expression: `(() => {
      const rect = (el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), bottom: Math.round(r.bottom), right: Math.round(r.right) };
      };
      const menu = document.querySelector('.dsb-menu');
      const trigger = document.querySelector('.dsb-trigger');
      const topUp = menu ? menu.querySelector('a[href="https://platform.deepseek.com/top_up"]') : null;
      return {
        menu: rect(menu),
        trigger: rect(trigger),
        viewport: { w: innerWidth, h: innerHeight },
        menuText: menu ? menu.innerText : null,
        topUpLink: topUp ? { href: topUp.getAttribute("href"), target: topUp.getAttribute("target"), rel: topUp.getAttribute("rel"), text: topUp.innerText } : null,
        bodyOverflowX: getComputedStyle(document.body).overflowX
      };
    })()`,
    returnByValue: true
  });
  console.log(JSON.stringify(evalResult.result.value, null, 2));
  console.log("page exceptions:", errors.length ? errors.join("\n") : "(none)");
} finally {
  try { ws?.close(); } catch {}
  chrome.kill();
}
