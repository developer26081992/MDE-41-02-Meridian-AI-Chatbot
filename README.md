# Meridian Assistant

Meridian Consulting Group’s staff policy chatbot. The supplied Expo starter now uses a Node API for Claude and on-device SQLite for conversation history.

## Run the app

1. Install Node.js 18 or newer and run `npm ci` in this directory.
2. Copy `.env.example` to `backend/.env`. Create your own key at the [Anthropic Console](https://console.anthropic.com/) and enter it as `ANTHROPIC_API_KEY` in that local file. The example specifies the model and port. Git ignores the populated file.
3. Run `npm run backend` and check that `http://localhost:3000/health` returns `{"ok":true}`.
4. In another terminal, run `npx expo start`. Use an Android emulator with an Expo Go build compatible with SDK 51, or a compatible iOS simulator or phone. Press **a** for Android or open the Expo link on the device.
5. Sign in with a test identity such as `demo@meridian.com` and any non-empty test password. The starter uses local demo sign-in. There is no corporate identity provider in this project.

The Android emulator defaults to `http://10.0.2.2:3000` and the iOS simulator to `http://localhost:3000`. For a phone, set the development computer’s LAN address before launching Expo. Keep both devices on the same network and allow the backend port through the development computer’s firewall.

```powershell
$env:EXPO_PUBLIC_API_URL = 'http://192.168.1.10:3000'
npx.cmd expo start
```

## Verify

Run `node --test tests/backend.test.cjs` for backend contract tests. These simulate Claude tool responses. For a live run, use the normal backend with your key and ask the five questions in [test results](tests/TEST-RESULTS.md).

The [navigation map and data model](public/docs/README.md) mark the starter discrepancies. The [bug log](BUGLOG.md) records the fixes. History works offline after the app has loaded on the device. Use **New chat** to begin a separate transcript. Human handoff points to the staff directory because the policy extract supplies office hours for IT but no contact addresses. **Read aloud** uses the device's speech engine.

## AI tools used

- OpenAI Codex (GPT-6) assisted with reading, debugging, implementing, testing and documenting the starter.
- Anthropic Claude is the chatbot service configured for live requests. Simulated results are labeled in the test record.

## Reflection

An incorrect policy answer can affect someone’s pay, leave plans or access to work systems. For example, the starter claimed that employees had 25 days of annual leave and could request it five working days ahead. Staff who relied on those figures could make travel plans or submit requests that conflict with Meridian’s actual policy. I corrected the policy extract and made the backend return approved excerpts selected from a fixed set of topics. Claude uses recent conversation turns to work out what a follow-up refers to, while the application supplies the actual wording staff see. An unrelated question gets a clear decline. Requests for help outside the extract can be directed to HR or IT. This design still depends on accurate topic selection and on Meridian keeping the extract current. Checking representative questions and reviewing the extract when policies change are both important.

A second risk is exposure of confidential information. Staff may type sensitive details into a conversation, and transcripts can remain on a shared or lost device. The starter also invited developers to put the Claude key into mobile code, where it could be extracted from the app bundle. I moved the integration to the server, excluded environment files from Git and stored the demo session token in SecureStore. The SQLite queries restrict history to the signed-in account and support deleting a single conversation or clearing the account’s history. These controls reduce accidental exposure in the app, but local demo sign-in verifies only the email format and presence of a password. The SQLite database is also readable by anyone who can obtain its file. A workplace deployment would need corporate authentication, protected transport, access controls and a clear retention policy. Staff would also need to know that recent conversation turns are sent to the AI service and should keep personal information out of their questions.
