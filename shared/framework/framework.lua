Framework = {}

function Framework.ESX()
    return GetResourceState("es_extended") ~= "missing"
end

--- Qbox uses `qbx_core` which **provides** `qb-core` and registers `GetCoreObject` via the qb bridge (requires `qbx:enableBridge`).
--- Standalone QBCore still uses resource name `qb-core`.
function Framework.QBCore()
    return GetResourceState("qb-core") ~= "missing"
        or GetResourceState("qbx_core") ~= "missing"
end

function Framework.Ox()
    return GetResourceState("ox_core") ~= "missing"
end
