import getPDF from './getpdf'

// returns a promise for text
function getText(blob) {
    return new Promise(function (resolve,reject) {
        var fileReader = new FileReader();
        fileReader.onload = function (blob) {
            require('pdfjs-dist');
            require('fs');

            // workerSrc needs to be specified, PDFJS library uses
            // Document.currentScript which is disallowed by content scripts
            PDFJS.workerSrc = browser.extension.getURL("pdf-worker/pdf.worker.js");
            PDFJS.getDocument(blob.target.result).then(function(pdf) {

                var totalContent = [];
                var promises = []
                collectContent()
                function collectContent(){
                    for(var i = 1; i <= pdf.pdfInfo.numPages; i++) {
                        promises.push(getPageContentForIndex(i, function(content){
                            totalContent.push(content)
                        }))
                    }
                }
                function getPageContentForIndex(i, callback) {
                    return pdf.getPage(i).then(function(page) {
                        return page.getTextContent().then(function(textContent) {
                            var pageContent = textContent.items.map((item) => item.str).join(" ")
                            callback(pageContent)
                        });
                    });
                }

                Promise.all(promises).then( function(){
                    totalContent = totalContent.join(" ");
                    resolve(totalContent)
                }).then(function (content) {

                });

            })
        }
        fileReader.readAsArrayBuffer(blob);
    });
}

// Wrap it in a promise.
export default function extractPdfText(url) {
    return getPDF(url).then(function (blob) {
        return getText(blob);
    });
}
