(function(){
	var choppaActive = true;
	chrome.extension.sendMessage({action: 'getChoppaActive'}, function(response) {
		choppaActive = response.isActive;
	});
	chrome.extension.onMessage.addListener(
		function(request, sender) {
			if (request.action == 'setChoppaActive') {
				choppaActive = request.isActive;
			}
		}
	);
	$('a[href]').click(function(e) {
		if (choppaActive) {
			e.preventDefault();
			chrome.extension.sendMessage({
				action: 'getToDaTab',
				destinationUrl: $(this)[0].href,
				newTab: (e.ctrlKey || e.metaKey),
				newWin: (e.shiftKey)
			});
		}
	});
})();