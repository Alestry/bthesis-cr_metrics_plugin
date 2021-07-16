//Function to convert the Date
function getTimeStamp(date) {
    currentYear = date.getFullYear();
    currentMonth = date.getMonth() + 1;
    currentDay = date.getDate();
    currentHour = date.getHours();
    currentMinute = date.getMinutes();
    currentSeconds = date.getSeconds();
    currentMilliseconds = date.getTime() % 1000;
    processedTimeStamp = currentYear + "/" + currentMonth + "/" + currentDay + "-" + currentHour + ":" + currentMinute + ":" + currentSeconds + ":" + currentMilliseconds;
    return processedTimeStamp;
}


//Function to log the current timestamp with the current element
function log(element) {
    timeStamp = getTimeStamp(new Date());
    chrome.storage.sync.get("logText", ({ logText }) => {
        logText += timeStamp + /*(23 - timeStamp.length + 4) **/ '    ' + 'CLICK: ' + element.constructor.name + ' - ' + element.nodeName + ' - ' + element.innerHTML.substring(0, 150) + '\n';
        console.log(timeStamp + /*(23 - timeStamp.length + 4) **/ '    ' + 'CLICK: ' + element.constructor.name + ' - ' + element.nodeName + ' - ' + element.innerHTML.substring(0, 150) + '\n');
        chrome.storage.sync.set({ logText });
    });
}


//Function to check the current URL and compare with the "old" one
/*function urlChangeDetector() {
    console.log("execute");
    chrome.storage.sync.get("currentURL", ({ currentURL }) => {
        let newURL = location.href;
        if (currentURL != newURL) {
            currentURL = newURL;
            chrome.storage.sync.set({ currentURL });
        }
    });
}*/


//Handle changes in the storage
function storageChangedListener(changed) {
    //Make a list of all changed items
    changedStorageItems = Object.keys(changed);

    //Go through all of the items in the storage
    for (item of changedStorageItems) {

        //Create a log message with a timestamp when a logging session is started/ended
        if (item == "loggingstatus") {
            oldItemValue = changed[item].oldValue;
            newItemValue = changed[item].newValue;

            //Log when a session starts/ends. The absolute time is needed in the storage to determine a logging session's length
            date = new Date();
            let absoluteTime = date.getTime();

            //Determine whether it is the start or the end of a logging session and log the appropriate message
            if (oldItemValue == false && newItemValue == true) {
                loggingStartTime = absoluteTime;
                chrome.storage.sync.set({ loggingStartTime });
                chrome.storage.sync.get("logText", ({ logText }) => {
                    let currentURL = location.href;
                    logText = "New logging session started at " + getTimeStamp(date) + "\nStarting URL:  " + currentURL + "\n";
                    chrome.storage.sync.set({ logText, currentURL });
                });

                //Log the current tab
                chrome.storage.sync.get("currentTab", ({ currentTab }) => {
                    console.log(currentTab);
                });
            }
            if (oldItemValue == true && newItemValue == false) {
                chrome.storage.sync.get(["loggingStartTime", "logText", "loggingFinished"], ({ loggingStartTime, logText, loggingFinished}) => {
                    timePassed = absoluteTime - loggingStartTime;
                    loggingFinished = true;
                    logText += "Ending URL:  " + location.href + "\nCurrent logging session ended at " + getTimeStamp(date) + " after " + timePassed + " ms\n";
                    chrome.storage.sync.set({ loggingStartTime, logText, loggingFinished });
                });
            }
        }

        //Log the new fucused tab when a tab change occurs
        if (item == "currentTab") {
            console.log("Checkpoint");
            if (changed[item].newValue != changed[item].oldValue) {
                console.log("Tab has changed!");
            }
        }

    }
}


//Get element clicked
document.addEventListener("click", function (e) {
    e = e || window.event;
    var target = e.target || e.srcElement;
    chrome.storage.sync.get("loggingstatus", ({ loggingstatus }) => {
        if (loggingstatus) {
            log(target);
        }
    });
}, false);


//Listener for changes in the storage
chrome.storage.onChanged.addListener(storageChangedListener);


//Listener for tab/url changes
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message === "urlchange") {
        chrome.storage.sync.get(["loggingstatus", "logText"], ({ loggingstatus, logText }) => {
            if (loggingstatus) {
                timeStamp = getTimeStamp(new Date());
                logText += timeStamp + /*(23 - timeStamp.length + 4) **/ '    '+ 'URL changed to ' + request.url + '\n';
                console.log(timeStamp + /*(23 - timeStamp.length + 4) **/ '    ' + 'URL changed to ' + request.url + '\n');
                chrome.storage.sync.set({ logText });
            }
        });
    }
});