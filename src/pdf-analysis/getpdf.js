
// XMLHttpRequest requests get file from cache
// in case it is recently opened, does not download again.
export default function getPDF(url) {
    return new Promise(function(resolve, reject) {
        var blob = null
        var xhr = new XMLHttpRequest()
        xhr.open("GET", url)
        xhr.responseType = "blob"
        xhr.onload = function()
        {
            resolve(xhr.response);
        }
        xhr.send()
    });
}
