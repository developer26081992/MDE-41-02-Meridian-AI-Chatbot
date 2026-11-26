import { API_URL } from '../config';

export async function askAssistant(messages, controller) {
  const timeout = setTimeout(() => controller.abort(), 28000);
  try {
    const response = await fetch(API_URL + '/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        messages: messages.slice(-24).map(({ role, text }) => ({ role, content: text })),
      }),
    });
    if (!response.ok) {
      if (response.status === 504) throw new Error('The assistant took too long. Try again.');
      throw new Error('The assistant is temporarily unavailable. Try again later.');
    }
    return await response.json();
  } catch (error) {
    if (controller.signal.aborted) throw new Error('The assistant took too long. Try again.');
    if (error instanceof TypeError) throw new Error('Check your connection and try again.');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

