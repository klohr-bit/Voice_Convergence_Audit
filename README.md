# NARROW VERSION, DEPLOY GUIDE

Goal: deploy the engine to a public URL so a few friends/colleagues can paste writing into it and get back the diagnostic plus rewrite.

Total time: 20 to 30 minutes if you have a GitHub account. The path uses Vercel (free) and Anthropic's Claude API (pay-as-you-go, cents per query).

---

## WHAT YOU GET

Five files in this folder:

```
narrow_version/
├── engine_system_prompt.md     # The engine. Drop this into any API call as the system message.
├── api/
│   └── analyze.js               # Serverless function. Receives writing, calls Claude, returns result.
├── index.html                   # Simple web UI. Friends visit this and paste writing.
├── package.json                 # Node dependencies.
└── README.md                    # This file.
```

The `engine_system_prompt.md` is the actual product. Everything else is a thin wrapper so people can use it.

---

## STEP 1: GET API ACCESS

You need an Anthropic API key. Sign up at https://console.anthropic.com, add a payment method, generate a key. Cost per analysis is roughly $0.01 to $0.03 depending on length.

(If you prefer OpenAI, the analyze.js file has instructions at the bottom for swapping providers. The system prompt works with either.)

Save the key somewhere safe. You will paste it into Vercel in Step 3.

---

## STEP 2: GET THE FILES INTO GITHUB

1. Create a new GitHub repository (private is fine). Name it something like `convergence-engine`.
2. Upload the contents of the `narrow_version/` folder to the root of the repo. Use the GitHub web uploader if you're not comfortable with command line.
3. Confirm the structure looks like:
   ```
   convergence-engine/
   ├── engine_system_prompt.md
   ├── api/analyze.js
   ├── index.html
   ├── package.json
   └── README.md
   ```

---

## STEP 3: DEPLOY TO VERCEL

1. Go to https://vercel.com, sign in with GitHub.
2. Click "Add New" → "Project".
3. Import the repo you just created.
4. On the configuration screen, click "Environment Variables" and add:
   - Name: `ANTHROPIC_API_KEY`
   - Value: (paste your Anthropic key)
5. Click "Deploy". Wait 30 to 60 seconds.
6. Vercel gives you a URL like `convergence-engine-yourname.vercel.app`.

That URL is your test product.

---

## STEP 4: TEST IT

1. Open the Vercel URL in your browser.
2. Paste a piece of writing into the textarea.
3. Optionally pick a mode.
4. Click Analyze.
5. The four-section output (Signature Score, Default Map, Rewrite, Why) appears below.

If the response shows an error: check that your Anthropic key is correct in Vercel's environment variables. Redeploy after fixing.

---

## STEP 5: SHARE WITH TESTERS

Send them the Vercel URL. They don't need accounts or installs. They paste writing, click Analyze, get output.

Tell them what you want feedback on. Suggestions:
- Does the rewrite still sound like the original writer?
- Did the Default Map flag anything they disagreed with?
- Did the score feel honest?
- Was the mode auto-detect correct?

Keep their actual writing samples and the engine's outputs. You'll want these when you build v2.

---

## NOTES ON COSTS AND LIMITS

Anthropic's Claude charges roughly $3 per million input tokens and $15 per million output tokens. The system prompt is around 4,000 tokens, so each query costs about $0.012 to $0.03 depending on the length of the writing.

If you're worried about runaway costs, set a monthly limit in the Anthropic console under Settings → Limits.

Vercel's free tier handles thousands of requests per month at no charge.

---

## TO MODIFY THE ENGINE

The engine lives entirely in `engine_system_prompt.md`. Edit that file, push to GitHub, Vercel auto-redeploys. No code changes needed for prompt iteration.

To change the model, edit `api/analyze.js` and replace `claude-sonnet-4-5` with another model name (e.g. `claude-opus-4-5` for slightly stronger reasoning at higher cost).

---

## IF SOMETHING BREAKS

Most common issues:

- **"Method not allowed" or 405**: you're visiting `/api/analyze` directly in the browser. Visit the root URL instead.
- **"Missing 'text' field"**: the frontend isn't sending the body correctly. Check browser console.
- **CORS error**: shouldn't happen since frontend and API are on the same domain, but the function includes CORS headers anyway.
- **Empty response or timeout**: model latency. Retry. If persistent, check Anthropic status.

For anything else, the Vercel dashboard has function logs that show errors clearly.
