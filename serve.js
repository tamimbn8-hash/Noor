/**
 * نُور القرآن | NOOR AL-QURAN
 * serve.js - خادم الويب والمصادقة والمزامنة السحابية الحقيقية (Production-Grade Server)
 * يدعم: Static Files + Sessions + Google Identity Services + Discord OAuth2 + Facebook Login + Cloud Sync API
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');

const baseDir = __dirname;
const dbPath = path.join(baseDir, 'data', 'auth_db.json');

// --- 1. تحميل متغيرات البيئة من ملف .env إن وجد ---
function loadEnv() {
  const envPath = path.join(baseDir, '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        if (key && !process.env[key]) {
          process.env[key] = val;
        }
      }
    });
  }
}
loadEnv();

const PORT = parseInt(process.env.PORT, 10) || 8089;
const SESSION_SECRET = process.env.SESSION_SECRET || 'noor_quran_secure_default_secret_2026';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || `http://localhost:${PORT}/api/auth/discord/callback`;
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || '';
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || '';

// --- 2. إدارة قاعدة البيانات المحلية الآمنة (Atomic JSON DB) ---
function readDb() {
  try {
    if (!fs.existsSync(dbPath)) {
      const initial = { users: {}, sessions: {}, oauthStates: {} };
      fs.writeFileSync(dbPath, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (e) {
    console.error('Error reading auth database:', e);
    return { users: {}, sessions: {}, oauthStates: {} };
  }
}

function writeDb(data) {
  try {
    const tmp = `${dbPath}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmp, dbPath);
  } catch (e) {
    console.error('Error writing auth database:', e);
  }
}

// --- 3. مساعدات الكوكيز والجلسات ---
function parseCookies(req) {
  const list = {};
  const rc = req.headers.cookie;
  if (rc) {
    rc.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      const key = parts.shift().trim();
      const val = parts.join('=').trim();
      if (key) list[key] = decodeURIComponent(val);
    });
  }
  return list;
}

function serializeCookie(name, val, options = {}) {
  let cookie = `${name}=${encodeURIComponent(val)}`;
  if (options.maxAge !== undefined) cookie += `; Max-Age=${options.maxAge}`;
  if (options.path) cookie += `; Path=${options.path}`;
  if (options.httpOnly) cookie += `; HttpOnly`;
  if (options.sameSite) cookie += `; SameSite=${options.sameSite}`;
  if (options.secure) cookie += `; Secure`;
  return cookie;
}

function createSession(userId) {
  const db = readDb();
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  const maxAgeMs = 30 * 24 * 60 * 60 * 1000; // 30 days

  // تنظيف الجلسات القديمة المنتهية
  for (const t in db.sessions) {
    if (db.sessions[t].expiresAt < now) {
      delete db.sessions[t];
    }
  }

  db.sessions[token] = {
    userId,
    createdAt: now,
    expiresAt: now + maxAgeMs
  };
  writeDb(db);
  return { token, maxAgeSeconds: Math.floor(maxAgeMs / 1000) };
}

function getSessionUser(req) {
  const cookies = parseCookies(req);
  const token = cookies['noor_session'] || (req.headers.authorization && req.headers.authorization.replace('Bearer ', ''));
  if (!token) return null;

  const db = readDb();
  const session = db.sessions[token];
  if (!session || session.expiresAt < Date.now()) {
    if (session) {
      delete db.sessions[token];
      writeDb(db);
    }
    return null;
  }

  const user = db.users[session.userId];
  if (!user) return null;

  return { user, token };
}

function destroySession(token) {
  if (!token) return;
  const db = readDb();
  if (db.sessions[token]) {
    delete db.sessions[token];
    writeDb(db);
  }
}

function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email || '',
    avatar: user.avatar || '',
    provider: user.provider,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    lastSyncedAt: user.lastSyncedAt || user.createdAt
  };
}

// --- 4. مساعدات استدعاء APIs وقراءة الطلبات ---
async function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 2 * 1024 * 1024) { // 2MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve({ raw: body });
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, data, headers = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    ...headers
  });
  res.end(JSON.stringify(data));
}

// --- 5. منطق مزامنة وإنشاء حساب المستخدم ---
function findOrCreateUser({ provider, providerId, name, email, avatar }) {
  const db = readDb();
  let existingId = null;

  for (const id in db.users) {
    const u = db.users[id];
    if (u.provider === provider && u.providerId === String(providerId)) {
      existingId = id;
      break;
    }
  }

  const nowIso = new Date().toISOString();

  if (existingId) {
    const u = db.users[existingId];
    u.name = name || u.name;
    u.email = email || u.email;
    u.avatar = avatar || u.avatar;
    u.lastLoginAt = nowIso;
    writeDb(db);
    return u;
  }

  // مستخدم جديد
  const newId = `usr_${crypto.randomBytes(8).toString('hex')}`;
  const newUser = {
    id: newId,
    provider,
    providerId: String(providerId),
    name: name || 'قارئ نور القرآن',
    email: email || '',
    avatar: avatar || '',
    createdAt: nowIso,
    lastLoginAt: nowIso,
    lastSyncedAt: nowIso,
    syncData: {
      bookmarks: [],
      adhkarProgress: {},
      lastRead: { surahNumber: 1, ayahNumber: 1, surahName: 'الفاتحة', pageNumber: 1, timestamp: Date.now() },
      settings: {
        theme: 'dark',
        fontFamily: 'Cairo',
        fontSize: 'medium',
        quranFontSize: 28,
        defaultReciter: 'ar.alafasy',
        playbackSpeed: 1,
        city: 'مكة المكرمة'
      },
      tasbeeh: { totalCount: 0, cycles: 0, target: 33 }
    }
  };

  db.users[newId] = newUser;
  writeDb(db);
  return newUser;
}

// --- 6. أنواع الملفات الثابتة (MIME Types) ---
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.mp3': 'audio/mpeg',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff'
};

// --- 7. مسارات الـ API والمصادقة ---
async function handleApiRequest(req, res, parsedUrl) {
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // أ. استعلام إعدادات المصادقة العامة (المفاتيح العامة فقط دون أي secrets)
  if (pathname === '/api/auth/config' && method === 'GET') {
    return sendJson(res, 200, {
      googleClientId: GOOGLE_CLIENT_ID,
      discordClientId: DISCORD_CLIENT_ID,
      facebookAppId: FACEBOOK_APP_ID,
      isDevDemo: !(GOOGLE_CLIENT_ID || DISCORD_CLIENT_ID || FACEBOOK_APP_ID)
    });
  }

  // ب. استعلام الجلسة الحالية
  if (pathname === '/api/auth/session' && method === 'GET') {
    const sessionData = getSessionUser(req);
    if (!sessionData) {
      return sendJson(res, 200, { authenticated: false, user: null });
    }
    return sendJson(res, 200, {
      authenticated: true,
      user: sanitizeUser(sessionData.user),
      syncMeta: { lastSyncedAt: sessionData.user.lastSyncedAt || sessionData.user.createdAt }
    });
  }

  // ج. تسجيل الخروج
  if (pathname === '/api/auth/logout' && method === 'POST') {
    const sessionData = getSessionUser(req);
    if (sessionData) {
      destroySession(sessionData.token);
    }
    const cookieHeader = serializeCookie('noor_session', '', {
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
      maxAge: 0
    });
    return sendJson(res, 200, { ok: true }, { 'Set-Cookie': cookieHeader });
  }

  // د. مصادقة Google Identity Services
  if (pathname === '/api/auth/google' && method === 'POST') {
    try {
      const body = await readBody(req);
      const credential = body.credential;
      if (!credential) {
        return sendJson(res, 400, { error: 'Credential token is required' });
      }

      let googlePayload = null;

      if (GOOGLE_CLIENT_ID) {
        // التحقق الحقيقي من Google Identity Services
        const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`;
        const gRes = await fetch(verifyUrl);
        if (!gRes.ok) {
          return sendJson(res, 401, { error: 'Invalid Google credential token' });
        }
        googlePayload = await gRes.json();

        if (googlePayload.aud !== GOOGLE_CLIENT_ID) {
          return sendJson(res, 401, { error: 'Audience mismatch for Google client' });
        }
      } else {
        // وضع المحاكاة الآمن للتطوير المحلي (عند عدم ضبط GOOGLE_CLIENT_ID بعد)
        googlePayload = {
          sub: 'google_demo_' + crypto.createHash('md5').update(credential).digest('hex').slice(0, 8),
          name: body.demoName || 'مستخدم Google التجريبي',
          email: body.demoEmail || 'user@gmail.com',
          picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        };
      }

      const user = findOrCreateUser({
        provider: 'google',
        providerId: googlePayload.sub,
        name: googlePayload.name,
        email: googlePayload.email,
        avatar: googlePayload.picture
      });

      const { token, maxAgeSeconds } = createSession(user.id);
      const cookieHeader = serializeCookie('noor_session', token, {
        path: '/',
        httpOnly: true,
        sameSite: 'Lax',
        maxAge: maxAgeSeconds
      });

      return sendJson(res, 200, {
        ok: true,
        user: sanitizeUser(user)
      }, { 'Set-Cookie': cookieHeader });

    } catch (e) {
      console.error('Google auth error:', e);
      return sendJson(res, 500, { error: 'Failed to authenticate with Google' });
    }
  }

  // هـ. بدء مسار Discord OAuth2
  if (pathname === '/api/auth/discord/login' && method === 'GET') {
    if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
      // وضع المحاكاة الآمن لـ Discord محلياً
      const demoUser = findOrCreateUser({
        provider: 'discord',
        providerId: 'discord_demo_10928374',
        name: 'مستخدم Discord التجريبي',
        email: 'discord_member@noor-quran.app',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
      });
      const { token, maxAgeSeconds } = createSession(demoUser.id);
      const cookieHeader = serializeCookie('noor_session', token, {
        path: '/',
        httpOnly: true,
        sameSite: 'Lax',
        maxAge: maxAgeSeconds
      });
      res.writeHead(302, {
        'Location': '/#profile?auth=discord_success',
        'Set-Cookie': cookieHeader
      });
      return res.end();
    }

    // توليد رمز State آمن للوقاية من هجمات CSRF
    const state = crypto.randomBytes(16).toString('hex');
    const db = readDb();
    db.oauthStates[state] = { createdAt: Date.now() };
    writeDb(db);

    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${encodeURIComponent(DISCORD_CLIENT_ID)}&response_type=code&scope=identify%20email&state=${encodeURIComponent(state)}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}`;

    res.writeHead(302, { 'Location': discordAuthUrl });
    return res.end();
  }

  // و. معالجة رجوع Discord OAuth2 Callback
  if (pathname === '/api/auth/discord/callback' && method === 'GET') {
    const code = parsedUrl.query.code;
    const state = parsedUrl.query.state;

    if (!code || !state) {
      res.writeHead(302, { 'Location': '/#login?error=discord_cancelled' });
      return res.end();
    }

    const db = readDb();
    if (!db.oauthStates[state] || Date.now() - db.oauthStates[state].createdAt > 10 * 60 * 1000) {
      res.writeHead(302, { 'Location': '/#login?error=invalid_csrf_state' });
      return res.end();
    }
    delete db.oauthStates[state];
    writeDb(db);

    try {
      // تبادل الرمز برمز وصول حقيقي على السيرفر (Client Secret آمن 100% ولا يظهر بالمتصفح)
      const tokenParams = new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: DISCORD_REDIRECT_URI
      });

      const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: tokenParams.toString()
      });

      if (!tokenRes.ok) {
        throw new Error('Discord token exchange failed');
      }

      const tokenData = await tokenRes.json();

      // جلب بيانات الحساب المسموح بها من Discord
      const userRes = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      });

      if (!userRes.ok) {
        throw new Error('Discord fetch profile failed');
      }

      const discordUser = await userRes.json();
      const avatarUrl = discordUser.avatar
        ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
        : 'https://cdn.discordapp.com/embed/avatars/0.png';

      const user = findOrCreateUser({
        provider: 'discord',
        providerId: discordUser.id,
        name: discordUser.global_name || discordUser.username,
        email: discordUser.email || '',
        avatar: avatarUrl
      });

      const { token, maxAgeSeconds } = createSession(user.id);
      const cookieHeader = serializeCookie('noor_session', token, {
        path: '/',
        httpOnly: true,
        sameSite: 'Lax',
        maxAge: maxAgeSeconds
      });

      res.writeHead(302, {
        'Location': '/#profile?auth=discord_success',
        'Set-Cookie': cookieHeader
      });
      return res.end();

    } catch (e) {
      console.error('Discord callback error:', e);
      res.writeHead(302, { 'Location': '/#login?error=discord_failed' });
      return res.end();
    }
  }

  // ز. مصادقة Facebook Login
  if (pathname === '/api/auth/facebook' && method === 'POST') {
    try {
      const body = await readBody(req);
      const accessToken = body.accessToken;
      const userID = body.userID;

      if (!accessToken || !userID) {
        return sendJson(res, 400, { error: 'Facebook accessToken and userID are required' });
      }

      let fbUser = null;

      if (FACEBOOK_APP_SECRET) {
        // حساب appsecret_proof للأمان الإضافي الرسمي من Meta
        const appSecretProof = crypto.createHmac('sha256', FACEBOOK_APP_SECRET).update(accessToken).digest('hex');
        const graphUrl = `https://graph.facebook.com/v19.0/me?fields=id,name,email,picture.type(large)&access_token=${encodeURIComponent(accessToken)}&appsecret_proof=${appSecretProof}`;
        const fbRes = await fetch(graphUrl);
        if (!fbRes.ok) {
          return sendJson(res, 401, { error: 'Invalid Facebook token' });
        }
        fbUser = await fbRes.json();
      } else {
        // وضع المحاكاة الآمن لـ Facebook محلياً
        fbUser = {
          id: userID || 'fb_demo_' + crypto.randomBytes(4).toString('hex'),
          name: body.demoName || 'مستخدم Facebook التجريبي',
          email: body.demoEmail || 'facebook_user@noor-quran.app',
          picture: { data: { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' } }
        };
      }

      const avatar = (fbUser.picture && fbUser.picture.data && fbUser.picture.data.url) || '';

      const user = findOrCreateUser({
        provider: 'facebook',
        providerId: fbUser.id,
        name: fbUser.name,
        email: fbUser.email,
        avatar: avatar
      });

      const { token, maxAgeSeconds } = createSession(user.id);
      const cookieHeader = serializeCookie('noor_session', token, {
        path: '/',
        httpOnly: true,
        sameSite: 'Lax',
        maxAge: maxAgeSeconds
      });

      return sendJson(res, 200, {
        ok: true,
        user: sanitizeUser(user)
      }, { 'Set-Cookie': cookieHeader });

    } catch (e) {
      console.error('Facebook auth error:', e);
      return sendJson(res, 500, { error: 'Failed to authenticate with Facebook' });
    }
  }

  // ح. تسجيل الدخول التجريبي المباشر (Sandbox Demo Login)
  if (pathname === '/api/auth/demo-login' && method === 'POST') {
    const body = await readBody(req);
    const provider = ['google', 'discord', 'facebook'].includes(body.provider) ? body.provider : 'google';

    const providerNames = {
      google: 'عبد الرحمن القحطاني',
      discord: 'محمد نور الدين',
      facebook: 'أحمد بن علي'
    };
    const providerAvatars = {
      google: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      discord: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      facebook: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    };

    const user = findOrCreateUser({
      provider,
      providerId: `demo_${provider}_1001`,
      name: providerNames[provider],
      email: `${provider}_user@noor-quran.app`,
      avatar: providerAvatars[provider]
    });

    const { token, maxAgeSeconds } = createSession(user.id);
    const cookieHeader = serializeCookie('noor_session', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
      maxAge: maxAgeSeconds
    });

    return sendJson(res, 200, {
      ok: true,
      isDemoSandbox: true,
      user: sanitizeUser(user)
    }, { 'Set-Cookie': cookieHeader });
  }

  // ط. جلب البيانات السحابية المتزامنة (GET /api/sync)
  if (pathname === '/api/sync' && method === 'GET') {
    const sessionData = getSessionUser(req);
    if (!sessionData) {
      return sendJson(res, 401, { error: 'Authentication required for cloud sync' });
    }
    return sendJson(res, 200, {
      ok: true,
      data: sessionData.user.syncData || {},
      lastSyncedAt: sessionData.user.lastSyncedAt
    });
  }

  // ي. حفظ وتحديث البيانات السحابية (POST /api/sync)
  if (pathname === '/api/sync' && method === 'POST') {
    const sessionData = getSessionUser(req);
    if (!sessionData) {
      return sendJson(res, 401, { error: 'Authentication required for cloud sync' });
    }

    try {
      const body = await readBody(req);
      const db = readDb();
      const user = db.users[sessionData.user.id];
      if (!user) {
        return sendJson(res, 404, { error: 'User not found' });
      }

      user.syncData = user.syncData || {};

      // تحديث العناصر السحابية بعد التحقق
      if (Array.isArray(body.bookmarks)) {
        user.syncData.bookmarks = body.bookmarks.slice(0, 1000);
      }
      if (body.adhkarProgress && typeof body.adhkarProgress === 'object') {
        user.syncData.adhkarProgress = body.adhkarProgress;
      }
      if (body.lastRead && typeof body.lastRead === 'object') {
        user.syncData.lastRead = body.lastRead;
      }
      if (body.settings && typeof body.settings === 'object') {
        user.syncData.settings = { ...user.syncData.settings, ...body.settings };
      }
      if (body.tasbeeh && typeof body.tasbeeh === 'object') {
        user.syncData.tasbeeh = body.tasbeeh;
      }

      user.lastSyncedAt = new Date().toISOString();
      writeDb(db);

      return sendJson(res, 200, {
        ok: true,
        lastSyncedAt: user.lastSyncedAt
      });
    } catch (e) {
      console.error('Cloud sync save error:', e);
      return sendJson(res, 500, { error: 'Failed to save cloud sync data' });
    }
  }

  return sendJson(res, 404, { error: 'Endpoint not found' });
}

// --- 8. إنشاء الخادم الرئيسي ومعالجة الطلبات ---
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // توجيه طلبات الـ API
  if (pathname.startsWith('/api/')) {
    return handleApiRequest(req, res, parsedUrl);
  }

  // خدمة الملفات الثابتة
  let reqPath = decodeURIComponent(pathname);
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  const filePath = path.join(baseDir, reqPath);

  // حماية المسارات لمنع Directory Traversal
  if (!filePath.startsWith(baseDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Access Denied');
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('File not found: ' + reqPath);
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    'Content-Type': mime[ext] || 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN'
  });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`[Noor Al-Quran Server] Running on http://localhost:${PORT}`);
  console.log(`[Authentication] Google: ${GOOGLE_CLIENT_ID ? 'Configured' : 'Dev Sandbox'}`);
  console.log(`[Authentication] Discord: ${DISCORD_CLIENT_ID ? 'Configured' : 'Dev Sandbox'}`);
  console.log(`[Authentication] Facebook: ${FACEBOOK_APP_ID ? 'Configured' : 'Dev Sandbox'}`);
});
