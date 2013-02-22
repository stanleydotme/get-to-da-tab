(function(){
	var choppaActive = true;
	chrome.browserAction.onClicked.addListener(function(tab) {
		choppaActive = !choppaActive;
		switch(choppaActive) {
			case true:
				chrome.browserAction.setIcon({ path: "img/heli-red-48.png" });
				break;
			case false:
				chrome.browserAction.setIcon({ path: "img/heli-48.png" });
				break;
		}
		chrome.windows.getAll({populate:true}, function(windows) {
			for (i=0; i<windows.length; i++) {
				for (j=0; j<windows[i].tabs.length; j++) {
					chrome.tabs.sendMessage(windows[i].tabs[j].id, { action: "setChoppaActive", isActive: choppaActive });
				}
			}
		});
	});
	chrome.extension.onMessage.addListener(
		function(request, sender, sendResponse) {
			if (request.action == 'getChoppaActive') {
				sendResponse({isActive: choppaActive});
			}
			if (request.action == 'getToDaTab') {
				chrome.windows.getAll({populate:true}, function(windows) {
					if (choppaActive) {
						if (compareTabsToUrlAndOpen(windows, request)) {
							return; // exit if url already handled
						}
					}
					// no existing tab, open it
					if (request.newTab) {
						chrome.tabs.create({
							url: request.destinationUrl,
							active: true
						});
					}
					else if (request.newWin) {
						chrome.windows.create({
							url: request.destinationUrl,
							focused: true
						});
					}
					else {
						chrome.tabs.update(sender.tab.id, { url: request.destinationUrl, selected: true });
					}
				});
			}
		}
	);
	
	var compareTabsToUrlAndOpen = function (windows, request){
		for (i=0; i<windows.length; i++) {
			for (j=0; j<windows[i].tabs.length; j++) {
				if (removeFragment(request.destinationUrl) === removeFragment(windows[i].tabs[j].url)) {
					// update existing tab with new URL (to handle anchor links)
					chrome.tabs.update(windows[i].tabs[j].id, { url: request.destinationUrl, selected: true });
					return true;
				}
			}
		}
		return false;
	}

	var removeFragment = function(url) {
		if (url.indexOf('#') === -1) {
			return(url);
		}
		else {
			return(url.substr(0, url.indexOf('#')));
		}
	}
})();