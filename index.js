(async () => {
    const Replay = require('./replay');
    const fs = require('fs');
    const buildHeader = require('./buildHeader');
    const wasm = require('ooz-wasm');

    const parts = [];
    let size = 0;

    const replay = new Replay(fs.readFileSync('nice.replay'));

    replay.skip(4);

    replay.header.fileVersion = replay.readInt32();

    replay.skip(4);

    replay.header.networkVersion = replay.readInt32();

    replay.writeInt32(100000000)

    const name = replay.readFString();

    replay.skip(4);

    if (replay.header.fileVersion >= 3) {
        replay.skip(8);
    }

    let isCompressed = false;
    if (replay.header.fileVersion >= 2) {
        isCompressed = replay.readInt32();
        replay.header.isCompressed = isCompressed
        replay.skip(-4);
        replay.writeInt32(0);
    }

    let isEncrypted;

    if (replay.header.fileVersion >= 6) {
        isEncrypted = replay.readInt32();
        replay.skip(-4);
        replay.writeInt32(0);
        replay.header.isEncrypted = isEncrypted;

        const length = replay.readInt32();


        replay.header.encryptionKey = replay.readBytes(length);
    }

    const header = buildHeader();

    parts.push({
        type: "meta",
        data: header,
    });

    size += header.length;
    let i = 0;
    while (!replay.atEnd()) {
        const chunkType = replay.readInt32();
        const chunkSize = replay.readInt32();
        const end = replay.offset + chunkSize;

        size += 8;
        const startSize = size;

        switch (chunkType) {
            case 0:
                size += chunkSize;

                parts.push({
                    type: 'chunk',
                    chunkType,
                    data: replay.readBytes(chunkSize),
                    size: size - startSize,
                });

                break;
            case 1:
                let start;
                let end;
                i++;
                if (i > 5) {
                    size-= 8;
                    break;
                }
                if (replay.header.fileVersion >= 4) {
                    start = replay.readInt32();
                    end = replay.readInt32();
                    size += 8;
                }

                const chunklength = replay.readInt32();
                size += 4;

                let memSize;
                if (replay.header.fileVersion >= 6) {
                    memSize = replay.readInt32();
                    size += 4;
                }

                if (chunklength === 1389582) {
                    console.log(i);
                }

                const decryptedAr = new Replay(replay.decryptBuffer(chunklength));

                let decompressed;

                if (isEncrypted) {
                    const decompressedSize = decryptedAr.readInt32();
                    const compressedSize = decryptedAr.readInt32();
                    const compressedBuffer = decryptedAr.readBytes(compressedSize);

                    decompressed = await wasm.decompressUnsafe(compressedBuffer, decompressedSize)
                } else {
                    decompressed = decryptedAr.buffer;
                }

                size += decompressed.length;

                parts.push({
                    type: 'chunk',
                    chunkType,
                    chunkData: {
                        start,
                        end,
                        memSize,
                    },
                    data: decompressed.slice(),
                    size: size - startSize,
                })

                break;

                const eventId = replay.readFString();
                size += 4 + 1;
                size += eventId.length;
                const group = replay.readFString();
                size += 4 + 1;
                size += group.length;
                const metadata = replay.readFString();
                size += 4 + 1;
                size += metadata.length;
                const startTime = replay.readInt32();
                const endTime = replay.readInt32();
                const length = replay.readInt32();
                size += 12;


                const decrypted = replay.decryptBuffer(length);
                size += decrypted.byteLength;

                parts.push({
                    type: 'chunk',
                    chunkType,
                    eventData: {
                        eventId,
                        group,
                        metadata,
                        startTime,
                        endTime,
                    },
                    data: decrypted,
                    size: size - startSize,
                })
                break;
            default:
                size -= 8;
                console.log('unhandled chunktype', chunkType)
        }

        replay.goTo(end);
        i++;
    }

    let newBuffer = new Replay(Buffer.from(Array.from({ length: size }).map(() => 12)));

    parts.forEach((part, index) => {
        switch (part.type) {
            case 'meta':
                newBuffer.writeBytes(part.data);
                break;

            case 'chunk':
                newBuffer.writeInt32(part.chunkType);
                const chunkTypeOffset = newBuffer.offset;
                newBuffer.skip(4);

                const startOffset = newBuffer.offset; 

                switch (part.chunkType) {
                    case 0:
                    case 2:
                        newBuffer.writeBytes(part.data);
                        break;
                    case 1:
                        newBuffer.writeInt32(part.chunkData.start);
                        newBuffer.writeInt32(part.chunkData.end);
                        newBuffer.writeInt32(part.data.length);
                        newBuffer.writeInt32(part.chunkData.memSize);
                        newBuffer.writeBytes(part.data);

                        break;
                    case 3:
                        newBuffer.writeString(part.eventData.eventId);
                        newBuffer.writeString(part.eventData.group);
                        newBuffer.writeString(part.eventData.metadata);
                        newBuffer.writeInt32(part.eventData.startTime);
                        newBuffer.writeInt32(part.eventData.endTime);
                        newBuffer.writeInt32(part.data.length);
                        newBuffer.writeBytes(part.data);
                }

                if (part.size !== (newBuffer.offset - startOffset)) {
                    console.log('Invalid size in type', part.chunkType, 'Expected:', part.size, 'Got:', newBuffer.offset - startOffset)
                }

                newBuffer.writeInt32(newBuffer.offset - startOffset, chunkTypeOffset);
        }
    });


    console.log(newBuffer.offset, size)

    fs.writeFileSync('C:\\Users\\marcm\\AppData\\Local\\FortniteGame\\Saved\\tournaments\\yeah.replay', newBuffer.buffer);
    fs.writeFileSync('C:\\Users\\marcm\\AppData\\Local\\FortniteGame\\Saved\\Demos\\yeah.replay', newBuffer.buffer);
    fs.writeFileSync('result.replay', newBuffer.buffer);
})()