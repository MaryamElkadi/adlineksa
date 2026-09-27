const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
const envContents = fs.readFileSync(envPath, 'utf8');
const env = {};
for (const line of envContents.split(/\r?\n/)) {
  if (!line || line.trim().startsWith('#')) continue;
  const idx = line.indexOf('=');
  if (idx === -1) continue;
  const key = line.slice(0, idx).trim();
  const value = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
  env[key] = value;
}

const apiKey = env.OPENAI_API_KEY;
const model = env.OPENAI_MODEL || 'gpt-4o-mini';

if (!apiKey) {
  console.log(JSON.stringify({ status: 'NO_KEY' }, null, 2));
  process.exit(0);
}

(async () => {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 20,
      temperature: 0.2,
    }),
  });

  const text = await res.text();
  let payload = {};
  try {
    payload = JSON.parse(text);
  } catch {
    payload = { raw: text.slice(0, 400) };
  }

  const error = payload.error || {};
  console.log(JSON.stringify({
    status: res.status,
    statusText: res.statusText,
    retryAfter: res.headers.get('retry-after'),
    requestId: res.headers.get('x-request-id'),
    type: error.type,
    code: error.code,
    message: error.message,
    param: error.param,
    request_id: error.request_id,
    raw: error.message ? undefined : payload.raw,
  }, null, 2));
})();
