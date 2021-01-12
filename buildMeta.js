const HJSON = require('hjson');
const fs = require('fs');
const header = HJSON.parse(fs.readFileSync('settings.hjson').toString()).meta;
const Replay = require('./replay');

const buildMeta = () => {
    let size = 0;

    size += 4;
    size += 4;
    size += 4;
    size += 4;
    size += 4;

    size += header.name.length + 5;

    size += 4;
    size += 8;
    size += 4;
    size += 4;
    size += header.encryptionKey.length + 4;

    const buffer = new Replay(Buffer.from({ length: size }));

    buffer.writeInt32(header.magic);
    buffer.writeInt32(header.fileVersion);
    buffer.writeInt32(header.lengthInMs);
    buffer.writeInt32(header.networkVersion);
    buffer.writeInt32(header.changelist);
    buffer.writeString(header.name);
    buffer.writeInt32(header.isLive);
    buffer.writeInt64(header.magic);
    buffer.writeInt32(header.isCompressed);
    buffer.writeInt32(header.isEncrypted);
    buffer.writeArray(header.encryptionKey, (a, value) => a.writeByte(value));

    return buffer.buffer;
}

module.exports = buildMeta;