# Meridian Assistant test record

The Android run used the SDK 52 build of Expo Go on an Android 11 emulator at 360 × 640 dp. The local Node backend used simulated Claude topic selections, so these results verify the end-to-end app flow and the approved answer text.

## Policy questions

All five questions also returned the expected answers in separate Android chats using the live Claude backend. The simulated run is retained as reproducible evidence.

| Question | Expected answer | Result and screenshot |
| --- | --- | --- |
| How many annual leave days do full-time staff get? | 22 days per year, requested at least 10 working days in advance. | Pass · [Annual leave](../public/docs/evidence/02-annual-leave.png) (simulated) · [Live Claude](../public/docs/evidence/live-01-annual-leave.png) |
| How many days can I work remotely? | Up to two days per week with manager approval. | Pass · [Remote work](../public/docs/evidence/04-remote-working.png) (simulated) · [Live Claude](../public/docs/evidence/live-02-remote-work.png) |
| What is the deadline for expense claims, and who approves claims over $500? | Submit within 30 days with receipts. Claims above $500 require director approval. | Pass · [Expense claims](../public/docs/evidence/05-expense-claims.png) (simulated) · [Live Claude](../public/docs/evidence/live-03-expenses.png) |
| How do I reset my password and when does my account lock? | Use the self-service portal. Accounts lock after five failed sign-in attempts. | Pass · [Password reset](../public/docs/evidence/06-password-reset.png) (simulated) · [Live Claude](../public/docs/evidence/live-04-password.png) |
| When is the IT help desk open? | 08:00 to 18:00 on working days. | Pass · [IT support](../public/docs/evidence/07-it-support.png) (simulated) · [Live Claude](../public/docs/evidence/live-05-it-support.png) |

**Outside-scope example.** Asking “Who won the World Cup?” produced “I can only answer questions about Meridian workplace policies in my guide.” It also exposed the human handoff action.

## Android feature evidence

| Check | Screenshot |
| --- | --- |
| App running at the small emulator size and a valid demo session restored after an app restart | [Chat](../public/docs/evidence/01-app-and-restored-session.png) |
| Loading announced while waiting for the backend | [Loading](../public/docs/evidence/03-loading.png) |
| Follow-up retained annual leave context | [Follow-up](../public/docs/evidence/08-leave-follow-up.png) |
| Read aloud started Android speech synthesis through eSpeak | [Reading state](../public/docs/evidence/09-reading-reply-aloud.png) |
| Unrelated question was declined | [Scope example](../public/docs/evidence/10-out-of-scope.png) |
| Explicit request offered a person, with HR and IT options | [Handoff reply](../public/docs/evidence/11-explicit-handoff.png) · [Options](../public/docs/evidence/12-handoff-options.png) · [IT directory guidance](../public/docs/evidence/13-it-handoff.png) |
| Failed backend call left a useful error and retry action | [Service error](../public/docs/evidence/14-recoverable-service-error.png) |
| Airplane mode still allowed listing and reopening saved messages | [Offline list](../public/docs/evidence/15-offline-history.png) · [Offline transcript](../public/docs/evidence/16-offline-reopened-chat.png) |
| Deleting one conversation left the others visible, and clearing emptied the account’s history | [After deletion](../public/docs/evidence/17-after-delete.png) · [Clear confirmation](../public/docs/evidence/18-confirm-clear-history.png) · [Empty history](../public/docs/evidence/19-empty-history-after-clear.png) |
| Sign-out returned to sign-in and stayed signed out after an app restart | [Signed out](../public/docs/evidence/20-signed-out.png) · [Restart](../public/docs/evidence/21-signed-out-after-restart.png) |

The speech test verified that the Android speech engine began synthesis and the control switched to **Stop reading**. Host audio was disabled during the screenshot run. In a later check with audio enabled, the candidate confirmed that the IT help desk reply was audible after increasing the emulator media volume.

## Verification commands

- `node --test tests/backend.test.cjs` runs the simulated Claude tests, including the backend timeout and invalid-role handling.
- `node --test tests/schema.test.cjs` checks account scoping and SQLite cascade deletion (Node.js 22.13+).
- `npx expo export --platform android --output-dir dist` built the production Android JavaScript bundle.
- To reproduce the Android simulation, run `node tests/android-fixture.cjs` and launch Expo with `EXPO_PUBLIC_API_URL=http://10.0.2.2:3001`. The fixture recognizes the evidence questions, the leave follow-up and both handoff cases.
- For a live model run, set up `backend/.env` and use the normal backend in the [README](../README.md).

[Exported Git log](GIT-LOG.txt)
