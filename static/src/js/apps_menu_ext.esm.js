import {AppsMenu} from "@web_responsive/components/apps_menu/apps_menu.esm";
import {AppMenuItem} from "@web_responsive/components/apps_menu_item/apps_menu_item.esm";
import {WebClient} from "@web/webclient/webclient";
import {patch} from "@web/core/utils/patch";
import {onMounted, onWillUnmount, onWillStart} from "@odoo/owl";
import {getWebIconData} from "@web_responsive/components/apps_menu_tools.esm";

// Recent apps tracking — persisted in localStorage so the row is populated
// across sessions. Capped at 5; most-recent first.
const RECENT_KEY = "web_responsive_advance.recent_apps";
const RECENT_MAX = 5;

function readRecentIds() {
    try {
        const raw = window.localStorage.getItem(RECENT_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr : [];
    } catch (e) {
        return [];
    }
}

function writeRecentIds(ids) {
    try {
        window.localStorage.setItem(RECENT_KEY, JSON.stringify(ids));
    } catch (e) {
        // ignore
    }
}

function recordRecentApp(appId) {
    if (!appId) return;
    const current = readRecentIds().filter((id) => id !== appId);
    current.unshift(appId);
    writeRecentIds(current.slice(0, RECENT_MAX));
}

// Track app launches so the "Recent" row stays current.
patch(AppMenuItem.prototype, {
    onClick() {
        if (this.props.app && this.props.app.id) {
            recordRecentApp(this.props.app.id);
        }
        return super.onClick();
    },
});

// Patch WebClient to handle the #home hash on initial load
patch(WebClient.prototype, {
    setup() {
        super.setup();

        onWillStart(() => {
            const currentHash = window.location.hash;
            const currentPath = window.location.pathname;

            // If we landed at /odoo/settings#home etc., normalise to /odoo#home
            if (currentHash === "#home" && currentPath !== "/odoo") {
                window.location.href = "/odoo#home";
            } else if (currentHash === "#home") {
                this.env.bus.trigger("APPS_MENU:STATE_CHANGED", true);
            }
        });
    },

    _loadDefaultApp() {
        // When the URL carries #home, keep the menu open instead of loading an app
        if (window.location.hash === "#home") {
            return;
        }
        super._loadDefaultApp();
    },
});

// Patch AppsMenu to sync open state with the URL hash
patch(AppsMenu.prototype, {
    setup() {
        super.setup();

        const handleHashChange = () => {
            const isHome = window.location.hash === "#home";
            if (isHome !== this.state.open) {
                this.setOpenState(isHome);
            }
        };

        onWillStart(() => {
            if (window.location.hash === "#home" && !this.state.open) {
                this.state.open = true;
            }
        });

        onMounted(() => {
            window.addEventListener("hashchange", handleHashChange);
            if (window.location.hash === "#home" && !this.state.open) {
                this.setOpenState(true);
            }
        });

        onWillUnmount(() => {
            window.removeEventListener("hashchange", handleHashChange);
        });
    },

    onMenuClick() {
        super.onMenuClick();
        // Ensure hash is set whenever the menu ends up open after a click
        if (this.state.open) {
            window.history.replaceState(null, "", "/odoo#home");
        }
    },

    // === Recent apps row ===

    get recentApps() {
        if (!this.menuService) return [];
        const ids = readRecentIds();
        if (!ids.length) return [];
        const allApps = this.menuService.getApps();
        const byId = new Map(allApps.map((a) => [a.id, a]));
        return ids
            .map((id) => byId.get(id))
            .filter(Boolean)
            .slice(0, RECENT_MAX);
    },

    getRecentIcon(app) {
        return getWebIconData(app);
    },

    getRecentHref(app) {
        if (app.actionPath) return `/odoo/${app.actionPath}`;
        if (app.actionID) return `/odoo/action-${app.actionID}`;
        return "#";
    },

    onRecentClick(ev, app) {
        // Let middle-click / cmd-click follow the href naturally.
        if (ev && (ev.ctrlKey || ev.metaKey || ev.button === 1)) return;
        if (ev) ev.preventDefault();
        recordRecentApp(app.id);
        if (this.menuService && this.menuService.selectMenu) {
            this.menuService.selectMenu(app);
        }
    },

    setOpenState(open_state) {
        // On close: add `.is-closing`, let the slide-up keyframe play, then unmount.
        if (!open_state && this.state.open) {
            const el = document.querySelector(".app-menu-container");
            if (el && !el.classList.contains("is-closing")) {
                el.classList.add("is-closing");
                let done = false;
                const finish = () => {
                    if (done) return;
                    done = true;
                    el.removeEventListener("animationend", onEnd);
                    super.setOpenState(false);
                    if (window.location.hash === "#home") {
                        window.history.replaceState(null, "", "/odoo");
                    }
                };
                const onEnd = (ev) => {
                    if (ev.target !== el) return;
                    finish();
                };
                el.addEventListener("animationend", onEnd);
                setTimeout(finish, 320);
                return;
            }
        }

        super.setOpenState(open_state);

        if (open_state) {
            if (window.location.hash !== "#home") {
                window.history.pushState(null, "", "/odoo#home");
            }
        } else if (window.location.hash === "#home") {
            window.history.replaceState(null, "", "/odoo");
        }
    },
});
