fx_version "cerulean"
game "gta5"

author "W2F Framework — Based on illenium-appearance by snakewiz & iLLeniumStudios"
description "W2F appearance — Player customization forked from illenium-appearance (credits: snakewiz & iLLeniumStudios / iLLeniumStudios)."
repository "https://github.com/iLLeniumStudios/illenium-appearance"
version "v5.7.0"

lua54 "yes"

-- Do not declare ox_lib 'locale': this resource ships Lua locales (e.g. locales/en.lua via NUI),
-- not locales/*.json files; declaring locale makes ox_lib warn about missing locales/en.json.

dependencies {
    'ox_lib',
}

client_scripts {
  "game/constants.lua",
  "game/util.lua",
  "game/customization.lua",
  "game/nui.lua",
  "client/outfits.lua",
  "client/common.lua",
  "client/zones.lua",
  "client/framework/framework.lua",
  "client/framework/qb/compatibility.lua",
  "client/framework/qb/main.lua",
  "client/framework/qb/migrate.lua",
  "client/framework/esx/compatibility.lua",
  "client/framework/esx/main.lua",
  "client/framework/ox/main.lua",
  "client/target/target.lua",
  "client/target/qb.lua",
  "client/target/ox.lua",
  "client/management/management.lua",
  "client/management/common.lua",
  "client/management/qb.lua",
  "client/management/qbx.lua",
  "client/management/esx.lua",
  "client/radial/radial.lua",
  "client/radial/qb.lua",
  "client/radial/ox.lua",
  "client/turntable.lua",
  "client/stats.lua",
  "client/defaults.lua",
  "client/blips.lua",
  "client/props.lua",
  "client/client.lua",
}

server_scripts {
  "@oxmysql/lib/MySQL.lua",
  "server/database/schema_bootstrap.lua",
  "server/database/database.lua",
  "server/database/jobgrades.lua",
  "server/database/managementoutfits.lua",
  "server/database/playeroutfitcodes.lua",
  "server/database/playeroutfits.lua",
  "server/database/players.lua",
  "server/database/playerskins.lua",
  "server/database/users.lua",
  "server/framework/qb/main.lua",
  "server/framework/qb/migrate.lua",
  "server/framework/esx/main.lua",
  "server/framework/esx/migrate.lua",
  "server/framework/esx/callbacks.lua",
  "server/framework/esx/management.lua",
  "server/framework/ox/main.lua",
  "server/util.lua",
  "server/server.lua",
  "server/permissions.lua"
}

shared_scripts {
  "@ox_lib/init.lua",
  "shared/config.lua",
  "shared/blacklist.lua",
  "shared/peds.lua",
  "shared/tattoos.lua",
  "shared/theme.lua",
  "shared/framework/framework.lua",
  "shared/framework/qb_core_compat.lua",
  "shared/framework/esx/util.lua",
  "locales/locales.lua",
  "locales/ar.lua",
  "locales/bg.lua",
  "locales/cs.lua",
  "locales/de.lua",
  "locales/en.lua",
  "locales/es-ES.lua",
  "locales/fr.lua",
  "locales/hu.lua",
  "locales/it.lua",
  "locales/nl.lua",
  "locales/pt-BR.lua",
  "locales/ro-RO.lua",
  "locales/id.lua"
}

files {
  "web/dist/index.html",
  "web/dist/assets/*.js"
}

ui_page "web/dist/index.html"
