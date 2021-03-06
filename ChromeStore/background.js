// Copyright (C) 2020 hashedtomato3@gmail.com
// License: MIT 

// import common parameters
import {appName, storageKey, sendMessageToNativeHost} from "./common.js"

// on installation of this extension, setup browser action icon and menu
chrome.runtime.onInstalled.addListener((details)=>{
    if( details.reason === "install" ){ // on install
        setupAll(null);
    }
});

// on startup of browser, setup browser action icon in Chrome toolbar
chrome.runtime.onStartup.addListener(createBrowserActionIcon);

// on message from options page or popup menu
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if( message.cmd == "setup" ) { // on click of setup botton in option page
        // setup browser action icon and menu
        setupAll(null, "Setup OK.")
    } else if( message.cmd === "click" ){ // on click of browser action menu item
        actionForClickMenuItem(message, sendResponse)
    }
    return true; // this is nessesary for response to caller page
});


// setup browser action icon and menu
function setupAll(details, successMessage = "") {
    sendMessageToNativeHost({cmd: "get-data"}, function(response){
        // store get info to storage
        const item = {
            [storageKey] : response,
        };
        chrome.storage.local.set(item, function() {
            console.log("saved to storage:")
            console.log(item)
            createBrowserActionIcon(successMessage)
        });
    });
}


// setup browser action icon
function createBrowserActionIcon(successMessage = "") {
console.log("get message ")
    // load icon info from storage
    chrome.storage.local.get(storageKey, function(data){        
        console.info("load browser action icon data from local storage:")
        console.log(data[storageKey].browserAction);
        // set title
        let title = data[storageKey].browserAction.title;
        chrome.browserAction.setTitle({title:title});
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
        console.info("icon setup finished.")
        if(successMessage) {
            alert(successMessage);
        }
    });
}

// on click of browser action menu item
function actionForClickMenuItem(message, sendResponse) {
    console.info("---- menu item clicked ----")
    // load injection code from local storage
    chrome.storage.local.get(storageKey, function(storageData){
        // execute injection code
        console.log(storageData[storageKey].browserAction)
        let code = storageData[storageKey].browserAction.menu[message.idx].injectionScript;
        if( code === undefined ) { code = "'no injection code';" }
        console.info("injection code to be executed:")
        console.info({code:code})
        chrome.tabs.executeScript({code:code}, function(injectionCodeResults){
            console.info("return value from injection code:");
            console.log(injectionCodeResults);
            if(injectionCodeResults[0].error && injectionCodeResults[0].message){
                // return error from injection code
                sendResponse(injectionCodeResults[0]); // response to popup.js
                return;
            }
            // send message to native host to execute native code
            let nativeScript = storageData[storageKey].browserAction.menu[message.idx].nativeScript;
            if( ! /^\s*$/.test(nativeScript) ) { // if native script exists
                let msg = {cmd:"click", idx:message.idx, injectionCodeResults:injectionCodeResults}
                console.info("request to native host:")
                console.log(msg)
                chrome.runtime.sendNativeMessage(appName, msg, response => {
                    console.info("response from native host:");
                    console.log(response);
                    sendResponse(response); // response to popup.js
                });    
            }
            //return true;
        });
        //return true;
    });    
}


