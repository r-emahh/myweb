// analytics.js - アクセス解析（Googleアナリティクス / gtag.js）管理スクリプト

(function () {
  'use strict';

  // Googleアナリティクス測定ID (必要に応じて本番の測定IDに変更可能)
  var GA_MEASUREMENT_ID = window.GA_MEASUREMENT_ID || 'G-POPSEISAKU01';

  // dataLayerの初期化
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    page_title: document.title,
    page_location: window.location.href,
    page_path: window.location.pathname
  });

  // 本番環境（HTTPSの公開ドメイン）でのみリモートのgtag.jsを読み込む
  var isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (!isLocalhost && GA_MEASUREMENT_ID && GA_MEASUREMENT_ID.startsWith('G-')) {
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_MEASUREMENT_ID);
    document.head.appendChild(script);
  }

  // CTAクリック等のカスタムイベントトラッキングヘルパー
  document.addEventListener('DOMContentLoaded', function () {
    // お問い合わせCTAボタンのクリック計測
    var ctaButtons = document.querySelectorAll('.btn-cta, .contact-submit-btn, #header-cta-btn');
    ctaButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        gtag('event', 'cta_click', {
          event_category: 'engagement',
          event_label: btn.textContent.trim(),
          page_location: window.location.pathname
        });
      });
    });

    // フォーム送信成功時のコンバージョン計測
    var submitBtn = document.getElementById('btn-submit-form');
    if (submitBtn) {
      submitBtn.addEventListener('click', function () {
        gtag('event', 'generate_lead', {
          event_category: 'contact',
          event_label: 'form_submission_success'
        });
      });
    }
  });
})();
