/**
 * 姓名：孙跃铭 | 学号：24001011104 | 时间：2026-11-19 | 大模型：豆包大模型（Doubao）
 * 文件说明：数据库连接测试页逻辑。调用 POST /api/database/test 并渲染结果。
 */
(function () {
  'use strict';

  var SUN_form = document.getElementById('SUN_dbForm');
  if (!SUN_form) {
    console.error('[TechScope] 未找到数据库测试表单');
    return;
  }

  var SUN_userInput = document.getElementById('SUN_dbUser');
  var SUN_passwordInput = document.getElementById('SUN_dbPassword');
  var SUN_submitBtn = document.getElementById('SUN_dbSubmit');
  var SUN_resetBtn = document.getElementById('SUN_dbReset');
  var SUN_statusBox = document.getElementById('SUN_dbStatus');
  var SUN_statusTitle = document.getElementById('SUN_dbStatusTitle');
  var SUN_statusText = document.getElementById('SUN_dbStatusText');
  var SUN_rawBox = document.getElementById('SUN_dbRaw');
  var SUN_costLabel = document.getElementById('SUN_dbCost');
  var SUN_apiUrlLabel = document.getElementById('SUN_dbApiUrl');
  var SUN_detailNodes = document.querySelectorAll('[data-SUN-field]');

  var SUN_apiPath = '/api/database/test';
  var SUN_apiFull = window.SUN_api ? window.SUN_api.SUN_url(SUN_apiPath) : SUN_apiPath;

  // 页面展示的接口链接按当前访问地址实时拼接
  if (SUN_apiUrlLabel) {
    SUN_apiUrlLabel.textContent = SUN_apiFull;
  }
  var SUN_copyBtn = document.querySelector('[data-SUN-copy]');
  if (SUN_copyBtn) {
    SUN_copyBtn.setAttribute('data-SUN-copy', SUN_apiFull);
  }

  /**
   * 设置状态条外观：idle / loading / ok / err
   */
  function SUN_setStatus(SUN_type, SUN_title, SUN_text) {
    SUN_statusBox.classList.remove(
      'SUN_status-ok',
      'SUN_status-err',
      'SUN_status-loading'
    );
    if (SUN_type === 'ok') SUN_statusBox.classList.add('SUN_status-ok');
    if (SUN_type === 'err') SUN_statusBox.classList.add('SUN_status-err');
    if (SUN_type === 'loading') SUN_statusBox.classList.add('SUN_status-loading');
    SUN_statusTitle.textContent = SUN_title;
    SUN_statusText.textContent = SUN_text;
  }

  /**
   * 写入右侧键值明细
   */
  function SUN_fillDetail(SUN_field, SUN_value) {
    Array.prototype.forEach.call(SUN_detailNodes, function (SUN_node) {
      if (SUN_node.getAttribute('data-SUN-field') === SUN_field) {
        SUN_node.textContent = SUN_value;
      }
    });
  }

  /**
   * 清空明细
   */
  function SUN_clearDetail() {
    Array.prototype.forEach.call(SUN_detailNodes, function (SUN_node) {
      SUN_node.textContent = '—';
    });
  }

  /**
   * 输出原始 JSON
   */
  function SUN_showRaw(SUN_obj) {
    try {
      SUN_rawBox.textContent = JSON.stringify(SUN_obj, null, 2);
    } catch (SUN_err) {
      SUN_rawBox.textContent = String(SUN_obj);
    }
  }

  /**
   * 提交测试请求
   */
  function SUN_handleSubmit(SUN_event) {
    SUN_event.preventDefault();

    var SUN_user = (SUN_userInput.value || '').trim();
    var SUN_password = SUN_passwordInput.value || '';

    if (!SUN_user) {
      SUN_setStatus('err', '参数不完整', '请填写用户名后再测试。');
      console.error('[TechScope] 用户名不能为空');
      return;
    }

    SUN_submitBtn.disabled = true;
    SUN_submitBtn.textContent = '连接中……';
    SUN_setStatus('loading', '正在连接', '已向 ' + SUN_apiFull + ' 发起请求，请稍候。');
    SUN_costLabel.textContent = '请求进行中';
    SUN_clearDetail();

    var SUN_start = window.performance ? window.performance.now() : Date.now();

    fetch(SUN_apiFull, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        SUN_user: SUN_user,
        SUN_password: SUN_password
      })
    })
      .then(function (SUN_response) {
        return SUN_response.text().then(function (SUN_text) {
          try {
            return { SUN_ok: true, SUN_data: JSON.parse(SUN_text) };
          } catch (SUN_parseErr) {
            return { SUN_ok: false, SUN_data: SUN_text };
          }
        });
      })
      .then(function (SUN_result) {
        var SUN_end = window.performance ? window.performance.now() : Date.now();
        var SUN_cost = Math.round(SUN_end - SUN_start);
        SUN_costLabel.textContent = '耗时 ' + SUN_cost + ' ms';

        if (!SUN_result.SUN_ok) {
          SUN_setStatus('err', '返回内容不是合法 JSON', '请检查后端是否正常运行。');
          SUN_rawBox.textContent = String(SUN_result.SUN_data);
          console.error('[TechScope] 数据库测试返回内容无法解析', SUN_result.SUN_data);
          return;
        }

        var SUN_json = SUN_result.SUN_data;
        SUN_showRaw(SUN_json);

        if (SUN_json.code === 0 && SUN_json.data) {
          var SUN_info = SUN_json.data;
          SUN_setStatus('ok', '连接成功', SUN_json.msg || '数据库连接成功');
          SUN_fillDetail('version', SUN_info.SUN_version || '—');
          SUN_fillDetail('server', SUN_info.SUN_server || '—');
          SUN_fillDetail('host', SUN_info.SUN_host || '—');
          SUN_fillDetail('database', SUN_info.SUN_database || '—');
          SUN_fillDetail('exists', SUN_info.SUN_database_exists ? '是' : '否');
          var SUN_tables = SUN_info.SUN_tables || [];
          SUN_fillDetail(
            'tables',
            SUN_tables.length ? SUN_tables.length + ' 张（' + SUN_tables.join('、') + '）' : '0 张'
          );
          console.log('[TechScope] 数据库连接成功', SUN_json);
        } else {
          SUN_setStatus('err', '连接失败', SUN_json.msg || '未知错误');
          console.error('[TechScope] 数据库连接失败', SUN_json);
        }
      })
      .catch(function (SUN_err) {
        SUN_costLabel.textContent = '请求失败';
        SUN_setStatus('err', '请求异常', '无法访问接口：' + SUN_apiFull + '，请确认后端已启动。');
        SUN_rawBox.textContent = String(SUN_err);
        console.error('[TechScope] 数据库测试请求异常', SUN_err);
      })
      .finally(function () {
        SUN_submitBtn.disabled = false;
        SUN_submitBtn.textContent = '连接数据库';
      });
  }

  SUN_form.addEventListener('submit', SUN_handleSubmit);

  SUN_resetBtn.addEventListener('click', function () {
    SUN_userInput.value = 'root';
    SUN_passwordInput.value = 'root';
    SUN_costLabel.textContent = '尚未测试';
    SUN_clearDetail();
    SUN_setStatus('idle', '未连接', '输入用户名与密码后点击“连接数据库”。');
    SUN_rawBox.textContent = '等待请求……';
    console.log('[TechScope] 已重置连接表单');
  });

  console.log('[TechScope] 数据库测试页就绪，接口：' + SUN_apiFull);
})();
