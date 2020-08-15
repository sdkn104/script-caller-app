// Copyright (C) 2020 hashedtomato3@gmail.com
// License: MIT 

// load common parameters
import {appName, storageKey} from "./common.js"

// get url of current tab
chrome.tabs.executeScript({
    code: 'location.href'
}, 
function(results){
    let url = results[0]
    let content = document.getElementById("content")

    chrome.storage.local.get(storageKey, function(data){        
        // draw title
        let title = data[storageKey].browserAction.title;
        document.getElementById("title").innerText = title;
        // draw menu items
        let menu = data[storageKey].browserAction.menu;
        menu.forEach(function(m) {
            if( !("matches" in m) || m.matches.some((p) => url.startsWith(p)) ) {
                // add a button on popup menu
                let inp = document.createElement("input")
                inp.type = "button"
                inp.value = m.title;
                inp.name = m.id;
                inp.onclick = function(evt){
                    let id = evt.target.name;
                    let message = {cmd:"click", id:id}
                    chrome.runtime.sendMessage(message);
                    window.close();
                }
                content.appendChild(inp)    
            }
        });
    });    
});
