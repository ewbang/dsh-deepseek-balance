// Standalone smoke test for the dsh-deepseek-balance host plugin.
// Simulates the cordis ctx surface the loader provides (webServer register +
// credentials resolve), mounts the plugin, and exercises the route handler
// against the REAL DeepSeek balance API with the user's stored key.
// Run: node scripts/smoke-host.js
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const require = createRequire(import.meta.url);

// --- fake ctx -------------------------------------------------------------
let registered = null;
let resolveCalls = 0;
const fakeCtx = {
  webServer: {
    host: "127.0.0.1",
    port: 3080,
    register(route) {
      if (registered) throw new Error("duplicate route registration");
      registered = route;
      return () => { registered = null; };
    }
  },
  get(name) {
    if (name !== "credentials") return void 0;
    return {
      async resolve(ref) {
        resolveCalls += 1;
        const text = readFileSync(join(process.env.DSH_HOME ?? join(require("os").homedir(), ".dsh"), ".credentials.yaml"), "utf8");
        const match = text.match(new RegExp(`^${ref}\\s*:\\s*(.+)$`, "m"));
        const value = match ? match[1].trim().replace(/^["']|["']$/g, "") : void 0;
        return value ? { value, source: "file" } : void 0;
      }
    };
  },
  effect(callback, label) {
    const cleanup = callback();
    return cleanup;
  }
};

const { apply } = await import(pathToFileURL(join(root, "lib/index.js")).href);
apply(fakeCtx, {});

if (!registered) throw new Error("route was not registered");
console.log(`route registered: ${registered.kind} ${registered.path}`);

// --- fake req/res ----------------------------------------------------------
function makeReq(method, host) {
  return { method, headers: { host } };
}
function makeRes() {
  const chunks = [];
  return {
    _status: 0,
    _headers: null,
    writeHead(status, headers) { this._status = status; this._headers = headers; },
    end(body) { chunks.push(body); },
    get body() { return chunks.join(""); }
  };
}

// 1) forbidden when the Host header is not loopback/bound
{
  const res = makeRes();
  await registered.handler(makeReq("GET", "evil.example:3080"), res);
  const parsed = JSON.parse(res.body);
  console.log(`[1] forbidden guard -> status=${res._status} ok=${parsed.ok} error=${parsed.error} ${parsed.error === "forbidden" ? "PASS" : "FAIL"}`);
}

// 2) real balance fetch with the stored key
{
  const res = makeRes();
  await registered.handler(makeReq("GET", "127.0.0.1:3080"), res);
  const parsed = JSON.parse(res.body);
  console.log(`[2] real balance -> ok=${parsed.ok} error=${parsed.error ?? "-"}`);
  if (parsed.ok) {
    console.log(`    is_available=${parsed.data.is_available}`);
    for (const info of parsed.data.balance_infos ?? []) {
      console.log(`    ${info.currency}: total=${info.total_balance} granted=${info.granted_balance} topped_up=${info.topped_up_balance}`);
    }
    console.log(`    config.refreshMs=${parsed.config.refreshMs} lowThreshold=${parsed.config.lowThreshold}`);
    console.log("[2] PASS");
  } else {
    console.log(`    detail=${parsed.message ?? parsed.detail ?? "-"}`);
    console.log("[2] FAIL (upstream/network issue — key resolution worked if no-key is absent)");
  }
}

// 3) cache hit on the immediate second request
{
  const res = makeRes();
  const before = resolveCalls;
  await registered.handler(makeReq("GET", "127.0.0.1:3080"), res);
  const parsed = JSON.parse(res.body);
  console.log(`[3] cache -> ok=${parsed.ok} resolveCallsDelta=${resolveCalls - before} ${resolveCalls === before ? "PASS (no re-resolve)" : "note (re-resolved)"}`);
}

// 4) method guard
{
  const res = makeRes();
  await registered.handler(makeReq("POST", "127.0.0.1:3080"), res);
  const parsed = JSON.parse(res.body);
  console.log(`[4] method guard -> status=${res._status} error=${parsed.error} ${parsed.error === "method" ? "PASS" : "FAIL"}`);
}

console.log("\nsmoke test done");
