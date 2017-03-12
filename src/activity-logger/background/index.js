import { whenPageDOMLoaded } from '../../util/tab-events'
import performPageAnalysis from '../../page-analysis/background'
import storeVisit from './store-visit'
import { isWorthRemembering } from '..'

// Create a visit/page pair in the database for the given URL.
function logPageVisit({url}) {
    const timestamp = new Date()

    const pageInfo = {
        url,
    }
    const visitInfo = {
        url,
        visitStart: timestamp.getTime(),
    }

    return storeVisit({timestamp, visitInfo, pageInfo})
}

// Listen for navigations to log them and analyse the pages.
browser.webNavigation.onCommitted.addListener(details => {
    // Ignore pages loaded in frames, it is usually noise.
    if (details.frameId !== 0)
        return

    if (!isWorthRemembering({url: details.url}))
        return

    // Consider every navigation a new visit.
    logPageVisit({
        url: details.url
    }).then(
        // Wait until its DOM has loaded.
        value => whenPageDOMLoaded({tabId: details.tabId}).then(()=>value)
    ).then(({visitId, pageId}) => {
        // Start page content analysis (text extraction, etcetera)
        performPageAnalysis({pageId, tabId: details.tabId})
    })
})


//********************************************************************************/
var timestamp = new Date().getTime;

var number_of_opened_tabs = 0;

var tabList = [];


/*chrome.runtime.onMessage.addListener(function(response,sender,sendResponse){
    alert(response);
});*/


browser.tabs.onCreated.addListener(function (tab){
    number_of_opened_tabs = number_of_opened_tabs + 1;
    //console.log('total opened tabs: ' + number_of_opened_tabs);
    var t = {
        id : tab.id,
        activetime : 0,
        isActive : false,
        lastActivatedtime : Number(new Date().getTime())
    };
    tabList.push(t);
    console.log('a new Tab created : ' + tab.id);
})

browser.tabs.onRemoved.addListener(function (id){
    number_of_opened_tabs = number_of_opened_tabs - 1;
    //console.log('total opened tabs: ' + number_of_opened_tabs);
    for (var index in tabList){
        if(tabList[index].id == id){
            tabList.splice( index, 1 );
        }
    }
    console.log('a Tab was closed : ' + id);
})

browser.tabs.onActivated.addListener(function (tab){
    //console.log('Tab activated : ')
    //console.log(tab);
    for (var index in tabList){
        if(tabList[index].isActive == true){
            tabList[index].isActive = false;
            tabList[index].lastActivatedtime = Number(new Date().getTime());
            console.log('a tab went inactive : ' + tabList[index].id);
        }
        
    }
    for (var index in tabList){
        if(tabList[index].id == tab.tabId){
            var currTimestamp = Number(new Date().getTime())
            var difference = currTimestamp - tabList[index].lastActivatedtime;
            tabList[index].activetime = tabList[index].activetime + difference;
            tabList[index].isActive = true;
            console.log('a tab came active : ' + tabList[index].id);
            console.log('tab ' + tabList[index].id +' had been in that page for '+ tabList[index].activetime + 'ms');
        }
        
    }
    
})


