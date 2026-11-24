/**
 * نُور القرآن | NOOR AL-QURAN
 * settings.js - إدارة تفضيلات المستخدم والتخصيص الفاخر وحفظها في localStorage
 */

const Settings = {
  // المفتاح المستخدم للتخزين
  STORAGE_KEY: 'noor_quran_settings_v1',

  // القيم الافتراضية الشاملة
  defaults: {
    theme: 'dark', // 'dark' | 'light' | 'auto'
    language: 'ar', // 'ar' | 'en' | 'fr'
    fontFamily: 'Cairo', // 'Cairo' | 'Amiri' | 'Noto Naskh Arabic' | 'Tajawal'
    fontSize: 'medium', // 'small' | 'medium' | 'large' | 'xlarge'
    primaryColor: '#059669', // Emerald
    quranFontSize: 28, // px
    quranViewMode: 'mushaf', // 'mushaf' | 'verses'
    quranTafsirEnabled: true,
    quranTranslationEnabled: false,
    customCursor: true, // مؤشر الفأرة الروحاني السلس
    spiritualAnimations: true,
    playbackSpeed: 1, // 0.75, 1, 1.25, 1.5
    defaultReciter: 'ar.alafasy',
    audioAutoplay: true,
    adhanSound: true,
    adhanVolume: 1.0,
    muezzin: 'muezzin1', // 'muezzin1' | 'muezzin2' | 'muezzin3'
    tasbeehSound: true,
    tasbeehVibrate: true,
    prayerNotifications: false,
    morningAdhkarNotif: true,
    eveningAdhkarNotif: true,
    dailyAyahNotif: true,
    calculationMethod: 3, // 3: Muslim World League, 4: Umm Al-Qura, 5: Egyptian, 1: Karachi
    lastLocation: {
      country: 'Saudi Arabia',
      city: 'Makkah',
      lat: 21.4225,
      lng: 39.8262,
      isGPS: false
    },
    lastQuranPosition: {
      surahNumber: 1,
      surahName: 'الفاتحة',
      ayahNumber: 1,
      pageNumber: 1
    },
    favorites: []
  },

  state: {},

  init() {
    this.load();
    this.applyAll();
    this.bindEvents();
    // تهيئة واجهة الإعدادات الفاخرة بعد تحميل المستند
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initLuxuryUI());
    } else {
      this.initLuxuryUI();
    }
  },

  load() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        this.state = Object.assign({}, this.defaults, JSON.parse(saved));
      } else {
        this.state = Object.assign({}, this.defaults);
      }
    } catch (e) {
      console.error('Failed to parse settings from localStorage:', e);
      this.state = Object.assign({}, this.defaults);
    }
  },

  save() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save settings to localStorage:', e);
    }
  },

  get(key) {
    return this.state[key] !== undefined ? this.state[key] : this.defaults[key];
  },

  set(key, value) {
    this.state[key] = value;
    this.save();
    this.applyKey(key, value);
    window.dispatchEvent(new CustomEvent('settings:changed', { detail: { key, value } }));
    this.updateLivePreview();
  },

  applyAll() {
    this.applyTheme(this.get('theme'));
    this.applyLanguage(this.get('language'));
    this.applyFontFamily(this.get('fontFamily'));
    this.applyFontSize(this.get('fontSize'));
    this.applyPrimaryColor(this.get('primaryColor'));
    this.applyQuranFontSize(this.get('quranFontSize'));
    this.applyCustomCursor(this.get('customCursor'));
  },

  applyKey(key, value) {
    switch (key) {
      case 'theme':
        this.applyTheme(value);
        break;
      case 'language':
        this.applyLanguage(value);
        break;
      case 'fontFamily':
        this.applyFontFamily(value);
        break;
      case 'fontSize':
        this.applyFontSize(value);
        break;
      case 'primaryColor':
        this.applyPrimaryColor(value);
        break;
      case 'quranFontSize':
        this.applyQuranFontSize(value);
        break;
      case 'customCursor':
        this.applyCustomCursor(value);
        break;
    }
  },

  applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', theme);
    }
    this.syncThemeCards(theme);
  },

  applyLanguage(lang) {
    const root = document.documentElement;
    root.setAttribute('lang', lang);
    root.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    if (window.App && typeof window.App.updateTranslations === 'function') {
      window.App.updateTranslations(lang);
    }
    this.syncLanguageCards(lang);
  },

  applyFontFamily(family) {
    document.documentElement.style.setProperty('--font-family-base', `'${family}', sans-serif`);
    const previewAyah = document.getElementById('preview-ayah-display');
    const previewFontTag = document.getElementById('preview-font-tag');
    if (previewAyah) previewAyah.style.fontFamily = `'${family}', var(--font-family-quran)`;
    if (previewFontTag) previewFontTag.textContent = `خط: ${family}`;
  },

  applyFontSize(size) {
    const sizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '20px'
    };
    document.documentElement.style.setProperty('--font-size-base', sizeMap[size] || '16px');
  },

  applyPrimaryColor(hex) {
    document.documentElement.style.setProperty('--primary-color', hex);
    document.documentElement.style.setProperty('--primary-hover', this.lightenDarkenColor(hex, 15));
    document.documentElement.style.setProperty('--primary-dim', hex + '26');
    // تحديث هالة النقطة النشطة في المعاينة
    const liveDot = document.querySelector('.preview-live-dot');
    if (liveDot) {
      liveDot.style.background = hex;
      liveDot.style.boxShadow = `0 0 10px ${hex}`;
    }
  },

  applyQuranFontSize(sizePx) {
    document.documentElement.style.setProperty('--font-size-quran', `${sizePx}px`);
    const previewAyah = document.getElementById('preview-ayah-display');
    const previewSizeTag = document.getElementById('preview-size-tag');
    if (previewAyah) previewAyah.style.fontSize = `${sizePx}px`;
    if (previewSizeTag) previewSizeTag.textContent = `${sizePx}px`;
  },

  applyCustomCursor(enabled) {
    if (window.NoorCursor && typeof window.NoorCursor.toggle === 'function') {
      window.NoorCursor.toggle(enabled);
    }
  },

  lightenDarkenColor(col, amt) {
    let usePound = false;
    if (col[0] === '#') {
      col = col.slice(1);
      usePound = true;
    }
    const num = parseInt(col, 16);
    let r = (num >> 16) + amt;
    if (r > 255) r = 255; else if (r < 0) r = 0;
    let b = ((num >> 8) & 0x00FF) + amt;
    if (b > 255) b = 255; else if (b < 0) b = 0;
    let g = (num & 0x0000FF) + amt;
    if (g > 255) g = 255; else if (g < 0) g = 0;
    return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
  },

  bindEvents() {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (this.get('theme') === 'auto') {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    });
  },

  /* ==================== تهيئة واجهة الإعدادات الفاخرة التفاعلية ==================== */
  initLuxuryUI() {
    this.bindSidebarTabs();
    this.bindThemeCards();
    this.bindLanguageCards();
    this.bindDataActions();
    this.updateDataStats();
    this.updateLivePreview();
  },

  // 1. التنقل السلس بين أقسام الـ Sidebar
  bindSidebarTabs() {
    const navItems = document.querySelectorAll('.settings-nav-item');
    const panels = document.querySelectorAll('.settings-panel');

    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const targetTab = item.getAttribute('data-settings-tab');
        if (!targetTab) return;

        // تحديث أزرار التنقل
        navItems.forEach(btn => btn.classList.remove('active'));
        item.classList.add('active');

        // تبديل اللوحات مع أنيميشن ناعمة
        panels.forEach(panel => {
          panel.classList.remove('active');
        });

        const activePanel = document.getElementById(`settings-panel-${targetTab}`);
        if (activePanel) {
          activePanel.classList.add('active');
          // صوت ناعم للنقر إذا كان مفعلاً
          if (window.Sound && typeof window.Sound.playClickSound === 'function') {
            window.Sound.playClickSound();
          }
        }
      });
    });
  },

  // 2. بطاقات اختيار السمة (داكن / فاتح / تلقائي)
  bindThemeCards() {
    const themeCards = document.querySelectorAll('.theme-mode-card');
    themeCards.forEach(card => {
      const radio = card.querySelector('input[type="radio"]');
      card.addEventListener('click', () => {
        if (!radio) return;
        radio.checked = true;
        const val = radio.value;
        this.set('theme', val);
        this.syncThemeCards(val);
        this.showToast(val === 'dark' ? 'تم تفعيل الوضع الليلي 🌙' : (val === 'light' ? 'تم تفعيل الوضع النهاري ☀️' : 'تم ضبط الوضع تلقائياً حسب جهازك ⚙️'));
      });
    });

    this.syncThemeCards(this.get('theme'));
  },

  syncThemeCards(currentTheme) {
    document.querySelectorAll('.theme-mode-card').forEach(card => {
      const radio = card.querySelector('input[type="radio"]');
      if (radio && radio.value === currentTheme) {
        card.classList.add('active');
        radio.checked = true;
      } else {
        card.classList.remove('active');
      }
    });
  },

  // 3. بطاقات اختيار اللغة الفاخرة
  bindLanguageCards() {
    const langCards = document.querySelectorAll('.lang-select-card');
    langCards.forEach(card => {
      card.addEventListener('click', () => {
        const langVal = card.getAttribute('data-lang-val');
        if (!langVal) return;

        this.set('language', langVal);
        this.syncLanguageCards(langVal);

        // تحديث محدد اللغة في الهيدر إذا وجد
        const headerSelect = document.getElementById('header-lang-select');
        if (headerSelect) headerSelect.value = langVal;

        this.showToast(langVal === 'ar' ? 'تم اختيار اللغة: العربية 🇸🇦' : (langVal === 'en' ? 'Language set to English 🇬🇧' : 'Langue définie sur Français 🇫🇷'));
      });
    });

    this.syncLanguageCards(this.get('language'));
  },

  syncLanguageCards(currentLang) {
    document.querySelectorAll('.lang-select-card').forEach(card => {
      if (card.getAttribute('data-lang-val') === currentLang) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  },

  // 4. استوديو المعاينة الحية المباشرة (Live Preview Studio)
  updateLivePreview() {
    const previewAyah = document.getElementById('preview-ayah-display');
    const previewFontTag = document.getElementById('preview-font-tag');
    const previewSizeTag = document.getElementById('preview-size-tag');
    const previewBox = document.getElementById('preview-quran-box');

    const curFont = this.get('fontFamily');
    const curSize = this.get('quranFontSize');
    const curTheme = this.get('theme');

    if (previewAyah) {
      previewAyah.style.fontSize = `${curSize}px`;
      previewAyah.style.fontFamily = `'${curFont}', var(--font-family-quran), sans-serif`;
    }
    if (previewFontTag) previewFontTag.textContent = `خط: ${curFont}`;
    if (previewSizeTag) previewSizeTag.textContent = `${curSize}px`;

    // ضبط درجات لون المعاينة
    const primaryColor = this.get('primaryColor');
    const bismillah = document.querySelector('.preview-bismillah');
    if (bismillah) bismillah.style.color = 'var(--accent-gold)';
  },

  // 5. قسم الخصوصية وإدارة البيانات المحلية
  bindDataActions() {
    // زر استعادة كافة الإعدادات الافتراضية
    const resetBtn = document.getElementById('btn-reset-all-settings');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        const confirmed = confirm('هل أنت متأكد من رغبتك في استعادة كافة الإعدادات الافتراضية للمنصة؟');
        if (confirmed) {
          localStorage.removeItem(this.STORAGE_KEY);
          this.state = Object.assign({}, this.defaults);
          this.save();
          this.applyAll();
          this.showToast('تمت استعادة كافة الإعدادات الافتراضية بنجاح 🔄');
          setTimeout(() => location.reload(), 800);
        }
      });
    }

    // زر مسح سجل القراءة والمفضلة
    const clearHistoryBtn = document.getElementById('btn-clear-reading-history');
    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener('click', () => {
        const confirmed = confirm('هل تريد بالتأكيد مسح مواضع القراءة المحفوظة وقائمة المفضلة؟');
        if (confirmed) {
          localStorage.removeItem('noor_quran_last_read');
          localStorage.removeItem('noor_quran_bookmarks');
          this.state.favorites = [];
          this.state.lastQuranPosition = Object.assign({}, this.defaults.lastQuranPosition);
          this.save();
          this.updateDataStats();
          this.showToast('تم مسح سجل القراءة والمفضلة بنجاح 🗑️');
        }
      });
    }
  },

  // حساب وتحديث إحصائيات التخزين
  updateDataStats() {
    const favCountEl = document.getElementById('stat-favorites-count');
    const lastSurahEl = document.getElementById('stat-last-surah-page');
    const storageSizeEl = document.getElementById('stat-storage-size');

    // 1. عدد المفضلة
    let favCount = 0;
    try {
      const bmarks = localStorage.getItem('noor_quran_bookmarks');
      if (bmarks) favCount = JSON.parse(bmarks).length;
      else if (this.state.favorites) favCount = this.state.favorites.length;
    } catch (e) {}
    if (favCountEl) favCountEl.textContent = favCount;

    // 2. آخر موضع قراءة
    try {
      const lastRead = localStorage.getItem('noor_quran_last_read');
      if (lastRead) {
        const lr = JSON.parse(lastRead);
        if (lastSurahEl) lastSurahEl.textContent = `${lr.surahName || 'الفاتحة'} (ص ${lr.pageNumber || 1})`;
      } else {
        const pos = this.state.lastQuranPosition || this.defaults.lastQuranPosition;
        if (lastSurahEl) lastSurahEl.textContent = `${pos.surahName || 'الفاتحة'} (ص ${pos.pageNumber || 1})`;
      }
    } catch (e) {}

    // 3. حجم التخزين الكلي المستخدم
    try {
      let totalBytes = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('noor_')) {
          totalBytes += (localStorage.getItem(key) || '').length * 2;
        }
      }
      const kb = Math.max(1, Math.round(totalBytes / 1024));
      if (storageSizeEl) storageSizeEl.textContent = `~${kb} KB`;
    } catch (e) {}
  },

  // رسالة التنبيه الخفيفة الفاخرة (Settings Toast)
  showToast(message) {
    let toast = document.getElementById('settings-toast');
    let toastMsg = document.getElementById('settings-toast-msg');

    if (!toast) return;
    if (toastMsg) toastMsg.textContent = message;

    toast.classList.add('show');
    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }
};

window.Settings = Settings;

// تهيئة الإعدادات
Settings.init();
