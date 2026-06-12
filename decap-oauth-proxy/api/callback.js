/**
 * /callback — GitHub OAuth 回调，用 code 换取 token
 */
const ALLOWED_ORIGINS = [
  'http://localhost:4000',
  'https://ghost0190.github.io',
];

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  const code = req.query.code;
  if (!code) {
    return res.status(400).send('Missing "code" parameter');
  }

  const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code }),
  });

  const data = await tokenResponse.json();

  if (!data.access_token) {
    return res.status(500).send(`Token exchange failed: ${JSON.stringify(data)}`);
  }

  const originsJson = JSON.stringify(ALLOWED_ORIGINS);

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>OAuth 完成</title></head>
<body>
  <div style="color:green;font-size:48px;text-align:center;padding-top:50px;">&#10003;</div>
  <h2 style="text-align:center;">认证成功！</h2>
  <script>
    (function() {
      var origins = ${originsJson};
      origins.forEach(function(origin) {
        try { window.opener && window.opener.postMessage({ token: '${data.access_token}', provider: 'github' }, origin); } catch(e) {}
      });
      setTimeout(function() { window.close(); }, 2000);
    })();
  </script>
</body>
</html>`;

  res.status(200).send(html);
}
