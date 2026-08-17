// Standalone smoke test for the dsh-deepseek-balance CLIENT bundle.
// Loads lib/client.js exactly as the browser module loader would (factory +
// require), applies it against a fake cordis ctx, captures the registered
// sidebar-footer component, and server-renders it with the REAL react /
// react-dom from the web profile's node_modules.
// Run: node scripts/smoke-client.js
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const profileNodeModules = join(process.env.DSH_HOME ?? join(process.env.USERPROFILE, ".dsh"), "profiles", "web", "node_modules");
const requireProfile = createRequire(pathToFileURL(join(profileNodeModules, "react/package.json")).href);

const React = requireProfile("react");
const JsxRuntime = requireProfile("react/jsx-runtime");
const { renderToStaticMarkup } = requireProfile("react-dom/server");

// --- module-loader harness -------------------------------------------------
let factory = null;
globalThis.window = {
  __ModuleLoader__: {
    load(handoff) {
      if (factory) throw new Error("double load");
      factory = handoff.factory;
      if (handoff.id !== "dsh-deepseek-balance") throw new Error(`unexpected id ${handoff.id}`);
    }
  }
};

const primitivesStub = {
  StateDot: ({ state, className }) => React.createElement("span", { className: `dot-${state} ${className ?? ""}` }),
  IconRefreshOutline14: () => React.createElement("svg", null),
  IconChevronDownOutline14: () => React.createElement("svg", null),
  IconWarningOutline16: () => React.createElement("svg", null),
  useDismissOnOutsidePointer: () => {}
};

const seeds = {
  "react": React,
  "react/jsx-runtime": JsxRuntime,
  "@deepseek-ai/dsh-client-ui-primitives": primitivesStub
};

const code = readFileSync(join(root, "lib/client.js"), "utf8");
(0, eval)(code);
if (!factory) throw new Error("bundle did not register a factory");

const moduleExports = factory((spec) => {
  if (!(spec in seeds)) throw new Error(`bundle required unknown module "${spec}"`);
  return seeds[spec];
});
console.log(`factory exports: ${Object.keys(moduleExports).join(", ")}`);
console.log(`client inject: ${JSON.stringify(moduleExports.inject)}`);

// --- fake client ctx --------------------------------------------------------
let captured = null;
let capturedDicts = null;
const fakeCtx = {
  effect(fn) {
    const cleanup = fn();
    return cleanup;
  },
  locale: {
    register(ns, dicts) {
      capturedDicts = dicts;
      return () => {};
    }
  },
  slots: {
    register(options, component) {
      captured = { options, component };
      return () => {};
    },
    inject(key, factory) {
      if (key !== "sidebar.footer.action") return () => {};
      factory();
      return () => {};
    }
  }
};
moduleExports.apply(fakeCtx);
if (!captured) throw new Error("widget was not registered into sidebar.footer.action");
const { options, component: BalanceWidget } = captured;
console.log(`slot registration: name=${options.name} id=${options.id} order=${options.order} locale=${options.locale}`);

// --- render the widget with a stub translator --------------------------------
const dicts = capturedDicts.zh;
function t(key, params = {}) {
  let template = dicts[key] ?? key;
  for (const [name, value] of Object.entries(params)) template = template.replaceAll(`{${name}}`, String(value));
  return template;
}
const html = renderToStaticMarkup(React.createElement(BalanceWidget, { wide: true, t }));
console.log(`rendered (wide): ${html}`);
if (!html.includes("DeepSeek")) throw new Error("render output missing label");
if (!html.includes("dot-ongoing")) throw new Error("render output missing state dot");
const htmlCollapsed = renderToStaticMarkup(React.createElement(BalanceWidget, { wide: false, t }));
console.log(`rendered (collapsed): ${htmlCollapsed}`);
console.log("\nclient smoke test PASSED");
