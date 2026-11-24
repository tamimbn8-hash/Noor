/**
 * نُور القرآن | NOOR AL-QURAN
 * cursor.js - محرك مؤشر الفأرة الروحاني السلس (Spiritual & Smooth Custom Cursor)
 * يتميز بالسلاسة الفائقة (60-120fps Lerp)، وجمالية النور والزخرفة الإسلامية، وخفة الأداء.
 */

const NoorCursor = {
  container: null,
  dot: null,
  ring: null,
  canvas: null,
  ctx: null,

  // إحداثيات الماوس الحالية والمستهدفة
  targetX: -100,
  targetY: -100,
  dotX: -100,
  dotY: -100,
  ringX: -100,
  ringY: -100,

  // متغيرات الحركة والانسيابية (Lerp Physics)
  lerpFactor: 0.18,
  rafId: null,
  isMoving: false,
  isVisible: false,
  isTouch: false,
  isEnabled: true,
  isHovering: false,
  isClicking: false,

  // نظام ذرات النور والبريق (Stardust Noor Particles)
  particles: [],
  maxParticles: 40,
  lastParticleTime: 0,
  lastMouseX: -100,
  lastMouseY: -100,

  // ألوان الذرات الروحانية الزمردية النقية المريحة للعين
  particleColors: [
    'rgba(52, 211, 153, ',  // نعناعي مشرق هادئ
    'rgba(16, 185, 129, ',  // زمردي ناصع
    'rgba(110, 231, 183, ', // زمردي فاتح ناعم
    'rgba(167, 243, 208, ', // أخضر شفاف كريستالي
    'rgba(255, 255, 255, '   // نور أبيض نقي
  ],

  init() {
    // التحقق من أجهزة اللمس
    this.checkDevice();
    if (this.isTouch) return;

    // استرجاع الإعداد من الـ Settings إذا وجد
    if (window.Settings && typeof window.Settings.get === 'function') {
      this.isEnabled = window.Settings.get('customCursor') !== false;
    }

    if (!this.isEnabled) return;

    this.createElements();
    this.initCanvas();
    this.bindEvents();
    this.startLoop();
  },

  checkDevice() {
    this.isTouch = (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
    );
  },

  createElements() {
    // التحقق من عدم وجوده مسبقاً
    let existing = document.getElementById('noor-cursor-container');
    if (existing) existing.remove();

    // الحاوية
    const container = document.createElement('div');
    container.id = 'noor-cursor-container';
    container.className = 'noor-cursor-container hidden';
    container.setAttribute('aria-hidden', 'true');

    // مؤشر الفأرة الكلاسيكي باللون الأخضر الشفاف الجذاب
    const dot = document.createElement('div');
    dot.id = 'noor-cursor-dot';
    dot.className = 'noor-cursor-dot';
    dot.innerHTML = `
      <!-- السهم الكلاسيكي العادي باللون الأخضر الشفاف الجذاب للعين -->
      <svg class="noor-cursor-shape cursor-shape-arrow" viewBox="0 0 32 32" aria-hidden="true">
        <defs>
          <linearGradient id="emeraldGlassArrow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#34d399" stop-opacity="0.88" />
            <stop offset="45%" stop-color="#10b981" stop-opacity="0.70" />
            <stop offset="100%" stop-color="#059669" stop-opacity="0.52" />
          </linearGradient>
          <linearGradient id="glassReflection" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
            <stop offset="50%" stop-color="#ffffff" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0.05" />
          </linearGradient>
          <filter id="emeraldCursorGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="2.5" flood-color="#10b981" flood-opacity="0.75" />
            <feDropShadow dx="0" dy="3.5" stdDeviation="6" flood-color="#059669" flood-opacity="0.4" />
          </filter>
        </defs>

        <!-- طبقة التوهج والظل الزجاجي الأخضر الشفاف -->
        <path class="cursor-glow-path"
              d="M 2 2 L 2 24 L 7.5 18.5 L 12 29 L 16.2 27.2 L 11.8 16.8 L 18.5 16.8 Z"
              fill="rgba(16, 185, 129, 0.28)"
              filter="url(#emeraldCursorGlow)" />

        <!-- جسم السهم الكلاسيكي العادي بلون أخضر زمردي زجاجي شفاف -->
        <path class="cursor-arrow-body"
              d="M 2 2 L 2 24 L 7.5 18.5 L 12 29 L 16.2 27.2 L 11.8 16.8 L 18.5 16.8 Z"
              fill="url(#emeraldGlassArrow)"
              stroke="#a7f3d0"
              stroke-width="1.35"
              stroke-linejoin="round"
              stroke-linecap="round" />

        <!-- انعكاس زجاجي شفاف يمنح المظهر الكريستالي الجذاب -->
        <path class="cursor-reflection-1"
              d="M 3.8 4.5 L 3.8 21 L 7 18"
              fill="none"
              stroke="url(#glassReflection)"
              stroke-width="1.1"
              stroke-linecap="round" />

        <path class="cursor-reflection-2"
              d="M 4 3.8 L 16.5 15.2"
              fill="none"
              stroke="url(#glassReflection)"
              stroke-width="0.8"
              stroke-linecap="round" />

        <!-- بريق رأس السهم الكريستالي الشفاف الدقيق -->
        <circle cx="2.6" cy="2.6" r="1.3" fill="#ffffff" opacity="0.95" />
      </svg>
    `;

    // هالة النور الزمردية الناعمة الانسيابية
    const ring = document.createElement('div');
    ring.id = 'noor-cursor-ring';
    ring.className = 'noor-cursor-ring';
    ring.innerHTML = `
      <div class="cursor-soft-aura"></div>
    `;

    // كانفاس ذرات النور
    const canvas = document.createElement('canvas');
    canvas.id = 'noor-cursor-canvas';
    canvas.className = 'noor-cursor-canvas';

    container.appendChild(canvas);
    container.appendChild(ring);
    container.appendChild(dot);
    document.body.appendChild(container);

    this.container = container;
    this.dot = dot;
    this.ring = ring;
    this.canvas = canvas;

    document.body.classList.add('noor-custom-cursor-enabled');
  },

  initCanvas() {
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  },

  resizeCanvas() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  bindEvents() {
    // تتبع موضع الفأرة
    window.addEventListener('mousemove', (e) => this.onMouseMove(e), { passive: true });

    // خروج / دخول الماوس من الشاشة
    document.addEventListener('mouseleave', () => this.hide());
    document.addEventListener('mouseenter', () => this.show());

    // النقر بالماوس (Click Waves)
    window.addEventListener('mousedown', (e) => this.onMouseDown(e), { passive: true });
    window.addEventListener('mouseup', () => this.onMouseUp(), { passive: true });

    // التحويم التفاعلي (Hover states عبر Event Delegation الذكي)
    document.addEventListener('mouseover', (e) => this.onMouseOver(e), { passive: true });
    document.addEventListener('mouseout', (e) => this.onMouseOut(e), { passive: true });

    // مراقبة تغيير الإعدادات
    window.addEventListener('settings:changed', (e) => {
      if (e.detail && e.detail.key === 'customCursor') {
        this.toggle(e.detail.value);
      }
    });
  },

  onMouseMove(e) {
    this.targetX = e.clientX;
    this.targetY = e.clientY;

    if (!this.isVisible) {
      this.show();
      this.ringX = this.targetX;
      this.ringY = this.targetY;
      this.dotX = this.targetX;
      this.dotY = this.targetY;
    }

    // حساب السرعة لإطلاق ذرات النور عند الحركة فقط
    const dx = this.targetX - this.lastMouseX;
    const dy = this.targetY - this.lastMouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const now = performance.now();
    if (dist > 3 && now - this.lastParticleTime > 25 && this.particles.length < this.maxParticles) {
      this.spawnParticle(this.targetX, this.targetY, dx, dy);
      this.lastParticleTime = now;
    }

    this.lastMouseX = this.targetX;
    this.lastMouseY = this.targetY;
  },

  onMouseDown(e) {
    if (!this.container || !this.isEnabled) return;
    this.isClicking = true;
    this.container.classList.add('state-clicking');
    // دفعة بريق زمردية ناعمة عند النقر
    for (let i = 0; i < 4; i++) {
      this.spawnParticle(this.targetX, this.targetY, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, true);
    }
  },

  onMouseUp() {
    this.isClicking = false;
    if (!this.container) return;
    this.container.classList.remove('state-clicking');
  },

  onMouseOver(e) {
    if (!this.container) return;
    const target = e.target;

    // فحص وضع قراءة الآيات
    const isAyah = target.closest('.mushaf-ayah, .ayah-text, .quran-reader-text, p.quran-ayah');
    if (isAyah) {
      this.container.classList.add('state-reading');
      this.container.classList.remove('state-hover');
      return;
    }

    // فحص العناصر التفاعلية
    const isClickable = target.closest(
      'a, button, [role="button"], [data-target], .clickable, .btn, ' +
      '.prayer-card, .adhkar-card, .surah-card, .tasbeeh-circle, ' +
      '.btn-header-pill, .btn-header-icon, .btn-color-preset, ' +
      'input, select, label, .switch-toggle, .mobile-nav-link'
    );

    if (isClickable) {
      this.isHovering = true;
      this.container.classList.add('state-hover');
      this.container.classList.remove('state-reading');
    }
  },

  onMouseOut(e) {
    if (!this.container) return;
    const target = e.target;
    const related = e.relatedTarget;

    const wasClickable = target.closest(
      'a, button, [role="button"], [data-target], .clickable, .btn, ' +
      '.prayer-card, .adhkar-card, .surah-card, .tasbeeh-circle, ' +
      '.btn-header-pill, .btn-header-icon, .btn-color-preset, ' +
      'input, select, label, .switch-toggle, .mobile-nav-link'
    );

    const willBeClickable = related && related.closest(
      'a, button, [role="button"], [data-target], .clickable, .btn, ' +
      '.prayer-card, .adhkar-card, .surah-card, .tasbeeh-circle, ' +
      '.btn-header-pill, .btn-header-icon, .btn-color-preset, ' +
      'input, select, label, .switch-toggle, .mobile-nav-link'
    );

    if (wasClickable && !willBeClickable) {
      this.isHovering = false;
      this.container.classList.remove('state-hover');
    }

    const wasAyah = target.closest('.mushaf-ayah, .ayah-text, .quran-reader-text, p.quran-ayah');
    const willBeAyah = related && related.closest('.mushaf-ayah, .ayah-text, .quran-reader-text, p.quran-ayah');
    if (wasAyah && !willBeAyah) {
      this.container.classList.remove('state-reading');
    }
  },

  spawnParticle(x, y, vx, vy, isBurst = false) {
    const colorPrefix = this.particleColors[Math.floor(Math.random() * this.particleColors.length)];
    const size = isBurst ? Math.random() * 2.8 + 1.8 : Math.random() * 2.4 + 1.2;
    const life = 1;
    const decay = isBurst ? Math.random() * 0.035 + 0.025 : Math.random() * 0.03 + 0.02;

    this.particles.push({
      x: x + (Math.random() - 0.5) * 8,
      y: y + (Math.random() - 0.5) * 8,
      vx: (vx * 0.12) + (Math.random() - 0.5) * 0.8,
      vy: (vy * 0.12) + (Math.random() - 0.5) * 0.8 - 0.2, // تطفو قليلاً للأعلى
      size,
      alpha: 0.9,
      decay,
      colorPrefix
    });
  },

  startLoop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    const loop = () => {
      this.render();
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  },

  render() {
    if (!this.isVisible || !this.isEnabled) return;

    // حساب التكبير/التصغير التفاعلي للسلاسة الفائقة
    let ringScale = 1;
    let dotScale = 1;
    if (this.isClicking) {
      ringScale = 0.85;
      dotScale = 0.90;
    } else if (this.isHovering) {
      ringScale = 1.45;
      dotScale = 1.15;
    }

    // 1. تحديث موضع السهم الفوري (0ms latency) مع محاذاة دقيقة لرأس السهم
    this.dotX = this.targetX;
    this.dotY = this.targetY;
    if (this.dot) {
      // إزاحة خفيفة لتطابق رأس السهم تماماً مع موضع الماوس الفعلي
      this.dot.style.transform = `translate3d(${this.dotX - 1.75}px, ${this.dotY - 1.75}px, 0) scale(${dotScale})`;
    }

    // 2. تحديث موضع هالة النور بالـ Lerp السلس الانسيابي
    this.ringX += (this.targetX - this.ringX) * this.lerpFactor;
    this.ringY += (this.targetY - this.ringY) * this.lerpFactor;
    if (this.ring) {
      this.ring.style.transform = `translate3d(${this.ringX}px, ${this.ringY}px, 0) translate(-50%, -50%) scale(${ringScale})`;
    }

    // 3. ريندر ذرات النور على الكانفاس
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        p.size *= 0.97;

        if (p.alpha <= 0.02 || p.size <= 0.3) {
          this.particles.splice(i, 1);
          continue;
        }

        // رسم ذرة النور المشعة
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = `${p.colorPrefix}${p.alpha})`;
        this.ctx.shadowBlur = 6;
        this.ctx.shadowColor = `${p.colorPrefix}0.7)`;
        this.ctx.fill();
      }
    }
  },

  show() {
    this.isVisible = true;
    if (this.container) {
      this.container.classList.remove('hidden');
    }
  },

  hide() {
    this.isVisible = false;
    if (this.container) {
      this.container.classList.add('hidden');
    }
  },

  toggle(enable) {
    this.isEnabled = !!enable;
    if (this.isEnabled) {
      document.body.classList.add('noor-custom-cursor-enabled');
      if (this.container) this.container.style.display = 'block';
      this.show();
    } else {
      document.body.classList.remove('noor-custom-cursor-enabled');
      if (this.container) this.container.style.display = 'none';
      this.hide();
    }
  }
};

window.NoorCursor = NoorCursor;

// تهيئة المؤشر تلقائياً بعد اكتمال تحميل الـ DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => NoorCursor.init());
} else {
  NoorCursor.init();
}
