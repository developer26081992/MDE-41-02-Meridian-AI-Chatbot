// Local Android evidence only. Simulates Claude tool decisions for known test questions.
const { createApp } = require('../backend/server');
process.env.ANTHROPIC_API_KEY = 'test-fixture';

const routes = new Map([
  ['how many annual leave days do full-time staff get?', ['answer', 'annual_leave']],
  ['how far in advance?', ['answer', 'annual_leave']],
  ['how many days can i work remotely?', ['answer', 'remote_working']],
  ['what is the deadline for expense claims, and who approves claims over $500?', ['answer', 'expense_claims']],
  ['how do i reset my password and when does my account lock?', ['answer', 'password_reset']],
  ['when is the it help desk open?', ['answer', 'it_support']],
  ['who won the world cup?', ['out_of_scope']],
  ['can i speak to a person?', ['handoff']],
]);

createApp({
  requestClaude: async (_, { body }) => {
    const { messages } = JSON.parse(body);
    const key = messages.at(-1).content.toLowerCase();
    const route = routes.get(key);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    if (!route || (key === 'how far in advance?' && !messages.some(({ role, content }) =>
      role === 'user' && content.toLowerCase() === 'how many annual leave days do full-time staff get?'))) return { ok: false };
    const [disposition, ...topics] = route;
    return {
      ok: true,
      json: async () => ({ content: [{ type: 'tool_use', name: 'select_policy', input: { disposition, topics } }] }),
    };
  },
}).listen(3001, () => console.log('Simulated Claude evidence backend on port 3001'));
