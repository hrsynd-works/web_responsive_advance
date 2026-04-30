{
    "name": "Web Responsive Custom",
    "summary": "Custom refinements for Web Responsive",
    "version": "18.0.1.0.0",
    "category": "Website",
    "author": "Your Name",
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
            "web_responsive_advance/static/src/scss/navbar.scss",
            "web_responsive_advance/static/src/xml/apps_menu_recent.xml",
        ],
    },
    "installable": True,
}
