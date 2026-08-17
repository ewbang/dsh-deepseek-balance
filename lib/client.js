window.__ModuleLoader__.load({
	id: "dsh-deepseek-balance",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region \0dsh-css:dsh-deepseek-balance/BalanceWidget.module.css
		const css = ".dsb-root{flex:none;align-items:center;width:100%;height:42px;margin:8px 0 0;display:flex;position:relative}.dsb-rootRail{width:36px;height:36px;margin:0}.dsb-footerButtons{align-items:center;width:100%;display:flex}.dsb-trigger{box-sizing:border-box;width:calc(100% + 4px);height:42px;color:var(--dsw-alias-label-primary);cursor:pointer;background:0 0;border:none;border-radius:12px;align-items:center;gap:8px;margin:0 -2px;padding:0 10px 0 8px;font-family:inherit;font-size:14px;display:inline-flex;overflow:hidden}.dsb-trigger:hover,.dsb-trigger[data-active]{background:var(--dsw-alias-interactive-bg-hover)}.dsb-rootRail .dsb-trigger{border-radius:50%;justify-content:center;gap:0;width:36px;height:36px;padding:0}.dsb-dot{flex:none}.dsb-label{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}.dsb-value{color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;flex:none;margin-left:auto;font-size:12px;line-height:16px}.dsb-chevron{color:var(--dsw-alias-label-tertiary);flex:none;display:inline-flex}.dsb-triggerOpen{transform:rotate(180deg)}.dsb-menu{z-index:100;box-sizing:border-box;width:100%;max-width:calc(100vw - 24px);border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-specific-menu);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);box-shadow:var(--dsw-shadow-lv3);border-radius:12px;flex-direction:column;gap:8px;margin:0;padding:10px;display:flex;position:absolute;bottom:calc(100% + 8px);left:0;overflow:auto}.dsb-rootRail .dsb-menu{width:300px}.dsb-menuTitle{color:var(--dsw-alias-label-primary);align-items:center;gap:6px;font-size:13px;font-weight:600;line-height:20px;display:flex}.dsb-badge{color:var(--dsw-alias-label-tertiary);border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-fill-l2);border-radius:5px;flex:none;margin-left:auto;padding:0 6px;font-size:11px;line-height:18px}.dsb-row{box-sizing:border-box;color:var(--dsw-alias-label-primary);border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-fill-l2);border-radius:8px;flex-direction:column;gap:4px;padding:8px 10px;font-size:12px;line-height:18px;display:flex}.dsb-rowHead{align-items:center;gap:6px;display:flex}.dsb-rowCurrency{font-weight:600}.dsb-rowSub{color:var(--dsw-alias-label-tertiary);justify-content:space-between;gap:8px;display:flex;font-size:11px;line-height:16px}.dsb-rowLow .dsb-rowCurrency{color:#d97706}.dsb-lowHint{color:#d97706;align-items:center;gap:6px;font-size:11px;line-height:16px;display:flex}.dsb-foot{color:var(--dsw-alias-label-tertiary);align-items:center;gap:8px;font-size:11px;line-height:18px;display:flex}.dsb-time{min-width:0;flex:1;white-space:nowrap;text-overflow:ellipsis;overflow:hidden}.dsb-refresh{color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:0;border-radius:6px;align-items:center;gap:4px;padding:2px 6px;font-size:11px;line-height:18px;display:inline-flex;text-decoration:none}.dsb-refresh:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}.dsb-refresh:disabled{color:var(--dsw-alias-label-tertiary);cursor:default;opacity:.55}.dsb-refresh:disabled:hover{color:var(--dsw-alias-label-tertiary);background:0 0}.dsb-refreshIcon{animation:dsb-refresh-spin 1s linear infinite}@keyframes dsb-refresh-spin{to{transform:rotate(360deg)}}.dsb-error{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;word-break:break-word}";
		const tagId = "dsh-deepseek-balance/BalanceWidget.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-deepseek-balance";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		const styles = {
			"badge": "dsb-badge",
			"chevron": "dsb-chevron",
			"dot": "dsb-dot",
			"error": "dsb-error",
			"foot": "dsb-foot",
			"footerButtons": "dsb-footerButtons",
			"label": "dsb-label",
			"lowHint": "dsb-lowHint",
			"menu": "dsb-menu",
			"menuTitle": "dsb-menuTitle",
			"refresh": "dsb-refresh",
			"refreshIcon": "dsb-refreshIcon",
			"root": "dsb-root",
			"rootRail": "dsb-rootRail",
			"row": "dsb-row",
			"rowCurrency": "dsb-rowCurrency",
			"rowHead": "dsb-rowHead",
			"rowLow": "dsb-rowLow",
			"rowSub": "dsb-rowSub",
			"time": "dsb-time",
			"trigger": "dsb-trigger",
			"triggerOpen": "dsb-triggerOpen",
			"value": "dsb-value"
		};
		//#endregion
		//#region lib/types/client/balance.js
		/** Initial snapshot: unknown state until the first fetch settles. */
		const INITIAL_SNAPSHOT = {
			status: "loading",
			payload: null,
			errorCode: null,
			error: null,
			env: null,
			fetchedAt: 0,
			lowThreshold: 20
		};
		/** Symbol lookup for the currencies the DeepSeek account can report. */
		const CURRENCY_SYMBOLS = {
			CNY: "¥",
			USD: "$",
			EUR: "€",
			GBP: "£",
			JPY: "¥",
			HKD: "HK$",
			SGD: "S$"
		};
		/** Format an amount with two decimals and the active locale's grouping. */
		function formatAmount(value) {
			if (!Number.isFinite(value)) return "—";
			return value.toLocaleString(undefined, {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			});
		}
		/** Currency code → display symbol (falls back to the bare code). */
		function currencySymbol(currency) {
			const code = String(currency ?? "").toUpperCase();
			return CURRENCY_SYMBOLS[code] ?? (code === "" ? "" : `${code} `);
		}
		/** Short clock time for the "fetched at" line. */
		function formatTime(ts) {
			if (!ts) return "—";
			return new Date(ts).toLocaleTimeString();
		}
		/** Join truthy class names. */
		function cx() {
			let out = "";
			for (const value of arguments) if (value) out += (out === "" ? "" : " ") + value;
			return out;
		}
		/**
		* One balance_infos row: currency, total, and the granted/topped-up split.
		* @param info - one DeepSeek /user/balance balance_infos entry.
		* @param low - whether this row's total sits below the warning threshold.
		* @param t - namespace translator.
		*/
		function balanceRow(info, low, t) {
			const currency = String(info.currency ?? "");
			const granted = Number(info.granted_balance);
			const toppedUp = Number(info.topped_up_balance);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: low ? `${styles.row} ${styles.rowLow}` : styles.row,
				children: [
					(0, react_jsx_runtime.jsx)("div", {
						className: styles.rowHead,
						children: (0, react_jsx_runtime.jsx)("span", { className: styles.rowCurrency, children: currency })
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: styles.rowSub,
						children: [
							(0, react_jsx_runtime.jsx)("span", { children: `${t("granted")}: ${formatAmount(granted)}` }),
							(0, react_jsx_runtime.jsx)("span", { children: `${t("toppedUp")}: ${formatAmount(toppedUp)}` })
						]
					})
				]
			});
		}
		/**
		* Sidebar footer widget: the current DeepSeek account balance with a
		* detail popover. Fetches the same-origin host proxy on an interval the
		* host config drives (response config), pauses while the tab is hidden,
		* and refreshes immediately when the tab becomes visible again.
		* @param props - slot props: `wide` from the sidebar owner, `t` from the locale face.
		* @returns the trigger and its popover, or null until the first fetch settles.
		*/
		function BalanceWidget({ wide, t }) {
			const [open, setOpen] = (0, react.useState)(false);
			const [snapshot, setSnapshot] = (0, react.useState)(INITIAL_SNAPSHOT);
			const [refreshing, setRefreshing] = (0, react.useState)(false);
			const rootRef = (0, react.useRef)(null);
			const triggerRef = (0, react.useRef)(null);
			const busyRef = (0, react.useRef)(false);
			const refreshMsRef = (0, react.useRef)(60000);
			const timerRef = (0, react.useRef)(null);
			const refresh = (0, react.useCallback)(async (force = false) => {
				if (busyRef.current) return;
				busyRef.current = true;
				setRefreshing(true);
				try {
					// The manual refresh button forces a fresh fetch (?fresh=1);
					// automatic polls keep the host snapshot-cache behavior.
					const response = await fetch(force ? "/api/dsh-balance?fresh=1" : "/api/dsh-balance", {
						headers: { accept: "application/json" },
						cache: "no-store"
					});
					let body = null;
					try {
						body = await response.json();
					} catch {
						body = null;
					}
					if (!response.ok || body === null || typeof body !== "object") {
						setSnapshot((current) => ({ ...current, status: "error", payload: null, errorCode: "http", error: String(response.status), fetchedAt: Date.now() }));
						return;
					}
					if (body.ok === true && body.data !== null && typeof body.data === "object") {
						if (body.config?.refreshMs > 0) refreshMsRef.current = body.config.refreshMs;
						setSnapshot((current) => ({
							...current,
							status: "ok",
							payload: body.data,
							errorCode: null,
							error: null,
							env: null,
							fetchedAt: body.fetchedAt ?? Date.now(),
							lowThreshold: body.config?.lowThreshold > 0 ? body.config.lowThreshold : current.lowThreshold
						}));
					} else {
						setSnapshot((current) => ({
							...current,
							status: "error",
							payload: null,
							errorCode: body.error ?? "unknown",
							error: body.message ?? body.detail ?? body.error ?? "unknown",
							env: body.env ?? null,
							fetchedAt: Date.now()
						}));
					}
				} catch (error) {
					setSnapshot((current) => ({
						...current,
						status: "error",
						payload: null,
						errorCode: "network",
						error: error instanceof Error ? error.message : String(error),
						env: null,
						fetchedAt: Date.now()
					}));
				} finally {
					busyRef.current = false;
					setRefreshing(false);
				}
			}, []);
			(0, react.useEffect)(() => {
				refresh();
				const schedule = () => {
					timerRef.current = setTimeout(() => {
						if (typeof document === "undefined" || document.visibilityState === "visible") refresh();
						schedule();
					}, refreshMsRef.current);
				};
				schedule();
				const onVisible = () => {
					if (typeof document !== "undefined" && document.visibilityState === "visible") refresh();
				};
				if (typeof document !== "undefined") document.addEventListener("visibilitychange", onVisible);
				return () => {
					if (timerRef.current !== null) clearTimeout(timerRef.current);
					if (typeof document !== "undefined") document.removeEventListener("visibilitychange", onVisible);
				};
			}, [refresh]);
			(0, _primitives.useDismissOnOutsidePointer)(rootRef, open, setOpen);
			const data = snapshot.payload;
			const infos = Array.isArray(data?.balance_infos) ? data.balance_infos : [];
			const primary = infos[0];
			const total = Number(primary?.total_balance);
			const low = snapshot.status === "ok" && Number.isFinite(total) && snapshot.lowThreshold > 0 && total < snapshot.lowThreshold;
			let dotState = "ongoing";
			let valueLabel = t("loading");
			if (snapshot.status === "ok") {
				dotState = data?.is_available === false ? "error" : low ? "warning" : "done";
				valueLabel = Number.isFinite(total) ? `${currencySymbol(primary?.currency)}${formatAmount(total)}` : t("unavailable");
			} else if (snapshot.status === "error") {
				dotState = "error";
				valueLabel = "—";
			}
			const onKeyDown = (event) => {
				if (event.key !== "Escape" || !open) return;
				event.preventDefault();
				setOpen(false);
				triggerRef.current?.focus();
			};
			const menuTitle = (0, react_jsx_runtime.jsxs)("div", {
				className: styles.menuTitle,
				children: [
					t("label"),
					snapshot.status === "ok" ? (0, react_jsx_runtime.jsx)("span", {
						className: styles.badge,
						children: data?.is_available === false ? t("unavailable") : t("available")
					}) : null
				]
			});
			let body;
			if (snapshot.status === "loading") {
				body = (0, react_jsx_runtime.jsx)("div", { className: styles.error, children: t("loading") });
			} else if (snapshot.status === "error") {
				const code = snapshot.errorCode;
				const message = code === "no-api-key"
					? t("noKey.hint", { env: snapshot.env ?? "DEEPSEEK_API_KEY" })
					: code === "upstream"
						? t("error.upstream", { status: snapshot.error })
						: code === "timeout"
							? t("error.timeout")
							: code === "forbidden"
								? t("error.forbidden")
								: code === "network"
									? t("error.network")
									: t("error.generic", { message: snapshot.error });
				body = (0, react_jsx_runtime.jsx)("div", { className: styles.error, children: message });
			} else {
				body = (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, {
					children: [
						infos.map((info) => balanceRow(info, low && info === primary, t)),
						low ? (0, react_jsx_runtime.jsx)("div", {
							className: styles.lowHint,
							children: t("low", { threshold: `${currencySymbol(primary?.currency)}${formatAmount(snapshot.lowThreshold)}` })
						}) : null,
						(0, react_jsx_runtime.jsxs)("div", {
							className: styles.foot,
							children: [
								(0, react_jsx_runtime.jsx)("span", {
									className: styles.time,
									title: t("fetchedAt", { time: formatTime(snapshot.fetchedAt) }),
									children: t("fetchedAt", { time: formatTime(snapshot.fetchedAt) })
								}),
								(0, react_jsx_runtime.jsx)("a", {
									className: styles.refresh,
									href: "https://platform.deepseek.com/top_up",
									target: "_blank",
									rel: "noopener noreferrer",
									title: t("topUp.aria"),
									children: [
										(0, react_jsx_runtime.jsx)(_primitives.IconRightUpOutline14, {}),
										t("topUp")
									]
								}),
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: styles.refresh,
									disabled: refreshing,
									"aria-busy": refreshing || void 0,
									title: t("refresh"),
									onClick: () => refresh(true),
									children: [
										(0, react_jsx_runtime.jsx)(_primitives.IconRefreshOutline14, {
											className: refreshing ? styles.refreshIcon : void 0
										}),
										t("refresh")
									]
								})
							]
						})
					]
				});
			}
			return (0, react_jsx_runtime.jsxs)("div", {
				ref: rootRef,
				className: wide ? styles.root : `${styles.root} ${styles.rootRail}`,
				onKeyDown,
				children: [
					open ? (0, react_jsx_runtime.jsxs)("div", {
						className: styles.menu,
						"aria-label": t("label"),
						children: [menuTitle, body]
					}) : null,
					(0, react_jsx_runtime.jsx)("div", {
						className: styles.footerButtons,
						children: (0, react_jsx_runtime.jsxs)("button", {
							ref: triggerRef,
							type: "button",
							className: styles.trigger,
							"data-active": (snapshot.status === "error" || low) || void 0,
							"aria-expanded": open,
							"aria-label": t("aria.trigger", { label: valueLabel }),
							title: t("label"),
							onClick: () => {
								setOpen((current) => !current);
							},
							children: [
								(0, react_jsx_runtime.jsx)(_primitives.StateDot, { state: dotState, size: wide ? 10 : 16, className: styles.dot }),
								wide ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, {
									children: [
										(0, react_jsx_runtime.jsx)("span", { className: styles.label, children: t("label") }),
										(0, react_jsx_runtime.jsx)("span", { className: styles.value, children: valueLabel }),
										(0, react_jsx_runtime.jsx)("span", {
											className: styles.chevron,
											children: (0, react_jsx_runtime.jsx)(_primitives.IconChevronDownOutline14, {
												className: open ? styles.triggerOpen : void 0
											})
										})
									]
								}) : null
							]
						})
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"label": "DeepSeek 余额",
			"loading": "加载中…",
			"available": "可用",
			"unavailable": "不可用",
			"noKey.hint": "未配置 DeepSeek API Key。请在 设置 → 模型 中配置，或设置环境变量 {env} 后重启。",
			"total": "总额",
			"granted": "赠送",
			"toppedUp": "充值",
			"refresh": "刷新",
			"topUp": "去充值",
			"topUp.aria": "前往 DeepSeek 开放平台充值页面",
			"fetchedAt": "更新于 {time}",
			"low": "余额低于 {threshold}",
			"aria.trigger": "DeepSeek 账户余额：{label}",
			"error.generic": "获取失败：{message}",
			"error.upstream": "DeepSeek API 返回错误（HTTP {status}）",
			"error.network": "网络请求失败",
			"error.timeout": "请求超时",
			"error.forbidden": "访问被拒绝"
		};
		/** English dictionary, key-identical to the Chinese source of truth. */
		const en = {
			"label": "DeepSeek Balance",
			"loading": "Loading…",
			"available": "Available",
			"unavailable": "Unavailable",
			"noKey.hint": "No DeepSeek API key configured. Set one in Settings → Models, or export {env} and restart.",
			"total": "Total",
			"granted": "Granted",
			"toppedUp": "Topped up",
			"refresh": "Refresh",
			"topUp": "Top up",
			"topUp.aria": "Open the DeepSeek platform top-up page",
			"fetchedAt": "Updated {time}",
			"low": "Balance below {threshold}",
			"aria.trigger": "DeepSeek account balance: {label}",
			"error.generic": "Failed to fetch: {message}",
			"error.upstream": "DeepSeek API error (HTTP {status})",
			"error.network": "Network request failed",
			"error.timeout": "Request timed out",
			"error.forbidden": "Access denied"
		};
		//#endregion
		//#region lib/types/client/index.js
		/** Dictionary namespace owned by this plugin. */
		const NS = "balance";
		/** Services required by the sidebar widget plugin. */
		const inject = ["slots", "locale"];
		/**
		* Client plugin body: register the dictionaries and the sidebar footer entry.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, { zh, en }), "dsh-balance: dictionaries");
			ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
				name: "sidebar.footer.action",
				id: "dsh-balance",
				order: 100,
				locale: NS
			}, BalanceWidget));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
