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

  // DOMContentLoaded で初期化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initTheme();
      initHamburger();
      initYear();
    });
  } else {
    initTheme();
    initHamburger();
    initYear();
  }
})();
