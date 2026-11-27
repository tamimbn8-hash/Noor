/**
 * نُور القرآن | NOOR AL-QURAN
 * sync.js - محرك المزامنة السحابية الذكي (Cloud Data Synchronization Engine)
 * يتولى مزامنة: المفضلة، آخر موضع قراءة، الأذكار المنجزة، السبحة، وإعدادات المستخدم عبر كافة الأجهزة
 */

const Sync = {
  isSyncing: false,
  _debounceTimer: null,
  lastSyncedAt: null,

  init() {
    // الاستماع لتغييرات تسجيل الدخول
    if (window.Auth) {
      Auth.onStateChange((event, user) => {
        if (event === 'login' && user) {
          this.pull();
        }
      });
    }

    // إذا كان المستخدم مسجلاً بالفعل عند فتح الصفحة
    if (window.Auth && Auth.currentUser) {
      this.pull();
    }
  },

  /**
   * جدولة إرسال التحديثات السحابية بتخميد (Debounce 1200ms) لمنع إرهاق الشبكة
   */
  schedulePush() {
    if (!window.Auth || !Auth.currentUser) return;

    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
    }

    this._debounceTimer = setTimeout(() => {
      this.push();
    }, 1200);
  },

  /**
   * تجميع البيانات المحلية الحالية لتجهيزها للإرسال
   */
  collectLocalData() {
    const data = {
      bookmarks: [],
      adhkarProgress: {},
      lastRead: null,
      settings: {},
      tasbeeh: {}
    };

    // 1. مفضلة الآيات
    if (window.Quran && Array.isArray(Quran.bookmarks)) {
      data.bookmarks = Quran.bookmarks;
    } else {
      try {
        const stored = localStorage.getItem('noor_bookmarks');
        if (stored) data.bookmarks = JSON.parse(stored);
      } catch (e) {}
    }

    // 2. آخر قراءة
    if (window.Quran && Quran.lastRead) {
      data.lastRead = Quran.lastRead;
    } else {
      try {
        const stored = localStorage.getItem('noor_last_read');
        if (stored) data.lastRead = JSON.parse(stored);
      } catch (e) {}
    }

    // 3. أذكار اليوم
    if (window.Adhkar && Adhkar.userProgress) {
      data.adhkarProgress = Adhkar.userProgress;
    }

    // 4. إعدادات المستخدم
    if (window.Settings && typeof Settings.getAll === 'function') {
      data.settings = Settings.getAll();
    } else {
      try {
        const stored = localStorage.getItem('noor_settings');
        if (stored) data.settings = JSON.parse(stored);
      } catch (e) {}
    }

    // 5. إحصائيات السبحة
    if (window.Tasbeeh) {
      data.tasbeeh = {
        totalCount: Tasbeeh.totalCount || 0,
        cycles: Tasbeeh.cycles || 0,
        target: Tasbeeh.target || 33
      };
    }

    return data;
  },

  /**
   * رفع البيانات المحلية وتحديث السحابة (Push to Cloud)
   */
  async push() {
    if (!window.Auth || !Auth.currentUser) return false;
    if (this.isSyncing) return false;

    this.isSyncing = true;
    this.updateSyncBadge('syncing');

    try {
      const payload = this.collectLocalData();

      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Cloud push failed');

      const result = await res.json();
      this.lastSyncedAt = result.lastSyncedAt || new Date().toISOString();
      if (Auth.currentUser) {
        Auth.currentUser.lastSyncedAt = this.lastSyncedAt;
      }

      this.updateSyncBadge('success');
      if (typeof Auth.renderProfileView === 'function') {
        Auth.renderProfileView();
      }

      return true;
    } catch (e) {
      console.warn('[Sync] Push error:', e);
      this.updateSyncBadge('error');
      return false;
    } finally {
      this.isSyncing = false;
    }
  },

  /**
   * جلب البيانات السحابية ودمجها مع الجهاز الحالي (Pull from Cloud)
   */
  async pull() {
    if (!window.Auth || !Auth.currentUser) return false;

    this.isSyncing = true;
    this.updateSyncBadge('syncing');

    try {
      const res = await fetch('/api/sync');
      if (!res.ok) throw new Error('Cloud pull failed');

      const result = await res.json();
      const cloudData = result.data || {};
      this.lastSyncedAt = result.lastSyncedAt || cloudData.lastSyncedAt;

      // 1. دمج المفضلة (دمج اتحادي بدون فقدان المحفوظ محلياً)
      if (Array.isArray(cloudData.bookmarks) && window.Quran) {
        const local = Quran.bookmarks || [];
        const combined = Array.from(new Set([...cloudData.bookmarks, ...local]));
        Quran.bookmarks = combined;
        try { localStorage.setItem('noor_bookmarks', JSON.stringify(combined)); } catch (e) {}
        if (typeof Quran.renderBookmarks === 'function') {
          Quran.renderBookmarks();
        }
      }

      // 2. تحديث موضع آخر قراءة
      if (cloudData.lastRead && window.Quran) {
        const cloudTime = cloudData.lastRead.timestamp || 0;
        const localTime = (Quran.lastRead && Quran.lastRead.timestamp) || 0;
        if (cloudTime >= localTime) {
          Quran.lastRead = cloudData.lastRead;
          try { localStorage.setItem('noor_last_read', JSON.stringify(cloudData.lastRead)); } catch (e) {}
        }
      }

      // 3. تطبيق الإعدادات السحابية
      if (cloudData.settings && window.Settings) {
        for (const key in cloudData.settings) {
          Settings.set(key, cloudData.settings[key]);
        }
        if (typeof Settings.applyAll === 'function') {
          Settings.applyAll();
        }
      }

      // 4. تحديث تقدم السبحة
      if (cloudData.tasbeeh && window.Tasbeeh) {
        if (cloudData.tasbeeh.totalCount > (Tasbeeh.totalCount || 0)) {
          Tasbeeh.totalCount = cloudData.tasbeeh.totalCount;
          Tasbeeh.cycles = cloudData.tasbeeh.cycles || 0;
          if (cloudData.tasbeeh.target) Tasbeeh.target = cloudData.tasbeeh.target;
          if (typeof Tasbeeh.updateStatsDisplay === 'function') {
            Tasbeeh.updateStatsDisplay();
          }
        }
      }

      this.updateSyncBadge('success');
      if (typeof Auth.renderProfileView === 'function') {
        Auth.renderProfileView();
      }

      return true;
    } catch (e) {
      console.warn('[Sync] Pull error:', e);
      this.updateSyncBadge('error');
      return false;
    } finally {
      this.isSyncing = false;
    }
  },

  /**
   * تحديث مؤشر المزامنة في شارة البروفايل
   */
  updateSyncBadge(status) {
    const badge = document.getElementById('profile-sync-status-indicator');
    const label = document.getElementById('profile-sync-status-label');
    if (!badge || !label) return;

    badge.className = 'sync-status-dot';
    if (status === 'syncing') {
      badge.classList.add('syncing');
      label.textContent = 'جاري المزامنة السحابية...';
    } else if (status === 'success') {
      badge.classList.add('success');
      label.textContent = 'المزامنة السحابية مفعّلة ونشطة';
    } else if (status === 'error') {
      badge.classList.add('error');
      label.textContent = 'تعذر المزامنة مؤقتاً';
    }
  }
};
