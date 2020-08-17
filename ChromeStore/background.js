// Copyright (C) 2020 hashedtomato3@gmail.com
// License: MIT 

// import common parameters
import {appName, storageKey} from "./common.js"

// on install, setup browser action icon and menu
chrome.runtime.onInstalled.addListener(setupAll);

// on startup of browser, setup browser action icon
chrome.runtime.onStartup.addListener(createBrowserActionIcon);

// on click of setup botton in option page, setup browser action icon and menu
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if( message.cmd == "setup" ) {
        setupAll(null)
    }
});


// setup browser action icon and menu
function setupAll(details) {
    // send message to native host to get browser icon and injection codes
    let message  = { cmd: "get-options" }
    console.log("---- setup all ----")
    console.log("request to native host:")
    console.log(message)
    chrome.runtime.sendNativeMessage(appName, message, response => {
        console.info("response: ");
        console.info(response);
        if (typeof response === "undefined") { // error occur in connecting to host
            // if native host not installed, show installation inscructions
            if( chrome.runtime.lastError.message ){
                alert("Error occurs in connecting to native client:\n"+chrome.runtime.lastError.message);
            }
            chrome.tabs.create({
                url: chrome.runtime.getURL("install.html")
            });
            //console.log(chrome.runtime.lastError)
        } else if( "error" in response ) { // error in native host
            alert("ERROR in native host:\n" + JSON.stringify(response, ["error","message"], 4))
        } else {
            // if native host is installed, store get info to storage
            const item = {
                [storageKey] : response,
            };
            chrome.storage.local.set(item, function() {
                console.log("saved to storage:")
                console.log(item)
                createBrowserActionIcon()
            });
        }
    });
}


// setup browser action icon
function createBrowserActionIcon() {
    // load icon/menu info from storage
    chrome.storage.local.get(storageKey, function(data){        
        console.log("setup browser action icon")
        // set title
        let title = data[storageKey].browserAction.title;
        chrome.browserAction.setTitle({title:title})
        // set icon image
        let icon = data[storageKey].browserAction.icon;
        if( icon ){
            // convert data URL to ImageData
            let img = new Image();
            img.src = icon;
            img.onload = function(){
                let canvas = document.createElement('canvas');
                canvas.width = 16;
                canvas.height = 16;
                let context = canvas.getContext('2d');
                context.drawImage(img, 0, 0, 16, 16);
                let icon = context.getImageData(0, 0, 16, 16);
                // set icon image
                chrome.browserAction.setIcon({imageData:icon})    
            }
        }
    });
}

// on click of browser action menu item
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if( message.cmd == "click" ) {
        // read local storage
        console.info("---- menu item clicked ----")
        chrome.storage.local.get(storageKey, function(storageData){
            // execute injection code
            let code = storageData[storageKey].injectionCode[message.idx]
            console.info("injection code to be executed:")
            console.info(code)
            if( !code ) { code = "" }
            chrome.tabs.executeScript({code:code}, function(injectionCodeResults){
                // send message to native host to execute native code
                let nativeScript = storageData[storageKey].browserAction.menu[message.idx].nativeScript
                if( nativeScript ){
                    let msg = {cmd:"click", idx:message.idx, injectionCodeResults:injectionCodeResults}
                    console.info("request to native host:")
                    console.info(msg)
                    chrome.runtime.sendNativeMessage(appName, msg, response => {
                        console.info("response:");
                        console.info(response);
                    });    
                }
            });
        });    
    }
});


