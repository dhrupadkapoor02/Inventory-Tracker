const env = require('../config/env');
const { AppError } = require('../middlewares/errorHandler');

// Calls the Gemini generateContent endpoint and returns the parsed JSON response.
// Kept deliberately simple: no SDK, no agent framework - just a single HTTP call.
async function generateJson(prompt) {
  if (!env.ai.apiKey) {
    throw new AppError('AI feature is not configured. Missing AI_API_KEY on the server.', 500);
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.ai.model}:generateContent?key=${env.ai.apiKey}`;

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.4,
        },
      }),
    });
  } catch (err) {
    throw new AppError('Could not reach the AI service. Please try again.', 502);
  }

  if (!response.ok) {
    const errorBody = await response.text();
    // eslint-disable-next-line no-console
    console.error('Gemini API error response:', response.status, errorBody);

    let reason = errorBody;
    try {
      reason = JSON.parse(errorBody)?.error?.message || errorBody;
    } catch {
      // errorBody wasn't JSON - use it as-is
    }

    throw new AppError(`AI service request failed: ${reason}`, response.status === 401 || response.status === 403 ? 502 : response.status);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new AppError('AI service returned an empty response.', 502);
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    throw new AppError('AI service returned an unexpected response format.', 502);
  }
}

module.exports = { generateJson };
