--- Lazy-resolves the QB-compat object from either resource (Qbox bridge or qb-core).

local cached

---@return table|nil
function Framework.ResolveQBCoreObject()
    if cached then return cached end
    if GetResourceState("qbx_core") ~= "started" and GetResourceState("qb-core") ~= "started" then
        return nil
    end
    local ok, core = pcall(function()
        return exports["qb-core"]:GetCoreObject()
    end)
    if ok and core and type(core) == "table" then
        cached = core
        return cached
    end
    return nil
end
