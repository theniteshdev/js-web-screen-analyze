# Server — image upload + OpenRouter analysis

This small Express server accepts an image upload from a client, forwards the image to an OpenRouter model for analysis, and returns the model's response.

## Setup

1. Copy `.env.example` to `.env` and set `OPENROUTER_API_KEY` (and optionally `OPENROUTER_MODEL`).
2. Install dependencies:

```bash
cd server
npm install
```

3. Start the server:

```bash
npm start
```

4. Open `http://localhost:3000` and test with the built-in upload form.

## Notes

- The example implementation encodes the image as a base64 data URI and includes it inline in a chat-style request to OpenRouter. Ensure the chosen model supports image inputs; you may need to adapt `analyzeImageWithOpenRouter` in `index.js` if your model requires a different input format.
- Do not commit your real API key into the repository — keep it in `.env` or a secrets manager.
