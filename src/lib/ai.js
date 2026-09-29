// Provider-agnostic AI Tutor boundary. A backend can be connected by setting
// window.__HBL_AI_API_URL__ to a server-side proxy such as /api/ai. No secret belongs here.
const mockReplies = [
  'Start with the highlighted structure. This model simplifies the biology so you can see direction and function without molecular-level detail.',
  'Great observation. Structure and movement are connected here: the selected part changes what can happen next in the pathway. Pause, then step once to compare the two states.',
  'The key idea is coordination. Cells, tissues, and organs work together rather than as isolated parts. Look for the WHAT, HOW, and WHY labels.'
];

export async function askAI({ question, context }) {
  const safeQuestion = String(question || '').trim().slice(0, 1200);
  const endpoint = typeof window !== 'undefined' ? window.__HBL_AI_API_URL__ : undefined;
  if (endpoint) {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeout = controller ? window.setTimeout(() => controller.abort(), 15_000) : null;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: safeQuestion, context }),
        ...(controller ? { signal: controller.signal } : {})
      });
      if (!response.ok) throw new Error(`AI request failed with ${response.status}`);
      const data = await response.json();
      return String(data.answer || data.message || 'The tutor returned no answer.').slice(0, 4000);
    } catch {
      throw new Error('AI Tutor is temporarily unavailable.');
    } finally {
      if (timeout) window.clearTimeout(timeout);
    }
  }
  await new Promise((resolve) => window.setTimeout(resolve, 380));
  return mockReplies[safeQuestion.length % mockReplies.length];
}
