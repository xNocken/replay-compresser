const HJSON = require('hjson');
const fs = require('fs');
const header = HJSON.parse(fs.readFileSync('settings.hjson').toString()).header;
const Replay = require('./replay');
const Size = require('./Size');

const buildHeader = () => {
    const size = new Size();

    size.size += 4;
    size.size += 4;
    size.size += 4;
    size.size += 4;
    size.size += 4;
    size.size += 16;

    size.size += 2;
    size.size += 2;
    size.size += 2;

    size.size += 4;

    size.size += header.branch.length + 5;

    size.size += 4;

    Object.entries(header.levelNamesAndTimes).forEach(([key]) => {
        size.size += 4;

        size.size += key.length + 5;

        size.size += 4;
    });

    size.size += 4;

    header.gameSpicificData.forEach((value) => {
        size.size += value.length + 5;
    });

    const buffer = new Replay(size.getBuffer());

    buffer.writeUInt32(0x2CF5A13D);
    buffer.writeUInt32(header.networkVersion);
    buffer.writeUInt32(header.networkChecksum);
    buffer.writeUInt32(header.engineNetworkVersion);
    buffer.writeUInt32(header.gameNetworkProtocolVersion);
    buffer.writeGuid(header.guid);
    buffer.writeUInt16(header.major);
    buffer.writeUInt16(header.minor);
    buffer.writeUInt16(header.patch);
    buffer.writeUInt32(header.changelist);
    buffer.writeString(header.branch);

    buffer.writeObject(header.levelNamesAndTimes, (a, b) => a.writeString(b), (a, b) => a.writeUInt32(b));

    buffer.writeUInt32(header.flags);

    buffer.writeArray(header.gameSpicificData, (a, b) => a.writeString(b));

    size.validate(buffer);

    return buffer.buffer;
};

module.exports = buildHeader;