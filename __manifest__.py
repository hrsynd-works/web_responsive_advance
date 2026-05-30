# Copyright 2026 hrsynd
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl-3.0)
{
    "name": "Web Responsive Advance",
    "summary": "Refinements and UI polish for OCA web_responsive",
    "version": "18.0.1.0.0",
    "category": "Website",
    "author": "hrsynd",
    "website": "https://works.hrsynd.com",
    "license": "LGPL-3",
    "depends": ["web_responsive"],
    "assets": {
        "web._assets_primary_variables": [
            ("before", "web/static/src/scss/primary_variables.scss",
             "web_responsive_advance/static/src/scss/navbar_variables_light.scss"),
        ],
        "web.assets_variables_dark": [
            ("before", "web/static/src/scss/primary_variables.scss",
             "web_responsive_advance/static/src/scss/navbar_variables.dark.scss"),
        ],
        "web.assets_backend": [
            "web_responsive_advance/static/src/js/apps_menu_ext.esm.js",
            "web_responsive_advance/static/src/components/loading_indicator/loading_indicator.esm.js",
            "web_responsive_advance/static/src/components/loading_indicator/loading_indicator.xml",
            "web_responsive_advance/static/src/scss/navbar.scss",
            "web_responsive_advance/static/src/xml/apps_menu_recent.xml",
        ],
    },
    "installable": True,
}
