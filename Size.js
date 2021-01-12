class Size {
    size = 0;
    _bitSize = 0;

    set bitSize(value) {
        this._bitSize = value;

        while (this._bitSize >= 8) {
            this.size += 1;
            this._bitSize -= 8;
        }
    }

    get bitSize() {
        return this._bitSize;
    }

    getBuffer() {
        return Buffer.from({ length: this.size + (this._bitSize ? 1 : 0) })
    }
}

module.exports = Size;