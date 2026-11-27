const fs = require('fs');
const path = require('path');

const base = path.resolve('موقع ديني الرسمي');

// 1. Update js/auth.js
{
  const authPath = path.join(base, 'js/auth.js');
  let authCode = fs.readFileSync(authPath, 'utf8');
  if (!authCode.includes('window.Auth = Auth')) {
    authCode += '\n\n// Make Auth globally accessible\nwindow.Auth = Auth;\n';
    fs.writeFileSync(authPath, authCode, 'utf8');
    console.log('window.Auth assigned successfully!');
  } else {
    console.log('window.Auth already present');
  }
}

// 2. Update js/sync.js
{
  const syncPath = path.join(base, 'js/sync.js');
  let syncCode = fs.readFileSync(syncPath, 'utf8');
  if (!syncCode.includes('window.Sync = Sync')) {
    syncCode += '\n\n// Make Sync globally accessible\nwindow.Sync = Sync;\n';
    fs.writeFileSync(syncPath, syncCode, 'utf8');
    console.log('window.Sync assigned successfully!');
  } else {
    console.log('window.Sync already present');
  }
}

// 3. Update css/style.css
{
  const cssPath = path.join(base, 'css/style.css');
  let css = fs.readFileSync(cssPath, 'utf8').replace(/\r\n/g, '\n');

  // Fix .btn-header-pill wrapping
  const targetPill = `.btn-header-pill {\n  display: inline-flex;\n  align-items: center;\n  gap: 7px;\n  padding: 6px 14px;`;
  const replPill = `.btn-header-pill {\n  display: inline-flex;\n  align-items: center;\n  gap: 7px;\n  padding: 6px 14px;\n  white-space: nowrap;\n  flex-shrink: 0;`;

  if (css.includes(targetPill)) {
    css = css.replace(targetPill, replPill);
    console.log('.btn-header-pill updated with white-space: nowrap!');
  }

  // Also ensure pill-label is nowrap
  if (!css.includes('.pill-label { white-space: nowrap; }')) {
    css = css.replace('.btn-header-pill:hover {', '.pill-label {\n  white-space: nowrap;\n}\n\n.btn-header-pill:hover {');
  }

  // Also ensure .btn-header-login is nowrap
  const targetLoginBtn = `.btn-header-login {\n  background: var(--bg-surface);\n  border: 1px solid var(--accent-gold);`;
  const replLoginBtn = `.btn-header-login {\n  background: var(--bg-surface);\n  border: 1px solid var(--accent-gold);\n  white-space: nowrap;\n  flex-shrink: 0;`;
  if (css.includes(targetLoginBtn)) {
    css = css.replace(targetLoginBtn, replLoginBtn);
    console.log('.btn-header-login updated with nowrap!');
  }

  // Also in header actions, ensure no wrapping of pill buttons
  const targetHeaderActions = `.header-actions {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n}`;
  const replHeaderActions = `.header-actions {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex-shrink: 0;\n}`;
  if (css.includes(targetHeaderActions)) {
    css = css.replace(targetHeaderActions, replHeaderActions);
    console.log('.header-actions updated with gap: 8px and flex-shrink: 0!');
  }

  fs.writeFileSync(cssPath, css, 'utf8');
}

console.log('All fixes applied!');
