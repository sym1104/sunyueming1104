/**
 * 姓名：孙跃铭 | 学号：24001011104 | 时间：2026-11-19 | 大模型：豆包大模型（Doubao）
 * 文件说明：科技新闻列表页逻辑。调用 GET /api/news，渲染列表、分类筛选与原始 JSON。
 */
(function () {
  'use strict';

  var SUN_listBox = document.getElementById('SUN_newsList');
  var SUN_toolbar = document.getElementById('SUN_newsToolbar');
  var SUN_countLabel = document.getElementById('SUN_newsCount');
  var SUN_rawBox = document.getElementById('SUN_newsRaw');
  var SUN_refreshBtn = document.getElementById('SUN_newsRefresh');
  var SUN_apiUrlLabel = document.getElementById('SUN_newsApiUrl');

  if (!SUN_listBox) {
    console.error('[TechScope] 未找到新闻列表容器');
    return;
  }

  var SUN_apiPath = '/api/news';
  var SUN_apiFull = window.SUN_api ? window.SUN_api.SUN_url(SUN_apiPath) : SUN_apiPath;
  var SUN_allNews = [];
  var SUN_activeCategory = '全部';

  if (SUN_apiUrlLabel) SUN_apiUrlLabel.textContent = SUN_apiFull;
  var SUN_copyBtn = document.querySelector('[data-SUN-copy]');
  if (SUN_copyBtn) SUN_copyBtn.setAttribute('data-SUN-copy', SUN_apiFull);

  /**
   * 创建节点的小工具，统一走 textContent 避免 XSS
   */
  function SUN_el(SUN_tag, SUN_className, SUN_text) {
    var SUN_node = document.createElement(SUN_tag);
    if (SUN_className) SUN_node.className = SUN_className;
    if (SUN_text !== undefined && SUN_text !== null) SUN_node.textContent = SUN_text;
    return SUN_node;
  }

  /**
   * 拆分 “2026-11-18 09:20:00” 为日 / 年月 / 时分
   */
  function SUN_splitTime(SUN_value) {
    var SUN_text = String(SUN_value || '');
    var SUN_datePart = SUN_text.split(' ')[0] || '';
    var SUN_timePart = SUN_text.split(' ')[1] || '';
    var SUN_day = SUN_datePart.slice(8, 10);
    var SUN_ym = SUN_datePart.slice(0, 7).replace('-', '.');
    return {
      SUN_day: SUN_day ? String(Number(SUN_day)) : '—',
      SUN_ym: SUN_ym || '—',
      SUN_clock: SUN_timePart ? SUN_timePart.slice(0, 5) : '',
      SUN_full: SUN_text
    };
  }

  /**
   * 生成分类筛选按钮
   */
  function SUN_renderChips() {
    // 旧按钮全部移除，只保留右侧的计数与刷新
    var SUN_oldChips = SUN_toolbar.querySelectorAll('.SUN_chip');
    Array.prototype.forEach.call(SUN_oldChips, function (SUN_chip) {
      SUN_chip.remove();
    });

    var SUN_categories = ['全部'];
    SUN_allNews.forEach(function (SUN_item) {
      if (SUN_item.SUN_category && SUN_categories.indexOf(SUN_item.SUN_category) === -1) {
        SUN_categories.push(SUN_item.SUN_category);
      }
    });

    var SUN_fragment = document.createDocumentFragment();
    SUN_categories.forEach(function (SUN_name) {
      var SUN_btn = SUN_el('button', 'SUN_chip', SUN_name);
      SUN_btn.type = 'button';
      if (SUN_name === SUN_activeCategory) {
        SUN_btn.classList.add('SUN_chip-active');
      }
      SUN_btn.addEventListener('click', function () {
        SUN_activeCategory = SUN_name;
        SUN_renderChips();
        SUN_renderList();
        console.log('[TechScope] 切换新闻分类：' + SUN_name);
      });
      SUN_fragment.appendChild(SUN_btn);
    });

    // 把按钮插到工具栏最前面
    SUN_toolbar.insertBefore(SUN_fragment, SUN_toolbar.firstChild);
  }

  /**
   * 渲染新闻列表（受当前分类筛选影响）
   */
  function SUN_renderList() {
    SUN_listBox.innerHTML = '';

    var SUN_filtered = SUN_allNews.filter(function (SUN_item) {
      return SUN_activeCategory === '全部' || SUN_item.SUN_category === SUN_activeCategory;
    });

    if (SUN_countLabel) {
      SUN_countLabel.textContent =
        '接口返回 ' + SUN_allNews.length + ' 条 · 当前显示 ' + SUN_filtered.length + ' 条';
    }

    if (!SUN_filtered.length) {
      var SUN_empty = SUN_el('div', 'SUN_empty', '当前分类下没有新闻数据。');
      SUN_listBox.appendChild(SUN_empty);
      return;
    }

    var SUN_fragment = document.createDocumentFragment();

    SUN_filtered.forEach(function (SUN_item) {
      var SUN_time = SUN_splitTime(SUN_item.SUN_publish_time);

      var SUN_card = SUN_el('article', 'SUN_news-item');

      // 左侧日期
      var SUN_dateBox = SUN_el('div', 'SUN_news-date');
      SUN_dateBox.appendChild(SUN_el('span', 'SUN_news-day', SUN_time.SUN_day));
      SUN_dateBox.appendChild(SUN_el('span', 'SUN_news-ymd', SUN_time.SUN_ym));

      // 右侧主体
      var SUN_main = SUN_el('div', 'SUN_news-main');

      var SUN_meta = SUN_el('div', 'SUN_news-meta');
      SUN_meta.appendChild(SUN_el('span', 'SUN_tag', SUN_item.SUN_category || '未分类'));
      SUN_meta.appendChild(SUN_el('span', '', '来源：' + (SUN_item.SUN_source || '未知')));
      SUN_meta.appendChild(SUN_el('span', '', SUN_time.SUN_full || '—'));
      var SUN_views = SUN_el(
        'span',
        'SUN_news-views',
        (Number(SUN_item.SUN_views) || 0).toLocaleString('zh-CN') + ' 次浏览'
      );
      SUN_meta.appendChild(SUN_views);

      SUN_main.appendChild(SUN_meta);
      SUN_main.appendChild(SUN_el('h2', 'SUN_news-title', SUN_item.SUN_title || '（无标题）'));
      SUN_main.appendChild(SUN_el('p', 'SUN_news-summary', SUN_item.SUN_summary || ''));

      SUN_card.appendChild(SUN_dateBox);
      SUN_card.appendChild(SUN_main);
      SUN_fragment.appendChild(SUN_card);
    });

    SUN_listBox.appendChild(SUN_fragment);
  }

  /**
   * 拉取新闻数据
   */
  function SUN_loadNews() {
    SUN_refreshBtn.disabled = true;
    SUN_listBox.innerHTML = '';
    SUN_listBox.appendChild(SUN_el('div', 'SUN_empty', '正在从接口读取数据……'));
    if (SUN_countLabel) SUN_countLabel.textContent = '读取中……';

    fetch(SUN_apiFull)
      .then(function (SUN_response) {
        return SUN_response.json();
      })
      .then(function (SUN_json) {
        SUN_rawBox.textContent = JSON.stringify(SUN_json, null, 2);

        if (SUN_json.code !== 0) {
          SUN_listBox.innerHTML = '';
          SUN_listBox.appendChild(SUN_el('div', 'SUN_empty', '接口返回错误：' + (SUN_json.msg || '未知错误')));
          if (SUN_countLabel) SUN_countLabel.textContent = '加载失败';
          console.error('[TechScope] 新闻接口返回失败', SUN_json);
          return;
        }

        SUN_allNews = (SUN_json.data && SUN_json.data.SUN_list) || [];
        console.log('[TechScope] 新闻接口返回数据', SUN_json.data);

        SUN_renderChips();
        SUN_renderList();
      })
      .catch(function (SUN_err) {
        SUN_listBox.innerHTML = '';
        SUN_listBox.appendChild(
          SUN_el('div', 'SUN_empty', '请求失败：' + SUN_apiFull + '（请确认后端已启动）')
        );
        if (SUN_countLabel) SUN_countLabel.textContent = '请求失败';
        SUN_rawBox.textContent = String(SUN_err);
        console.error('[TechScope] 新闻列表请求异常', SUN_err);
      })
      .finally(function () {
        SUN_refreshBtn.disabled = false;
      });
  }

  SUN_refreshBtn.addEventListener('click', function () {
    SUN_loadNews();
  });

  SUN_loadNews();
  console.log('[TechScope] 新闻页就绪，接口：' + SUN_apiFull);
})();
