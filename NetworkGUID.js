class NetworkGUID {
  value;

  isValid() {
    return this.value > 0;
  }

  isDynamic() {
    return this.value > 0 && (this.value & 1) != 1;
  }

  isDefault() {
    return this.value == 1;
  }

  serialze(reader) {
    reader.readIntPacket();
  }
}

module.exports = NetworkGUID;
