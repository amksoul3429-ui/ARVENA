# Connect AERIS to Cloudflare Workers AI (free tier)

This adds a private server-side AI endpoint. The AI secret is not placed in the public ARVENA website or GitHub source.

## What you need
- A Cloudflare account on the Free plan.
- Access to the ARVENA GitHub repository.
- A long random access token that you keep private.

Cloudflare Workers AI currently includes a free daily inference allocation (10,000 Neurons/day); usage is limited and can stop when the allowance is exhausted. Model availability and limits can change. Check the current pricing page before relying on it:
https://developers.cloudflare.com/workers-ai/platform/pricing/

## Deploy the Worker from GitHub
1. Sign in to https://dash.cloudflare.com/ and open **Workers & Pages**.
2. Choose **Create application** / **Create Worker**, then choose the GitHub repository option if offered.
3. Connect GitHub and select `amksoul3429-ui/ARVENA`.
4. Configure the Worker to use the repository root (the root contains `wrangler.jsonc`) and deploy with Wrangler. If the dashboard asks for a deploy command, use `npx wrangler deploy`.
5. The Worker name is `arvena-aeris`. After deployment, copy its `https://arvena-aeris.<your-subdomain>.workers.dev` URL.

If the dashboard's Git integration does not expose the Wrangler configuration automatically, create a Worker named `arvena-aeris`, paste the contents of `worker/index.js` into its editor, add the Workers AI binding named `AI`, and deploy.

## Add the private access secret
1. In the Worker, open **Settings → Variables and Secrets**.
2. Add a variable of type **Secret** named exactly `ARVENA_ACCESS_TOKEN`.
3. Set its value to a long random token (at least 32 random characters). Do not use your GitHub password or any account password.
4. Save and deploy the Worker again.

## Connect the ARVENA app
1. Open https://amksoul3429-ui.github.io/ARVENA/
2. Open AERIS, then its settings (gear icon).
3. Paste the Worker URL and the exact same access token. Save.
4. Send AERIS a test question.

The URL and token are stored only in this browser's local storage. Do not share the token. If you lose it, replace the Worker secret and update the app settings.

## Privacy and limits
- Messages you send to AERIS are sent to Cloudflare Workers AI for inference.
- The Worker only accepts requests from the official ARVENA GitHub Pages origin and requires the private access token.
- The endpoint does not intentionally store chat messages.
- Free inference is limited; this does not promise unlimited AI.
- This connects text intelligence only. It does not create AI video lessons or connect the Universal Knowledge sources.
