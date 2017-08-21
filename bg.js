var executionInProgress = false;
var removalMethod = null;
var victimUrlArray = null;

chrome.runtime.onConnect.addListener(function(port) {
    port.onMessage.addListener(function(msg) {
        if (msg.type === 'initVictims') {
            executionInProgress = true;
            victimUrlArray = msg.rawTxt.replace(/^\s+|\s+$/g, '').split('\n');
            removalMethod = msg.removalMethod;

            var victimUrl = victimUrlArray.pop();
            port.postMessage({
                'type': 'removeUrl',
                'victim': victimUrl,
                'removalMethod': removalMethod
            });
        } else if (msg.type === 'nextVictim') {
            // find the next victim
            if (executionInProgress) {
                // Set a 1 second timeout between requests as Google will prevent multiple requests coming in too fast
                setTimeout(function() {
                    var victimUrl = victimUrlArray.pop();
                    if (victimUrl !== undefined) {
                        port.postMessage({
                            'type': 'removeUrl',
                            'victim': victimUrl,
                            'removalMethod': removalMethod
                        });
                    } else {
                        executionInProgress = false; //done
                        removalMethod = null;
                        victimUrlArray = null;
                        alert("Done!");
                    }
                }, 1000); // 1 Second timeout
            } else {
                console.log("no victim to be executed."); //xxx
            }
        } else if (msg.type == 'askState') {
            port.postMessage({
                'type': 'state',
                'executionInProgress': executionInProgress,
                'removalMethod': removalMethod
            });
        }
    });
});