const BACKEND_URL = 'http://localhost:3000/analyze-image';

document.getElementById('startBtn').addEventListener('click', async () => {
    const startBtn = document.getElementById('startBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const statusText = document.getElementById('statusText');
    const output = document.getElementById('output');
    const scrollTimes = parseInt(document.getElementById('scrollTimes').value) || 1;

    // UI Setup
    startBtn.disabled = true;
    downloadBtn.style.display = 'none';
    output.value = '';

    try {
        // 1. Get the active browser tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) throw new Error("No active tab found.");

        // 2. Loop through the scrolling action 'n' times
        for (let i = 1; i <= scrollTimes; i++) {
            statusText.innerText = `Scrolling (${i}/${scrollTimes})...`;

            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => window.scrollBy(0, window.innerHeight)
            });

            // Pause briefly for any lazy-loading elements to render
            await new Promise(resolve => setTimeout(resolve, 800));
        }

        statusText.innerText = "Capturing visual state...";

        // 3. CAPTURE DIRECTLY IN POPUP (Fixes the background worker timeout bug)
        const dataUrl = await new Promise((resolve, reject) => {
            chrome.tabs.captureVisibleTab(null, { format: "jpeg", quality: 80 }, (res) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else if (!res) {
                    reject(new Error("Captured image is empty. Try a different webpage."));
                } else {
                    resolve(res);
                }
            });
        });

        statusText.innerText = "Processing image data via Vision Server...";

        // 4. Send the base64 string directly to your local backend server
        const serverReply = await fetch(BACKEND_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base64Image: dataUrl })
        });

        const result = await serverReply.json();

        if (!serverReply.ok) {
            throw new Error(result.error || "Server responded with an execution failure.");
        }

        // Output server metrics directly to screen UI element
        output.value = result.analysis;
        statusText.innerText = "Analysis Complete!";
        downloadBtn.style.display = 'block';

    } catch (err) {
        statusText.innerText = "Process halted.";
        output.value = `[Error]: ${err.message}`;
    } finally {
        startBtn.disabled = false;
    }
});

// Download Handler
document.getElementById('downloadBtn').addEventListener('click', () => {
    const textContent = document.getElementById('output').value;
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    chrome.downloads.download({
        url: url,
        filename: 'image-analysis-report.txt',
        saveAs: true
    });
});