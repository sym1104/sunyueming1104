/**
 * 姓名：孙跃铭 | 学号：24001011104 | 时间：2026-11-19 | 大模型：豆包大模型（Doubao）
 * 文件说明：首页 canvas 背景动画（粒子网络），带鼠标轻微交互与响应式适配。
 */
(function () {
  'use strict';

  var SUN_canvas = document.getElementById('SUN_heroCanvas');
  if (!SUN_canvas) {
    console.error('[TechScope] 未找到 hero canvas，背景动画跳过');
    return;
  }

  var SUN_ctx = SUN_canvas.getContext('2d');
  var SUN_host = SUN_canvas.parentElement;
  var SUN_width = 0;
  var SUN_height = 0;
  var SUN_dpr = 1;
  var SUN_particles = [];
  var SUN_rafId = 0;
  var SUN_mouse = { x: -9999, y: -9999, active: false };
  var SUN_reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 连接阈值：两点间距小于该值时连线，距离越近越亮
  var SUN_LINK_DIST = 132;

  /**
   * 根据画布尺寸生成粒子。屏幕越大粒子越多，最少 26 个，最多 78 个。
   */
  function SUN_buildParticles() {
    var SUN_area = SUN_width * SUN_height;
    var SUN_count = Math.round(Math.min(78, Math.max(26, SUN_area / 16000)));
    SUN_particles = [];

    for (var SUN_i = 0; SUN_i < SUN_count; SUN_i++) {
      SUN_particles.push({
        SUN_x: Math.random() * SUN_width,
        SUN_y: Math.random() * SUN_height,
        SUN_vx: (Math.random() - 0.5) * 0.32,
        SUN_vy: (Math.random() - 0.5) * 0.32,
        SUN_r: Math.random() * 1.4 + 0.7,
        SUN_teal: Math.random() > 0.72
      });
    }
  }

  /**
   * 重新计算画布尺寸（含高 DPR 适配），并重建粒子。
   */
  function SUN_resize() {
    var SUN_rect = SUN_host.getBoundingClientRect();
    SUN_dpr = Math.min(window.devicePixelRatio || 1, 2);
    SUN_width = SUN_rect.width;
    SUN_height = SUN_rect.height;

    SUN_canvas.width = Math.round(SUN_width * SUN_dpr);
    SUN_canvas.height = Math.round(SUN_height * SUN_dpr);
    SUN_ctx.setTransform(SUN_dpr, 0, 0, SUN_dpr, 0, 0);

    SUN_buildParticles();
    if (SUN_reduced) {
      SUN_paint();
    }
  }

  /**
   * 绘制一帧：先画连线，再画粒子。
   */
  function SUN_paint() {
    SUN_ctx.clearRect(0, 0, SUN_width, SUN_height);

    // 远距离细网格，给深色背景一点层次
    SUN_ctx.save();
    SUN_ctx.strokeStyle = 'rgba(148, 174, 205, 0.06)';
    SUN_ctx.lineWidth = 1;
    var SUN_step = 72;
    for (var SUN_gx = 0; SUN_gx < SUN_width; SUN_gx += SUN_step) {
      SUN_ctx.beginPath();
      SUN_ctx.moveTo(SUN_gx, 0);
      SUN_ctx.lineTo(SUN_gx, SUN_height);
      SUN_ctx.stroke();
    }
    for (var SUN_gy = 0; SUN_gy < SUN_height; SUN_gy += SUN_step) {
      SUN_ctx.beginPath();
      SUN_ctx.moveTo(0, SUN_gy);
      SUN_ctx.lineTo(SUN_width, SUN_gy);
      SUN_ctx.stroke();
    }
    SUN_ctx.restore();

    // 粒子之间的连线
    for (var SUN_i = 0; SUN_i < SUN_particles.length; SUN_i++) {
      var SUN_a = SUN_particles[SUN_i];
      for (var SUN_j = SUN_i + 1; SUN_j < SUN_particles.length; SUN_j++) {
        var SUN_b = SUN_particles[SUN_j];
        var SUN_dx = SUN_a.SUN_x - SUN_b.SUN_x;
        var SUN_dy = SUN_a.SUN_y - SUN_b.SUN_y;
        var SUN_dist = Math.sqrt(SUN_dx * SUN_dx + SUN_dy * SUN_dy);
        if (SUN_dist > SUN_LINK_DIST) continue;

        var SUN_alpha = (1 - SUN_dist / SUN_LINK_DIST) * 0.34;
        SUN_ctx.beginPath();
        SUN_ctx.strokeStyle = 'rgba(63, 216, 191, ' + SUN_alpha.toFixed(3) + ')';
        SUN_ctx.lineWidth = 1;
        SUN_ctx.moveTo(SUN_a.SUN_x, SUN_a.SUN_y);
        SUN_ctx.lineTo(SUN_b.SUN_x, SUN_b.SUN_y);
        SUN_ctx.stroke();
      }
    }

    // 粒子本体
    for (var SUN_k = 0; SUN_k < SUN_particles.length; SUN_k++) {
      var SUN_p = SUN_particles[SUN_k];
      SUN_ctx.beginPath();
      SUN_ctx.arc(SUN_p.SUN_x, SUN_p.SUN_y, SUN_p.SUN_r, 0, Math.PI * 2);
      SUN_ctx.fillStyle = SUN_p.SUN_teal
        ? 'rgba(63, 216, 191, 0.68)'
        : 'rgba(232, 238, 246, 0.42)';
      SUN_ctx.fill();
    }
  }

  /**
   * 更新粒子位置：边界回弹 + 鼠标轻微排斥。
   */
  function SUN_step() {
    for (var SUN_i = 0; SUN_i < SUN_particles.length; SUN_i++) {
      var SUN_p = SUN_particles[SUN_i];

      SUN_p.SUN_x += SUN_p.SUN_vx;
      SUN_p.SUN_y += SUN_p.SUN_vy;

      if (SUN_p.SUN_x < 0 || SUN_p.SUN_x > SUN_width) SUN_p.SUN_vx *= -1;
      if (SUN_p.SUN_y < 0 || SUN_p.SUN_y > SUN_height) SUN_p.SUN_vy *= -1;

      // 鼠标半径 110px 内的粒子被轻轻推开，避免遮住文字
      if (SUN_mouse.active) {
        var SUN_mx = SUN_p.SUN_x - SUN_mouse.x;
        var SUN_my = SUN_p.SUN_y - SUN_mouse.y;
        var SUN_len = Math.sqrt(SUN_mx * SUN_mx + SUN_my * SUN_my);
        if (SUN_len > 0.001 && SUN_len < 110) {
          var SUN_force = (110 - SUN_len) / 110 * 0.9;
          SUN_p.SUN_x += (SUN_mx / SUN_len) * SUN_force;
          SUN_p.SUN_y += (SUN_my / SUN_len) * SUN_force;
        }
      }
    }
  }

  /**
   * 主循环
   */
  function SUN_loop() {
    SUN_step();
    SUN_paint();
    SUN_rafId = window.requestAnimationFrame(SUN_loop);
  }

  // ---------- 事件绑定 ----------
  var SUN_resizeTimer = 0;
  window.addEventListener('resize', function () {
    window.clearTimeout(SUN_resizeTimer);
    SUN_resizeTimer = window.setTimeout(function () {
      SUN_resize();
      console.log('[TechScope] 画布已按窗口尺寸重排：' + Math.round(SUN_width) + '×' + Math.round(SUN_height));
    }, 220);
  });

  window.addEventListener('mousemove', function (SUN_event) {
    var SUN_rect = SUN_canvas.getBoundingClientRect();
    SUN_mouse.x = SUN_event.clientX - SUN_rect.left;
    SUN_mouse.y = SUN_event.clientY - SUN_rect.top;
    SUN_mouse.active =
      SUN_mouse.x >= 0 && SUN_mouse.x <= SUN_rect.width &&
      SUN_mouse.y >= 0 && SUN_mouse.y <= SUN_rect.height;
  });

  window.addEventListener('mouseout', function () {
    SUN_mouse.active = false;
  });

  // 页面隐藏时暂停动画，回到前台再恢复，节省资源
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      window.cancelAnimationFrame(SUN_rafId);
      SUN_rafId = 0;
    } else if (!SUN_rafId && !SUN_reduced) {
      SUN_rafId = window.requestAnimationFrame(SUN_loop);
    }
  });

  // ---------- 启动 ----------
  SUN_resize();
  if (SUN_reduced) {
    console.log('[TechScope] 检测到 reduced-motion，canvas 使用静态绘制');
  } else {
    SUN_rafId = window.requestAnimationFrame(SUN_loop);
  }

  console.log('[TechScope] 首页已加载 · 姓名：孙跃铭 · 学号：24001011104');
})();
