import { whenPageDOMLoaded } from '../../util/tab-events'
import performPageAnalysis from '../../page-analysis/background'
import storeVisit from './store-visit'
import { isWorthRemembering } from '..'

//array to store added pages for this section
let pages = []

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

let pageLoaded = function(item){
    pages.forEach((page)=>{
        if(item === page){
            return true;
        }
    });
    return false;
}

let navigated = function(details){
     console.log(details);
    // Ignore pages loaded in frames, it is usually noise.
    if (details.frameId !== 0)
        return

    if (!isWorthRemembering({url: details.url}))
        return

    // check to make sure the page has not been loaded before by any of the listeners.To avoid double loading
    if(pageLoaded({tabId: details.tabId, url: details.url})){
        return
    }

    // Consider every navigation a new visit.
    logPageVisit({
        url: details.url
    }).then(        
        // Wait until its DOM has loaded.
        value => whenPageDOMLoaded({tabId: details.tabId}).then(()=>value)
    ).then(({visitId, pageId}) => {

        //add the loaded page to the array to prevent double loading due to double checks
        pages.push({tabId: details.tabId, url: details.tabId});

        // Start page content analysis (text extraction, etcetera)
        performPageAnalysis({pageId, tabId: details.tabId})
    });
}




// Listen for navigations to log them and analyse the pages.
browser.webNavigation.onCommitted.addListener((details)=>navigated(details))

// Listen for navigations in web apps to log them and analyse the pages.
browser.webNavigation.onHistoryStateUpdated.addListener((details)=>{
    browser.tabs.get(details.tabId,(tab)=>{
        
        //make sure the page logged is the nal page that is reached by the history change action
        if(tab.url===details.url)
            navigated(details)
    });
});
