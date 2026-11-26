# Meridian Assistant bug log

| File | Fault in starter | Fix |
| --- | --- | --- |
| src/screens/ChatScreen.js | Empty and whitespace questions were sent. | Trim input and disable Send when empty. |
| src/screens/ChatScreen.js | Repeated taps could start overlapping requests. | Set a synchronous request lock and disable the composer while waiting. |
| src/screens/ChatScreen.js | History route parameters were ignored. | Load the selected SQLite transcript when returning from History. |
| src/screens/ChatScreen.js | Every conversation used the ID c1 and there was no New chat action. | Create a SQLite ID at first send and expose New chat. |
| src/screens/ChatScreen.js | The latest reply could sit below the viewport. | Scroll the transcript to the newest turn as content changes. |
| src/screens/SettingsScreen.js | Back attempted to open SignIn inside the signed-in stack. | Use the native header back action. |
| src/screens/HistoryScreen.js | History loaded only once and delete left a stale list. | Refresh on focus and remove the deleted row after SQLite succeeds. |
| src/screens/ChatScreen.js, src/screens/SignInScreen.js, src/components/MessageBubble.js, src/screens/HistoryScreen.js | Small, low-contrast text and incomplete accessibility labels made the app hard to use. | Use high-contrast text, labeled fields and buttons, larger tap targets, a scrollable sign-in form and a keyboard-aware chat layout. |
| src/auth/session.js, src/auth/AuthContext.js, App.js | Session token was stored in AsyncStorage, never removed on sign-out, and restored after route rendering. | Use SecureStore, remove the obsolete insecure token, await sign-out and block route rendering until restoration finishes. |
| src/config.js, src/api/chat.js, .gitignore | Mobile code invited embedding an API key and Git did not ignore secret files. | Remove direct Claude calls, use the Node backend, and ignore environment files. |
| backend/prompt.js, backend/server.js | Prompt allowed any question, ignored the policy and passed model text through. | Supply the approved policy, constrain topic selection and return only verified excerpts or fixed handoff and scope messages. |
| backend/policy.json | Incorrect leave, remote work, expense and password policy values. | Copy the six topics from the examination extract. |
| src/api/chat.js, src/screens/ChatScreen.js | Follow-up requests contained only the latest question. | Send up to 24 recent stored turns, starting on a user turn. |
| src/components/TypingIndicator.js, src/screens/ChatScreen.js, backend/server.js | Loading state was never set and failed requests could reject without recovery. | Announce loading, apply timeouts and offer retry using the saved question. |
| src/components/TalkToPersonButton.js, src/components/MessageBubble.js | Human handoff was disconnected. | Show HR and IT directory guidance on handoff replies. |
| src/db/database.js, db/schema.sql | History existed only in memory. Delete and clear were stubs. | Use SQLite with user ownership and cascading deletion. |
| src/components/SpeakButton.js, src/components/MessageBubble.js | The speech function received an object and had no entry point. | Pass the reply string to Expo Speech and add accessible read and stop controls. |
| package.json, app.json, App.js, src/screens/HistoryScreen.js | The SDK 51 Expo Go client crashed at the native root view on the test emulator. | Upgrade the starter to SDK 52, align the navigation stack and use the version 7 return action when opening a transcript. |
