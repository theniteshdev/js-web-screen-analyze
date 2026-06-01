chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "capture_tab") {
        // Captures the visible area of the currently selected window tab as a JPEG base64 data URI
        chrome.tabs.captureVisibleTab(null, { format: "jpeg", quality: 80 }, (dataUrl) => {
            if (chrome.runtime.lastError) {
                sendResponse({ error: chrome.runtime.lastError.message });
            } else {
                sendResponse({ imageData: dataUrl });
            }
        });
        return true; // Keep message channel open for asynchronous processing wrapper
    }
});