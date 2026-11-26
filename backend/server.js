require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const policy = require('./policy.json');
const { SYSTEM_PROMPT } = require('./prompt');

const tool = {
  name: 'select_policy',
  description: 'Select the approved policy topics and indicate whether to offer human help.',
  input_schema: {
    type: 'object',
    properties: {
      disposition: { type: 'string', enum: ['answer', 'handoff', 'out_of_scope'] },
      topics: { type: 'array', items: { type: 'string', enum: Object.keys(policy) } },
    },
    required: ['disposition', 'topics'],
  },
};

function createApp({ requestClaude = fetch, timeoutMs = 22000 } = {}) {
  const app = express();
  app.use(express.json({ limit: '256kb' }));
  app.get('/health', (req, res) => res.json({ ok: true }));

  app.post('/chat', async (req, res) => {
    const { messages } = req.body || {};
    const valid = Array.isArray(messages) && messages.length > 0 && messages.length <= 24 &&
      messages[0]?.role === 'user' && messages.at(-1)?.role === 'user' &&
      messages.every((message) => message && ['user', 'assistant'].includes(message.role) &&
        typeof message.content === 'string' && message.content.trim() && message.content.length <= 2000);
    if (!valid) return res.status(400).json({ error: 'Send a valid conversation ending in a staff question.' });

    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) return res.status(503).json({ error: 'The assistant is temporarily unavailable.' });

    try {
      const response = await requestClaude('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        signal: AbortSignal.timeout(timeoutMs),
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.CLAUDE_MODEL || 'claude-haiku-5-5',
          max_tokens: 400,
          system: SYSTEM_PROMPT,
          messages: messages.map(({ role, content }) => ({ role, content })),
          tools: [tool],
          tool_choice: { type: 'tool', name: tool.name, disable_parallel_tool_use: true },
        }),
      });
      if (!response.ok) return res.status(502).json({ error: 'The assistant is temporarily unavailable.' });
      const data = await response.json();
      const result = data.content?.find((block) => block.type === 'tool_use' && block.name === tool.name)?.input;
      if (!result || !['answer', 'handoff', 'out_of_scope'].includes(result.disposition) ||
          !Array.isArray(result.topics) || !result.topics.every((key) => Object.hasOwn(policy, key))) {
        return res.status(502).json({ error: 'The assistant could not read the policy response.' });
      }
      if (result.disposition === 'out_of_scope') {
        return res.json({ reply: 'I can only answer questions about Meridian workplace policies in my guide.', handoff: true });
      }
      const excerpt = [...new Set(result.topics)].map((key) => policy[key]).join('\n\n');
      if (result.disposition === 'answer' && excerpt) return res.json({ reply: excerpt, handoff: false });
      return res.json({
        reply: [excerpt, 'A person from HR or IT can help with your request.'].filter(Boolean).join('\n\n'),
        handoff: true,
      });
    } catch (error) {
      if (error.name === 'TimeoutError' || error.name === 'AbortError') {
        return res.status(504).json({ error: 'The assistant took too long. Try again.' });
      }
      res.status(502).json({ error: 'The assistant is temporarily unavailable.' });
    }
  });
  return app;
}

if (require.main === module) {
  const port = process.env.PORT || 3000;
  createApp().listen(port, () => console.log('Backend listening on port ' + port));
}

module.exports = { createApp };

