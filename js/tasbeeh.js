/**
 * نُور القرآن | NOOR AL-QURAN
 * tasbeeh.js - السبحة الحقيقية المرئية التفاعلية الملكية مع فيزياء حركة الخرز، الأصوات، التراجع والاهتزاز
 */

const Tasbeeh = {
  count: 0,
  target: 33, // 33, 100, 1000, 0 (مفتوح) أو مخصص
  currentDhikr: 'سبحان الله',
  currentStyle: 'classic', // 'classic' | 'wooden' | 'dark' | 'luxury' | 'minimal'
  totalBeads: 33,
  beadRotation: 0,

  init() {
    this.loadState();
    this.renderBeadsRing();
    this.bindDOMEvents();
    this.updateUI();
  },

  loadState() {
    try {
      const savedCount = localStorage.getItem('noor_tasbeeh_count');
      const savedTarget = localStorage.getItem('noor_tasbeeh_target');
      const savedDhikr = localStorage.getItem('noor_tasbeeh_dhikr');
      const savedStyle = localStorage.getItem('noor_tasbeeh_style');

      if (savedCount !== null) this.count = parseInt(savedCount, 10) || 0;
      if (savedTarget !== null) this.target = parseInt(savedTarget, 10);
      if (savedDhikr) this.currentDhikr = savedDhikr;
      if (savedStyle) this.currentStyle = savedStyle;
    } catch (e) {
      console.warn(e);
    }
  },

  saveState() {
    try {
      localStorage.setItem('noor_tasbeeh_count', this.count);
      localStorage.setItem('noor_tasbeeh_target', this.target);
      localStorage.setItem('noor_tasbeeh_dhikr', this.currentDhikr);
      localStorage.setItem('noor_tasbeeh_style', this.currentStyle);
      if (window.Sync && typeof window.Sync.schedulePush === 'function') {
        window.Sync.schedulePush();
      }
    } catch (e) {
      console.warn(e);
    }
  },

  /**
   * بناء عقد حبات السبحة الدائرية (33 حبة مرئية مع الشواهد الفاخرة)
   */
  renderBeadsRing() {
    const ringContainer = document.getElementById('tasbeeh-beads-track');
    if (!ringContainer) return;

    const radius = 108; // نصف قطر مسار الحبات
    const centerX = 130;
    const centerY = 130;
    let beadsHtml = '';

    for (let i = 0; i < this.totalBeads; i++) {
      const angle = (i * (360 / this.totalBeads) - 90) * (Math.PI / 180);
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      // الشاهد (الفاصل) عند الحبة 0 و 11 و 22
      const isSeparator = i === 0 || i === 11 || i === 22;
      const beadClass = isSeparator ? 'tasbeeh-bead separator-bead' : 'tasbeeh-bead';

      beadsHtml += `
        <div class="${beadClass}" 
             data-index="${i}" 
             title="حبة ${i + 1}"
             style="transform: translate(${x - 10}px, ${y - 10}px);">
        </div>
      `;
    }

    ringContainer.innerHTML = beadsHtml;
  },

  /**
   * احتساب تسبيحة واحدة عند النقر على أي مكان في السبحة أو الحبات
   */
  increment(clickEvent = null) {
    this.count += 1;
    this.saveState();

    // 1. تدوير عقد السبحة بمقدار حبة واحدة (حركة حقيقية مرئية للسبحة)
    this.beadRotation += (360 / this.totalBeads);
    const track = document.getElementById('tasbeeh-beads-track');
    if (track) {
      track.style.transform = `rotate(${this.beadRotation}deg)`;
    }

    // تأرجح خفيف للشاهد والشرابة مع الحركة
    const minaret = document.querySelector('.tasbeeh-minaret-assembly');
    if (minaret) {
      minaret.classList.remove('minaret-sway');
      void minaret.offsetWidth;
      minaret.classList.add('minaret-sway');
    }

    // 2. تشغيل صوت نقرة الخرزة الطبيعية
    if (window.Sound) {
      Sound.playTasbeehBeadClick();
    }

    // 3. اهتزاز خفيف للأجهزة المدعومة
    if (window.Settings && Settings.get('tasbeehVibrate') && navigator.vibrate) {
      try { navigator.vibrate(22); } catch(e) {}
    }

    // 4. تأثير نبض العداد والتموج (Ripple) وذرات النور
    this.animateTapEffects(clickEvent);

    // 5. تحقق من الوصول للهدف المحدد
    if (this.target > 0 && this.count % this.target === 0) {
      this.celebrateGoal();
    }

    this.updateUI();
  },

  /**
   * التراجع عن الضغطة الأخيرة (Undo)
   */
  undo() {
    if (this.count <= 0) {
      if (window.App) App.showToast('العداد صفر بالفعل');
      return;
    }

    this.count -= 1;
    this.beadRotation -= (360 / this.totalBeads);
    const track = document.getElementById('tasbeeh-beads-track');
    if (track) {
      track.style.transform = `rotate(${this.beadRotation}deg)`;
    }

    if (window.Sound) {
      Sound.playUIClick();
    }

    this.saveState();
    this.updateUI();
    if (window.App) App.showToast('تم التراجع عن التسبيحة الأخيرة ↩️');
  },

  celebrateGoal() {
    if (navigator.vibrate) {
      try { navigator.vibrate([60, 80, 100]); } catch(e) {}
    }

    if (window.Sound) {
      Sound.playGoalCelebration();
    }

    if (window.App) {
      App.showToast(`✨ مبارك لك! أتممت دورة التسبيح (${this.target} تسبيحة) • تقبل الله طاعتكم 🤲`, 4500);
    }

    // تأثير الاحتفال البصري على جهاز السبحة
    const device = document.getElementById('tasbeeh-main-device');
    const surface = document.getElementById('tasbeeh-click-surface');
    if (device) {
      device.classList.add('goal-celebrating');
      setTimeout(() => device.classList.remove('goal-celebrating'), 1200);
    }
    if (surface) {
      surface.classList.add('goal-reached');
      setTimeout(() => surface.classList.remove('goal-reached'), 900);
    }
  },

  animateTapEffects(clickEvent) {
    const counterEl = document.getElementById('tasbeeh-counter-number');
    const surface = document.getElementById('tasbeeh-click-surface');
    
    if (counterEl) {
      counterEl.classList.remove('counter-bounce');
      void counterEl.offsetWidth; // force reflow
      counterEl.classList.add('counter-bounce');
    }

    if (surface) {
      surface.classList.remove('pulse-bead');
      void surface.offsetWidth;
      surface.classList.add('pulse-bead');
      setTimeout(() => surface.classList.remove('pulse-bead'), 220);

      // تموج مائي ناعم (Ripple) عند موضع النقر
      if (clickEvent) {
        const rect = surface.getBoundingClientRect();
        const x = clickEvent.clientX - rect.left;
        const y = clickEvent.clientY - rect.top;
        const ripple = document.createElement('span');
        ripple.className = 'tasbeeh-bead-ripple';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        surface.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      }
    }
  },

  reset() {
    this.count = 0;
    this.beadRotation = 0;
    const track = document.getElementById('tasbeeh-beads-track');
    if (track) {
      track.style.transform = 'rotate(0deg)';
    }
    this.saveState();
    this.updateUI();
    if (window.App) App.showToast('تمت إعادة ضبط عداد السبحة');
  },

  setTarget(targetVal) {
    if (targetVal === 'custom') {
      const input = prompt('أدخل هدف التسبيح المخصص الذي تريده:', '70');
      if (input && !isNaN(parseInt(input, 10)) && parseInt(input, 10) > 0) {
        this.target = parseInt(input, 10);
      } else {
        return;
      }
    } else {
      this.target = parseInt(targetVal, 10);
    }
    this.saveState();
    this.updateUI();
    if (window.App) {
      App.showToast(this.target > 0 ? `تم تحديد الهدف: ${this.target} تسبيحة` : 'تم تفعيل العداد المفتوح');
    }
  },

  setDhikr(dhikrText) {
    this.currentDhikr = dhikrText;
    this.saveState();
    this.updateUI();
  },

  setStyle(styleName) {
    this.currentStyle = styleName;
    this.saveState();
    this.updateUI();
    
    // أنيميشن عند تغيير نوع السبحة
    const device = document.getElementById('tasbeeh-main-device');
    if (device) {
      device.classList.add('style-switch-anim');
      setTimeout(() => device.classList.remove('style-switch-anim'), 400);
    }
  },

  updateUI() {
    const countEl = document.getElementById('tasbeeh-counter-number');
    if (countEl) {
      countEl.textContent = String(this.count).padStart(3, '0');
    }

    const dhikrEl = document.getElementById('tasbeeh-current-dhikr-text');
    if (dhikrEl) {
      dhikrEl.textContent = this.currentDhikr;
    }

    // نسبة التقدم والمتبقي نحو الهدف
    const progressTextEl = document.getElementById('tasbeeh-progress-ratio');
    if (progressTextEl) {
      if (this.target > 0) {
        const currentInCycle = (this.count % this.target) || (this.count > 0 && this.count % this.target === 0 ? this.target : 0);
        progressTextEl.textContent = `${currentInCycle} / ${this.target}`;
      } else {
        progressTextEl.textContent = `${this.count} (مفتوح)`;
      }
    }

    const targetBadge = document.getElementById('tasbeeh-target-badge');
    if (targetBadge) {
      targetBadge.textContent = this.target > 0 ? `الهدف: ${this.target}` : 'الهدف: مفتوح';
    }

    // دائرة الـ SVG Progress Ring
    const circle = document.getElementById('tasbeeh-progress-circle');
    if (circle) {
      const radius = circle.r.baseVal.value;
      const circumference = 2 * Math.PI * radius;
      circle.style.strokeDasharray = `${circumference} ${circumference}`;

      if (this.target > 0) {
        const fraction = (this.count % this.target) / this.target;
        const progress = (this.count > 0 && fraction === 0) ? 1 : fraction;
        const offset = circumference - progress * circumference;
        circle.style.strokeDashoffset = offset;
      } else {
        const progress = (this.count % 33) / 33;
        const offset = circumference - progress * circumference;
        circle.style.strokeDashoffset = offset;
      }
    }

    // تطبيق نمط المظهر
    const container = document.getElementById('tasbeeh-main-device');
    if (container) {
      container.className = `tasbeeh-device style-${this.currentStyle}`;
    }

    // تحديث أزرار الأنماط
    document.querySelectorAll('.btn-tasbeeh-style').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.style === this.currentStyle);
    });

    // تحديث أزرار الأهداف
    document.querySelectorAll('.btn-tasbeeh-target').forEach(btn => {
      const targetVal = parseInt(btn.dataset.target, 10);
      if (btn.dataset.target === 'custom') {
        btn.classList.toggle('active', this.target !== 33 && this.target !== 100 && this.target !== 1000 && this.target !== 0);
      } else {
        btn.classList.toggle('active', targetVal === this.target);
      }
    });

    // تحديث شريط الأذكار السريعة (Dhikr Pills)
    document.querySelectorAll('.btn-dhikr-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.dhikr === this.currentDhikr);
    });

    // القائمة المنسدلة
    const select = document.getElementById('tasbeeh-dhikr-select');
    if (select) {
      select.value = this.currentDhikr;
    }

    // تحديث كروت الإحصائيات
    const statTotal = document.getElementById('tasbeeh-stat-total');
    if (statTotal) statTotal.textContent = this.count;

    const statCycles = document.getElementById('tasbeeh-stat-cycles');
    if (statCycles) {
      const cycleTarget = this.target > 0 ? this.target : 33;
      statCycles.textContent = Math.floor(this.count / cycleTarget);
    }

    const statTarget = document.getElementById('tasbeeh-stat-target');
    if (statTarget) {
      statTarget.textContent = this.target > 0 ? this.target : 'مفتوح';
    }
  },

  bindDOMEvents() {
    // 1. جعل مساحة النقر تشمل الزر المركزي وعقد الحبات بالكامل
    const assembly = document.querySelector('.tasbeeh-visual-assembly');
    if (assembly) {
      assembly.addEventListener('click', (e) => {
        e.preventDefault();
        this.increment(e);
      });
    }

    const surface = document.getElementById('tasbeeh-click-surface');
    if (surface) {
      surface.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          this.increment();
        } else if (e.key === 'Backspace' || e.key === 'Delete') {
          e.preventDefault();
          this.undo();
        }
      });
    }

    // زر إعادة الضبط
    const resetBtn = document.getElementById('btn-tasbeeh-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.reset();
      });
    }

    // زر التراجع عن آخر ضغطة
    const undoBtn = document.getElementById('btn-tasbeeh-undo');
    if (undoBtn) {
      undoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.undo();
      });
    }

    // أزرار أنماط السبحة
    document.querySelectorAll('.btn-tasbeeh-style').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setStyle(btn.dataset.style);
        if (window.Sound) Sound.playUIClick();
      });
    });

    // أزرار أهداف التسبيح
    document.querySelectorAll('.btn-tasbeeh-target').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setTarget(btn.dataset.target);
        if (window.Sound) Sound.playUIClick();
      });
    });

    // أزرار الأذكار السريعة (Dhikr Pills)
    document.querySelectorAll('.btn-dhikr-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const dhikr = btn.dataset.dhikr;
        if (dhikr) {
          this.setDhikr(dhikr);
          if (window.Sound) Sound.playUIClick();
          if (window.App) App.showToast(`تم اختيار: ${dhikr}`);
        }
      });
    });

    // اختيار الذكر من القائمة أو إضافة مخصص
    const dhikrSelect = document.getElementById('tasbeeh-dhikr-select');
    if (dhikrSelect) {
      dhikrSelect.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
          const customPrompt = prompt('أدخل الذكر المخصص الذي تريد التسبيح به:');
          if (customPrompt && customPrompt.trim()) {
            this.setDhikr(customPrompt.trim());
          }
        } else {
          this.setDhikr(e.target.value);
        }
        if (window.Sound) Sound.playUIClick();
      });
    }

    // دعم اختصارات لوحة المفاتيح عند التواجد في قسم السبحة
    window.addEventListener('keydown', (e) => {
      if (window.App && App.currentSection === 'tasbeeh') {
        if (e.code === 'Space') {
          e.preventDefault();
          this.increment();
        } else if (e.key === 'Backspace') {
          this.undo();
        }
      }
    });
  }
};

window.Tasbeeh = Tasbeeh;
