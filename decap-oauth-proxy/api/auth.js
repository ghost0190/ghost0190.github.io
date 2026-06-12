/**
 * /auth — 发起 GitHub OAuth
 */
export default function handler(req, res) {
  const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const host = req.headers.host;

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    scope: 'repo,user',
    redirect_uri: `https://${host}/callback`,
  });

  res.redirect(302, `https://github.com/login/oauth/authorize?${params.toString()}`);
}
