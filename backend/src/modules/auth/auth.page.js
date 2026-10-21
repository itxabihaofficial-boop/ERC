function loginPage({ error = '' } = {}) {
  const message = error
    ? `<p style="margin:0 0 16px;color:#B42318;font-size:14px;">${escapeHtml(error)}</p>`
    : '';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Sign in - Enfield Royal Clinics</title>
</head>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#F7F3EE;font-family:Segoe UI,sans-serif;color:#1A1614;">
  <main style="width:min(420px, calc(100% - 32px));">
    <h1 style="margin:0 0 8px;font-size:28px;">Sign in</h1>
    <p style="margin:0 0 24px;color:#8D8680;">Use your email and password.</p>
    ${message}
    <form method="post" action="/api/auth/login" style="display:grid;gap:14px;">
      <label style="display:grid;gap:6px;font-weight:600;">
        Email
        <input name="email" type="email" autocomplete="username" required placeholder="admin@gmail.com" style="height:48px;border:0;border-radius:14px;padding:0 14px;background:#fff;font-size:15px;" />
      </label>
      <label style="display:grid;gap:6px;font-weight:600;">
        Password
        <input name="password" type="password" autocomplete="current-password" required minlength="6" placeholder="Password" style="height:48px;border:0;border-radius:14px;padding:0 14px;background:#fff;font-size:15px;" />
      </label>
      <button type="submit" style="height:50px;border:0;border-radius:999px;background:#BF824F;color:#fff;font-size:16px;font-weight:600;cursor:pointer;">Sign in</button>
    </form>
  </main>
</body>
</html>`;
}

function signedInPage(email) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Signed in - Enfield Royal Clinics</title>
</head>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#F7F3EE;font-family:Segoe UI,sans-serif;color:#1A1614;">
  <main style="width:min(420px, calc(100% - 32px));">
    <h1 style="margin:0 0 8px;font-size:28px;">Signed in</h1>
    <p style="margin:0;color:#8D8680;">${escapeHtml(email)} is saved in Firebase. Continue in the app to verify the region.</p>
  </main>
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { loginPage, signedInPage };
