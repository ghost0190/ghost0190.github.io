/**
 * Decap CMS GitHub OAuth Proxy — Cloudflare Worker
 *
 * 部署步骤：
 * 1. 安装 Wrangler CLI：npm install -g wrangler
 * 2. 登录：wrangler login
 * 3. 设置 Secret：
 *    wrangler secret put GITHUB_CLIENT_ID
 *    wrangler secret put GITHUB_CLIENT_SECRET
 * 4. 部署：wrangler deploy
 * 5. 将生成的 URL (如 https://decap-oauth.xxx.workers.dev) 填入 config.yml
 *
 * 参考：https://decapcms.org/docs/external-oauth-clients/
 */

// 允许的来源（用于 CORS 和 postMessage 通信）
const ALLOWED_ORIGINS = [
  'http://localhost:4000',
  'https://ghost0190.github.io',
];

const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';

function getCorsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // OAuth 凭证（通过 wrangler secret 注入，从 env 读取）
    const CLIENT_ID = env.GITHUB_CLIENT_ID;
    const CLIENT_SECRET = env.GITHUB_CLIENT_SECRET;

    // CORS 预检
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: getCorsHeaders(request) });
    }

    // 首页
    if (url.pathname === '/' || url.pathname === '') {
      return new Response(
        'Decap CMS GitHub OAuth Proxy is running.',
        { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8', ...getCorsHeaders(request) } }
      );
    }

    // /auth — 发起 OAuth
    if (url.pathname === '/auth') {
      const params = new URLSearchParams({
        client_id: CLIENT_ID,
        scope: 'repo,user',
        redirect_uri: `${url.origin}/callback`,
      });
      return Response.redirect(`${GITHUB_AUTH_URL}?${params.toString()}`, 302);
    }

    // /callback — 用 code 换 token
    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code');
      if (!code) {
        return new Response('Missing "code" parameter', { status: 400 });
      }

      const tokenResponse = await fetch(GITHUB_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code: code,
        }),
      });

      if (!tokenResponse.ok) {
        const errText = await tokenResponse.text();
        return new Response(`Token exchange failed: ${errText}`, { status: 500 });
      }

      const tokenData = await tokenResponse.json();

      if (!tokenData.access_token) {
        return new Response(`No access_token in response: ${JSON.stringify(tokenData)}`, { status: 500 });
      }

      const token = tokenData.access_token;
      const originsJson = JSON.stringify(ALLOWED_ORIGINS);

      // 通过 postMessage 将 token 传回 Decap CMS
      const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>OAuth 完成</title></head>
<body>
  <div class="success">&#10003;</div>
  <h2>认证成功！窗口将自动关闭...</h2>
  <script>
    (function() {
      var token = '${token}';
      var origins = ${originsJson};
      origins.forEach(function(origin) {
        try { window.opener && window.opener.postMessage({ token: token, provider: 'github' }, origin); } catch(e) {}
      });
      setTimeout(function() { window.close(); }, 2000);
    })();
  </script>
</body>
</html>`;

      return new Response(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8', ...getCorsHeaders(request) },
      });
    }

    // 404
    return new Response('Not Found', { status: 404, headers: getCorsHeaders(request) });
  }
};
