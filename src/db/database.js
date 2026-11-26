import { openDatabaseAsync } from 'expo-sqlite';

let connection;
let queue = Promise.resolve();

export function initDb() {
  if (!connection) {
    connection = openDatabaseAsync('meridian.db').then(async (db) => {
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
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
      `);
      return db;
    }).catch((error) => {
      connection = undefined;
      throw error;
    });
  }
  return connection;
}

// Serialize work on this connection so other screens cannot interleave with a transaction.
function run(operation) {
  const result = queue.then(async () => operation(await initDb()));
  queue = result.catch(() => {});
  return result;
}

export function createConversation(owner, text) {
  return run(async (db) => {
    let conversation;
    await db.withTransactionAsync(async () => {
      await db.runAsync('INSERT OR IGNORE INTO users (email) VALUES (?)', owner);
      const title = text.slice(0, 60);
      const result = await db.runAsync('INSERT INTO conversations (owner, title) VALUES (?, ?)', owner, title);
      const id = result.lastInsertRowId;
      const message = await insertMessage(db, owner, id, 'user', text);
      conversation = { id, title, messages: [message] };
    });
    return conversation;
  });
}

async function insertMessage(db, owner, id, role, text, handoff = false) {
  const result = await db.runAsync(
    `INSERT INTO messages (conversation_id, role, text, handoff)
     SELECT id, ?, ?, ? FROM conversations WHERE owner = ? AND id = ?`,
    role, text, Number(handoff), owner, id,
  );
  if (!result.changes) throw new Error('This conversation was deleted.');
  return { id: result.lastInsertRowId, role, text, handoff };
}

export const appendMessage = (owner, id, role, text, handoff) =>
  run((db) => insertMessage(db, owner, id, role, text, handoff));

export const listConversations = (owner) => run((db) =>
  db.getAllAsync('SELECT id, title FROM conversations WHERE owner = ? ORDER BY id DESC', owner));

export function getConversation(owner, id) {
  return run(async (db) => {
    const row = await db.getFirstAsync('SELECT id, title FROM conversations WHERE owner = ? AND id = ?', owner, id);
    if (!row) return null;
    const messages = await db.getAllAsync(
      'SELECT id, role, text, handoff FROM messages WHERE conversation_id = ? ORDER BY id', id,
    );
    return { ...row, messages };
  });
}

export const deleteConversation = (owner, id) =>
  run((db) => db.runAsync('DELETE FROM conversations WHERE owner = ? AND id = ?', owner, id));

export const clearAll = (owner) =>
  run((db) => db.runAsync('DELETE FROM conversations WHERE owner = ?', owner));
