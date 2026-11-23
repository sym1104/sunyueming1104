/**
 * 姓名：孙跃铭 | 学号：24001011104 | 时间：2026-11-23 | 大模型：DeepSeek-V4-Flash
 * 文件说明：AI 对话页逻辑。
 *   - 多轮对话：前端累积 messages 数组，每次 POST /api/chat
 *   - 三层 console.log：
 *       [AI 聊天] 发送给大模型的数据（前端 payload）
 *       [AI 聊天] 后端拼接 messages（后端转发给 SiliconFlow 的完整 messages）
 *       [AI 聊天] 从大模型接收到的数据（后端收到的原始 choices + usage）
 *   - 气泡渲染、Enter 发送 / Shift+Enter 换行、清空对话
 */
(function () {
  'use strict';

  var SUN_API = (window.SUN_api && window.SUN_api.SUN_url && window.SUN_api.SUN_url('/api/chat')) ||
    (window.location.origin + '/api/chat');

  var SUN_STATE = {
    messages: [],
    sending: false
  };

  // DOM
  var $log = document.getElementById('SUN_chatLog');
  var $empty = document.getElementById('SUN_chatEmpty');
  var $form = document.getElementById('SUN_chatForm');
  var $input = document.getElementById('SUN_chatInput');
  var $send = document.getElementById('SUN_chatSend');
  var $count = document.getElementById('SUN_chatCount');
  var $status = document.getElementById('SUN_chatStatus');
  var $reqBox = document.getElementById('SUN_chatRequest');
  var $resBox = document.getElementById('SUN_chatResponse');
  var $clear = document.getElementById('SUN_chatClear');

  if (!$form) return;

  function SUN_setStatus(text, type) {
    $status.textContent = text;
    $status.className = 'SUN_chat-status' +
      (type === 'busy' ? ' SUN_chat-status-busy' : '') +
      (type === 'err' ? ' SUN_chat-status-err' : '');
  }

  function SUN_appendMsg(role, content, isErr) {
    if ($empty) $empty.style.display = 'none';

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
    name.textContent = (role === 'user' ? '我' : 'DeepSeek-V4-Flash') +
      ' · ' + String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0');

    var bubble = document.createElement('div');
    bubble.className = 'SUN_chat-bubble' + (isErr ? ' SUN_chat-bubble-err' : '');
    bubble.textContent = content;

    body.appendChild(name);
    body.appendChild(bubble);
    wrap.appendChild(avatar);
    wrap.appendChild(body);
    $log.appendChild(wrap);
    $log.scrollTop = $log.scrollHeight;
  }

  function SUN_appendTyping() {
    if ($empty) $empty.style.display = 'none';
    var wrap = document.createElement('div');
    wrap.className = 'SUN_chat-msg SUN_chat-msg-ai';
    wrap.id = 'SUN_chatTyping';

    var avatar = document.createElement('span');
    avatar.className = 'SUN_chat-avatar';
    avatar.textContent = 'AI';

    var body = document.createElement('div');
    body.className = 'SUN_chat-body';

    var name = document.createElement('span');
    name.className = 'SUN_chat-name';
    name.textContent = 'DeepSeek-V4-Flash · 正在思考';

    var bubble = document.createElement('div');
    bubble.className = 'SUN_chat-bubble';
    bubble.innerHTML = '<span class="SUN_chat-typing"><i></i><i></i><i></i></span>';

    body.appendChild(name);
    body.appendChild(bubble);
    wrap.appendChild(avatar);
    wrap.appendChild(body);
    $log.appendChild(wrap);
    $log.scrollTop = $log.scrollHeight;
  }

  function SUN_removeTyping() {
    var t = document.getElementById('SUN_chatTyping');
    if (t) t.remove();
  }

  function SUN_resetLog() {
    $log.innerHTML = '';
    $empty = document.createElement('div');
    $empty.className = 'SUN_empty';
    $empty.id = 'SUN_chatEmpty';
    $empty.textContent = '对话已清空。输入新的问题开始吧。';
    $log.appendChild($empty);
  }

  function SUN_send() {
    if (SUN_STATE.sending) return;
    var text = ($input.value || '').trim();
    if (!text) return;

    // 1) 累积 messages（前端直接发 messages 数组，后端转发给大模型）
    SUN_STATE.messages.push({ role: 'user', content: text });

    // 2) 前端发的 payload
    var payload = { messages: SUN_STATE.messages.slice() };

    console.log('============================================');
    console.log('[AI 聊天] 发送给大模型的数据（前端 payload = messages 数组）：');
    console.log(payload);
    console.log('============================================');
    $reqBox.textContent = JSON.stringify(payload, null, 2);
    $resBox.textContent = '等待大模型响应……';

    // 渲染用户气泡
    SUN_appendMsg('user', text, false);
    $input.value = '';
    $count.textContent = '0 / 2000';

    // 状态：正在思考
    SUN_STATE.sending = true;
    $send.disabled = true;
    $send.textContent = '生成中…';
    SUN_setStatus('生成中……', 'busy');
    SUN_appendTyping();

    fetch(SUN_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (resp) { return resp.json(); })
      .then(function (json) {
        SUN_removeTyping();

        console.log('============================================');
        console.log('[AI 聊天] 后端拼好后发送给大模型的数据（data.SUN_request）：');
        console.log(json.data && json.data.SUN_request);
        console.log('============================================');
        console.log('[AI 聊天] 从大模型接收到的原始响应（data.SUN_response）：');
        console.log(json.data && json.data.SUN_response);
        console.log('============================================');

        if (json.code !== 0) {
          SUN_appendMsg('assistant', '错误：' + json.msg, true);
          $resBox.textContent = JSON.stringify(json, null, 2);
          SUN_setStatus('错误', 'err');
          return;
        }

        // 正常：渲染回复 + 累积到 messages
        var reply = (json.data && json.data.SUN_reply) || '';
        SUN_appendMsg('assistant', reply, false);
        SUN_STATE.messages.push({ role: 'assistant', content: reply });

        $resBox.textContent = JSON.stringify({
          model: json.data.SUN_model,
          usage: json.data.SUN_usage,
          reply: reply
        }, null, 2);
        SUN_setStatus('就绪 · ' + SUN_STATE.messages.length + ' 条消息', '');
      })
      .catch(function (err) {
        SUN_removeTyping();
        console.error('[AI 聊天] 请求异常：', err);
        SUN_appendMsg('assistant', '请求失败：' + err.message, true);
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

  $form.addEventListener('submit', function (e) {
    e.preventDefault();
    SUN_send();
  });

  $input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      $form.dispatchEvent(new Event('submit'));
    }
  });

  $input.addEventListener('input', function () {
    $count.textContent = $input.value.length + ' / 2000';
  });

  // 建议 chips
  Array.prototype.forEach.call(
    document.querySelectorAll('[data-SUN-prompt]'),
    function (btn) {
      btn.addEventListener('click', function () {
        $input.value = btn.getAttribute('data-SUN-prompt');
        $count.textContent = $input.value.length + ' / 2000';
        SUN_send();
      });
    }
  );

  // 清空对话
  $clear.addEventListener('click', function () {
    if (SUN_STATE.sending) return;
    SUN_STATE.messages = [];
    SUN_resetLog();
    $reqBox.textContent = '等待发送……';
    $resBox.textContent = '等待响应……';
    SUN_setStatus('就绪', '');
    $input.focus();
  });

  console.log('[AI 聊天] 页面就绪，接口：' + SUN_API + '，模型：deepseek-ai/DeepSeek-V4-Flash');
})();
