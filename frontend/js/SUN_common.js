/**
 * 姓名：孙跃铭 | 学号：24001011104 | 时间：2026-11-19 | 大模型：豆包大模型（Doubao）
 * 文件说明：内页公共脚本。提供接口地址拼接与“复制”按钮的通用能力。
 */
(function () {
  'use strict';

  // 统一从这里拼接当前环境下完整的接口地址
  window.SUN_api = {
    SUN_base: window.location.origin,
    SUN_url: function (SUN_path) {
      return window.location.origin + SUN_path;
    }
  };

  /**
   * 复制文本到剪贴板，失败时退回临时 textarea 方案
   * @param {string} SUN_text 待复制文本
   * @param {HTMLElement} SUN_btn 触发复制的按钮
   */
  function SUN_copyText(SUN_text, SUN_btn) {
    var SUN_original = SUN_btn.getAttribute('data-SUN-label') || SUN_btn.textContent;

    function SUN_done() {
      SUN_btn.setAttribute('data-SUN-label', SUN_original);
      SUN_btn.textContent = '已复制';
      window.setTimeout(function () {
        SUN_btn.textContent = SUN_original;
      }, 1600);
    }

    function SUN_fallback() {
      var SUN_area = document.createElement('textarea');
      SUN_area.value = SUN_text;
      SUN_area.style.position = 'fixed';
      SUN_area.style.opacity = '0';
      document.body.appendChild(SUN_area);
      SUN_area.select();
      try {
        document.execCommand('copy');
        SUN_done();
      } catch (SUN_err) {
        console.error('[TechScope] 复制失败', SUN_err);
        window.alert('复制失败，请手动选择文本复制');
      }
      document.body.removeChild(SUN_area);
    }

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(SUN_text).then(SUN_done).catch(function (SUN_err) {
        console.error('[TechScope] clipboard 写入失败，改用兼容方案', SUN_err);
        SUN_fallback();
      });
    } else {
      SUN_fallback();
    }
  }

  // 为所有带 data-SUN-copy 的按钮绑定复制逻辑
  document.addEventListener('DOMContentLoaded', function () {
    var SUN_buttons = document.querySelectorAll('[data-SUN-copy]');
    Array.prototype.forEach.call(SUN_buttons, function (SUN_btn) {
      SUN_btn.addEventListener('click', function () {
        SUN_copyText(SUN_btn.getAttribute('data-SUN-copy') || '', SUN_btn);
      });
    });
  });
})();
