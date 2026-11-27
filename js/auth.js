/**
 * نُور القرآن | NOOR AL-QURAN
 * auth.js - إدارة المصادقة، الجلسات، حساب المستخدم، وربط Google, Discord, Facebook
 */

const Auth = {
  currentUser: null,
  config: {
    googleClientId: '',
    discordClientId: '',
    facebookAppId: '',
    isDevDemo: true
  },
  isInitialized: false,
  _listeners: [],

  async init() {
    try {
      // 1. جلب إعدادات المصادقة العامة من الخادم
      const cfgRes = await fetch('/api/auth/config');
      if (cfgRes.ok) {
        this.config = await cfgRes.json();
      }
    } catch (e) {
      console.warn('[Auth] Could not fetch auth config, using defaults:', e);
    }

    // 2. فحص الجلسة الحالية
    await this.checkSession();

    // 3. تهيئة مزودي الخدمة (Google GIS و Facebook SDK عند توفر المفاتيح)
    this.initGoogleClient();
    this.initFacebookClient();

    // 4. ربط أحداث واجهة تسجيل الدخول والبروفايل
    this.bindEvents();
    this.handleUrlParams();
    this.renderNavState();

    this.isInitialized = true;
    this.notify('init', this.currentUser);
  },

  async checkSession() {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          this.currentUser = data.user;
          this.renderNavState();
          this.renderProfileView();
          return this.currentUser;
        }
      }
    } catch (e) {
      console.warn('[Auth] Session check failed:', e);
    }
    this.currentUser = null;
    this.renderNavState();
    return null;
  },

  onStateChange(fn) {
    if (typeof fn === 'function') {
      this._listeners.push(fn);
    }
  },

  notify(event, payload) {
    this._listeners.forEach(fn => {
      try { fn(event, payload); } catch (e) { console.error(e); }
    });
  },

  /**
   * تهيئة عميل Google Identity Services الرسمي
   */
  initGoogleClient() {
    if (!this.config.googleClientId) return;

    if (!document.getElementById('google-gsi-script')) {
      const script = document.createElement('script');
      script.id = 'google-gsi-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google && window.google.accounts) {
          window.google.accounts.id.initialize({
            client_id: this.config.googleClientId,
            callback: (res) => this.handleGoogleCredential(res),
            auto_select: false,
            cancel_on_tap_outside: true
          });
        }
      };
      document.head.appendChild(script);
    }
  },

  /**
   * تهيئة عميل Facebook SDK الرسمي
   */
  initFacebookClient() {
    if (!this.config.facebookAppId) return;

    if (!document.getElementById('facebook-jssdk')) {
      window.fbAsyncInit = () => {
        window.FB.init({
          appId: this.config.facebookAppId,
          cookie: true,
          xfbml: true,
          version: 'v19.0'
        });
      };
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/ar_AR/sdk.js';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  },

  /**
   * تسجيل الدخول عبر Google
   */
  async loginWithGoogle() {
    this.setButtonLoading('btn-login-google', true);
    this.hideError();

    // إذا كان Google Client ID معرفاً ومضبوطاً في الإنتاج
    if (this.config.googleClientId && window.google && window.google.accounts) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            this.setButtonLoading('btn-login-google', false);
          }
        });
      } catch (err) {
        this.setButtonLoading('btn-login-google', false);
        this.showError('تعذر فتح نافذة تسجيل دخول Google حالياً. يرجى المحاولة مجدداً.');
      }
      return;
    }

    // وضع التطوير السلس (Sandbox Mode)
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'google' })
      });
      const data = await res.json();
      this.setButtonLoading('btn-login-google', false);

      if (data.ok && data.user) {
        this.handleAuthSuccess(data.user, 'google');
      } else {
        this.showError('تعذر تسجيل الدخول حالياً. حاول مرة أخرى.');
      }
    } catch (e) {
      this.setButtonLoading('btn-login-google', false);
      this.showError('تعذر تسجيل الدخول حالياً. تحقق من اتصالك وحاول مرة أخرى.');
    }
  },

  async handleGoogleCredential(response) {
    if (!response || !response.credential) {
      this.showError('لم يتم استلام بيانات التحقق من Google.');
      this.setButtonLoading('btn-login-google', false);
      return;
    }

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential })
      });
      const data = await res.json();
      this.setButtonLoading('btn-login-google', false);

      if (data.ok && data.user) {
        this.handleAuthSuccess(data.user, 'google');
      } else {
        this.showError('تعذر التحقق من حساب Google. حاول مرة أخرى.');
      }
    } catch (e) {
      this.setButtonLoading('btn-login-google', false);
      this.showError('تعذر إكمال المصادقة عبر Google. حاول مرة أخرى.');
    }
  },

  /**
   * تسجيل الدخول عبر Discord
   */
  loginWithDiscord() {
    this.setButtonLoading('btn-login-discord', true);
    this.hideError();

    // التوجيه إلى مسار السيرفر الآمن الذي ينشئ الـ state ويحميه
    window.location.href = '/api/auth/discord/login';
  },

  /**
   * تسجيل الدخول عبر Facebook
   */
  async loginWithFacebook() {
    this.setButtonLoading('btn-login-facebook', true);
    this.hideError();

    if (this.config.facebookAppId && window.FB) {
      window.FB.login(async (response) => {
        if (response.authResponse) {
          try {
            const res = await fetch('/api/auth/facebook', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                accessToken: response.authResponse.accessToken,
                userID: response.authResponse.userID
              })
            });
            const data = await res.json();
            this.setButtonLoading('btn-login-facebook', false);
            if (data.ok && data.user) {
              this.handleAuthSuccess(data.user, 'facebook');
            } else {
              this.showError('تعذر التحقق من حساب Facebook.');
            }
          } catch (e) {
            this.setButtonLoading('btn-login-facebook', false);
            this.showError('حدث خطأ أثناء الاتصال بحساب Facebook.');
          }
        } else {
          this.setButtonLoading('btn-login-facebook', false);
        }
      }, { scope: 'public_profile,email' });
      return;
    }

    // وضع التطوير السلس (Sandbox Mode)
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'facebook' })
      });
      const data = await res.json();
      this.setButtonLoading('btn-login-facebook', false);

      if (data.ok && data.user) {
        this.handleAuthSuccess(data.user, 'facebook');
      } else {
        this.showError('تعذر تسجيل الدخول حالياً. حاول مرة أخرى.');
      }
    } catch (e) {
      this.setButtonLoading('btn-login-facebook', false);
      this.showError('تعذر تسجيل الدخول حالياً. حاول مرة أخرى.');
    }
  },

  /**
   * معالجة نجاح تسجيل الدخول والانتقال السلس
   */
  async handleAuthSuccess(user, provider) {
    this.currentUser = user;
    this.renderNavState();
    this.renderProfileView();
    this.closeGuestPrompt();

    // تشغيل مزامنة السحابة
    if (window.Sync) {
      await Sync.pull();
    }

    this.notify('login', user);

    if (window.App && typeof window.App.showToast === 'function') {
      window.App.showToast(`مرحباً بك يا ${user.name}، تم تسجيل الدخول والمزامنة بنجاح.`);
    }

    // الانتقال للبروفايل أو استئناف القراءة
    if (window.App && typeof window.App.navigateTo === 'function') {
      window.App.navigateTo('profile');
    }
  },

  /**
   * تسجيل الخروج
   */
  async logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('[Auth] Logout network error:', e);
    }

    this.currentUser = null;
    this.renderNavState();
    this.notify('logout', null);

    if (window.App && typeof window.App.showToast === 'function') {
      window.App.showToast('تم تسجيل الخروج بنجاح. أنت الآن تتصفح كزائر.');
    }

    if (window.App && typeof window.App.navigateTo === 'function') {
      window.App.navigateTo('home');
    }
  },

  /**
   * تحديث أزرار وواجهة الهيدر والقائمة المنسدلة
   */
  renderNavState() {
    const loginBtn = document.getElementById('btn-header-login');
    const userMenu = document.getElementById('header-user-menu');
    const avatarImg = document.getElementById('header-user-avatar');
    const nameSpan = document.getElementById('header-user-name');
    const dropName = document.getElementById('dropdown-user-name');
    const dropEmail = document.getElementById('dropdown-user-email');
    const dropProvider = document.getElementById('dropdown-user-provider');

    if (this.currentUser) {
      if (loginBtn) loginBtn.style.display = 'none';
      if (userMenu) userMenu.style.display = 'inline-flex';

      const avatarSrc = this.currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
      if (avatarImg) avatarImg.src = avatarSrc;
      if (nameSpan) nameSpan.textContent = this.currentUser.name.split(' ')[0] || 'حسابي';
      if (dropName) dropName.textContent = this.currentUser.name;
      if (dropEmail) dropEmail.textContent = this.currentUser.email || 'حساب موثق';

      if (dropProvider) {
        const providerLabels = {
          google: 'حساب Google موثق',
          discord: 'حساب Discord موثق',
          facebook: 'حساب Facebook موثق'
        };
        dropProvider.textContent = providerLabels[this.currentUser.provider] || 'حساب نور القرآن';
      }
    } else {
      if (loginBtn) loginBtn.style.display = 'inline-flex';
      if (userMenu) userMenu.style.display = 'none';
    }
  },

  /**
   * تحديث وتعبئة محتويات صفحة البروفايل
   */
  renderProfileView() {
    if (!this.currentUser) return;

    const pAvatar = document.getElementById('profile-user-avatar');
    const pName = document.getElementById('profile-user-name');
    const pEmail = document.getElementById('profile-user-email');
    const pProviderBadge = document.getElementById('profile-user-provider-badge');
    const pMemberSince = document.getElementById('profile-member-since');
    const pLastSync = document.getElementById('profile-last-sync-time');

    if (pAvatar) pAvatar.src = this.currentUser.avatar || '';
    if (pName) pName.textContent = this.currentUser.name;
    if (pEmail) pEmail.textContent = this.currentUser.email || 'لا يوجد بريد إلكتروني عام';

    if (pProviderBadge) {
      const pIcons = {
        google: 'Google',
        discord: 'Discord',
        facebook: 'Facebook'
      };
      pProviderBadge.textContent = `مسجل بواسطة ${pIcons[this.currentUser.provider] || 'الحساب المعتمد'}`;
    }

    if (pMemberSince && this.currentUser.createdAt) {
      const date = new Date(this.currentUser.createdAt);
      pMemberSince.textContent = `عضو منذ: ${date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}`;
    }

    if (pLastSync) {
      const syncDate = this.currentUser.lastSyncedAt ? new Date(this.currentUser.lastSyncedAt) : new Date();
      pLastSync.textContent = `آخر مزامنة سحابية: ${syncDate.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}`;
    }

    // تحديث إحصائيات المفضلة وآخر قراءة
    if (window.Quran) {
      const bookmarks = Quran.bookmarks || [];
      const countEl = document.getElementById('profile-stat-favorites-count');
      if (countEl) countEl.textContent = bookmarks.length;

      const lastRead = Quran.lastRead || {};
      const lastReadSurahEl = document.getElementById('profile-last-read-surah');
      const lastReadPageEl = document.getElementById('profile-last-read-page');
      if (lastReadSurahEl && lastRead.surahName) {
        lastReadSurahEl.textContent = `سورة ${lastRead.surahName} (الآية ${lastRead.ayahNumber || 1})`;
      }
      if (lastReadPageEl && lastRead.pageNumber) {
        lastReadPageEl.textContent = `الصفحة ${lastRead.pageNumber}`;
      }
    }

    // القارئ المفضل
    if (window.Settings) {
      const reciterId = Settings.get('defaultReciter') || 'ar.alafasy';
      const reciterNameEl = document.getElementById('profile-stat-reciter');
      const reciterNames = {
        'ar.alafasy': 'مشاري العفاسي',
        'ar.abdulbasitmurattal': 'عبد الباسط عبد الصمد',
        'ar.minshawi': 'محمد صديق المنشاوي',
        'ar.husary': 'محمود خليل الحصري',
        'ar.ghamadi': 'سعد الغامدي',
        'ar.mahermuaiqly': 'ماهر المعيقلي'
      };
      if (reciterNameEl) reciterNameEl.textContent = reciterNames[reciterId] || 'مشاري العفاسي';
    }
  },

  /**
   * معالجة بارامترات الرابط بعد العودة من OAuth
   */
  handleUrlParams() {
    const hash = window.location.hash || '';
    if (hash.includes('auth=discord_success')) {
      this.checkSession().then(u => {
        if (u) {
          if (window.App && typeof window.App.showToast === 'function') {
            window.App.showToast('تم تسجيل الدخول بنجاح عبر حساب Discord.');
          }
          if (window.Sync) Sync.pull();
        }
      });
      window.history.replaceState(null, '', '#profile');
    } else if (hash.includes('error=')) {
      this.showError('تعذر إكمال تسجيل الدخول. يرجى إعادة المحاولة.');
      window.history.replaceState(null, '', '#login');
    }
  },

  /**
   * ربط عناصر الواجهة
   */
  bindEvents() {
    // أزرار تسجيل الدخول في صفحة Login
    const btnGoogle = document.getElementById('btn-login-google');
    if (btnGoogle) {
      btnGoogle.addEventListener('click', () => this.loginWithGoogle());
    }

    const btnDiscord = document.getElementById('btn-login-discord');
    if (btnDiscord) {
      btnDiscord.addEventListener('click', () => this.loginWithDiscord());
    }

    const btnFacebook = document.getElementById('btn-login-facebook');
    if (btnFacebook) {
      btnFacebook.addEventListener('click', () => this.loginWithFacebook());
    }

    // القائمة المنسدلة للمستخدم في الهيدر
    const userToggle = document.getElementById('btn-user-dropdown-toggle');
    const userDropdown = document.getElementById('user-dropdown-menu');
    if (userToggle && userDropdown) {
      userToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = userDropdown.classList.contains('active');
        userDropdown.classList.toggle('active', !isOpen);
        userToggle.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
      });

      document.addEventListener('click', (e) => {
        if (!userDropdown.contains(e.target) && !userToggle.contains(e.target)) {
          userDropdown.classList.remove('active');
          userToggle.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // زر تسجيل الخروج
    const logoutBtn = document.getElementById('btn-dropdown-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (userDropdown) userDropdown.classList.remove('active');
        this.logout();
      });
    }

    const pLogoutBtn = document.getElementById('btn-profile-logout');
    if (pLogoutBtn) {
      pLogoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
    }

    // زر مزامنة الآن اليدوي في البروفايل
    const syncNowBtn = document.getElementById('btn-profile-sync-now');
    if (syncNowBtn) {
      syncNowBtn.addEventListener('click', async () => {
        if (window.Sync) {
          syncNowBtn.classList.add('is-spinning');
          await Sync.push();
          setTimeout(() => syncNowBtn.classList.remove('is-spinning'), 700);
          this.renderProfileView();
        }
      });
    }

    // أزرار نافذة موجه الزائر (Guest Prompt Modal)
    const gpGoogle = document.getElementById('btn-guest-prompt-google');
    if (gpGoogle) gpGoogle.addEventListener('click', () => this.loginWithGoogle());

    const gpDiscord = document.getElementById('btn-guest-prompt-discord');
    if (gpDiscord) gpDiscord.addEventListener('click', () => this.loginWithDiscord());

    const gpFacebook = document.getElementById('btn-guest-prompt-facebook');
    if (gpFacebook) gpFacebook.addEventListener('click', () => this.loginWithFacebook());

    const gpClose = document.getElementById('btn-close-guest-prompt');
    if (gpClose) gpClose.addEventListener('click', () => this.closeGuestPrompt());

    const gpSkip = document.getElementById('btn-skip-guest-prompt');
    if (gpSkip) gpSkip.addEventListener('click', () => this.closeGuestPrompt());
  },

  showGuestPrompt(contextMsg) {
    const modal = document.getElementById('guest-prompt-modal');
    const msgEl = document.getElementById('guest-prompt-context-text');
    if (msgEl && contextMsg) {
      msgEl.textContent = contextMsg;
    }
    if (modal) {
      modal.style.display = 'flex';
      void modal.offsetWidth;
      modal.classList.add('active');
    }
  },

  closeGuestPrompt() {
    const modal = document.getElementById('guest-prompt-modal');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => { modal.style.display = 'none'; }, 200);
    }
  },

  setButtonLoading(btnId, isLoading) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    if (isLoading) {
      btn.classList.add('is-loading');
      btn.disabled = true;
    } else {
      btn.classList.remove('is-loading');
      btn.disabled = false;
    }
  },

  showError(msg) {
    const box = document.getElementById('login-error-banner');
    const text = document.getElementById('login-error-text');
    if (text) text.textContent = msg;
    if (box) {
      box.style.display = 'flex';
      void box.offsetWidth;
      box.classList.add('active');
    }
  },

  hideError() {
    const box = document.getElementById('login-error-banner');
    if (box) {
      box.classList.remove('active');
      box.style.display = 'none';
    }
  }
};
