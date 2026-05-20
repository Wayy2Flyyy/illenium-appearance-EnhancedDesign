if not Framework.QBCore() then return end

CreateThread(function()
    for _ = 1, 150 do
        if Framework.ResolveQBCoreObject() then return end
        Wait(200)
    end
    lib.print.warn("[illenium-appearance] QB-compat object unavailable after 30s. Enable qbx:enableBridge true or ensure qb-core is running.")
end)

function Framework.GetPlayerID(src)
    local QBCore = Framework.ResolveQBCoreObject()
    if not QBCore then return end
    local Player = QBCore.Functions.GetPlayer(src)
    if Player then
        return Player.PlayerData.citizenid
    end
end

function Framework.HasMoney(src, type, money)
    local QBCore = Framework.ResolveQBCoreObject()
    local Player = QBCore and QBCore.Functions.GetPlayer(src)
    if not Player or not Player.PlayerData.money then return false end
    return Player.PlayerData.money[type] >= money
end

function Framework.RemoveMoney(src, type, money)
    local QBCore = Framework.ResolveQBCoreObject()
    local Player = QBCore and QBCore.Functions.GetPlayer(src)
    if not Player then return false end
    return Player.Functions.RemoveMoney(type, money)
end

function Framework.GetJob(src)
    local QBCore = Framework.ResolveQBCoreObject()
    local Player = QBCore and QBCore.Functions.GetPlayer(src)
    if not Player then return end
    return Player.PlayerData.job
end

function Framework.GetGang(src)
    local QBCore = Framework.ResolveQBCoreObject()
    local Player = QBCore and QBCore.Functions.GetPlayer(src)
    if not Player then return end
    return Player.PlayerData.gang
end

function Framework.SaveAppearance(appearance, citizenID)
    Database.PlayerSkins.UpdateActiveField(citizenID, 0)
    Database.PlayerSkins.DeleteByModel(citizenID, appearance.model)
    Database.PlayerSkins.Add(citizenID, appearance.model, json.encode(appearance), 1)
end

function Framework.GetAppearance(citizenID, model)
    local result = Database.PlayerSkins.GetByCitizenID(citizenID, model)
    if result then
        return json.decode(result)
    end
end
