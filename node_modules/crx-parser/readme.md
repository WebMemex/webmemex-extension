# node-crx-parser

[CRX](https://developer.chrome.com/extensions/crx) parser. 

# Installation

```sh
npm install crx-parser --save
```

# Usage

```javascript
var parseCRX = require('crx-parser');

fs.readFile('/tmp/mfabfdnimhipcapcioneheloaehhoggk.crx', function (err, buff) {
    parseCRX(buff, function (err, data) {
        console.log(data.header.publicKey);
        ...
    });
});
```
 
> For complete example see [text/index.spec.js](text/index.spec.js). 

## License

[MIT License](https://github.com/shyiko/node-crx-parser/blob/master/mit.license)
