# Meridian Assistant test record

The five policy questions passed the automated backend assertions with simulated Claude topic selections. These tests verify the app’s approved answer text and request contract. Live model topic selection remains pending a candidate-owned Claude key.

| Test question | Expected answer | Backend result |
| --- | --- | --- |
| How many annual leave days do full-time staff get? | 22 days per year, requested at least 10 working days in advance. | Pass |
| How many days can I work remotely? | Up to two days per week with manager approval. | Pass |
| What is the deadline for expense claims, and who approves claims over $500? | Submit within 30 days with receipts. Claims above $500 require director approval. | Pass |
| How do I reset my password and when does my account lock? | Use the self-service portal. Accounts lock after five failed sign-in attempts. | Pass |
| When is the IT help desk open? | 08:00 to 18:00 on working days. | Pass |

Additional automated passes covered forwarding a leave follow-up in context, offering HR or IT handoff on request, rejecting disallowed roles and unknown topics, translating an upstream timeout, and SQLite ownership and cascade deletion. The production Android JavaScript bundle built successfully.

## Outside-scope example

In the backend contract test, **Who won the World Cup?** returned **I can only answer questions about Meridian workplace policies in my guide.** The app contract also returned the flag for **Talk to a person**.

## Reproduce

- `node --test tests/backend.test.cjs` runs the simulated Claude contract tests.
- `node --test tests/schema.test.cjs` runs the SQLite schema check (Node.js 22.13+).
- To reproduce the Android simulation, run `node tests/android-fixture.cjs` and launch Expo with `EXPO_PUBLIC_API_URL=http://10.0.2.2:3001`. This fixture only handles the listed evidence questions and the specific follow-up and handoff cases.
- For a live model run, set up `backend/.env` and use the normal backend in the [README](../README.md).

[Exported Git log](GIT-LOG.txt)
