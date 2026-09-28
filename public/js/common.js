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
    function updateClock() {
      var now = new Date();
      var hours = String(now.getHours()).padStart(2, '0');
      var minutes = String(now.getMinutes()).padStart(2, '0');
      var seconds = String(now.getSeconds()).padStart(2, '0');
      var timeEl = document.getElementById('current-time');
      if (timeEl) {
        timeEl.textContent = hours + ':' + minutes + ':' + seconds;
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

  // DOMContentLoaded で初期化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initTheme();
      initHamburger();
      initYear();
      initClock();
      initScrollToBottom();
    });
  } else {
    initTheme();
    initHamburger();
    initYear();
    initClock();
    initScrollToBottom();
  }
})();
