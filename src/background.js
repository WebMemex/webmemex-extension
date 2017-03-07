import './activity-logger/background'


function openOverview() {
    browser.tabs.create({
        url: '/overview/overview.html',
    })
}

// Open the overview when the extension's button is clicked
browser.browserAction.onClicked.addListener(() => {
    console.log("Hello World");
    openOverview()
})

browser.commands.onCommand.addListener(command => {
    if (command === "openOverview") {
        openOverview()
    }
})
