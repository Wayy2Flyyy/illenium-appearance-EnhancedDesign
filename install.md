# illenium-appearance W2F - Install Guide

This resource is ready for normal FiveM server use as a drag-and-drop install. The NUI is already built in `web/dist`, so customers do not need Node.js, npm, Yarn, Vite, or any build command.

## Requirements

- A FiveM server using Qbox/QBX, QB, ESX, or ox integration supported by this resource.
- `ox_lib` installed and started before `illenium-appearance`.
- `oxmysql` installed, configured, and started before `illenium-appearance`.
- A working MySQL/MariaDB database connection.


## Install The Resource

1. Rename the actual resource folder to:

```txt
illenium-appearance
```

1. Place it in your server resources folder, for example:

```txt
resources/[standalone]/illenium-appearance
```

1. Confirm the final path looks like this:

```txt
resources/[standalone]/illenium-appearance/fxmanifest.lua
resources/[standalone]/illenium-appearance/web/dist/index.html
```

## Import SQL

Import the SQL files from the `sql/` folder into your server database:

```txt
sql/playerskins.sql
sql/player_outfits.sql
sql/player_outfit_codes.sql
sql/management_outfits.sql
```

You can import them with phpMyAdmin, HeidiSQL, DBeaver, txAdmin database tools, or your preferred MySQL tool.

Skip a file only if your database already has that exact table with the correct structure.

## Configure `server.cfg`

Make sure dependencies start before this resource:

```cfg
ensure oxmysql
ensure ox_lib
ensure illenium-appearance
```

If you use resource groups, the important part is still the order: `oxmysql` and `ox_lib` must start before `illenium-appearance`.

Optional locale setting:

```cfg
setr illenium-appearance:locale "en"
```

## Start Or Restart

After installing or updating, restart the server. If the server is already running, use the server console:

```txt
refresh
restart illenium-appearance
```

If this is a first install and the resource was not started yet:

```txt
refresh
ensure illenium-appearance
```

## Test In Game

1. Join the server.
2. Open the appearance menu or walk into a configured clothing/barber/tattoo shop.
3. Test these categories:

- Hair
- Torso
- Hands
- Shirt
- Legs
- Shoes
- Bags
- Chains
- Hats / props

1. Save once and confirm your skin saves after reconnecting.

If the menu opens but saving does not work, check that `oxmysql` is started and the SQL files were imported.

## Updating Existing Installs

1. Stop the server or stop `illenium-appearance`.
2. Back up your old `illenium-appearance/shared/config.lua` if you changed it.
3. Replace the old `illenium-appearance` folder with the new one.
4. Reapply your config changes carefully.
5. Import any new SQL files if they were added.
6. Start the server or run:

```txt
refresh
restart illenium-appearance
```

If players still see the old UI after updating, clear the FiveM client cache.

## Important Notes For Customers

- Do not run `yarn`.
- Do not run `npm install`.
- Do not run `npm run build`.
- Do not upload only `web-src`.
- Do not delete `web/dist`.
- Keep the folder name `illenium-appearance` unless you also update every `ensure` and reference.

The game loads the compiled UI from:

```txt
web/dist/index.html
web/dist/assets/*.js
```

## Optional Developer Rebuild

Only developers editing React/TypeScript source under `web-src/web/src/` need to rebuild the NUI.

Use npm, not Yarn:

```bash
cd web-src/web
npm install
npm run build
```

The build output is written to:

```txt
web/dist/
```

After rebuilding, include the updated `web/dist` folder in your release. Customers should never be required to build the UI themselves.

## Troubleshooting

- `illenium-appearance does not have a resource manifest`: `fxmanifest.lua` is not directly inside the folder being ensured. Move/rename the actual resource folder correctly.
- `'yarn' is not recognized`: do not use Yarn. Normal installs need no build step. Developers should use npm only.
- Menu opens but Torso/Shirt/Hands/Legs do not click: make sure you are using the included rebuilt `web/dist` and clear FiveM cache if updating from an older copy.
- Menu opens but does not save: start `oxmysql` before this resource and import the SQL files.
- Missing text or locale errors: keep `locales/` in the resource and set `setr illenium-appearance:locale "en"` or another included locale.
- Resource starts before dependencies: move `ensure illenium-appearance` below `ensure oxmysql` and `ensure ox_lib`.
