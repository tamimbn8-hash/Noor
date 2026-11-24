/**
 * نُور القرآن | NOOR AL-QURAN
 * atmosphere.js - محرك الأجواء الروحانية التفاعلي (السماء المرصعة بالنجوم، المطر الحي، والهلال)
 */

const Atmosphere = {
  canvas: null,
  ctx: null,
  width: 0,
  height: 0,
  mode: 'both', // 'both' | 'stars' | 'rain' | 'clear'
  stars: [],
  raindrops: [],
  splashes: [],
  animationFrameId: null,
  isReducedMotion: false,
  isPaused: false,

  init() {
    this.mode = localStorage.getItem('noor_ambiance_mode') || 'both';
    this.checkReducedMotion();
    this.createCanvas();
    this.initParticles();
    this.bindEvents();
    this.syncButtonStates();
    this.startLoop();
  },

  checkReducedMotion() {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.isReducedMotion = mq.matches;
    mq.addEventListener('change', (e) => {
      this.isReducedMotion = e.matches;
      if (this.isReducedMotion) {
        this.stopLoop();
        this.drawStatic();
      } else {
        this.startLoop();
      }
    });
  },

  createCanvas() {
    let cvs = document.getElementById('sky-canvas');
    if (!cvs) {
      cvs = document.createElement('canvas');
      cvs.id = 'sky-canvas';
      cvs.className = 'sky-canvas';
      document.body.prepend(cvs);
    }
    this.canvas = cvs;
    this.ctx = cvs.getContext('2d', { alpha: true });
    this.resize();
  },

  resize() {
    if (!this.canvas) return;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.initParticles();
  },

  initParticles() {
    const isMobile = this.width < 768;
    
    // 1. النجوم - كثافة غنية، أحجام متنوعة، ولمعان حقيقي، مع تدرج سرعات (Parallax)
    const starCount = isMobile ? 65 : 150;
    this.stars = [];
    for (let i = 0; i < starCount; i++) {
      const tier = Math.random();
      let size, speedY, baseAlpha, isBright;
      
      if (tier < 0.45) {
        // نجوم بعيدة صغيرة وهادئة
        size = Math.random() * 0.7 + 0.8;
        speedY = Math.random() * 0.12 + 0.08;
        baseAlpha = Math.random() * 0.35 + 0.3;
        isBright = false;
      } else if (tier < 0.82) {
        // نجوم متوسطة ذات بريق أوضح
        size = Math.random() * 1.1 + 1.4;
        speedY = Math.random() * 0.18 + 0.14;
        baseAlpha = Math.random() * 0.3 + 0.6;
        isBright = false;
      } else {
        // نجوم أمامية مضيئة وساطعة مع هالة ضوئية خفيفة
        size = Math.random() * 1.4 + 2.4;
        speedY = Math.random() * 0.24 + 0.2;
        baseAlpha = Math.random() * 0.2 + 0.8;
        isBright = true;
      }

      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size,
        speedY,
        speedX: (Math.random() - 0.5) * 0.07,
        baseAlpha,
        twinkleSpeed: Math.random() * 0.03 + 0.015,
        twinkleOffset: Math.random() * Math.PI * 2,
        isBright,
        hasCross: isBright && Math.random() > 0.35
      });
    }

    // 2. قطرات المطر - هادئة ولطيفة وروحانية (رذاذ ومطر خفيف يبعث على السكينة)
    const rainCount = isMobile ? 28 : 65;
    this.raindrops = [];
    for (let i = 0; i < rainCount; i++) {
      const depth = Math.random();
      let length, speedY, width, alpha;

      if (depth < 0.55) {
        // رذاذ ومطر خفيف جداً بعيد
        length = Math.random() * 8 + 10;
        speedY = Math.random() * 2 + 4.0;
        width = 0.8;
        alpha = Math.random() * 0.10 + 0.10;
      } else if (depth < 0.85) {
        // قطرات متوسطة هادئة
        length = Math.random() * 10 + 14;
        speedY = Math.random() * 2.5 + 5.5;
        width = 1.0;
        alpha = Math.random() * 0.12 + 0.18;
      } else {
        // قطرات أمامية ناعمة ومنسابة بهدوء
        length = Math.random() * 12 + 18;
        speedY = Math.random() * 3 + 7.0;
        width = 1.25;
        alpha = Math.random() * 0.12 + 0.25;
      }

      this.raindrops.push({
        x: Math.random() * (this.width + 120) - 60,
        y: Math.random() * this.height,
        length,
        speedY,
        width,
        alpha,
        slant: 0.10 // ميلان خفيف بانسيابية طبيعية
      });
    }

    this.splashes = [];
  },

  syncButtonStates() {
    document.querySelectorAll('.btn-ambiance-mode').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === this.mode);
    });
  },

  setMode(newMode) {
    this.mode = newMode;
    localStorage.setItem('noor_ambiance_mode', newMode);
    this.syncButtonStates();

    if (this.mode === 'clear') {
      this.clearCanvas();
      if (window.Sound && Sound.isRainPlaying) {
        Sound.stopRainSound(false);
      }
    }
  },

  startLoop() {
    if (this.isReducedMotion) {
      this.drawStatic();
      return;
    }

    const render = (time) => {
      if (!this.isPaused && this.mode !== 'clear') {
        this.updateAndDraw(time);
      }
      this.animationFrameId = requestAnimationFrame(render);
    };

    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = requestAnimationFrame(render);
  },

  stopLoop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  },

  clearCanvas() {
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  },

  updateAndDraw(time) {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.width, this.height);

    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';

    // 0. رسم الهلال الروحاني في سماء الليل (Ethereal Floating Crescent)
    if (isDark && (this.mode === 'stars' || this.mode === 'both')) {
      this.drawCelestialMoon(time);
    }

    // 1. رسم النجوم (حركة بطيئة وانسيابية مع تلألؤ)
    if (this.mode === 'stars' || this.mode === 'both') {
      const starRgb = isDark ? '255, 248, 222' : '205, 160, 45'; // عاجي ذهبي دافئ في الداكن

      for (let i = 0; i < this.stars.length; i++) {
        const s = this.stars[i];
        
        // حركة هبوطية وانزياح طفيف
        s.y += s.speedY;
        s.x += s.speedX;

        // إعادة تدوير النجوم بسلاسة
        if (s.y > this.height + 10) {
          s.y = -10;
          s.x = Math.random() * this.width;
        }
        if (s.x > this.width + 10) s.x = -10;
        if (s.x < -10) s.x = this.width + 10;

        // تلألؤ النجوم بالمنحنى الجيبي
        const twinkle = Math.sin(time * 0.0012 * s.twinkleSpeed * 100 + s.twinkleOffset);
        const currentAlpha = Math.max(0.12, Math.min(1.0, s.baseAlpha + twinkle * 0.35));

        // هالة ضوئية للنجوم المضيئة
        if (s.isBright) {
          const glowGrad = this.ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 3.8);
          glowGrad.addColorStop(0, `rgba(${starRgb}, ${currentAlpha * 0.6})`);
          glowGrad.addColorStop(1, `rgba(${starRgb}, 0)`);
          this.ctx.fillStyle = glowGrad;
          this.ctx.beginPath();
          this.ctx.arc(s.x, s.y, s.size * 3.8, 0, Math.PI * 2);
          this.ctx.fill();
        }

        // مركز النجم
        this.ctx.beginPath();
        this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(${starRgb}, ${currentAlpha})`;
        this.ctx.fill();

        // بريق صليبي خفيف وأنيق عند قمة اللمعان ✨
        if (s.hasCross && currentAlpha > 0.75) {
          const crossLen = s.size * 3.0;
          this.ctx.strokeStyle = `rgba(${starRgb}, ${currentAlpha * 0.45})`;
          this.ctx.lineWidth = 0.85;
          this.ctx.beginPath();
          this.ctx.moveTo(s.x - crossLen, s.y);
          this.ctx.lineTo(s.x + crossLen, s.y);
          this.ctx.moveTo(s.x, s.y - crossLen);
          this.ctx.lineTo(s.x, s.y + crossLen);
          this.ctx.stroke();
        }
      }
    }

    // 2. رسم المطر (قطرات انسيابية واضحة وسريعة بطبقات عمق)
    if (this.mode === 'rain' || this.mode === 'both') {
      const rainBaseColor = isDark ? '215, 245, 240' : '110, 160, 150';
      this.ctx.lineCap = 'round';

      for (let i = 0; i < this.raindrops.length; i++) {
        const r = this.raindrops[i];
        
        r.y += r.speedY;
        r.x += r.speedY * r.slant;

        if (r.y > this.height) {
          // إضافة رذاذ طفيف عند ملامسة الأسفل
          if (Math.random() > 0.65 && this.splashes.length < 25) {
            this.splashes.push({
              x: r.x,
              y: this.height - 4,
              radius: Math.random() * 2.5 + 1,
              alpha: r.alpha * 0.65,
              life: 1.0
            });
          }

          r.y = -r.length - 10;
          r.x = Math.random() * (this.width + 120) - 60;
        }

        this.ctx.lineWidth = r.width;
        this.ctx.strokeStyle = `rgba(${rainBaseColor}, ${r.alpha})`;

        this.ctx.beginPath();
        this.ctx.moveTo(r.x, r.y);
        this.ctx.lineTo(r.x + (r.length * r.slant), r.y + r.length);
        this.ctx.stroke();
      }

      // رسم رذاذ المطر البسيط عند القاع
      for (let i = this.splashes.length - 1; i >= 0; i--) {
        const sp = this.splashes[i];
        sp.radius += 0.35;
        sp.life -= 0.1;
        sp.alpha *= 0.88;

        if (sp.life <= 0 || sp.alpha <= 0.02) {
          this.splashes.splice(i, 1);
          continue;
        }

        this.ctx.beginPath();
        this.ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = `rgba(${rainBaseColor}, ${sp.alpha})`;
        this.ctx.lineWidth = 0.8;
        this.ctx.stroke();
      }
    }
  },

  /**
   * رسم الهلال المضيء في زاوية السماء بهدوء
   */
  drawCelestialMoon(time) {
    const isMobile = this.width < 768;
    const moonX = isMobile ? this.width - 55 : this.width - 110;
    const moonY = 85 + Math.sin(time * 0.0007) * 8; // طفو بطيء انسيابي
    const moonR = isMobile ? 22 : 32;

    // هالة ضوئية دائرية متوهجة حول الهلال
    const halo = this.ctx.createRadialGradient(moonX, moonY, moonR * 0.5, moonX, moonY, moonR * 2.8);
    halo.addColorStop(0, 'rgba(235, 195, 85, 0.22)');
    halo.addColorStop(0.5, 'rgba(197, 155, 39, 0.08)');
    halo.addColorStop(1, 'rgba(197, 155, 39, 0)');

    this.ctx.fillStyle = halo;
    this.ctx.beginPath();
    this.ctx.arc(moonX, moonY, moonR * 2.8, 0, Math.PI * 2);
    this.ctx.fill();

    // رسم الهلال الأنيق
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(255, 245, 210, 0.9)';
    this.ctx.shadowColor = 'rgba(235, 195, 85, 0.6)';
    this.ctx.shadowBlur = 12;
    this.ctx.fill();

    // اقتطاع ظل الكرة لإنتاج شكل هلال إسلامي جميل
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.beginPath();
    this.ctx.arc(moonX - (moonR * 0.55), moonY - (moonR * 0.25), moonR * 0.92, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  },

  drawStatic() {
    this.clearCanvas();
    if (!this.ctx || this.mode === 'clear') return;
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const starRgb = isDark ? '255, 248, 222' : '205, 160, 45';

    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${starRgb}, ${s.baseAlpha * 0.8})`;
      this.ctx.fill();
    }
  },

  bindEvents() {
    window.addEventListener('resize', () => this.resize(), { passive: true });

    document.addEventListener('visibilitychange', () => {
      this.isPaused = document.hidden;
      if (document.hidden && window.Sound && Sound.isRainPlaying) {
        // خفض الصوت تلقائياً عند تصغير التاب
      }
    });

    document.querySelectorAll('.btn-ambiance-mode').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setMode(btn.dataset.mode);
        if (window.Sound) Sound.playUIClick();
      });
    });
  }
};

window.Atmosphere = Atmosphere;
