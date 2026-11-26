// Run with Node 22.13+ (built-in SQLite).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { DatabaseSync } = require('node:sqlite');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

test('SQLite schema matches the app and cascades account-scoped history deletion', () => {
  const schema = readFileSync(join(__dirname, '../db/schema.sql'), 'utf8');
  const app = readFileSync(join(__dirname, '../src/db/database.js'), 'utf8');
  const statements = (source) => source.replace(/^\uFEFF/, '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean).join('\n');
  assert.ok(statements(app).includes(statements(schema)));

  const db = new DatabaseSync(':memory:');
  try {
    db.exec(schema);
    db.exec(`
      INSERT INTO users VALUES ('a@meridian.com'), ('b@meridian.com');
      INSERT INTO conversations (id, owner, title) VALUES
        (1, 'a@meridian.com', 'Leave'), (2, 'a@meridian.com', 'Hours'), (3, 'b@meridian.com', 'IT');
      INSERT INTO messages (conversation_id, role, text) VALUES
        (1, 'user', 'Question'), (1, 'assistant', 'Answer'), (2, 'user', 'Question'), (3, 'user', 'Question');
    `);
    assert.deepEqual(db.prepare('SELECT text FROM messages WHERE conversation_id = ? ORDER BY id').all(1).map((row) => row.text), ['Question', 'Answer']);
    const remove = db.prepare('DELETE FROM conversations WHERE owner = ? AND id = ?');
    assert.equal(remove.run('b@meridian.com', 1).changes, 0);
    assert.equal(remove.run('a@meridian.com', 1).changes, 1);
    assert.equal(db.prepare('SELECT COUNT(*) AS count FROM messages WHERE conversation_id = 1').get().count, 0);
    db.prepare('DELETE FROM conversations WHERE owner = ?').run('a@meridian.com');
    assert.deepEqual(db.prepare('SELECT conversation_id FROM messages').all().map((row) => row.conversation_id), [3]);
  } finally {
    db.close();
  }
});
