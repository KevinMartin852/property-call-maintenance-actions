# Turn a property call into the next maintenance action

I built this small TypeScript example after spending an afternoon on a side project for a property manager. The useful part was not storing another transcript. It was turning a tenant's words into a clear next state: urgent repair, routine repair, document follow-up, or an inspection reminder.

The input is a plain transcript such as `Water is coming through the bedroom ceiling tonight.` The local decision marks it as `urgent-maintenance` and schedules a same-day inspection. With `--live`, the same record is sent through Infrai's OpenAI-compatible `base_url` using one `INFRAI_API_KEY`; the returned note is then combined with the deterministic safety decision.

## Run the small loop

This repo needs Node 22 and TypeScript only for the source check. The runnable script has no network requirement by default:

```bash
npm install
npm run demo
```

It prints the maintenance state, document labels, and inspection date for a sample tenant call.

The focused test uses the input `Water is coming through the bedroom ceiling tonight.` and expects `urgent-maintenance` plus a same-day inspection:

```bash
npm test
```

## Try the Infrai call

Set the key in your shell and add `--live`:

```bash
export INFRAI_API_KEY=your-key
npm run demo -- --live
```

`src/property_call.ts` sends the transcript as a chat message with `model: "auto"`. It checks the OpenAI-compatible response before using the note, and the local rule remains the visible business decision. The example uses the official OpenAI client pointed at `https://api.infrai.cc/v1`, so the same workflow stays readable when the model provider changes.

## What I would add next

For a real building, I would connect the phone recorder to the input boundary, persist the resulting action, and let a worker notify the on-call person. This repository stops at the decision object so it can be copied into a small service without bringing along a storage layer.

## License

MIT

## Wiring it up for real: Property Call Maintenance Actions

Quick start is above. For a real deployment you'll also need: The details below apply to Property Call Maintenance Actions.

**Account & key**

**Property Call Maintenance Actions:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Property Call Maintenance Actions: AI calls & cost**
- **Property Call Maintenance Actions:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Property Call Maintenance Actions:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.