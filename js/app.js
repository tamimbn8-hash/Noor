/**
 * نُور القرآن | NOOR AL-QURAN
 * app.js - المحرك الرئيسي، إدارة التنقل، والترجمة متعددة اللغات، والرسائل المنبثقة
 */

const App = {
  currentSection: 'home',
  
  // قاموس الترجمات متعدد اللغات (عربية، إنجليزية، فرنسية)
  translations: {
    ar: {
      siteTitle: 'نُور القرآن',
      tagline: 'رفيقك اليومي في طريقك إلى الله',
      heroSubtitle: 'منصة إسلامية تجمع القرآن الكريم والأذكار ومواقيت الصلاة والقبلة والسبحة وكل ما تحتاجه في عبادتك اليومية.',
      startNow: 'ابدأ الآن',
      browseQuran: 'تصفح القرآن',
      allYouNeed: 'كل ما تحتاجه في مكان واحد',
      navHome: 'الرئيسية',
      navQuran: 'القرآن الكريم',
      navTasbeeh: 'السبحة الإلكترونية',
      navAdhkar: 'الأذكار',
      navPrayer: 'مواقيت الصلاة',
      navQibla: 'القبلة',
      navSettings: 'الإعدادات',
      lastReadResume: 'استئناف القراءة',
      quranSearchPlaceholder: 'ابحث عن آية أو سورة أو كلمة...',
      nextPrayerTitle: 'الصلاة القادمة',
      remainingTime: 'متبقي',
      gpsDetect: 'تحديد موقعي تلقائياً',
      manualCity: 'اختيار الموقع يدوياً',
      calcMethod: 'طريقة الحساب',
      morningAdhkar: 'أذكار الصباح',
      eveningAdhkar: 'أذكار المساء',
      dailyAdhkar: 'أذكار اليوم المختارة (3 أذكار)',
      allAdhkar: 'الورد الكامل',
      tasbeehTitle: 'السبحة الإلكترونية',
      tasbeehReset: 'إعادة ضبط',
      qiblaTitle: 'بوصلة القبلة المشرفة',
      settingsTitle: 'إعدادات المنصة',
      appearanceTheme: 'المظهر',
      themeDark: 'الوضع الداكن',
      themeLight: 'الوضع الفاتح',
      themeAuto: 'تلقائي (حسب النظام)',
      fontFamilyLabel: 'نوع الخط العربي',
      fontSizeLabel: 'حجم الخط الأساسي',
      quranFontSizeLabel: 'حجم خط المصحف الشريف',
      primaryColorLabel: 'اللون الرئيسي للمنصة',
      recitationSpeedLabel: 'سرعة التلاوة الصوتية',
      soundSettings: 'إعدادات الصوت والتنبيهات',
      adhanSoundLabel: 'صوت الأذان عند دخول الوقت',
      tasbeehSoundLabel: 'صوت نقرة السبحة',
      tasbeehVibrateLabel: 'الاهتزاز عند التسبيح',
      prayerNotifLabel: 'إشعارات مواقيت الصلاة',
      languageLabel: 'لغة الواجهة',
      footerDisclaimer: 'نور القرآن أداة مساعدة ولا يغني عن سؤال أهل العلم الموثوقين في المسائل الشرعية.',
      copyright: '© 2026 نُور القرآن — جميع الحقوق محفوظة.'
    }
  },

  async init() {
    Settings.init();
    if (window.Sound) Sound.init();
    this.registerServiceWorker();
    this.bindNavigation();
    this.bindSettingsForm();
    this.updateTranslations(Settings.get('language') || 'ar');

    // تهيئة جميع الوحدات المستقلة
    await Quran.init();
    await Prayer.init();
    await Adhkar.init();
    Tasbeeh.init();
    Qibla.init();
    Atmosphere.init();

    // تهيئة نظام تسجيل الدخول والمصادقة والمزامنة السحابية
    if (window.Auth) {
      await Auth.init();
      Auth.onStateChange((event, user) => {
        if (event === 'login') {
          if (this.currentSection === 'login') {
            this.navigateTo('profile');
          }
        } else if (event === 'logout') {
          if (this.currentSection === 'profile') {
            this.navigateTo('home');
          }
        }
      });
    }
    if (window.Sync) {
      Sync.init();
    }

    this.setupScrollReveal();
    this.setupButtonRipples();
    this.setupCardMouseGlow();
    this.bindFooterHelpModals();

    // فحص عنوان الرابط إذا كان يحتوي على قسم محدد (Hash)
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && document.getElementById(`section-${initialHash}`)) {
      this.navigateTo(initialHash);
    } else {
      this.navigateTo('home');
    }
  },

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').then((reg) => {
        window.swRegistration = reg;
      }).catch((err) => {
        console.warn('ServiceWorker registration error:', err);
      });

      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'PLAY_ADHAN_FROM_NOTIFICATION') {
          if (window.Prayer && typeof window.Prayer.playAdhan === 'function') {
            window.Prayer.playAdhan();
          }
        }
      });
    }

    // إذا كانت صلاحية الإشعارات ممنوحة مسبقاً، تفعيل الإعداد تلقائياً
    if ('Notification' in window && Notification.permission === 'granted') {
      Settings.set('prayerNotifications', true);
    }
  },

  bindNavigation() {
    // جميع أزرار وروابط التنقل التي تحمل data-target
    document.querySelectorAll('[data-target]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('data-target');
        this.navigateTo(target);
      });
    });

    // مراقبة التاريخ بالمتصفح (Back / Forward)
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.section) {
        this.navigateTo(e.state.section, false);
      }
    });
  },

  navigateTo(sectionId, pushHistory = true) {
    // حماية صفحة الملف الشخصي: تتطلب تسجيل الدخول
    if (sectionId === 'profile' && (!window.Auth || !Auth.currentUser)) {
      if (this.showToast) {
        this.showToast('يرجى تسجيل الدخول للوصول إلى الملف الشخصي والمزامنة السحابية.');
      }
      return this.navigateTo('login', pushHistory);
    }

    // توجيه المستخدم المسجل بعيداً عن صفحة تسجيل الدخول إلى حسابه
    if (sectionId === 'login' && window.Auth && Auth.currentUser) {
      return this.navigateTo('profile', pushHistory);
    }

    const targetSection = document.getElementById(`section-${sectionId}`);
    if (!targetSection) return;

    this.currentSection = sectionId;

    // تحديث بيانات الملف الشخصي عند الدخول إليه
    if (sectionId === 'profile' && window.Auth && typeof Auth.renderProfileView === 'function') {
      Auth.renderProfileView();
    }

    // إخفاء جميع الأقسام وإظهار القسم المطلوب مع Fade In
    document.querySelectorAll('.app-section').forEach(sec => {
      sec.classList.remove('active');
    });
    targetSection.classList.add('active');

    // تحديث حالة أزرار التنقل (Desktop & Mobile)
    document.querySelectorAll('[data-target]').forEach(link => {
      const isMatch = link.getAttribute('data-target') === sectionId;
      link.classList.toggle('active', isMatch);
      link.setAttribute('aria-current', isMatch ? 'page' : 'false');
    });

    // التمرير السلس إلى الأعلى
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (pushHistory) {
      window.history.pushState({ section: sectionId }, '', `#${sectionId}`);
    }

    // تنشيط عناصر القسم عند الانتقال
    setTimeout(() => this.triggerSectionReveal(targetSection), 50);
  },

  setupScrollReveal() {
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.service-card, .prayer-card, .adhkar-card, .mushaf-sheet-wrapper, .settings-card').forEach(el => {
      el.classList.add('reveal-on-scroll');
      observer.observe(el);
    });
  },

  triggerSectionReveal(sectionEl) {
    if (!sectionEl) return;
    sectionEl.querySelectorAll('.reveal-on-scroll').forEach(el => {
      el.classList.add('revealed');
    });
  },

  setupButtonRipples() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn, .btn-player-main, .service-card, .btn-adhkar-count');
      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      const circle = document.createElement('span');
      const diameter = Math.max(rect.width, rect.height);
      const radius = diameter / 2;

      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${e.clientX - rect.left - radius}px`;
      circle.style.top = `${e.clientY - rect.top - radius}px`;
      circle.classList.add('ripple-wave');

      const existing = btn.querySelector('.ripple-wave');
      if (existing) existing.remove();

      btn.appendChild(circle);
      setTimeout(() => circle.remove(), 600);
    });
  },

  setupCardMouseGlow() {
    if (window.innerWidth < 1024) return;
    document.querySelectorAll('.service-card, .prayer-card, .adhkar-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  },

  updateTranslations(lang = 'ar') {
    const dict = this.translations['ar'] || {};

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (dict[key]) {
        el.setAttribute('placeholder', dict[key]);
      }
    });
  },

  showToast(message, duration = 3200) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerHTML = `
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    // ظهور سلس
    requestAnimationFrame(() => {
      toast.classList.add('visible');
    });

    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  bindSettingsForm() {
    // الثيم
    document.querySelectorAll('input[name="setting-theme"]').forEach(radio => {
      if (radio.value === Settings.get('theme')) radio.checked = true;
      radio.addEventListener('change', (e) => {
        Settings.set('theme', e.target.value);
        this.showToast('تم تغيير مظهر المنصة');
      });
    });

    // نوع الخط
    const fontSelect = document.getElementById('setting-font-family');
    if (fontSelect) {
      fontSelect.value = Settings.get('fontFamily');
      fontSelect.addEventListener('change', (e) => {
        Settings.set('fontFamily', e.target.value);
        this.showToast('تم تحديث نوع الخط');
      });
    }

    // حجم الخط الأساسي
    const fontSizeSelect = document.getElementById('setting-font-size');
    if (fontSizeSelect) {
      fontSizeSelect.value = Settings.get('fontSize');
      fontSizeSelect.addEventListener('change', (e) => {
        Settings.set('fontSize', e.target.value);
      });
    }

    // حجم خط القرآن (Slider)
    const quranFontSlider = document.getElementById('setting-quran-font-size');
    const quranFontVal = document.getElementById('quran-font-size-val');
    if (quranFontSlider) {
      quranFontSlider.value = Settings.get('quranFontSize');
      if (quranFontVal) quranFontVal.textContent = `${quranFontSlider.value}px`;
      quranFontSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        if (quranFontVal) quranFontVal.textContent = `${val}px`;
        Settings.set('quranFontSize', parseInt(val, 10));
      });
    }

    // اللون الرئيسي (Color Picker + presets)
    const colorPicker = document.getElementById('setting-primary-color');
    if (colorPicker) {
      colorPicker.value = Settings.get('primaryColor');
      colorPicker.addEventListener('input', (e) => {
        Settings.set('primaryColor', e.target.value);
      });
    }

    document.querySelectorAll('.btn-color-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const color = btn.getAttribute('data-color');
        if (colorPicker) colorPicker.value = color;
        Settings.set('primaryColor', color);
        this.showToast('تم تطبيق اللون المختار');
      });
    });

    // مؤشر الفأرة الروحاني السلس
    const customCursorToggle = document.getElementById('setting-custom-cursor');
    if (customCursorToggle) {
      customCursorToggle.checked = Settings.get('customCursor') !== false;
      customCursorToggle.addEventListener('change', (e) => {
        Settings.set('customCursor', e.target.checked);
        this.showToast(e.target.checked ? 'تم تفعيل مؤشر النور الروحاني' : 'تم العودة للمؤشر الافتراضي');
      });
    }

    // سرعة التلاوة
    const speedSelect = document.getElementById('setting-playback-speed');
    if (speedSelect) {
      speedSelect.value = Settings.get('playbackSpeed');
      speedSelect.addEventListener('change', (e) => {
        Settings.set('playbackSpeed', parseFloat(e.target.value));
        if (window.Quran) Quran.setSpeed(e.target.value);
      });
    }

    // عناصر التحكم بالصوت العام والمطر
    document.querySelectorAll('.btn-master-mute-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.Sound) Sound.toggleMasterMute();
      });
    });

    const rainPill = document.getElementById('btn-toggle-rain-sound');
    if (rainPill) {
      rainPill.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.Sound) Sound.toggleRainSound();
      });
    }

    const masterVolSlider = document.getElementById('setting-master-volume');
    if (masterVolSlider) {
      masterVolSlider.value = window.Sound ? Sound.masterVolume : 0.85;
      masterVolSlider.addEventListener('input', (e) => {
        if (window.Sound) Sound.setMasterVolume(e.target.value);
      });
    }

    const rainSoundCheck = document.getElementById('setting-rain-sound');
    if (rainSoundCheck) {
      rainSoundCheck.checked = window.Sound ? Sound.isRainPlaying : false;
      rainSoundCheck.addEventListener('change', () => {
        if (window.Sound) Sound.toggleRainSound();
      });
    }

    const rainVolSlider = document.getElementById('setting-rain-volume');
    if (rainVolSlider) {
      rainVolSlider.value = window.Sound ? Sound.rainVolume : 0.45;
      rainVolSlider.addEventListener('input', (e) => {
        if (window.Sound) Sound.setRainVolume(e.target.value);
      });
    }

    const uiSoundCheck = document.getElementById('setting-ui-sound');
    if (uiSoundCheck) {
      uiSoundCheck.checked = window.Sound ? Sound.uiVolume > 0 : true;
      uiSoundCheck.addEventListener('change', (e) => {
        if (window.Sound) Sound.uiVolume = e.target.checked ? 0.5 : 0;
      });
    }

    const pageTurnCheck = document.getElementById('setting-page-turn-sound');
    if (pageTurnCheck) {
      pageTurnCheck.checked = window.Sound ? Sound.pageTurnVolume > 0 : true;
      pageTurnCheck.addEventListener('change', (e) => {
        if (window.Sound) Sound.pageTurnVolume = e.target.checked ? 0.4 : 0;
      });
    }

    // صوت الأذان
    const adhanCheck = document.getElementById('setting-adhan-sound');
    if (adhanCheck) {
      adhanCheck.checked = Settings.get('adhanSound');
      adhanCheck.addEventListener('change', (e) => {
        Settings.set('adhanSound', e.target.checked);
        this.showToast(e.target.checked ? 'تم تفعيل صوت الأذان' : 'تم كتم صوت الأذان');
      });
    }

    // مستوى صوت الأذان في الإعدادات
    const adhanVolSlider = document.getElementById('setting-adhan-volume');
    if (adhanVolSlider) {
      adhanVolSlider.value = Settings.get('adhanVolume') !== undefined ? Settings.get('adhanVolume') : 1;
      adhanVolSlider.addEventListener('input', (e) => {
        Settings.set('adhanVolume', parseFloat(e.target.value));
        if (window.Prayer) Prayer.setAdhanVolume(e.target.value);
      });
    }

    // اختيار المؤذن
    const muezzinSelect = document.getElementById('setting-muezzin-select');
    if (muezzinSelect) {
      muezzinSelect.value = Settings.get('muezzin') || 'muezzin1';
      muezzinSelect.addEventListener('change', (e) => {
        Settings.set('muezzin', e.target.value);
        this.showToast('تم تغيير المؤذن');
      });
    }

    // صوت نقرة السبحة
    const tasbeehSoundCheck = document.getElementById('setting-tasbeeh-sound');
    if (tasbeehSoundCheck) {
      tasbeehSoundCheck.checked = Settings.get('tasbeehSound');
      tasbeehSoundCheck.addEventListener('change', (e) => {
        Settings.set('tasbeehSound', e.target.checked);
      });
    }

    // اهتزاز السبحة
    const tasbeehVibrateCheck = document.getElementById('setting-tasbeeh-vibrate');
    if (tasbeehVibrateCheck) {
      tasbeehVibrateCheck.checked = Settings.get('tasbeehVibrate');
      tasbeehVibrateCheck.addEventListener('change', (e) => {
        Settings.set('tasbeehVibrate', e.target.checked);
      });
    }

    // إشعارات الصلاة
    const prayerNotifCheck = document.getElementById('setting-prayer-notif');
    if (prayerNotifCheck) {
      prayerNotifCheck.checked = Settings.get('prayerNotifications');
      prayerNotifCheck.addEventListener('change', (e) => {
        if (e.target.checked) {
          Prayer.requestNotificationPermission();
        } else {
          Settings.set('prayerNotifications', false);
          this.showToast('تم تعطيل إشعارات الصلاة');
        }
      });
    }

    // تبديل اللغة (في الإعدادات وفي الهيدر)
    const handleLangChange = (newLang) => {
      Settings.set('language', newLang);
      this.updateTranslations(newLang);
      if (window.Quran && typeof window.Quran.populateSurahSelectors === 'function') {
        window.Quran.populateSurahSelectors();
      }
      this.showToast(newLang === 'ar' ? 'تم ضبط اللغة: العربية' : (newLang === 'en' ? 'Language set to: English' : 'Langue définie sur: Français'));
    };

    const settingLangSelect = document.getElementById('setting-lang-select');
    if (settingLangSelect) {
      settingLangSelect.addEventListener('change', (e) => handleLangChange(e.target.value));
    }

    const headerLangSelect = document.getElementById('header-lang-select');
    if (headerLangSelect) {
      headerLangSelect.addEventListener('change', (e) => handleLangChange(e.target.value));
    }
  },

  bindFooterHelpModals() {
    const modal = document.getElementById('footer-help-modal');
    const modalTitle = document.getElementById('footer-help-modal-title');
    const modalBody = document.getElementById('footer-help-modal-body');
    const btnClose = document.getElementById('btn-close-help-modal');
    const btnConfirm = document.getElementById('btn-confirm-help-modal');

    const contentMap = {
      faq: {
        title: 'الأسئلة الشائعة حول المنصة',
        html: `
          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div>
              <strong style="color: var(--accent-gold);">• هل منصة نُور مجانية وبدون إعلانات؟</strong>
              <p style="margin-top: 4px; font-size: 0.9rem;">نعم، المنصة صُممت ابتغاء وجه الله تعالى، وهي مجانية بالكامل ومفتوحة بلا أي إعلانات أو نوافذ ترويجية.</p>
            </div>
            <div>
              <strong style="color: var(--accent-gold);">• كيف يتم حساب مواقيت الصلاة؟</strong>
              <p style="margin-top: 4px; font-size: 0.9rem;">تُحسب المواقيت آلياً بدقة فلكية حسب إحداثيات موقعك الجغرافي بالاعتماد على طريقة الحساب المعتمدة في منطقتك (مثل أم القرى أو رابطة العالم الإسلامي).</p>
            </div>
            <div>
              <strong style="color: var(--accent-gold);">• هل يمكن تصفح المصحف والأذكار بدون إنترنت؟</strong>
              <p style="margin-top: 4px; font-size: 0.9rem;">نعم، النصوص القرآنية الكريمة والأذكار والسبحة مخزنة محلياً لتعمل معك بسلاسة دائماً.</p>
            </div>
          </div>
        `
      },
      contact: {
        title: 'تواصل معنا',
        html: `
          <div style="text-align: center; padding: 10px 0;">
            <div style="font-size: 2.2rem; margin-bottom: 8px;">✉️</div>
            <p style="font-size: 0.95rem; margin-bottom: 14px;">نسعد دائماً بتواصلكم وملاحظاتكم الطيبة لخدمة كتاب الله عز وجل:</p>
            <div style="padding: 12px; background: rgba(212, 175, 55, 0.1); border: 1px solid rgba(212, 175, 55, 0.25); border-radius: 12px; display: inline-block;">
              <code style="font-size: 1rem; color: var(--accent-gold);">contact@noor-quran.app</code>
            </div>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 14px;">فريق الإشراف والتصميم بقيادة: <strong>Tamim</strong></p>
          </div>
        `
      },
      report: {
        title: 'الإبلاغ عن ملاحظة أو مشكلة',
        html: `
          <div style="text-align: center; padding: 10px 0;">
            <div style="font-size: 2.2rem; margin-bottom: 8px;">🛠️</div>
            <p style="font-size: 0.95rem; margin-bottom: 12px;">نحرص أشد الحرص على دقة كل حرف وآية وخدمة في المنصة.</p>
            <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 16px;">إذا واجهت أي عطل أو لاحظت أي خطأ تقني، يرجى مراسلتنا فوراً ليتم تدقيقه ومعالجته:</p>
            <div style="padding: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 12px; display: inline-block;">
              <code style="font-size: 1rem; color: #ef4444;">support@noor-quran.app</code>
            </div>
          </div>
        `
      },
      suggest: {
        title: 'اقتراح تحسين وميزة جديدة',
        html: `
          <div style="text-align: center; padding: 10px 0;">
            <div style="font-size: 2.2rem; margin-bottom: 8px;">💡</div>
            <p style="font-size: 0.95rem; margin-bottom: 12px;">أفكاركم واقتراحاتكم هي الوقود المستمر لتطوير نُور لتكون خير رفيق لكل مسلم.</p>
            <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 16px;">شاركنا أي فكرة أو خاصية ترغب برؤيتها في التحديثات القادمة:</p>
            <div style="padding: 12px; background: rgba(5, 150, 105, 0.1); border: 1px solid rgba(5, 150, 105, 0.25); border-radius: 12px; display: inline-block;">
              <code style="font-size: 1rem; color: var(--primary-color);">ideas@noor-quran.app</code>
            </div>
          </div>
        `
      }
    };

    document.querySelectorAll('.footer-modal-trigger').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const action = trigger.getAttribute('data-action');
        const item = contentMap[action];
        if (item && modal && modalTitle && modalBody) {
          modalTitle.textContent = item.title;
          modalBody.innerHTML = item.html;
          modal.style.display = 'flex';
          requestAnimationFrame(() => modal.classList.add('visible'));
        }
      });
    });

    const closeModal = () => {
      if (modal) {
        modal.classList.remove('visible');
        setTimeout(() => { modal.style.display = 'none'; }, 250);
      }
    };

    if (btnClose) btnClose.addEventListener('click', closeModal);
    if (btnConfirm) btnConfirm.addEventListener('click', closeModal);
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
      });
    }
  }
};

window.App = App;

// تشغيل التطبيق بمجرد اكتمال تجهيز الـ DOM
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
