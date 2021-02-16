const settings = {
    meta: {
        magic: 480436863, // Dont change this
        fileVersion: 6,
        lengthInMs: 1000000,
        networkVersion: 2,
        changelist: 1000000000, // Build version. Increase it if the replay is marked as outdated
        name: "", // This doesnt do anything
        isLive: 0, // Marks your replay as corrupted
        timestamp: 11128120930901950464, // When the replay was created
        isCompressed: 0, // needs to be 0 or it doesnt work
        isEncrypted: 0, // same
        encryptionKey: [], // keep this empty. Just a waste of space
    },
    header: {
        networkVersion: 14,
        networkChecksum: 2825649272,
        engineNetworkVersion: 16,
        gameNetworkProtocolVersion: 0,
        guid: 'C29FC39EC6835346ABE70DDDC5625419',
        major: 4,
        minor: 26,
        patch: 0,
        changelist: 14937640,
        branch: '++Fortnite+Release-15.10',
        levelNamesAndTimes: {
            '/Game/Athena/Apollo/Maps/Apollo_Terrain': 0, // this needs to match your mode. Or it will infinite load
        },
        flags: 9, // 1: client recorded // 2: has streaming fixes // 4: delta checkpoints // 8: gameSpecificFrameData
        gameSpicificData: [
            'SubGame=Outpost'
        ],
    },
    useCustomHeader: true,
    useCustomMeta: true,
    chunkTypes: {
        header: true,
        replayPackets: true,
        checkpoints: false,
        events: false,
    },
    replayPacketstoCheck: 1,
    packetTypesIsBlacklist: false,
    packetTypes: [
        '/Game/Athena/PlayerPawn_Athena.PlayerPawn_Athena_C',
        '/Game/Athena/Athena_GameState.Athena_GameState_C',
        '/Script/FortniteGame.FortTeamPrivateInfo',
        '/Script/FortniteGame.FortPlayerStateAthena',
        '/Game/Athena/Aircraft/AthenaAircraft.AthenaAircraft_C',
    ]
};

module.exports = settings;
