// Copyright 2026 hrsynd
// License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0)
//
// Upstream FormErrorDialog ("Oh snap!") never sets `env.dialogData.dismiss`, so
// ESC hits Dialog.dismiss() -> close() without resolving the promise that
// form_controller.onSaveError awaits. That promise is awaited inside
// model.mutex.exec() (record.js save()), so the mutex never unlocks and the
// whole view deadlocks until reload.
//
// Sibling dialogs (ConfirmationDialog, FormViewDialog, relational_utils) all
// set `dismiss`; this one simply forgot. Still missing in Odoo 19.
import {FormErrorDialog} from "@web/views/form/form_error_dialog/form_error_dialog";
import {patch} from "@web/core/utils/patch";

patch(FormErrorDialog.prototype, {
    setup() {
        super.setup();
        // ESC == "Stay here": resolve the promise, release the mutex, keep edits.
        // stay() also calls props.close(), and Dialog.dismiss() calls close()
        // again — harmless, overlay remove() is guarded by `if (id in overlays)`
        // (core/overlay/overlay_service.js:27-32).
        this.env.dialogData.dismiss = () => this.stay();
    },
});
