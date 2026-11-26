PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  email TEXT PRIMARY KEY
);
CREATE TABLE IF NOT EXISTS conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  text TEXT NOT NULL,
  handoff INTEGER NOT NULL DEFAULT 0 CHECK (handoff IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS conversations_owner ON conversations(owner, id);
CREATE INDEX IF NOT EXISTS messages_conversation ON messages(conversation_id, id);
