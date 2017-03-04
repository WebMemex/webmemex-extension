import './activity-logger/background'
//import importBookmarks from './browser-bookmarks/import-bookmarks'

function openOverview() {
    browser.tabs.create({
        url: '/overview/overview.html',
    })
}

// Open the overview when the extension's button is clicked
browser.browserAction.onClicked.addListener(() => {
    console.log("Hello World");
    //importBookmarks();
    openOverview()
})

browser.commands.onCommand.addListener(command => {
    if (command === "openOverview") {
        openOverview()
    }
})
