# Web Scrolling Vision Analyzer

An end-to-end system consisting of a lightweight Chrome Extension (Manifest V3) and a Node.js Express backend server. The extension automates page scrolling, captures a baseline visual screenshot of the viewport, encodes it to Base64, and transmits it to the server. The backend processes the payload using OpenRouter's vision intelligence models (e.g., Gemini or GPT-4o) and returns an analysis of what is visible on the screen.

## Project Architecture

- **Client (Chrome Extension)**: Automates viewport scrolling via injection scripting, captures the visual frame directly from the active tab container, and handles report downsampling.
- **Server (Express Backend)**: Instantiates local configuration settings, unpackages incoming data URIs, and handles upstream OpenRouter payloads with strict size parsing constraints.

---

## Server Setup

### Prerequisites

- Node.js (v18 or higher recommended)
- An active OpenRouter API Key

### Installation

1. Navigate to your server project directory:

```bash
git clone https://github.com/theniteshdev/js-web-screen-analyze.git
cd js-web-screen-analyze
```

cd server

````

2. Initialize your project and install dependencies:
   ```bash
   npm init -y
   npm install express node-fetch cors

````

3. Create a `.env` file in the root directory of the server project:

```env
PORT=3000
OPENROUTER_API_KEY=your_actual_openrouter_api_key_here

```

````

### Code Configuration

Ensure your server entry file (e.g., `index.js` or `server.js`) utilizes the custom environment loader, sets up CORS to accept extension requests, and accommodates large base64 payload strings:

```javascript
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import loadEnv from './loadEnv.js'; // Custom .env reader utility

loadEnv();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware configuration
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Allows parsing of large image payloads

app.post('/analyze-image', async (req, res) => {
  try {
    const { base64Image } = req.body;
    if (!base64Image) {
      return res.status(400).json({ error: 'Missing base64Image in request body' });
    }

    // Standardize data representation by removing any incoming URI scheme prefixes
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash', // Fast, precise, and cost-effective vision model
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this image in detail and describe everything that is visible.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${cleanBase64}`
                }
              }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error || 'OpenRouter Upstream Error' });
    }

    const analysis = data.choices[0].message.content;
    res.json({ success: true, analysis });

  } catch (error) {
    console.error('Server Processing Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => console.log(`Server executing successfully on port ${PORT}`));

````

---

## Extension Deployment

### Installation

1. Create an isolated directory named `extension` on your local disk.
2. Place the project files inside the directory:

- `manifest.json`
- `popup.html`
- `popup.js`

3. Launch Google Chrome and navigate to `chrome://extensions/`.
4. Enable **Developer mode** using the toggle switch located in the upper right quadrant.
5. Click **Load unpacked** in the top-left corner and select your `extension` directory.

### Extension Specifications

The client leverages standard Chrome APIs to safely perform automated interactions:

- `activeTab`: Grants access to execute screen-capturing sequences on the current focused tab.
- `scripting`: Injects native window frame scrolling events (`window.scrollBy`).
- `downloads`: Triggers localized creation of plain-text system summaries.

---

## Execution Flow and Usage

1. Start your local Node.js server environment:

```bash

```

node index.js

```
2. Open Chrome and navigate to any public website (e.g., a news site, technical document, or blog).
3. Click the extension icon in your toolbar to activate the popup interface.
4. Input your desired scroll iteration count (each iteration scrolls down exactly one full viewport frame height).
5. Click **Scroll & Analyze**.
6. The extension will automatically scroll the specified number of times, pause briefly to let content settle, capture the viewport frame, and transmit it to the server.
7. Review the markdown-formatted textual analysis directly inside the extension output wrapper.
8. Click **Download Response (.txt)** to archive the intelligence report locally.

## Troubleshooting Notes

*   **Internal Browser Pages**: Chrome security policies strictly block scripts from executing on standard internal pages (such as `chrome://` or the Chrome Web Store). Always validate execution paths on a standard live internet address.
*   **Payload Limit Adjustments**: If your vision pipeline rejects high-resolution snapshots, verify that your server configuration includes the explicit `express.json({ limit: '50mb' })` payload declaration block before handling runtime routing logic.

```
