module.exports = function (buff, cb) {
  if (buff.readUInt32LE(0) !== 0x34327243 /* Cr24 */) {
    return cb(new Error('Unexpected CRX magic number')), undefined;
  }

  if (buff.readUInt32LE(4) !== 2) {
    return cb(new Error('Unexpected CRX version')), undefined;
  }

  var publicKeyLength = buff.readUInt32LE(8);
  var signatureLength = buff.readUInt32LE(12);
  var metaOffset = 16;
  var publicKey = new Buffer(buff.slice(metaOffset,
    metaOffset + publicKeyLength)).toString('base64');
  var signature = new Buffer(buff.slice(metaOffset + publicKeyLength,
    metaOffset + publicKeyLength + signatureLength)).toString('base64');

  cb(null, {
    header: {
      publicKey: publicKey,
      signature: signature
    },
    body: buff.slice(metaOffset + publicKeyLength + signatureLength)
  });
};
