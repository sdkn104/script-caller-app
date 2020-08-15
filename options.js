
{
  // set links
  document.getElementById("install_page1").href = chrome.runtime.getURL("install.html");
  document.getElementById("install_page2").href = chrome.runtime.getURL("install.html");
  document.getElementById("store_page").href= "https://chrome.google.com/webstore/detail/"+chrome.runtime.id;
}