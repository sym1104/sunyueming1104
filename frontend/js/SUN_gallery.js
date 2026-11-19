/**
 * 姓名：孙跃铭 | 学号：24001011104 | 时间：2026-11-19 | 大模型：豆包大模型（Doubao）
 * 文件说明：图文列表页逻辑。调用 GET /api/gallery，渲染图文卡片与原始 JSON。
 */
(function () {
  'use strict';

  var SUN_grid = document.getElementById('SUN_galleryGrid');
  var SUN_countLabel = document.getElementById('SUN_galleryCount');
  var SUN_rawBox = document.getElementById('SUN_galleryRaw');
  var SUN_refreshBtn = document.getElementById('SUN_galleryRefresh');
  var SUN_apiUrlLabel = document.getElementById('SUN_galleryApiUrl');

  if (!SUN_grid) {
    console.error('[TechScope] 未找到图文列表容器');
    return;
  }

  var SUN_apiPath = '/api/gallery';
  var SUN_apiFull = window.SUN_api ? window.SUN_api.SUN_url(SUN_apiPath) : SUN_apiPath;
  var SUN_allGallery = [];

  if (SUN_apiUrlLabel) SUN_apiUrlLabel.textContent = SUN_apiFull;
  var SUN_copyBtn = document.querySelector('[data-SUN-copy]');
  if (SUN_copyBtn) SUN_copyBtn.setAttribute('data-SUN-copy', SUN_apiFull);

  function SUN_el(SUN_tag, SUN_className, SUN_text) {
    var SUN_node = document.createElement(SUN_tag);
    if (SUN_className) SUN_node.className = SUN_className;
    if (SUN_text !== undefined && SUN_text !== null) SUN_node.textContent = SUN_text;
    return SUN_node;
  }

  /**
   * 渲染图文卡片
   */
  function SUN_renderGallery() {
    SUN_grid.innerHTML = '';

    if (SUN_countLabel) {
      SUN_countLabel.textContent = '接口返回 ' + SUN_allGallery.length + ' 条';
    }

    if (!SUN_allGallery.length) {
      SUN_grid.appendChild(SUN_el('div', 'SUN_empty', '接口暂无图文数据。'));
      return;
    }

    var SUN_fragment = document.createDocumentFragment();

    SUN_allGallery.forEach(function (SUN_item) {
      var SUN_card = SUN_el('article', 'SUN_gallery-card');

      var SUN_media = SUN_el('div', 'SUN_gallery-media');
      var SUN_img = document.createElement('img');
      SUN_img.src = SUN_item.SUN_image || '';
      SUN_img.alt = SUN_item.SUN_title || '图文封面';
      SUN_img.decoding = 'async';
      // 图片缺失时给出一块可见的占位，避免破图
      SUN_img.addEventListener('error', function () {
        SUN_media.classList.add('SUN_gallery-media-fallback');
        SUN_img.remove();
        console.error('[TechScope] 图片加载失败：' + SUN_img.src);
      });
      SUN_media.appendChild(SUN_img);
      SUN_media.appendChild(SUN_el('span', 'SUN_gallery-tagline', SUN_item.SUN_tag || '未分类'));

      var SUN_body = SUN_el('div', 'SUN_gallery-body');
      SUN_body.appendChild(SUN_el('h2', 'SUN_gallery-title', SUN_item.SUN_title || '（无标题）'));
      SUN_body.appendChild(SUN_el('p', 'SUN_gallery-intro', SUN_item.SUN_intro || ''));
      SUN_body.appendChild(SUN_el('span', 'SUN_gallery-time', SUN_item.SUN_create_time || ''));

      SUN_card.appendChild(SUN_media);
      SUN_card.appendChild(SUN_body);
      SUN_fragment.appendChild(SUN_card);
    });

    SUN_grid.appendChild(SUN_fragment);
  }

  /**
   * 拉取图文数据
   */
  function SUN_loadGallery() {
    SUN_refreshBtn.disabled = true;
    SUN_grid.innerHTML = '';
    SUN_grid.appendChild(SUN_el('div', 'SUN_empty', '正在从接口读取数据……'));

    fetch(SUN_apiFull)
      .then(function (SUN_response) {
        return SUN_response.json();
      })
      .then(function (SUN_json) {
        SUN_rawBox.textContent = JSON.stringify(SUN_json, null, 2);

        if (SUN_json.code !== 0) {
          SUN_grid.innerHTML = '';
          SUN_grid.appendChild(
            SUN_el('div', 'SUN_empty', '接口返回错误：' + (SUN_json.msg || '未知错误'))
          );
          if (SUN_countLabel) SUN_countLabel.textContent = '加载失败';
          console.error('[TechScope] 图文接口返回失败', SUN_json);
          return;
        }

        SUN_allGallery = (SUN_json.data && SUN_json.data.SUN_list) || [];
        console.log('[TechScope] 图文接口返回数据', SUN_json.data);
        SUN_renderGallery();
      })
      .catch(function (SUN_err) {
        SUN_grid.innerHTML = '';
        SUN_grid.appendChild(
          SUN_el('div', 'SUN_empty', '请求失败：' + SUN_apiFull + '（请确认后端已启动）')
        );
        if (SUN_countLabel) SUN_countLabel.textContent = '请求失败';
        SUN_rawBox.textContent = String(SUN_err);
        console.error('[TechScope] 图文列表请求异常', SUN_err);
      })
      .finally(function () {
        SUN_refreshBtn.disabled = false;
      });
  }

  SUN_refreshBtn.addEventListener('click', function () {
    SUN_loadGallery();
  });

  SUN_loadGallery();
  console.log('[TechScope] 图文页就绪，接口：' + SUN_apiFull);
})();
