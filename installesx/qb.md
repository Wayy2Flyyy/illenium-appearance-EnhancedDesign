# ESX / QB Install Guide

This guide is for server owners installing `illenium-appearance` on ESX, QB-Core, or Qbox/QBX servers. The resource is drag-and-drop ready. Do not run Yarn, npm, or any build command for a normal install.

## Requirements

- `ox_lib`
- `oxmysql`
- A working MySQL/MariaDB database
- One supported framework: ESX, QB-Core, or Qbox/QBX
- The resource folder named exactly `illenium-appearance`

## Folder Layout

Place the resource here:

```txt
resources/[standalone]/illenium-appearance
```

The final folder must contain:

```txt
resources/[standalone]/illenium-appearance/fxmanifest.lua
resources/[standalone]/illenium-appearance/client/
resources/[standalone]/illenium-appearance/server/
resources/[standalone]/illenium-appearance/shared/
resources/[standalone]/illenium-appearance/sql/
resources/[standalone]/illenium-appearance/web/dist/index.html
```

If `fxmanifest.lua` is not directly inside `illenium-appearance`, the folder is nested incorrectly.

## SQL

Import these files from `sql/` into your server database:

```txt
sql/playerskins.sql
sql/player_outfits.sql
sql/player_outfit_codes.sql
sql/management_outfits.sql
```

Use phpMyAdmin, HeidiSQL, DBeaver, txAdmin database tools, or your preferred MySQL tool.

## QB-Core / Qbox Setup

In `server.cfg`, make sure the framework and dependencies start before `illenium-appearance`:

```cfg
ensure oxmysql
ensure ox_lib
ensure qb-core
ensure illenium-appearance
```

For Qbox/QBX, use your normal Qbox resource order:

```cfg
ensure oxmysql
ensure ox_lib
ensure qbx_core
ensure illenium-appearance
```

If your server already starts `[qbx]`, `[qb]`, or another framework group, keep `illenium-appearance` after the group and after `ox_lib`.

## ESX Setup

In `server.cfg`, make sure ESX and dependencies start before `illenium-appearance`:

```cfg
ensure oxmysql
ensure ox_lib
ensure es_extended
ensure illenium-appearance
```

If your ESX resources are grouped, keep `illenium-appearance` after `es_extended` and after any required identity/job resources.

## Locale

Optional:

```cfg
setr illenium-appearance:locale "en"
```

Use another included locale only if the matching file exists in `locales/`.

## Start / Restart

After installing, restart the server or run:

```txt
refresh
ensure illenium-appearance
```

After updating an existing install, run:

```txt
refresh
restart illenium-appearance
```

## Test Checklist

1. Join the server.
1. Open the appearance menu or enter a clothing/barber shop.
1. Test Hair, Torso, Hands, Shirt, Legs, Shoes, Bags, Chains, and Props.
1. Save the appearance.
1. Reconnect and confirm the skin loads correctly.

## Customer Notes

- Do not run `yarn`.
- Do not run `npm install`.
- Do not run `npm run build`.
- Do not delete `web/dist`.
- Do not rename the folder unless you also update every `ensure` and reference.

The game loads the prebuilt UI from:

```txt
web/dist/index.html
web/dist/assets/*.js
```

## Troubleshooting

- `illenium-appearance does not have a resource manifest`: the folder is nested wrong. `fxmanifest.lua` must be directly inside `illenium-appearance`.
- Duplicate resource warning: remove every other `illenium-appearance` folder from `resources/`. Only one copy should exist.
- Menu opens but does not save: check `oxmysql`, database credentials, and SQL imports.
- Categories do not click: make sure you uploaded the included `web/dist` folder and clear FiveM client cache after updating.
- Missing dependency errors: start `ox_lib`, `oxmysql`, and your framework before `illenium-appearance`.
