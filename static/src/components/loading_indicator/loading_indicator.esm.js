// Copyright 2026 hrsynd
// License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0)
//
// Mirrors stock `LoadingIndicator` (web/static/src/webclient/loading_indicator)
// — same rpcBus-driven counter, same 250ms grace, same silent-RPC skip — but
// renders the custom SVG / mobile-bar visual defined in navbar.scss.
import {browser} from "@web/core/browser/browser";
import {rpcBus} from "@web/core/network/rpc";
import {registry} from "@web/core/registry";
import {useBus} from "@web/core/utils/hooks";
import {Transition} from "@web/core/transition";

import {Component, useState} from "@odoo/owl";

export class WraLoadingIndicator extends Component {
    static template = "web_responsive_advance.LoadingIndicator";
    static components = {Transition};
    static props = {};

    setup() {
        this.state = useState({count: 0, show: false});
        this.rpcIds = new Set();
        this.startShowTimer = null;
        useBus(rpcBus, "RPC:REQUEST", this.requestCall.bind(this));
        useBus(rpcBus, "RPC:RESPONSE", this.responseCall.bind(this));
    }

    requestCall({detail}) {
        if (detail.settings.silent) return;
        if (this.state.count === 0) {
            browser.clearTimeout(this.startShowTimer);
            this.startShowTimer = browser.setTimeout(() => {
                if (this.state.count) this.state.show = true;
            }, 250);
        }
        this.rpcIds.add(detail.data.id);
        this.state.count++;
    }

    responseCall({detail}) {
        if (detail.settings.silent) return;
        this.rpcIds.delete(detail.data.id);
        this.state.count = this.rpcIds.size;
        if (this.state.count === 0) {
            browser.clearTimeout(this.startShowTimer);
            this.state.show = false;
        }
    }
}

registry.category("main_components").add("WraLoadingIndicator", {
    Component: WraLoadingIndicator,
});
