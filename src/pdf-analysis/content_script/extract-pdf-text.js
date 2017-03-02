//Rough idea how pdfgen would work



// // get pdf via XMLHTTP request
// import Readability from 'readability'
// import readPDF from "./pdfgen"

// function openPDF(url, epochTime){
// var blob = null
// var xhr = new XMLHttpRequest()
// xhr.open("GET", url)
// xhr.responseType = "blob"
// xhr.onload = function() 
// {
//     blob = xhr.response
//     getContentPDF(blob, function(pdf_content){
//       storePDF(pdf_content, url ,epochTime)
//     });
// }
// xhr.send()
// }

// // GET PDF TEXT VIA PDF.JS
// function getContentPDF(blob, callback) {
//       var arrayBuffer;
//       var fileReader = new FileReader();
//       fileReader.onload = function(a) {
//           PDFJS.workerSrc = chrome.extension.getURL('./pdf.min.worker.js');
//           PDFJS.getDocument(a.target.result).then(function(pdf) {
//             var items = [];
//             var pagesRemaining = pdf.pdfInfo.numPages;
//             var totalContent = [];
//             var promises = []
//             collectContent()
//               function collectContent(){
//                 for(var i = 1; i <= pdf.pdfInfo.numPages; i++) {
//                   promises.push(getPageContentForIndex(i, function(content){
//                     totalContent.push(content) 
//                   }))
//                 }              
//               }
//               function getPageContentForIndex(i, callback) {
//                 return pdf.getPage(i).then(function(page) {
//                   return page.getTextContent().then(function(textContent) {
//                     var pageContent = textContent.items.map((item) => item.str).join(" ")
//                     callback(pageContent)
//                   });
//                 });
//               }

//             Promise.all(promises).then( function(){
//                 totalContent = totalContent.join(" ");
//                 console.log(totalContent)
//                 callback(totalContent)
//             });

//           })
//         }
//   fileReader.readAsArrayBuffer(blob);
// }

// // STORE PDF VIA HANDLE_MESSAGE FUNCTION IN BACKGROUND.JS
// function storePDF(pdf_content, url, epochTime){
//     chrome.runtime.sendMessage({
//         "msg":'pageContent',
//         "time": epochTime,
//         "url": url,
//         "text": pdf_content, //relText,
//         "title": "",
//     })};



//   //Extract the 'main text' from a web page (esp. news article, blog post, ...).
// function extractPdfText_sync({
//     // By default, use the globals window and document.
//     loc = window.location,
//     doc = document,
// }={}) {
//     const uri = {
//         spec: loc.href,
//         host: loc.host,
//         prePath: loc.protocol + "//" + loc.host,
//         scheme: loc.protocol.substr(0, loc.protocol.indexOf(":")),
//         pathBase: loc.protocol + "//" + loc.host + loc.pathname.substr(0, loc.pathname.lastIndexOf("/") + 1)
//     }
//     let article
//     try {


//         article = readpdf(loc.href)



//     }
//     catch (err) {
//         // Bummer.
//         console.error('Readability (content extraction) crashed:', err)
//     }
//     return {
//         ...article,
//         // Also return full text, as article may be empty or wrong.
//         bodyInnerText: " May be something useful inside pdf" ,
//     }
// }

// // Wrap it in a promise.

// // Is it something you don't want to do ?(typo)

// // export default function extractPageText_async(...args) {


// export default function extractPdfText(...args){
//     return new Promise(function (resolve, reject) {
//         const run = () => resolve(extractPdfText_sync(...args))
//         window.setTimeout(run, 0)
//     })
// }
