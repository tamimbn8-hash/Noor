/**
 * نُور القرآن | NOOR AL-QURAN
 * quran.js - محرك المصحف الشريف الرقمي الاحترافي المتكامل
 * يدعم: فهرس السور الـ 114، الأجزاء الـ 30، الأحزاب الـ 60، صفحات المصحف الـ 604، المفضلة،
 * قارئ المصحف الحقيقي (عرض الصفحة الملكية + عرض الآيات)، مشغل التلاوة الصوتي بـ 8 قراء، والتفسير والترجمة والبحث
 */

const Quran = {
  surahs: [],
  juzs: [],
  hizbs: [],
  currentView: 'hub', // 'hub' | 'reader'
  readingMode: 'mushaf', // 'mushaf' | 'verses'
  currentPage: 1,
  currentSurah: 1,
  currentAyah: 1,
  activeTab: 'surahs',
  selectedReciter: 'afs',
  isPlaying: false,
  isRepeat: false,
  activePlayingAyah: null, // { surah: 1, ayah: 1 }
  audio: new Audio(),
  bookmarks: [],
  lastPosition: null,
  searchDebounceTimer: null,
  readerSettings: {
    fontSize: 26,
    theme: 'ivory',
    lineHeight: 2.3
  },

  /**
   * تهيئة قسم القرآن الكريم بالكامل
   */
  async init() {
    this.loadBookmarks();
    this.loadLastPosition();
    this.loadReaderSettings();
    this.setupAudioDeckEvents();
    this.bindDOMEvents();

    // تحميل بيانات السور والأجزاء والأحزاب
    await this.loadQuranData();

    // ريندر المكونات الأساسية في الفهرس
    this.renderContinueReadingCard();
    this.renderSurahsGrid();
    this.renderJuzsGrid();
    this.renderHizbsGrid();
    this.renderPagesGrid();
    this.renderBookmarks();
    this.populateReciterSelectors();
    this.updateHomeLastReadBanner();
  },

  /**
   * تحميل بيانات السور والميتا الموثقة
   */
  async loadQuranData() {
    if (typeof QuranMeta !== 'undefined') {
      this.surahs = QuranMeta.surahs || [];
      this.juzs = QuranMeta.juzs || [];
      this.hizbs = QuranMeta.hizbs || [];
    } else {
      this.surahs = await API.getSurahs();
    }
  },

  /**
   * ربط أحداث واجهة المستخدم
   */
  bindDOMEvents() {
    // تبويبات الفهرس الـ 5
    const tabBtns = document.querySelectorAll('#quran-tabs-nav .quran-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });

    // شريط البحث الذكي
    const searchInput = document.getElementById('quran-main-search-input');
    const clearBtn = document.getElementById('btn-clear-quran-search');
    const dropdown = document.getElementById('quran-main-search-dropdown');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (clearBtn) clearBtn.style.display = query ? 'block' : 'none';
        clearTimeout(this.searchDebounceTimer);
        this.searchDebounceTimer = setTimeout(() => {
          this.handleSearch(query);
        }, 280);
      });

      searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim().length >= 2) {
          dropdown.classList.add('active');
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
        clearBtn.style.display = 'none';
        if (dropdown) dropdown.classList.remove('active');
      });
    }

    // إغلاق الدروبداون عند النقر في الخارج
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.quran-search-container')) {
        if (dropdown) dropdown.classList.remove('active');
      }
    });

    // الانتقال السريع للصفحات في تبويب الصفحات
    const jumpInput = document.getElementById('quran-page-quick-jump');
    const jumpBtn = document.getElementById('btn-submit-page-jump');
    if (jumpBtn && jumpInput) {
      const doJump = () => {
        const p = parseInt(jumpInput.value);
        if (p >= 1 && p <= 604) {
          this.openReader({ pageNumber: p });
        }
      };
      jumpBtn.addEventListener('click', doJump);
      jumpInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') doJump();
      });
    }

    // أزرار قارئ المصحف الحقيقي
    const backBtn = document.getElementById('btn-reader-back-to-hub');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.backToHub());
    }

    const toggleModeBtn = document.getElementById('btn-toggle-reading-mode');
    if (toggleModeBtn) {
      toggleModeBtn.addEventListener('click', () => this.toggleReadingMode());
    }

    const prevPageBtn = document.getElementById('btn-reader-prev-page');
    if (prevPageBtn) {
      prevPageBtn.addEventListener('click', () => this.prevPage());
    }

    const nextPageBtn = document.getElementById('btn-reader-next-page');
    if (nextPageBtn) {
      nextPageBtn.addEventListener('click', () => this.nextPage());
    }

    // مودال التفسير
    const closeTafsirBtn = document.getElementById('btn-close-tafsir-modal');
    if (closeTafsirBtn) {
      closeTafsirBtn.addEventListener('click', () => {
        document.getElementById('quran-tafsir-modal').classList.remove('active');
      });
    }

    // مودال إعدادات القارئ
    const openSettingsBtn = document.getElementById('btn-open-reader-settings');
    const closeSettingsBtn = document.getElementById('btn-close-reader-settings');
    const settingsModal = document.getElementById('quran-settings-modal');

    if (openSettingsBtn && settingsModal) {
      openSettingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('active');
      });
    }
    if (closeSettingsBtn && settingsModal) {
      closeSettingsBtn.addEventListener('click', () => {
        settingsModal.classList.remove('active');
      });
    }

    // مستمعات عناصر إعدادات القارئ
    const fontSizeSlider = document.getElementById('reader-setting-font-size');
    if (fontSizeSlider) {
      fontSizeSlider.value = this.readerSettings.fontSize;
      fontSizeSlider.addEventListener('input', (e) => {
        this.updateReaderFontSize(e.target.value);
      });
    }

    const lineHeightSlider = document.getElementById('reader-setting-line-height');
    if (lineHeightSlider) {
      lineHeightSlider.value = this.readerSettings.lineHeight;
      lineHeightSlider.addEventListener('input', (e) => {
        this.updateReaderLineHeight(e.target.value);
      });
    }

    const themeButtons = document.querySelectorAll('.theme-option-btn');
    themeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        themeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const theme = btn.getAttribute('data-mushaf-theme');
        this.updateReaderTheme(theme);
      });
    });

    // التنقل بأسهم لوحة المفاتيح في وضع القارئ
    document.addEventListener('keydown', (e) => {
      if (this.currentView !== 'reader') return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowLeft') {
        // باللغة العربية: السهم الأيسر ينقل للصفحة التالية
        this.nextPage();
      } else if (e.key === 'ArrowRight') {
        // السهم الأيمن ينقل للصفحة السابقة
        this.prevPage();
      }
    });
  },

  /**
   * تبديل التبويبات الـ 5 في الفهرس
   */
  switchTab(tabName) {
    this.activeTab = tabName;

    // تحديث أزرار التبويب
    const tabBtns = document.querySelectorAll('#quran-tabs-nav .quran-tab-btn');
    tabBtns.forEach(btn => {
      if (btn.getAttribute('data-tab') === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // تحديث محتوى التبويبات
    const panes = {
      surahs: 'pane-quran-surahs',
      juzs: 'pane-quran-juzs',
      hizbs: 'pane-quran-hizbs',
      pages: 'pane-quran-pages',
      bookmarks: 'pane-quran-bookmarks'
    };

    Object.keys(panes).forEach(key => {
      const el = document.getElementById(panes[key]);
      if (el) {
        if (key === tabName) {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      }
    });

    if (tabName === 'bookmarks') {
      this.renderBookmarks();
    }
  },

  /**
   * أرقام الأجزاء والأحزاب المقترنة بالصفحة بأمان تام
   */
  getJuzNumber(page) {
    if (typeof QuranMeta === 'undefined' || !QuranMeta.getJuzForPage) return 1;
    const res = QuranMeta.getJuzForPage(page);
    return (res && typeof res === 'object') ? (res.number || 1) : (res || 1);
  },

  getHizbNumber(page) {
    if (typeof QuranMeta === 'undefined' || !QuranMeta.getHizbForPage) return 1;
    const res = QuranMeta.getHizbForPage(page);
    return (res && typeof res === 'object') ? (res.number || 1) : (res || 1);
  },

  /**
   * 1. ريندر بطاقة تابع القراءة
   */
  renderContinueReadingCard() {
    const container = document.getElementById('quran-continue-card');
    if (!container) return;

    if (this.lastPosition && this.lastPosition.surahNumber) {
      const sNum = this.lastPosition.surahNumber;
      const s = this.surahs.find(item => item.number === sNum) || { name: `سورة ${sNum}` };
      const aNum = this.lastPosition.ayahNumber || 1;
      const pNum = this.lastPosition.pageNumber || 1;
      const pct = Math.min(100, Math.round((pNum / 604) * 100));

      container.innerHTML = `
        <div class="quran-continue-info">
          <div class="quran-continue-label">
            <span>🔖</span>
            <span>تابع القراءة</span>
          </div>
          <div class="quran-continue-title">آخر قراءة: ${s.name} — الآية ${aNum}</div>
          <div class="quran-continue-subtitle">الصفحة ${pNum} من 604 • الجزء ${this.getJuzNumber(pNum)}</div>
          <div class="quran-continue-progress-wrapper">
            <div class="quran-continue-progress-bar">
              <div class="quran-continue-progress-fill" style="width: ${pct}%;"></div>
            </div>
            <span class="quran-continue-progress-pct">${pct}%</span>
          </div>
        </div>
        <button class="quran-continue-btn" onclick="Quran.openReader({ pageNumber: ${pNum}, surahNumber: ${sNum}, ayahNumber: ${aNum} })">
          <span>متابعة القراءة</span>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      `;
    } else {
      container.innerHTML = `
        <div class="quran-continue-info">
          <div class="quran-continue-label">
            <span>✨</span>
            <span>ابدأ رحلتك المباركة</span>
          </div>
          <div class="quran-continue-title">ابدأ رحلتك مع القرآن الكريم</div>
          <div class="quran-continue-subtitle">اقرأ كتاب الله العظيم بتدبر وسكينة؛ اختر سورة أو ابدأ من الفاتحة</div>
        </div>
        <button class="quran-continue-btn" onclick="Quran.openReader({ pageNumber: 1, surahNumber: 1, ayahNumber: 1 })">
          <span>ابدأ القراءة</span>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      `;
    }
  },

  /**
   * 2. ريندر قائمة السور الـ 114 بالترتيب القرآني الصحيح
   */
  renderSurahsGrid() {
    const grid = document.getElementById('quran-surahs-grid');
    if (!grid || !this.surahs || this.surahs.length === 0) return;

    // فرز وتأكيد الترتيب القرآني 1 إلى 114
    const sorted = [...this.surahs].sort((a, b) => a.number - b.number);

    grid.innerHTML = sorted.map(s => {
      const isMakki = s.revelationType === 'Meccan' || s.revelationType === 'makkiyah' || s.revelationType === 1 || (typeof QuranMeta !== 'undefined' && QuranMeta.surahTypesAr && QuranMeta.surahTypesAr[s.number] === 'مكية');
      const typeLabel = isMakki ? 'مكية' : 'مدنية';
      const typeClass = isMakki ? 'makkiyah' : 'madaniyah';
      const numPadded = String(s.number).padStart(2, '0');
      const ayahCount = s.numberOfAyahs || (typeof QuranMeta !== 'undefined' && QuranMeta.surahAyahCounts ? QuranMeta.surahAyahCounts[s.number] : 7);
      const isBookmarked = this.isSurahBookmarked(s.number);

      return `
        <div class="surah-card-pro" data-surah="${s.number}">
          <div class="surah-card-top">
            <div class="surah-number-badge">${numPadded}</div>
            <div class="surah-card-names">
              <div class="surah-arabic-name">${s.name}</div>
            </div>
            <button class="surah-favorite-btn ${isBookmarked ? 'active' : ''}" 
                    title="${isBookmarked ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}"
                    onclick="Quran.toggleSurahBookmark(${s.number}, event)">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            </button>
          </div>

          <div class="surah-card-meta">
            <span class="surah-type-badge ${typeClass}">
              <span>${isMakki ? '🕋' : '🕌'}</span>
              <span>${typeLabel}</span>
            </span>
            <span>${ayahCount} آية</span>
            <span>صفحة ${s.startingPage || 1}</span>
          </div>

          <div class="surah-card-actions">
            <button class="btn-surah-read" onclick="Quran.openReader({ surahNumber: ${s.number}, pageNumber: ${s.startingPage || 1} })">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              <span>قراءة</span>
            </button>
            <button class="btn-surah-listen" onclick="Quran.playFullSurah(${s.number})">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              <span>استماع</span>
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * 3. ريندر قائمة الأجزاء الـ 30
   */
  renderJuzsGrid() {
    const grid = document.getElementById('quran-juz-grid');
    if (!grid || !this.juzs || this.juzs.length === 0) return;

    grid.innerHTML = this.juzs.map(j => {
      const s = this.surahs.find(item => item.number === j.startSurah) || { name: `سورة ${j.startSurah}` };
      return `
        <div class="juz-card">
          <div class="juz-card-header">
            <span class="juz-title">الجزء ${j.number}</span>
            <span class="surah-type-badge makkiyah">صفحة ${j.page}</span>
          </div>
          <div class="juz-preview-text">
            ${j.startText || `يبدأ من ${s.name} الآية ${j.startAyah}`}
          </div>
          <div style="font-size: 0.85rem; color: var(--text-muted);">
            يبدأ من ${s.name} (الآية ${j.startAyah})
          </div>
          <button class="btn-surah-read" style="margin-top: 4px;" onclick="Quran.openReader({ pageNumber: ${j.page}, surahNumber: ${j.startSurah}, ayahNumber: ${j.startAyah} })">
            <span>قراءة الجزء ${j.number}</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      `;
    }).join('');
  },

  /**
   * 4. ريندر قائمة الأحزاب الـ 60
   */
  renderHizbsGrid() {
    const grid = document.getElementById('quran-hizb-grid');
    if (!grid || !this.hizbs || this.hizbs.length === 0) return;

    grid.innerHTML = this.hizbs.map(h => {
      const s = this.surahs.find(item => item.number === h.startSurah) || { name: `سورة ${h.startSurah}` };
      return `
        <div class="hizb-card">
          <div class="juz-card-header">
            <span class="juz-title">الحزب ${h.number}</span>
            <span class="surah-type-badge madaniyah">صفحة ${h.page}</span>
          </div>
          <div style="font-size: 0.95rem; color: var(--text-normal);">
            يبدأ من <strong>${s.name}</strong> — الآية ${h.startAyah}
          </div>
          <button class="btn-surah-read" onclick="Quran.openReader({ pageNumber: ${h.page}, surahNumber: ${h.startSurah}, ayahNumber: ${h.startAyah} })">
            <span>قراءة الحزب</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      `;
    }).join('');
  },

  /**
   * 5. ريندر قائمة الـ 604 صفحة
   */
  renderPagesGrid() {
    const grid = document.getElementById('quran-pages-grid');
    if (!grid) return;

    let html = '';
    for (let p = 1; p <= 604; p++) {
      const isCurrent = this.currentPage === p;
      html += `
        <button class="page-chip-btn ${isCurrent ? 'current' : ''}" onclick="Quran.openReader({ pageNumber: ${p} })" title="الانتقال إلى صفحة ${p}">
          <span style="font-size: 0.72rem; opacity: 0.7;">صفحة</span>
          <span>${p}</span>
        </button>
      `;
    }
    grid.innerHTML = html;
  },

  /**
   * 6. ريندر قائمة المفضلة
   */
  renderBookmarks() {
    const container = document.getElementById('quran-bookmarks-container');
    const badge = document.getElementById('quran-tab-bookmarks-count');
    if (badge) badge.textContent = this.bookmarks.length;

    if (!container) return;

    if (this.bookmarks.length === 0) {
      container.innerHTML = `
        <div class="bookmarks-empty-state">
          <div class="bookmarks-empty-icon">🔖</div>
          <h3 style="font-size: 1.3rem; color: var(--text-normal); margin-bottom: 8px;">لا توجد آيات محفوظة بعد</h3>
          <p style="max-width: 420px; margin: 0 auto; line-height: 1.6;">
            يمكنك حفظ أي آية كريمة بالضغط على زر الحفظ 🔖 أثناء قراءة المصحف أو تصفح الآيات لتظهر هنا وتعود إليها في أي وقت.
          </p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.bookmarks.map((b, idx) => {
      const s = this.surahs.find(item => item.number === b.surahNumber) || { name: `سورة ${b.surahNumber}` };
      return `
        <div class="bookmark-item-card">
          <div class="bookmark-header">
            <span class="bookmark-surah-info">${s.name} — الآية ${b.ayahNumber} (صفحة ${b.pageNumber || 1})</span>
            <div class="bookmark-actions">
              <button class="verse-action-btn" onclick="Quran.openReader({ pageNumber: ${b.pageNumber || 1}, surahNumber: ${b.surahNumber}, ayahNumber: ${b.ayahNumber} })">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                <span>عرض بالمصحف</span>
              </button>
              <button class="verse-action-btn" onclick="Quran.playAyahAudio(${b.surahNumber}, ${b.ayahNumber})">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                <span>استماع</span>
              </button>
              <button class="verse-action-btn" style="color: #ef4444;" onclick="Quran.removeBookmark(${idx})">
                <span>حذف</span>
              </button>
            </div>
          </div>
          <div class="verse-arabic-text" style="font-size: 1.25rem;">
            ${b.text || ''}
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * فتح قارئ المصحف الحقيقي
   */
  async openReader({ surahNumber, ayahNumber, pageNumber }) {
    this.currentView = 'reader';

    // إخفاء الفهرس وإظهار القارئ
    const hub = document.getElementById('quran-hub-view');
    const reader = document.getElementById('quran-reader-container');
    if (hub) hub.style.display = 'none';
    if (reader) reader.classList.add('active');

    // تحديد الصفحة والسورة
    if (pageNumber) {
      this.currentPage = pageNumber;
      if (surahNumber) {
        this.currentSurah = surahNumber;
      } else if (typeof QuranMeta !== 'undefined') {
        const pSurah = QuranMeta.surahs.slice().reverse().find(s => s.startingPage <= pageNumber);
        if (pSurah) this.currentSurah = pSurah.number;
      }
    } else if (surahNumber) {
      this.currentSurah = surahNumber;
      const s = this.surahs.find(item => item.number === surahNumber);
      if (s && s.startingPage) {
        this.currentPage = s.startingPage;
      }
    }

    if (ayahNumber) {
      this.currentAyah = ayahNumber;
    }

    // حفظ الموضع الأخير
    this.savePosition(this.currentSurah, this.currentAyah, this.currentPage);

    // تحديث شريط القارئ العلوي
    this.updateReaderToolbar();

    // تحميل وعرض المحتوى حسب الوضع المختار
    if (this.readingMode === 'mushaf') {
      await this.loadMushafPage(this.currentPage);
    } else {
      await this.loadVersesList(this.currentSurah);
    }

    // التمرير السلس لرأس القارئ
    const section = document.getElementById('section-quran');
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  /**
   * العودة إلى فهرس القرآن
   */
  backToHub() {
    this.currentView = 'hub';
    const hub = document.getElementById('quran-hub-view');
    const reader = document.getElementById('quran-reader-container');
    if (reader) reader.classList.remove('active');
    if (hub) hub.style.display = 'block';

    this.renderContinueReadingCard();
  },

  /**
   * تبديل وضع القراءة بين صفحة المصحف وقائمة الآيات
   */
  toggleReadingMode() {
    this.readingMode = this.readingMode === 'mushaf' ? 'verses' : 'mushaf';
    const label = document.getElementById('reading-mode-label');
    const mushafLayout = document.getElementById('reader-mushaf-layout');
    const versesLayout = document.getElementById('reader-verses-layout');

    if (this.readingMode === 'mushaf') {
      if (label) label.textContent = 'عرض المصحف';
      if (mushafLayout) mushafLayout.style.display = 'block';
      if (versesLayout) versesLayout.style.display = 'none';
      this.loadMushafPage(this.currentPage);
    } else {
      if (label) label.textContent = 'عرض الآيات';
      if (mushafLayout) mushafLayout.style.display = 'none';
      if (versesLayout) versesLayout.style.display = 'block';
      this.loadVersesList(this.currentSurah);
    }
  },

  /**
   * تحديث شريط أدوات القارئ العلوي
   */
  updateReaderToolbar() {
    const titleEl = document.getElementById('reader-current-surah-title');
    const metaEl = document.getElementById('reader-current-meta-text');
    const pageIndicator = document.getElementById('reader-quick-page-indicator');

    const s = this.surahs.find(item => item.number === this.currentSurah) || { name: `سورة ${this.currentSurah}` };
    const juzNum = this.getJuzNumber(this.currentPage);
    const hizbNum = this.getHizbNumber(this.currentPage);

    if (titleEl) titleEl.textContent = s.name;
    if (metaEl) metaEl.textContent = `الجزء ${juzNum} • الحزب ${hizbNum} • صفحة ${this.currentPage}`;
    if (pageIndicator) pageIndicator.textContent = `صفحة ${this.currentPage} من 604`;
  },

  /**
   * تحميل وعرض صفحة المصحف الملكية (1 - 604)
   */
  async loadMushafPage(pageNumber) {
    const bodyEl = document.getElementById('mushaf-page-body');
    const headerSurah = document.getElementById('mushaf-header-surah');
    const headerJuz = document.getElementById('mushaf-header-juz');
    const footerPage = document.getElementById('mushaf-footer-page-num');

    if (!bodyEl) return;
    bodyEl.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-muted);">جاري إحضار الصفحة المباركة (${pageNumber})...</div>`;

    const juzNum = this.getJuzNumber(pageNumber);
    if (headerJuz) headerJuz.textContent = `الجزء ${juzNum}`;
    if (footerPage) footerPage.textContent = `صفحة ${pageNumber} من 604`;

    try {
      const pageData = await API.getPageDetail(pageNumber);

      if (!pageData || !pageData.ayahs || pageData.ayahs.length === 0) {
        bodyEl.innerHTML = `
          <div style="text-align:center;padding:30px;">
            <p>الصفحة ${pageNumber} غير متوفرة في وضع الأوفلاين الحالي.</p>
            <button class="btn btn-primary" onclick="Quran.loadMushafPage(${pageNumber})">إعادة المحاولة</button>
          </div>
        `;
        return;
      }

      // تحديد السور الموجودة في الصفحة
      let lastSurahNum = null;
      let html = '';

      if (headerSurah && pageData.ayahs[0] && pageData.ayahs[0].surah) {
        headerSurah.textContent = pageData.ayahs[0].surah.name;
        this.currentSurah = pageData.ayahs[0].surah.number;
      }

      pageData.ayahs.forEach(ayah => {
        const sNum = ayah.surah.number;
        const sName = ayah.surah.name;

        // إذا بدأت سورة جديدة في الصفحة
        if (sNum !== lastSurahNum) {
          lastSurahNum = sNum;
          if (ayah.numberInSurah === 1) {
            html += `
              <div class="mushaf-surah-title-banner">
                ${sName}
              </div>
            `;
            // إضافة البسملة لجميع السور عدا التوبة (رقم 9) والفاتحة (آيتها الأولى هي البسملة)
            if (sNum !== 9 && sNum !== 1) {
              html += `
                <div class="mushaf-bismillah-banner">
                  بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                </div>
              `;
            }
          }
        }

        let ayahText = ayah.text;
        // تنظيف البسملة المكررة من بداية نص الآية الأولى إن وجدت
        if (ayah.numberInSurah === 1 && sNum !== 1 && sNum !== 9 && ayahText.startsWith('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ')) {
          ayahText = ayahText.replace('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', '').trim();
        }

        const isPlaying = this.activePlayingAyah && this.activePlayingAyah.surah === sNum && this.activePlayingAyah.ayah === ayah.numberInSurah;

        html += `
          <span class="mushaf-ayah-span ${isPlaying ? 'active-playing' : ''}" 
                id="mushaf-ayah-${sNum}-${ayah.numberInSurah}"
                onclick="Quran.onMushafAyahClick(${sNum}, ${ayah.numberInSurah}, ${pageNumber})">
            ${ayahText}
            <span class="ayah-end-symbol">﴿${ayah.numberInSurah}﴾</span>
          </span>
        `;
      });

      bodyEl.innerHTML = html;
      this.updateReaderToolbar();

    } catch (err) {
      console.error('Failed to load mushaf page:', err);
      bodyEl.innerHTML = `<div style="text-align:center;padding:30px;color:#ef4444;">تعذر تحميل صفحة المصحف. يرجى التحقق من الاتصال بالإنترنت.</div>`;
    }
  },

  /**
   * تحميل وعرض قائمة الآيات (Verse by Verse)
   */
  async loadVersesList(surahNumber) {
    const container = document.getElementById('reader-verses-layout');
    if (!container) return;

    container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-muted);">جاري تحميل آيات السورة...</div>`;

    try {
      const surahData = await API.getSurahDetail(surahNumber);
      if (!surahData || !surahData.ayahs) {
        container.innerHTML = `<div style="text-align:center;padding:30px;">تعذر تحميل السورة.</div>`;
        return;
      }

      const sName = surahData.name;
      let html = '';

      // بانر عنوان السورة
      html += `
        <div style="text-align:center;margin-bottom:1.5rem;">
          <h2 style="font-family:var(--font-family-quran);font-size:2.2rem;color:var(--accent-gold);margin-bottom:6px;">${sName}</h2>
          <p style="color:var(--text-muted);font-size:0.95rem;">${surahData.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • ${surahData.numberOfAyahs} آية</p>
        </div>
      `;

      if (surahNumber !== 9 && surahNumber !== 1) {
        html += `
          <div class="mushaf-bismillah-banner" style="margin-bottom: 2rem;">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>
        `;
      }

      surahData.ayahs.forEach(ayah => {
        const aNum = ayah.numberInSurah;
        let aText = ayah.text;
        if (aNum === 1 && surahNumber !== 1 && surahNumber !== 9 && aText.startsWith('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ')) {
          aText = aText.replace('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', '').trim();
        }

        const isBookmarked = this.isAyahBookmarked(surahNumber, aNum);
        const isPlaying = this.activePlayingAyah && this.activePlayingAyah.surah === surahNumber && this.activePlayingAyah.ayah === aNum;

        html += `
          <div class="verse-item-card ${isPlaying ? 'active-playing' : ''}" id="verse-card-${surahNumber}-${aNum}">
            <div class="verse-item-header">
              <span class="verse-num-pill">الآية ${aNum}</span>
              <div class="verse-actions-toolbar">
                <button class="verse-action-btn" title="استماع" onclick="Quran.playAyahAudio(${surahNumber}, ${aNum})">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  <span>استماع</span>
                </button>
                <button class="verse-action-btn" title="تفسير" onclick="Quran.showTafsir(${surahNumber}, ${aNum})">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                  <span>تفسير</span>
                </button>
                <button class="verse-action-btn" title="ترجمة" onclick="Quran.toggleVerseTranslation(${surahNumber}, ${aNum})">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  <span>ترجمة</span>
                </button>
                <button class="verse-action-btn ${isBookmarked ? 'active' : ''}" title="حفظ بالمفضلة" onclick="Quran.toggleAyahBookmark(${surahNumber}, ${aNum}, this)">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="${isBookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                  <span>حفظ</span>
                </button>
                <button class="verse-action-btn" title="نسخ الآية" onclick="Quran.copyAyahTextByNum(${surahNumber}, ${aNum})">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  <span>نسخ</span>
                </button>
              </div>
            </div>

            <div class="verse-arabic-text" id="verse-text-${surahNumber}-${aNum}">
              ${aText}
              <span class="ayah-end-symbol">﴿${aNum}﴾</span>
            </div>

            <div class="verse-translation-text" id="verse-translation-${surahNumber}-${aNum}"></div>
          </div>
        `;
      });

      container.innerHTML = html;
      this.updateReaderToolbar();

    } catch (e) {
      console.error('Failed to load verses list:', e);
      container.innerHTML = `<div style="text-align:center;padding:30px;color:#ef4444;">تعذر تحميل الآيات.</div>`;
    }
  },

  /**
   * التفاعل عند النقر على آية في صفحة المصحف
   */
  onMushafAyahClick(surahNumber, ayahNumber, pageNumber) {
    this.currentSurah = surahNumber;
    this.currentAyah = ayahNumber;
    this.savePosition(surahNumber, ayahNumber, pageNumber);

    // تشغيل تلاوة الآية فوراً
    this.playAyahAudio(surahNumber, ayahNumber);
  },

  /**
   * التنقل للصفحة السابقة
   */
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.savePosition(this.currentSurah, 1, this.currentPage);
      this.loadMushafPage(this.currentPage);
    }
  },

  /**
   * التنقل للصفحة التالية
   */
  nextPage() {
    if (this.currentPage < 604) {
      this.currentPage++;
      this.savePosition(this.currentSurah, 1, this.currentPage);
      this.loadMushafPage(this.currentPage);
    }
  },

  /**
   * مشغل التلاوة الصوتي المتقدم
   */
  setupAudioDeckEvents() {
    const playBtn = document.getElementById('btn-deck-play-main');
    const prevBtn = document.getElementById('btn-deck-prev');
    const nextBtn = document.getElementById('btn-deck-next');
    const repeatBtn = document.getElementById('btn-deck-repeat');
    const sliderContainer = document.getElementById('deck-slider-container');
    const reciterSelect = document.getElementById('deck-reciter-select');

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (this.isPlaying) {
          this.pauseAudio();
        } else {
          this.resumeAudio();
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.playPreviousAyah());
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.playNextAyah());
    }

    if (repeatBtn) {
      repeatBtn.addEventListener('click', () => {
        this.isRepeat = !this.isRepeat;
        repeatBtn.classList.toggle('active', this.isRepeat);
      });
    }

    if (reciterSelect) {
      reciterSelect.addEventListener('change', (e) => {
        this.selectedReciter = e.target.value;
        const r = API.reciters.find(item => item.id === this.selectedReciter);
        const nameEl = document.getElementById('deck-reciter-name');
        if (nameEl && r) nameEl.textContent = r.name;

        // إذا كان الصوت يعمل، نعيد التشغيل بالقارئ الجديد
        if (this.isPlaying && this.activePlayingAyah) {
          this.playAyahAudio(this.activePlayingAyah.surah, this.activePlayingAyah.ayah);
        }
      });
    }

    // شريط التمرير
    if (sliderContainer) {
      sliderContainer.addEventListener('click', (e) => {
        if (!this.audio.duration) return;
        const rect = sliderContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const ratio = Math.max(0, Math.min(1, clickX / rect.width));
        this.audio.currentTime = ratio * this.audio.duration;
      });
    }

    // أحداث الصوت
    this.audio.addEventListener('timeupdate', () => {
      this.updateAudioProgress();
    });

    this.audio.addEventListener('ended', () => {
      if (this.isRepeat) {
        this.audio.currentTime = 0;
        this.audio.play();
      } else {
        this.playNextAyah();
      }
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('Audio playback error:', e);
      this.isPlaying = false;
      this.updatePlayBtnUI();
    });
  },

  populateReciterSelectors() {
    const select = document.getElementById('deck-reciter-select');
    if (!select) return;

    select.innerHTML = API.reciters.map(r => `
      <option value="${r.id}" ${r.id === this.selectedReciter ? 'selected' : ''}>${r.name}</option>
    `).join('');
  },

  /**
   * تشغيل تلاوة آية بعينها
   */
  playAyahAudio(surahNumber, ayahNumber) {
    this.activePlayingAyah = { surah: surahNumber, ayah: ayahNumber };
    const url = API.getAyahAudioUrl(this.selectedReciter, surahNumber, ayahNumber);

    this.audio.src = url;
    this.audio.play().then(() => {
      this.isPlaying = true;
      this.updatePlayBtnUI();
      this.updateActiveAyahHighlight();
      this.updateDeckTrackInfo(surahNumber, ayahNumber);
    }).catch(err => {
      console.warn('Could not autoplay audio:', err);
      this.isPlaying = false;
      this.updatePlayBtnUI();
    });
  },

  /**
   * تشغيل سورة كاملة
   */
  playFullSurah(surahNumber) {
    const url = API.getSurahAudioUrl(this.selectedReciter, surahNumber);
    const s = this.surahs.find(item => item.number === surahNumber) || { name: `سورة ${surahNumber}` };

    this.activePlayingAyah = { surah: surahNumber, ayah: 1 };
    this.audio.src = url;
    this.audio.play().then(() => {
      this.isPlaying = true;
      this.updatePlayBtnUI();
      const titleEl = document.getElementById('deck-track-title');
      if (titleEl) titleEl.textContent = `${s.name} (تلاوة كاملة)`;
    }).catch(e => console.warn(e));
  },

  pauseAudio() {
    this.audio.pause();
    this.isPlaying = false;
    this.updatePlayBtnUI();
  },

  resumeAudio() {
    if (this.audio.src) {
      this.audio.play().then(() => {
        this.isPlaying = true;
        this.updatePlayBtnUI();
      }).catch(e => console.warn(e));
    } else if (this.currentSurah) {
      this.playAyahAudio(this.currentSurah, this.currentAyah || 1);
    }
  },

  playNextAyah() {
    if (!this.activePlayingAyah) return;
    const { surah, ayah } = this.activePlayingAyah;
    const s = this.surahs.find(item => item.number === surah);
    const totalAyahs = s ? s.numberOfAyahs : 7;

    if (ayah < totalAyahs) {
      this.playAyahAudio(surah, ayah + 1);
    } else if (surah < 114) {
      this.playAyahAudio(surah + 1, 1);
    } else {
      this.isPlaying = false;
      this.updatePlayBtnUI();
    }
  },

  playPreviousAyah() {
    if (!this.activePlayingAyah) return;
    const { surah, ayah } = this.activePlayingAyah;
    if (ayah > 1) {
      this.playAyahAudio(surah, ayah - 1);
    } else if (surah > 1) {
      const prevS = this.surahs.find(item => item.number === surah - 1);
      this.playAyahAudio(surah - 1, prevS ? prevS.numberOfAyahs : 1);
    }
  },

  updateAudioProgress() {
    const fill = document.getElementById('deck-slider-fill');
    const curTime = document.getElementById('deck-time-current');
    const totTime = document.getElementById('deck-time-total');

    if (!fill || !this.audio.duration) return;

    const current = this.audio.currentTime || 0;
    const duration = this.audio.duration || 0;
    const pct = (current / duration) * 100;

    fill.style.width = `${pct}%`;
    if (curTime) curTime.textContent = this.formatTime(current);
    if (totTime) totTime.textContent = this.formatTime(duration);
  },

  updatePlayBtnUI() {
    const btn = document.getElementById('btn-deck-play-main');
    if (!btn) return;
    btn.innerHTML = this.isPlaying
      ? `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`
      : `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
  },

  updateDeckTrackInfo(surahNumber, ayahNumber) {
    const titleEl = document.getElementById('deck-track-title');
    const s = this.surahs.find(item => item.number === surahNumber) || { name: `سورة ${surahNumber}` };
    if (titleEl) titleEl.textContent = `${s.name} — الآية ${ayahNumber}`;
  },

  updateActiveAyahHighlight() {
    // إزالة التمييز السابق
    document.querySelectorAll('.mushaf-ayah-span.active-playing, .verse-item-card.active-playing').forEach(el => {
      el.classList.remove('active-playing');
    });

    if (!this.activePlayingAyah) return;
    const { surah, ayah } = this.activePlayingAyah;

    // تمييز في صفحة المصحف
    const mushafSpan = document.getElementById(`mushaf-ayah-${surah}-${ayah}`);
    if (mushafSpan) {
      mushafSpan.classList.add('active-playing');
      mushafSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // تمييز في قائمة الآيات
    const verseCard = document.getElementById(`verse-card-${surah}-${ayah}`);
    if (verseCard) {
      verseCard.classList.add('active-playing');
      verseCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  },

  formatTime(secs) {
    if (isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  },

  /**
   * التفسير المعتمد (الميسر / السعدي)
   */
  async showTafsir(surahNumber, ayahNumber, ayahText) {
    const modal = document.getElementById('quran-tafsir-modal');
    const title = document.getElementById('tafsir-modal-title');
    const quote = document.getElementById('tafsir-ayah-quote');
    const body = document.getElementById('tafsir-body-text');

    if (!modal) return;

    const s = this.surahs.find(item => item.number === surahNumber) || { name: `سورة ${surahNumber}` };
    if (title) title.textContent = `تفسير الآية (${ayahNumber}) من ${s.name}`;

    let text = ayahText;
    if (!text) {
      const textEl = document.getElementById(`verse-text-${surahNumber}-${ayahNumber}`) ||
                     document.getElementById(`mushaf-ayah-${surahNumber}-${ayahNumber}`);
      if (textEl) {
        text = textEl.innerText.replace(/﴿\d+﴾/g, '').replace(/[\r\n]+/g, ' ').trim();
      }
    }
    if (quote) quote.innerHTML = text ? `﴿${text}﴾` : `سورة ${s.name} - الآية ${ayahNumber}`;
    if (body) body.innerHTML = 'جاري إحضار التفسير المعتمد...';

    modal.classList.add('active');

    const tafsirData = await API.getAyahTafsir(surahNumber, ayahNumber);
    if (body) {
      body.innerHTML = `
        <div style="margin-bottom: 12px; font-weight: 700; color: var(--accent-gold);">المصدر: ${tafsirData.source}</div>
        <div style="line-height: 1.8; font-size: 1.05rem;">${tafsirData.text}</div>
      `;
    }
  },

  /**
   * الترجمة الإنجليزية / الفرنسية للآية
   */
  async toggleVerseTranslation(surahNumber, ayahNumber) {
    const transEl = document.getElementById(`verse-translation-${surahNumber}-${ayahNumber}`);
    if (!transEl) return;

    if (transEl.classList.contains('active')) {
      transEl.classList.remove('active');
      return;
    }

    transEl.innerHTML = 'Loading translation...';
    transEl.classList.add('active');

    const transData = await API.getAyahTranslation(surahNumber, ayahNumber, 'en');
    if (transData) {
      transEl.innerHTML = `
        <div style="font-size: 0.8rem; color: var(--accent-gold); margin-bottom: 4px;">${transData.edition}:</div>
        <div>"${transData.text}"</div>
      `;
    } else {
      transEl.innerHTML = 'Translation unavailable offline.';
    }
  },

  /**
   * إدارة المفضلة (Bookmarks)
   */
  loadBookmarks() {
    try {
      this.bookmarks = JSON.parse(localStorage.getItem('noor_quran_bookmarks') || '[]');
    } catch (e) {
      this.bookmarks = [];
    }
  },

  saveBookmarks() {
    localStorage.setItem('noor_quran_bookmarks', JSON.stringify(this.bookmarks));
    const badge = document.getElementById('quran-tab-bookmarks-count');
    if (badge) badge.textContent = this.bookmarks.length;
    if (window.Sync && typeof window.Sync.schedulePush === 'function') {
      window.Sync.schedulePush();
    }
  },

  isAyahBookmarked(surahNumber, ayahNumber) {
    return this.bookmarks.some(b => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber);
  },

  isSurahBookmarked(surahNumber) {
    return this.bookmarks.some(b => b.surahNumber === surahNumber && (!b.ayahNumber || b.ayahNumber === 1));
  },

  toggleAyahBookmark(surahNumber, ayahNumber, btnEl) {
    const idx = this.bookmarks.findIndex(b => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber);
    if (idx >= 0) {
      this.bookmarks.splice(idx, 1);
      if (btnEl) btnEl.classList.remove('active');
    } else {
      const s = this.surahs.find(item => item.number === surahNumber);
      const textEl = document.getElementById(`verse-text-${surahNumber}-${ayahNumber}`) ||
                     document.getElementById(`mushaf-ayah-${surahNumber}-${ayahNumber}`);
      const text = textEl ? textEl.innerText.replace(/﴿\d+﴾/g, '').replace(/[\r\n]+/g, ' ').trim() : '';
      this.bookmarks.push({
        surahNumber,
        ayahNumber,
        text,
        pageNumber: s ? s.startingPage : 1,
        date: new Date().toISOString()
      });
      if (btnEl) btnEl.classList.add('active');
      if (window.Auth && !Auth.currentUser && typeof Auth.showGuestPrompt === 'function') {
        Auth.showGuestPrompt('سجّل دخولك لحفظ هذه الآية ومزامنة مفضلاتك عبر كافة أجهزتك.');
      }
    }
    this.saveBookmarks();
  },

  copyAyahTextByNum(surahNumber, ayahNumber) {
    const s = this.surahs.find(item => item.number === surahNumber) || { name: `سورة ${surahNumber}` };
    const textEl = document.getElementById(`verse-text-${surahNumber}-${ayahNumber}`) ||
                   document.getElementById(`mushaf-ayah-${surahNumber}-${ayahNumber}`);
    const text = textEl ? textEl.innerText.replace(/﴿\d+﴾/g, '').replace(/[\r\n]+/g, ' ').trim() : '';
    this.copyAyahText(text, s.name, ayahNumber);
  },

  toggleSurahBookmark(surahNumber, event) {
    if (event) event.stopPropagation();
    const idx = this.bookmarks.findIndex(b => b.surahNumber === surahNumber && (!b.ayahNumber || b.ayahNumber === 1));
    if (idx >= 0) {
      this.bookmarks.splice(idx, 1);
    } else {
      const s = this.surahs.find(item => item.number === surahNumber);
      this.bookmarks.push({
        surahNumber,
        ayahNumber: 1,
        text: `سورة ${s ? s.name : surahNumber}`,
        pageNumber: s ? s.startingPage : 1,
        date: new Date().toISOString()
      });
    }
    this.saveBookmarks();
    this.renderSurahsGrid();
  },

  removeBookmark(index) {
    if (index >= 0 && index < this.bookmarks.length) {
      this.bookmarks.splice(index, 1);
      this.saveBookmarks();
      this.renderBookmarks();
    }
  },

  /**
   * نسخ ومشاركة الآية
   */
  copyAyahText(text, surahName, ayahNumber) {
    const formatted = `﴿${text}﴾ [${surahName} - الآية ${ayahNumber}]\nنُور القرآن`;
    navigator.clipboard.writeText(formatted).then(() => {
      alert(`تم نسخ الآية الكريمة (${ayahNumber} من ${surahName}) بنجاح`);
    }).catch(() => {
      prompt('انسخ نص الآية:', formatted);
    });
  },

  /**
   * حفظ واسترجاع موضع القراءة
   */
  loadLastPosition() {
    try {
      this.lastPosition = JSON.parse(localStorage.getItem('noor_last_quran_position') || 'null');
    } catch (e) {
      this.lastPosition = null;
    }
  },

  savePosition(surahNumber, ayahNumber = 1, pageNumber = 1) {
    this.lastPosition = { surahNumber, ayahNumber, pageNumber };
    localStorage.setItem('noor_last_quran_position', JSON.stringify(this.lastPosition));
    this.updateHomeLastReadBanner();
    if (window.Sync && typeof window.Sync.schedulePush === 'function') {
      window.Sync.schedulePush();
    }
  },

  updateHomeLastReadBanner() {
    const banner = document.getElementById('last-read-banner');
    const textEl = document.getElementById('last-read-text');
    const btn = document.getElementById('btn-resume-reading');
    if (!banner) return;

    if (this.lastPosition && this.lastPosition.surahNumber) {
      const s = this.surahs.find(item => item.number === this.lastPosition.surahNumber) || { name: `سورة ${this.lastPosition.surahNumber}` };
      const a = this.lastPosition.ayahNumber || 1;
      const p = this.lastPosition.pageNumber || 1;
      banner.style.display = 'flex';
      if (textEl) textEl.textContent = `${s.name} - الآية ${a} (صفحة ${p})`;
      if (btn) {
        btn.onclick = (e) => {
          e.preventDefault();
          if (window.App && typeof App.navigateTo === 'function') App.navigateTo('quran');
          this.openReader({ surahNumber: s.number, ayahNumber: a, pageNumber: p });
        };
      }
    } else {
      banner.style.display = 'none';
    }
  },

  /**
   * إعدادات القارئ (حجم الخط، الثيم، تباعد الأسطر)
   */
  loadReaderSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem('noor_quran_reader_settings') || 'null');
      if (saved) this.readerSettings = { ...this.readerSettings, ...saved };
    } catch (e) {}

    this.applyReaderSettings();
  },

  saveReaderSettings() {
    localStorage.setItem('noor_quran_reader_settings', JSON.stringify(this.readerSettings));
    this.applyReaderSettings();
  },

  applyReaderSettings() {
    document.documentElement.style.setProperty('--mushaf-font-size', `${this.readerSettings.fontSize}px`);
    document.documentElement.style.setProperty('--mushaf-line-height', this.readerSettings.lineHeight);

    const mushafLayout = document.getElementById('reader-mushaf-layout');
    if (mushafLayout) {
      mushafLayout.setAttribute('data-reader-theme', this.readerSettings.theme);
    }
  },

  updateReaderFontSize(size) {
    this.readerSettings.fontSize = size;
    this.saveReaderSettings();
  },

  updateReaderLineHeight(height) {
    this.readerSettings.lineHeight = height;
    this.saveReaderSettings();
  },

  updateReaderTheme(theme) {
    this.readerSettings.theme = theme;
    this.saveReaderSettings();
  },

  /**
   * محرك البحث القرآني
   */
  async handleSearch(query) {
    const dropdown = document.getElementById('quran-main-search-dropdown');
    if (!dropdown) return;

    if (!query || query.length < 2) {
      dropdown.classList.remove('active');
      return;
    }

    // 1. البحث في أسماء السور وأرقامها محلياً
    const surahMatches = this.surahs.filter(s => {
      return s.name.includes(query) ||
             (s.englishName && s.englishName.toLowerCase().includes(query.toLowerCase())) ||
             String(s.number) === query;
    });

    let resultsHtml = '';

    if (surahMatches.length > 0) {
      resultsHtml += `<div style="padding: 8px 16px; font-size: 0.8rem; color: var(--accent-gold); font-weight: 700;">السور:</div>`;
      surahMatches.slice(0, 5).forEach(s => {
        resultsHtml += `
          <div class="search-result-item" onclick="Quran.openReader({ surahNumber: ${s.number}, pageNumber: ${s.startingPage || 1} })">
            <div class="search-result-meta">
              <span>سورة رقم ${s.number}</span>
              <span>صفحة ${s.startingPage || 1}</span>
            </div>
            <div class="search-result-text" style="font-size: 1.25rem; font-weight: 700;">
              ${s.name} (${s.englishName || ''})
            </div>
          </div>
        `;
      });
    }

    // 2. البحث في نص الآيات
    try {
      const ayahMatches = await API.searchQuran(query);
      if (ayahMatches && ayahMatches.length > 0) {
        resultsHtml += `<div style="padding: 8px 16px; font-size: 0.8rem; color: var(--accent-gold); font-weight: 700;">الآيات القرآنية:</div>`;
        ayahMatches.slice(0, 8).forEach(m => {
          const highlighted = m.text.replace(new RegExp(query, 'gi'), match => `<mark>${match}</mark>`);
          resultsHtml += `
            <div class="search-result-item" onclick="Quran.openReader({ surahNumber: ${m.surahNumber}, ayahNumber: ${m.ayahNumber} })">
              <div class="search-result-meta">
                <span>${m.surahName} — الآية ${m.ayahNumber}</span>
              </div>
              <div class="search-result-text">
                ﴿${highlighted}﴾
              </div>
            </div>
          `;
        });
      }
    } catch (e) {
      console.warn('Ayah search failed:', e);
    }

    if (!resultsHtml) {
      resultsHtml = `<div style="padding: 20px; text-align: center; color: var(--text-muted);">لم يتم العثور على نتائج تطابق "${query}".</div>`;
    }

    dropdown.innerHTML = resultsHtml;
    dropdown.classList.add('active');
  },

  /**
   * ضبط سرعة التلاوة
   */
  setSpeed(speed) {
    if (this.audio) {
      this.audio.playbackRate = parseFloat(speed) || 1.0;
    }
  }
};

// إتاحة الكائن عالمياً
window.Quran = Quran;
