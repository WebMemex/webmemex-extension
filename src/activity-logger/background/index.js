import maybeLogPageVisit from './log-page-visit'

// Listen for navigations to log them and analyse the pages.
browser.webNavigation.onCommitted.addListener(({url, tabId, frameId}) => {
    // Ignore pages loaded in frames, it is usually noise.
    if (frameId !== 0) {
        return
    }

    maybeLogPageVisit({url, tabId})
})


//********************************************************************************/


var number_of_opened_tabs = 0;

var tabList = [];


/*chrome.runtime.onMessage.addListener(function(response,sender,sendResponse){
    alert(response);
});*/


browser.tabs.onCreated.addListener(function (tab){
    number_of_opened_tabs = number_of_opened_tabs + 1;
    //console.log('total opened tabs: ' + number_of_opened_tabs);
    var tabObj = {
        id : tab.id,
        activetime : 0,
        isActive : false,
        lastActivatedtime : Number(new Date().now())
    };
    tabList.push(tabObj);
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
            tabList[index].lastActivatedtime = Number(new Date().now());
            console.log('a tab went inactive : ' + tabList[index].id);
        }
        
    }
    for (var index in tabList){
        if(tabList[index].id == tab.tabId){
            var currTimestamp = Number(new Date().now())
            var difference = currTimestamp - tabList[index].lastActivatedtime;
            tabList[index].activetime += difference;
            tabList[index].isActive = true;
            console.log('a tab came active : ' + tabList[index].id);
            console.log('tab ' + tabList[index].id +' had been in that page for '+ tabList[index].activetime + 'ms');
        }
        
    }
    
})


