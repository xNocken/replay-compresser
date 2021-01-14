const fs = require('fs');
const NetBitReader = require('../NetBitReader');
const NetFieldExport = require('./NetFieldExport');
const NetFieldExportGroup = require('./NetFieldExportGroup');
let i = 0;

class NetFieldParser {
  netFieldGroups = {};

  constructor() {
    fs.readdirSync('classes').forEach((path) => {
      try {
        const fieldExport = JSON.parse(fs.readFileSync(`classes/${ path }`));

        this.netFieldGroups[fieldExport.path] = fieldExport.properties;
      } catch (_) {
        console.log(`Error while loading ${ path }`)
      }
    });
  }

  willReadType(group) {
    return !!this.netFieldGroups[group];
  }

  createType(group) {
    const exportGroup = {};

    group.netFieldExports.forEach((field) => {
      if (field) {
        exportGroup[field.name] = null;
      }
    });

    return exportGroup;
  }


  /**
   *
   * @param {object} obj
   * @param {NetFieldExport} exportt
   * @param {number} handle
   * @param {NetFieldExportGroup} exportGroup
   * @param {NetBitReader} netBitReader
   */
  readField(obj, exportt, handle, exportGroup, netBitReader) {
    fs.writeFileSync('debug/packet' + i++, netBitReader.buffer)

    if (!this.netFieldGroups[exportGroup.pathName]) {
      return false;
    }

    // setType(obj,exportGroup, netfieldin);
  }
}

module.exports = NetFieldParser;
