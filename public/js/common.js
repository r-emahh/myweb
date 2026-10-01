// common.js - POP制作所 共通スクリプト

(function () {
  'use strict';

  // 1. テーマ切り替え機能
  function initTheme() {
    var themeToggle = document.getElementById('theme-toggle');
    var themeIcon = document.getElementById('theme-icon');
    var themeText = document.getElementById('theme-text');

    function updateThemeUI(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      try {
        localStorage.setItem('theme', theme);
      } catch (e) {}

      if (themeIcon && themeText) {
        if (theme === 'dark') {
          themeIcon.textContent = '🌙';
          themeText.textContent = 'Dark';
        } else {
          themeIcon.textContent = '☀️';
          themeText.textContent = 'Light';
        }
      }
    }

    var currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    updateThemeUI(currentTheme);

    if (themeToggle) {
      themeToggle.addEventListener('click', function () {
        var activeTheme = document.documentElement.getAttribute('data-theme');
        var nextTheme = activeTheme === 'dark' ? 'light' : 'dark';
        updateThemeUI(nextTheme);
      });
    }
  }

  // 2. ハンバーガーメニュー (モバイル対応)
  function initHamburger() {
    var hamburgerBtn = document.getElementById('hamburger-btn');
    var siteNav = document.getElementById('site-nav');

    if (hamburgerBtn && siteNav) {
      hamburgerBtn.addEventListener('click', function () {
        var isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
        hamburgerBtn.setAttribute('aria-expanded', !isExpanded);
        siteNav.classList.toggle('open');
      });

      // ナビゲーション内リンクをクリックしたときにメニューを閉じる
      var navLinks = siteNav.querySelectorAll('.nav-link, .btn-cta');
      navLinks.forEach(function (link) {
        link.addEventListener('click', function () {
          hamburgerBtn.setAttribute('aria-expanded', 'false');
          siteNav.classList.remove('open');
        });
      });
    }
  }

  // 3. フッター現在年更新
  function initYear() {
    var yearEl = document.getElementById('current-year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  // 4. 時計表示の更新処理
  function initClock() {
    var timeEl = document.getElementById('current-time');
    if (!timeEl) return;

    function updateClock() {
      var now = new Date();
      var hours = String(now.getHours()).padStart(2, '0');
      var minutes = String(now.getMinutes()).padStart(2, '0');
      var seconds = String(now.getSeconds()).padStart(2, '0');
      var el = document.getElementById('current-time');
      if (el) {
        el.textContent = hours + ':' + minutes + ':' + seconds;
      }
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  // 5. ページ最下部へ移動ボタンの制御
  function initScrollToBottom() {
    var scrollToBottomBtn = document.getElementById('scroll-to-bottom');
    if (scrollToBottomBtn) {
      scrollToBottomBtn.addEventListener('click', function (e) {
        e.preventDefault();
        var isReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: isReduced ? 'auto' : 'smooth'
        });
      });
    }
  }

  // 6. 浮遊パーティクル／ダストエフェクト (雪が舞う背景アニメーション)
  function initParticles() {
    var canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    var width = 0;
    var height = 0;
    var particles = [];
    var maxParticles = 45;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      maxParticles = width < 640 ? 25 : 45;
      while (particles.length > maxParticles) {
        particles.pop();
      }
    }
    window.addEventListener('resize', resize, { passive: true });
    resize();

    function createParticle(initial) {
      return {
        x: Math.random() * width,
        y: initial ? Math.random() * height : height + 10,
        radius: Math.random() * 1.5 + 0.7,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -(Math.random() * 0.35 + 0.15),
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.015 + 0.008,
        wobbleRadius: Math.random() * 0.3 + 0.1,
        alpha: initial ? (Math.random() * 0.45 + 0.1) : 0,
        targetAlpha: Math.random() * 0.45 + 0.25,
        fadeIn: true,
        fadeSpeed: Math.random() * 0.006 + 0.003
      };
    }

    for (var i = 0; i < maxParticles; i++) {
      particles.push(createParticle(true));
    }

    var animId = null;
    var isRunning = false;

    function animate() {
      ctx.clearRect(0, 0, width, height);

      var isDark = document.documentElement.getAttribute('data-theme') !== 'light';

      for (var j = 0; j < particles.length; j++) {
        var p = particles[j];

        p.wobble += p.wobbleSpeed;
        p.x += p.vx + Math.sin(p.wobble) * p.wobbleRadius;
        p.y += p.vy;

        if (p.fadeIn) {
          p.alpha += p.fadeSpeed;
          if (p.alpha >= p.targetAlpha) {
            p.fadeIn = false;
          }
        } else {
          if (p.y < height * 0.25) {
            p.alpha -= p.fadeSpeed * 1.5;
          }
        }

        if (p.y < -10 || p.x < -20 || p.x > width + 20 || p.alpha <= 0) {
          particles[j] = createParticle(false);
          continue;
        }

        var color = isDark
          ? 'rgba(216, 226, 255, ' + Math.max(0, p.alpha) + ')'
          : 'rgba(99, 102, 241, ' + Math.max(0, p.alpha * 0.6) + ')';

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }

      if (isRunning && !document.hidden && !prefersReducedMotion) {
        animId = requestAnimationFrame(animate);
      } else {
        isRunning = false;
      }
    }

    function start() {
      if (!isRunning && !document.hidden && !prefersReducedMotion) {
        isRunning = true;
        animId = requestAnimationFrame(animate);
      }
    }

    function stop() {
      if (isRunning) {
        isRunning = false;
        if (animId) {
          cancelAnimationFrame(animId);
          animId = null;
        }
      }
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    });

    start();
  }

  // DOMContentLoaded で初期化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initTheme();
      initHamburger();
      initYear();
      initClock();
      initScrollToBottom();
      initParticles();
    });
  } else {
    initTheme();
    initHamburger();
    initYear();
    initClock();
    initScrollToBottom();
    initParticles();
  }
})();
