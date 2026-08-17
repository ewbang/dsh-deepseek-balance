// CDP geometry probe: measure the sidebar footer layout precisely.
// Run: node scripts/cdp-probe.mjs
import { spawn } from "node:child_process";

const url = process.argv[2] ?? "http://127.0.0.1:3080";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9334;

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
    }
  };
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Page.navigate", { url });
  await sleep(16000);

  const evalResult = await send("Runtime.evaluate", {
    expression: `(() => {
      const rect = (el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
      };
      const style = (el, props) => {
        if (!el) return null;
        const cs = getComputedStyle(el);
        const out = {};
        for (const p of props) out[p] = cs[p];
        return out;
      };
      const foot = document.querySelector('[data-slot="sidebar.footer.action"]');
      const root = document.querySelector('.dsb-root');
      const trigger = document.querySelector('.dsb-trigger');
      const dot = document.querySelector('.dsb-dot');
      const value = document.querySelector('.dsb-value');
      const chevron = document.querySelector('.dsb-chevron');
      const settings = document.querySelector('[data-slot="sidebar.settings"]');
      const settingsBtn = settings ? settings.querySelector('button') : null;
      const sidebarRoot = document.querySelector('[data-slot="sidebar"]');
      // find the footerActions container (parent of the display:contents wrapper)
      let wrapper = foot;
      let actions = wrapper ? wrapper.parentElement : null;
      const footArea = actions ? actions.parentElement : null;
      return {
        viewport: { w: innerWidth, h: innerHeight },
        footerSlot: rect(foot),
        myRoot: rect(root),
        trigger: rect(trigger),
        dot: rect(dot),
        value: rect(value),
        chevron: rect(chevron),
        settingsSlot: rect(settings),
        settingsBtn: rect(settingsBtn),
        sidebar: rect(sidebarRoot),
        actionsContainer: rect(actions),
        footArea: rect(footArea),
        actionsStyle: style(actions, ["display","flexDirection","alignItems","justifyContent","gap","width","flexWrap"]),
        footAreaStyle: style(footArea, ["display","flexDirection","alignItems","width"]),
        myRootStyle: style(root, ["display","width","height","margin","flex","position","alignItems"]),
        triggerStyle: style(trigger, ["display","width","height","padding","margin","gap","fontSize","lineHeight","minHeight","boxSizing"]),
        settingsBtnStyle: style(settingsBtn, ["display","width","height","padding","margin","gap","fontSize","lineHeight","borderRadius"]),
        settingsAreaStyle: style(actions ? actions.nextElementSibling : null, ["display","width"])
      };
    })()`,
    returnByValue: true
  });
  console.log(JSON.stringify(evalResult.result.value, null, 2));
} finally {
  try { ws?.close(); } catch {}
  chrome.kill();
}
