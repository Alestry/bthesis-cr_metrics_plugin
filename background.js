//Function to get the current tab (this only works as a background script)
async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab.url;
}


//Initialize the variables and storage
chrome.runtime.onInstalled.addListener(() => {
    //Initialize variables
    let loggingstatus = true;
    let sessionstatus = false;
    let loggingStartTime = 0;
    let logText = "";
    let fullLog = "";
    let currentURL = "";
    let currentTab = getCurrentTab();
    let fileTimers = [[], []];
    let currentFileTimer = ["", ""];
    //Initialize storage
    chrome.storage.sync.set({ loggingstatus, sessionstatus, loggingStartTime, logText, fullLog, currentURL, currentTab, fileTimers, currentFileTimer });
});


//On active tab change, update the storage with the new active tab
/*chrome.tabs.onActivated.addListener(() => {
    currentTab = getCurrentTab();
    chrome.storage.sync.set({ currentTab });
});*/


//Listener for URL change
chrome.tabs.onUpdated.addListener(
    function (tabId, changeInfo, tab) {
        if (changeInfo.url) {
            chrome.tabs.sendMessage(tabId, {
                message: "urlchange",
                url: changeInfo.url
            });
        }
    }
);