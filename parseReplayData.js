const { netGuidCache } = require("./global");
const NetFieldExport = require("./NetFieldExports/NetFieldExport");
const Replay = require("./replay");
const Size = require("./Size");

let size;
let packetSize;
let netFields;

const readNetFieldExport = (archive) => {
    const isExported = archive.readByte() === 1;

    if (isExported) {
        const fieldExport = new NetFieldExport();
        fieldExport.handle = archive.readIntPacked();
        fieldExport.compatibleChecksum = archive.readUInt32();
        fieldExport.name = archive.readName();

        return fieldExport;
    }

    return null;
};

const readExportData = (replay) => {
    const numLayoutCmdExports = replay.readIntPacked();

    for (let i = 0; i < numLayoutCmdExports; i++) {
        const pathNameIndex = replay.readIntPacked(packetSize);

        const isExported = replay.readIntPacked(packetSize) === 1;

        let group;

        if (isExported) {
            const pathname = replay.readString(packetSize);
            const numExports = replay.readIntPacked(packetSize);

            group = netGuidCache.NetFieldExportGroupMap[pathname];
            if (!group) {
                group = new NetFieldExportGroup();
                group.pathName = pathname;
                group.pathNameIndex = pathNameIndex;
                group.netFieldExportsLength = numExports;

                group.netFieldExports = [];
                netGuidCache.addToExportGroupMap(pathname, group);
            }
        } else {
            group = netGuidCache.GetNetFieldExportGroupFromIndex(pathNameIndex);
        }

        const netField = readNetFieldExport(replay);

        if (group) {
            group.netFieldExports[netField.handle] = netField;
        }
    }
};

const parseNextPacket = (replay) => {
    packetSize = new Size();

    const currentLevelIndex = replay.readInt32();
    packetSize.size += 4;
    const timeSeconds = replay.readFloat32();
    packetSize.size += 4;

    readExportData(replay);
};

const parseReplayData = (buffer) => {
    size = new Size();
    netFields = [];
    const replay = new Replay(buffer);

    while (!replay.atEnd()) {
        parseNextPacket(replay);
    }
};

module.exports = parseReplayData;