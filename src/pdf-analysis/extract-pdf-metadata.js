import getPDF from './getpdf'

//returns a promise for metadata
function getMetaData(blob) {
    return new Promise(function (resolve,reject) {
        var fileReader = new FileReader();
        fileReader.onload = function (blob) {

            require('pdfjs-dist');
            require('fs');

            // workerSrc needs to be specified, PDFJS library uses
            // Document.currentScript which is disallowed by content scripts
            PDFJS.workerSrc = browser.extension.getURL("pdf-worker/pdf.worker.js");
            PDFJS.getDocument(blob.target.result).then(function(pdf) {

                pdf.getMetadata().then(function (data) {
                    resolve(JSON.parse(JSON.stringify(data.info, null, 2)));
                });
            });
        }
        fileReader.readAsArrayBuffer(blob);
    });
}

// Wrap it in a promise.
export default function extractPdfMetaData(url) {
    return getPDF(url).then(function (blob) {
        return getMetaData(blob);
    });
}
