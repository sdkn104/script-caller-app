// Copyright (C) 2020 hashedtomato3@gmail.com
// License: MIT 

// load common parameters
import {appName, storageKey} from "./common.js"

// load data from local storage
chrome.storage.local.get(storageKey, function(data){        
    // draw title
    let title = data[storageKey].browserAction.title;
    document.getElementById("title").innerText = title;
    // get url of current tab
    chrome.tabs.executeScript({ // ! this generates error if the page is "chrome://*", etc.
        code: 'location.href'
    }, 
    function(results){
        //alert(9999)
        let url = results[0]
        let content = document.getElementById("content")
        // draw menu items
        let menu = data[storageKey].browserAction.menu;
        menu.forEach(function(m, idx) {
            if( !("matches" in m) || m.matches.some((p) => url.startsWith(p)) ) {
                // add a button on popup menu
                let inp = document.createElement("input")
                inp.type = "button"
                inp.value = m.title;
                inp.name = idx;
                inp.onclick = function(evt){
                    let i = evt.target.name;
                    let message = {cmd:"click", idx:i}
                    chrome.runtime.sendMessage(message);
                    window.close();
                }
                content.appendChild(inp)    
            }
        });
    });
});
