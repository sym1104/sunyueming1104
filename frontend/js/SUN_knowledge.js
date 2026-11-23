/**
 * 姓名：孙跃铭 | 学号：24001011104 | 时间：2026-11-23 | 大模型：DeepSeek-V4-Flash
 * 文件说明：知识库 RAG 页逻辑。
 *   - 上传文件 → 后端解析分块 → 控制台打印 [RAG 上传]
 *   - 文件列表渲染 → 删除
 *   - 问答 → POST /api/knowledge/ask → 控制台打印三层 [RAG 问答]
 */
(function () {
  'use strict';

  var SUN_API = (window.SUN_api && window.SUN_api.SUN_url && window.SUN_api.SUN_url('/api/knowledge')) ||
    (window.location.origin + '/api/knowledge');

  // DOM
  var $drop = document.getElementById('SUN_ragFile');
  var $status = document.getElementById('SUN_ragUploadStatus');
  var $fileList = document.getElementById('SUN_ragFileList');
  var $fileCount = document.getElementById('SUN_ragFileCount');
  var $form = document.getElementById('SUN_ragForm');
  var $input = document.getElementById('SUN_ragInput');
  var $send = document.getElementById('SUN_ragSend');
  var $count = document.getElementById('SUN_ragCount');
  var $log = document.getElementById('SUN_ragLog');
  var $logEmpty = $log.querySelector('.SUN_empty');
  var $statusBar = document.getElementById('SUN_ragStatus');
  var $reqBox = document.getElementById('SUN_ragRequest');
  var $resBox = document.getElementById('SUN_ragResponse');
  var $clear = document.getElementById('SUN_ragClear');

  if (!$form) return;

  // ---------- 状态 ----------

  var SUN_STATE = { sending: false, history: [] };

  function SUN_setStatus(text, type) {
    $statusBar.textContent = text;
    $statusBar.className = 'SUN_chat-status' +
      (type === 'busy' ? ' SUN_chat-status-busy' : '') +
      (type === 'err' ? ' SUN_chat-status-err' : '');
  }

  function SUN_sizeStr(n) {
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
    return (n / 1024 / 1024).toFixed(1) + ' MB';
  }

  function SUN_appendMsg(role, content, sources, isErr) {
    if ($logEmpty) { $logEmpty.remove(); $logEmpty = null; }
    var wrap = document.createElement('div');
    wrap.className = 'SUN_chat-msg ' + (role === 'user' ? 'SUN_chat-msg-user' : 'SUN_chat-msg-ai');
    var avatar = document.createElement('span');
    avatar.className = 'SUN_chat-avatar';
    avatar.textContent = role === 'user' ? '我' : 'AI';
    var body = document.createElement('div');
    body.className = 'SUN_chat-body';
    var name = document.createElement('span');
    name.className = 'SUN_chat-name';
    var now = new Date();
    name.textContent = (role === 'user' ? '我' : 'RAG / DeepSeek-V4-Flash') +
      ' · ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    var bubble = document.createElement('div');
    bubble.className = 'SUN_chat-bubble' + (isErr ? ' SUN_chat-bubble-err' : '');
    bubble.textContent = content;
    body.appendChild(name);
    body.appendChild(bubble);
    if (sources && sources.length) {
      var srcBox = document.createElement('div');
      srcBox.className = 'SUN_rag-sources';
      srcBox.textContent = '📎 参考来源：' + sources.map(function (s) { return s.SUN_name; }).join(' · ');
      body.appendChild(srcBox);
    }
    wrap.appendChild(avatar);
    wrap.appendChild(body);
    $log.appendChild(wrap);
    $log.scrollTop = $log.scrollHeight;
  }

  // ---------- 文件列表 ----------

  function SUN_loadFiles() {
    fetch(SUN_API + '/files')
      .then(function (r) { return r.json(); })
      .then(function (json) {
        if (json.code !== 0) throw new Error(json.msg);
        $fileCount.textContent = json.data.SUN_total + ' 个文件';
        $fileList.innerHTML = '';
        if (!json.data.SUN_list.length) {
          $fileList.appendChild((function () {
            var d = document.createElement('div');
            d.className = 'SUN_empty';
            d.textContent = '点击上传第一个知识库文件。';
            return d;
          })());
          return;
        }
        json.data.SUN_list.forEach(function (f) {
          var row = document.createElement('div');
          row.className = 'SUN_file-item';
          var info = document.createElement('div');
          info.className = 'SUN_file-info';
          info.innerHTML = '<b>' + f.SUN_original_name + '</b>' +
            '<br><span>' + f.SUN_ext + ' · ' + SUN_sizeStr(f.SUN_size) + ' · ' +
            f.SUN_chunk_count + ' 个片段</span>';
          var del = document.createElement('button');
          del.type = 'button';
          del.className = 'SUN_btn SUN_btn-ghost SUN_btn-danger';
          del.textContent = '删除';
          del.setAttribute('data-SUN-id', f.SUN_id);
          del.addEventListener('click', function () { SUN_deleteFile(f.SUN_id, f.SUN_original_name); });
          row.appendChild(info);
          row.appendChild(del);
          $fileList.appendChild(row);
        });
      })
      .catch(function (e) {
        console.error('[RAG 文件列表失败]', e);
        $fileList.innerHTML = '<div class="SUN_empty">加载失败：' + e.message + '</div>';
      });
  }

  function SUN_deleteFile(id, name) {
    if (!window.confirm('确定删除《' + name + '》？对应的 ' +
      '知识片段将一并删除。')) return;
    fetch(SUN_API + '/files/' + id, { method: 'DELETE' })
      .then(function (r) { return r.json(); })
      .then(function (json) {
        if (json.code !== 0) throw new Error(json.msg);
        console.log('[RAG 删除] 文件 id=' + id + ' 已删除');
        SUN_loadFiles();
      })
      .catch(function (e) {
        console.error('[RAG 删除失败]', e);
      });
  }

  // ---------- 上传 ----------

  $drop.addEventListener('change', function () {
    if (!$drop.files || !$drop.files.length) return;
    var file = $drop.files[0];
    SUN_upload(file);
  });

  // 拖放
  var $dropLabel = document.querySelector('.SUN_upload-drop');
  if ($dropLabel) {
    $dropLabel.addEventListener('dragover', function (e) {
      e.preventDefault();
      $dropLabel.classList.add('SUN_drag');
    });
    $dropLabel.addEventListener('dragleave', function () {
      $dropLabel.classList.remove('SUN_drag');
    });
    $dropLabel.addEventListener('drop', function (e) {
      e.preventDefault();
      $dropLabel.classList.remove('SUN_drag');
      if (e.dataTransfer.files && e.dataTransfer.files.length) SUN_upload(e.dataTransfer.files[0]);
    });
  }

  function SUN_upload(file) {
    $status.textContent = '上传中……';
    var fd = new FormData();
    fd.append('file', file);

    console.log('============================================');
    console.log('[RAG 上传] 发送给后端的文件数据：', {
      name: file.name, size: file.size, type: file.type, lastModified: file.lastModified
    });
    console.log('============================================');

    fetch(SUN_API + '/upload', { method: 'POST', body: fd })
      .then(function (r) { return r.json(); })
      .then(function (json) {
        console.log('============================================');
        console.log('[RAG 上传] 后端返回的数据：', json);
        console.log('============================================');
        if (json.code !== 0) {
          $status.textContent = '失败：' + json.msg;
          console.error('[RAG 上传失败]', json.msg);
          return;
        }
        $status.textContent = '成功：' + json.data.SUN_name + ' → ' +
          json.data.SUN_chunk_count + ' 个片段';
        SUN_loadFiles();
      })
      .catch(function (e) {
        console.error('[RAG 上传异常]', e);
        $status.textContent = '异常：' + e.message;
      });
  }

  // ---------- RAG 问答 ----------

  function SUN_ask() {
    if (SUN_STATE.sending) return;
    var text = ($input.value || '').trim();
    if (!text) return;

    SUN_STATE.sending = true;
    $send.disabled = true;
    $send.textContent = '生成中…';
    SUN_setStatus('生成中……', 'busy');

    // 累积历史
    SUN_STATE.history.push({ role: 'user', content: text });
    SUN_appendMsg('user', text, null, false);
    $input.value = '';
    $count.textContent = '0 / 2000';

    var payload = { question: text };
    console.log('============================================');
    console.log('[RAG 问答] 发送给大模型的数据（前端 payload）：', payload);
    console.log('============================================');
    $reqBox.textContent = '等待后端返回完整 messages（system prompt + 知识片段）……';
    $resBox.textContent = '等待大模型响应……';

    fetch(SUN_API + '/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (r) { return r.json(); })
      .then(function (json) {
        console.log('============================================');
        console.log('[RAG 问答] 后端拼接好后发送给大模型的数据（data.SUN_payload）：');
        console.log(json.data && json.data.SUN_payload);
        console.log('============================================');
        console.log('[RAG 问答] 从大模型接收到的原始响应（data.SUN_response）：');
        console.log(json.data && json.data.SUN_response);
        console.log('============================================');

        if (json.code !== 0) {
          SUN_appendMsg('assistant', '错误：' + json.msg, null, true);
          $resBox.textContent = JSON.stringify(json, null, 2);
          SUN_setStatus('错误', 'err');
          return;
        }

        SUN_appendMsg('assistant', json.data.SUN_reply || '(空回复)', json.data.SUN_sources, false);
        SUN_STATE.history.push({ role: 'assistant', content: json.data.SUN_reply });

        $reqBox.textContent = JSON.stringify(json.data.SUN_payload, null, 2);
        $resBox.textContent = JSON.stringify({
          model: json.data.SUN_model,
          usage: json.data.SUN_usage,
          reply: json.data.SUN_reply,
          sources: json.data.SUN_sources
        }, null, 2);
        SUN_setStatus('就绪 · ' + SUN_STATE.history.length + ' 轮', '');
      })
      .catch(function (err) {
        console.error('[RAG 问答异常]', err);
        SUN_appendMsg('assistant', '请求失败：' + err.message, null, true);
        $resBox.textContent = '请求异常：' + err.stack;
        SUN_setStatus('请求异常', 'err');
      })
      .then(function () {
        SUN_STATE.sending = false;
        $send.disabled = false;
        $send.textContent = '发送';
        $input.focus();
      });
  }

  // ---------- 事件绑定 ----------

  $form.addEventListener('submit', function (e) { e.preventDefault(); SUN_ask(); });
  $input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault(); $form.dispatchEvent(new Event('submit'));
    }
  });
  $input.addEventListener('input', function () { $count.textContent = $input.value.length + ' / 2000'; });

  Array.prototype.forEach.call(
    document.querySelectorAll('[data-SUN-prompt]'),
    function (btn) {
      btn.addEventListener('click', function () {
        $input.value = btn.getAttribute('data-SUN-prompt');
        $count.textContent = $input.value.length + ' / 2000';
        SUN_ask();
      });
    }
  );

  $clear.addEventListener('click', function () {
    if (SUN_STATE.sending) return;
    SUN_STATE.history = [];
    $log.innerHTML = '';
    var empty = document.createElement('div');
    empty.className = 'SUN_empty';
    empty.textContent = '对话已清空。';
    $log.appendChild(empty);
    $reqBox.textContent = '等待发送……';
    $resBox.textContent = '等待响应……';
    SUN_setStatus('就绪', '');
    $input.focus();
  });

  // 启动
  SUN_loadFiles();
  console.log('[RAG] 页面就绪，接口：' + SUN_API);
})();
