const HJSON = require('hjson');
const fs = require('fs');
const header = HJSON.parse(fs.readFileSync('settings.hjson').toString()).meta;
const Replay = require('./replay');
const Size = require('./Size');

const buildMeta = () => {
    let size = new Size();

    size.size += 4;
    size.size += 4;
    size.size += 4;
    size.size += 4;
    size.size += 4;

    size.size += header.name.length + 5;

    size.size += 4;
    size.size += 8;
    size.size += 4;
    size.size += 4;
    size.size += header.encryptionKey.length + 4;

    const buffer = new Replay(size.getBuffer());

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

    size.validate(buffer);

    return buffer.buffer;
}

module.exports = buildMeta;