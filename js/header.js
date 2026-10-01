// header.js - POP制作所 共通ヘッダー読み込み・初期化スクリプト

(function () {
  'use strict';

  var clockTimer = null;

  // 1. 現在ページのアクティブ表示設定
  function updateActiveNav() {
    var path = window.location.pathname;
    var filename = path.substring(path.lastIndexOf('/') + 1);
    if (!filename || filename === '' || filename === '/') {
      filename = 'index.html';
    }

    var navLinks = document.querySelectorAll('.site-nav .nav-link');
    navLinks.forEach(function (link) {
      link.classList.remove('active');
      var href = link.getAttribute('href');
      if (href && href === filename) {
        link.classList.add('active');
      }
    });

    // お問い合わせページの場合のモバイルCTA対応
    var mobileCta = document.querySelector('.mobile-cta-btn');
    if (mobileCta) {
      if (filename === 'contact.html') {
        mobileCta.classList.add('active');
      } else {
        mobileCta.classList.remove('active');
      }
    }
  }

  // 2. テーマ切り替え機能
  function initHeaderTheme() {
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
      // 既存リスナーの重複登録防止フラグ
      if (!themeToggle.dataset.hasThemeListener) {
        themeToggle.dataset.hasThemeListener = 'true';
        themeToggle.addEventListener('click', function () {
          var activeTheme = document.documentElement.getAttribute('data-theme');
          var nextTheme = activeTheme === 'dark' ? 'light' : 'dark';
          updateThemeUI(nextTheme);
        });
      }
    }
  }

  // 3. 時計表示機能
  function initHeaderClock() {
    var timeEl = document.getElementById('current-time');
    if (!timeEl) return;

    function updateClock() {
      var now = new Date();
      var hours = String(now.getHours()).padStart(2, '0');
      var minutes = String(now.getMinutes()).padStart(2, '0');
      var seconds = String(now.getSeconds()).padStart(2, '0');
      if (timeEl) {
        timeEl.textContent = hours + ':' + minutes + ':' + seconds;
      }
    }

    if (clockTimer) {
      clearInterval(clockTimer);
    }
    updateClock();
    clockTimer = setInterval(updateClock, 1000);
  }

  // 4. ページ最下部へ移動ボタン機能
  function initHeaderScrollToBottom() {
    var scrollToBottomBtn = document.getElementById('scroll-to-bottom');
    if (scrollToBottomBtn && !scrollToBottomBtn.dataset.hasScrollListener) {
      scrollToBottomBtn.dataset.hasScrollListener = 'true';
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

  // 5. ハンバーガーメニュー (モバイル対応)
  function initHeaderHamburger() {
    var hamburgerBtn = document.getElementById('hamburger-btn');
    var siteNav = document.getElementById('site-nav');

    if (hamburgerBtn && siteNav && !hamburgerBtn.dataset.hasHamburgerListener) {
      hamburgerBtn.dataset.hasHamburgerListener = 'true';
      hamburgerBtn.addEventListener('click', function () {
        var isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
        hamburgerBtn.setAttribute('aria-expanded', !isExpanded);
        siteNav.classList.toggle('open');
      });

      var navLinks = siteNav.querySelectorAll('.nav-link, .btn-cta');
      navLinks.forEach(function (link) {
        link.addEventListener('click', function () {
          hamburgerBtn.setAttribute('aria-expanded', 'false');
          siteNav.classList.remove('open');
        });
      });
    }
  }

  // 6. 共通ヘッダー挿入後の全初期化処理
  function initHeaderComponents() {
    updateActiveNav();
    initHeaderTheme();
    initHeaderClock();
    initHeaderScrollToBottom();
    initHeaderHamburger();
  }

  // 7. 共通ヘッダーHTMLの読み込み
  function loadCommonHeader() {
    var placeholder = document.getElementById('header-placeholder');
    if (!placeholder) {
      // プレースホルダーがなければ既存の #site-header があるか確認
      var existingHeader = document.getElementById('site-header');
      if (existingHeader) {
        initHeaderComponents();
      }
      return;
    }

    fetch('components/header.html')
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Failed to load header component: ' + response.status);
        }
        return response.text();
      })
      .then(function (html) {
        placeholder.outerHTML = html;
        initHeaderComponents();
      })
      .catch(function (error) {
        console.error('Error loading common header:', error);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCommonHeader);
  } else {
    loadCommonHeader();
  }
})();
