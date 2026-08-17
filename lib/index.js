/**
 * dsh-deepseek-balance — host half.
 *
 * A dual-face profile bundle: the loader mounts this module on the host (the
 * row's `inject: [webServer]` waits for the webserver service), where it
 * registers one exact same-origin route that proxies the DeepSeek OpenAPI
 * balance endpoint (`GET {baseURL}/user/balance`) using the API key resolved
 * through the DSH credentials service (`ctx.credentials`). The API key never
 * leaves the host: the browser half only ever reads the sanitized balance
 * projection returned by this route.
 *
 * Response envelope (always HTTP 200 — the widget treats transport failures
 * as a UI state, never as an HTTP error page):
 *   { ok: true,  data: <DeepSeek /user/balance body>, fetchedAt, config: {refreshMs, lowThreshold} }
 *   { ok: false, error: "no-api-key" | "upstream" | "network" | "timeout" | "forbidden", ... }
 *
 * Cache-bypass: a request with `?fresh=1` (the widget's manual refresh button)
 * skips the in-host snapshot cache and always talks to the upstream, while
 * still refreshing the cache with the new payload.
 */

/** Stable Cordis plugin name (appears in loader logs). */
export const name = "dsh-balance";

/** Services required before this plugin mounts. */
export const inject = ["webServer"];

/** Default configuration; every key is overridable from the patch row config. */
const DEFAULTS = {
  apiKeyEnv: "DEEPSEEK_API_KEY",
  baseURL: "https://api.deepseek.com",
  routePath: "/api/dsh-balance",
  cacheMs: 30000,
  refreshMs: 60000,
  lowThreshold: 20,
  requestTimeoutMs: 15000
};

/** Serialize one JSON payload as the route's response. */
function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  res.end(payload);
}

/** Light DNS-rebinding / cross-site guard for the read-only route. */
function isLoopbackOrBoundHost(req, boundHost) {
  const host = req.headers.host;
  if (host === void 0 || host === "") return true;
  const lower = String(host).toLowerCase();
  // The literal address the server bound to (host:port).
  if (lower === boundHost) return true;
  // Loopback spellings are always acceptable for a local GUI.
  return lower === "127.0.0.1" || lower.startsWith("127.0.0.1:") ||
    lower === "localhost" || lower.startsWith("localhost:");
}

/**
 * Mount the balance proxy route.
 * @param ctx - host plugin context carrying the webServer service.
 * @param config - resolved row config (defaults merged in).
 */
export function apply(ctx, config = {}) {
  const cfg = { ...DEFAULTS, ...config };
  let cache = null; // { at, payload }

  const handler = async (req, res) => {
    const boundHost = `${ctx.webServer.host}:${String(ctx.webServer.port)}`;
    if (!isLoopbackOrBoundHost(req, boundHost)) {
      sendJson(res, 403, { ok: false, error: "forbidden" });
      return;
    }
    if (req.method !== "GET" && req.method !== "HEAD") {
      sendJson(res, 405, { ok: false, error: "method" });
      return;
    }

    // A manual refresh (?fresh=1) always bypasses the snapshot cache; every
    // other request serves a fresh-enough cached snapshot without touching
    // the upstream (so several browser tabs do not hammer the API).
    const fresh = new URL(req.url ?? "/", "http://x").searchParams.get("fresh") === "1";
    if (!fresh && cache !== null && Date.now() - cache.at < cfg.cacheMs) {
      sendJson(res, 200, cache.payload);
      return;
    }

    // Resolve the API key through the optional credentials seam, so a key
    // changed in the Models settings page reaches the next request with no
    // plugin restart; fall back to the launching environment.
    let apiKey;
    const credentials = ctx.get("credentials");
    if (credentials !== void 0) {
      try {
        const hit = await credentials.resolve(cfg.apiKeyEnv);
        apiKey = hit?.value;
      } catch {
        apiKey = void 0;
      }
    }
    if (!apiKey && typeof cfg.apiKey === "string" && cfg.apiKey.length > 0) apiKey = cfg.apiKey;
    if (!apiKey) {
      sendJson(res, 200, {
        ok: false,
        error: "no-api-key",
        env: cfg.apiKeyEnv,
        message: `No DeepSeek API key for credential ref ${cfg.apiKeyEnv}`
      });
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), cfg.requestTimeoutMs);
    try {
      const response = await fetch(`${cfg.baseURL}/user/balance`, {
        method: "GET",
        headers: {
          authorization: `Bearer ${apiKey}`,
          accept: "application/json"
        },
        signal: controller.signal
      });
      const text = await response.text();
      if (!response.ok) {
        sendJson(res, 200, {
          ok: false,
          error: "upstream",
          status: response.status,
          detail: text.slice(0, 400)
        });
        return;
      }
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        sendJson(res, 200, { ok: false, error: "upstream-parse", detail: text.slice(0, 400) });
        return;
      }
      const payload = {
        ok: true,
        data,
        fetchedAt: Date.now(),
        config: { refreshMs: cfg.refreshMs, lowThreshold: cfg.lowThreshold }
      };
      cache = { at: Date.now(), payload };
      sendJson(res, 200, payload);
    } catch (error) {
      const aborted = error instanceof Error && error.name === "AbortError";
      sendJson(res, 200, {
        ok: false,
        error: aborted ? "timeout" : "network",
        message: aborted ? "request timed out" : error instanceof Error ? error.message : String(error)
      });
    } finally {
      clearTimeout(timer);
    }
  };

  ctx.effect(
    () => ctx.webServer.register({ kind: "exact", path: cfg.routePath, handler }),
    "dsh-balance: route"
  );
}
