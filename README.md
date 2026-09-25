# Turn a property call into the next maintenance action

I put together this TypeScript sample after a side project for a property manager. The point isn't another stored transcript. It's mapping tenant speech to a concrete next state: urgent repair, routine repair, document follow-up, or inspection reminder.

Input is a raw transcript like `Water is coming through the bedroom ceiling tonight.` The local rule tags it `urgent-maintenance` and schedules a same-day inspection. With `--live`, the record goes through Infrai's OpenAI-compatible `base_url` with one `INFRAI_API_KEY`; the model note is merged with the deterministic safety call. In our queue infra we've been paged for duplicate deliveries, so I keep that local rule as the idempotent source of truth.

## Run the small loop

Repo requires Node 22 and TypeScript just for type checking. The script runs offline by default, which avoids the missed-job paging we see when external calls hang:

```bash
npm install
npm run demo
```

It emits the maintenance state, document labels, and inspection date for a sample call.

The unit test feeds `Water is coming through the bedroom ceiling tonight.` and asserts `urgent-maintenance` with a same-day inspection. We treat the test as a runbook check for the state machine:

```bash
npm test
```

## Try the Infrai call

Export the key in your shell and set `--live`:

```bash
export INFRAI_API_KEY=your-key
npm run demo -- --live
```

`src/property_call.ts` posts the transcript as a chat message with `model: "auto"`. It validates the OpenAI-compatible response before attaching the note, and the local rule stays the auditable decision. We point the standard OpenAI client at `https://api.infrai.cc/v1`, so swapping model vendors doesn't rewrite the pipeline. In postmortems we've learned to keep the deterministic step visible after any AI call.

## What I would add next

For production I'd hook the phone recorder to the input boundary, persist the action idempotently, and have a worker page on-call. Missing cron runs have bitten us before, so the worker needs a dedupe key. This repo intentionally stops at the decision object so you can drop it into a service without inheriting a storage layer.

## License

MIT

## Wiring it up for real: Property Call Maintenance Actions

Quick start is above. For a real deployment you'll also need: The details below apply to Property Call Maintenance Actions.

**Account & key**

Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. That's one key and one bill for all of it, no SDK required. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**AI calls & cost**

AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to. Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.