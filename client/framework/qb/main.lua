if not Framework.QBCore() then return end

local client = client

local PlayerData = {
    citizenid = nil,
    job = { name = "unemployed", grade = { level = 0 }, onduty = false },
    gang = { name = "none", grade = { level = 0 } },
    charinfo = { gender = 0 },
    metadata = {},
}

local function getQBCore()
    return Framework.ResolveQBCoreObject()
end

local function syncPlayerData()
    local core = getQBCore()
    if not core then return end
    local data = core.Functions.GetPlayerData()
    if type(data) == "table" then
        PlayerData = data
    end
end

syncPlayerData()

local function setClientParams()
    client.job = PlayerData.job
    client.gang = PlayerData.gang
    client.citizenid = PlayerData.citizenid
end

setClientParams()

CreateThread(function()
    for _ = 1, 150 do
        if getQBCore() then
            syncPlayerData()
            setClientParams()
            return
        end
        Wait(200)
    end
end)

local function getRankInputValues(rankList)
    local rankValues = {}
    if not rankList then return rankValues end
    for k, v in pairs(rankList) do
        rankValues[#rankValues + 1] = {
            label = v.name,
            value = k
        }
    end
    return rankValues
end

function Framework.GetPlayerGender()
    if PlayerData.charinfo and PlayerData.charinfo.gender == 1 then
        return "Female"
    end
    return "Male"
end

function Framework.UpdatePlayerData()
    syncPlayerData()
    setClientParams()
end

function Framework.HasTracker()
    local pd = PlayerData
    return pd.metadata and pd.metadata["tracker"]
end

function Framework.CheckPlayerMeta()
    local m = PlayerData.metadata
    if not m then return false end
    return m["isdead"] or m["inlaststand"] or m["ishandcuffed"]
end

function Framework.IsPlayerAllowed(citizenid)
    return citizenid == PlayerData.citizenid
end

function Framework.GetRankInputValues(type)
    local QBCore = getQBCore()
    if not QBCore or not client.job or not client.gang then return {} end

    local jobs = QBCore.Shared.Jobs
    local gangs = QBCore.Shared.Gangs

    local grades = jobs and jobs[client.job.name] and jobs[client.job.name].grades
    if type == "gang" then
        grades = gangs and gangs[client.gang.name] and gangs[client.gang.name].grades
    end

    return getRankInputValues(grades or {})
end

function Framework.GetJobGrade()
    return client.job and client.job.grade and client.job.grade.level or 0
end

function Framework.GetGangGrade()
    return client.gang and client.gang.grade and client.gang.grade.level or 0
end

RegisterNetEvent("QBCore:Client:OnJobUpdate", function(JobInfo)
    PlayerData.job = JobInfo
    client.job = JobInfo
    ResetBlips()
end)

RegisterNetEvent("QBCore:Client:OnGangUpdate", function(GangInfo)
    PlayerData.gang = GangInfo
    client.gang = GangInfo
    ResetBlips()
end)

RegisterNetEvent("QBCore:Client:SetDuty", function(duty)
    if PlayerData and PlayerData.job then
        PlayerData.job.onduty = duty
        client.job = PlayerData.job
    end
end)

RegisterNetEvent("QBCore:Client:OnPlayerLoaded", function()
    Framework.UpdatePlayerData()
    InitAppearance()
end)

RegisterNetEvent("qb-clothes:client:CreateFirstCharacter", function()
    local QBCore = getQBCore()
    if not QBCore then return end
    QBCore.Functions.GetPlayerData(function(pd)
        if type(pd) == "table" then
            PlayerData = pd
        end
        setClientParams()
        InitializeCharacter(Framework.GetGender(true))
    end)
end)

function Framework.CachePed()
    return nil
end

function Framework.RestorePlayerArmour()
    Framework.UpdatePlayerData()
    if PlayerData and PlayerData.metadata then
        Wait(1000)
        SetPedArmour(cache.ped, PlayerData.metadata["armor"])
    end
end
