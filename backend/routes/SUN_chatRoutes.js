/**
 * 姓名：孙跃铭 | 学号：24001011104 | 时间：2026-11-23 | 大模型：DeepSeek-V4-Flash
 * 文件说明：AI 对话路由。代理 SiliconFlow 的 chat/completions 接口。
 *   API Key 仅保存在 backend/.env，前端不接触密钥。
 *   服务端终端打印两段：发给大模型的完整请求体 + 模型返回的完整响应体，便于取证。
 */
const express = require('express');
const SUN_router = express.Router();

const SUN_LM_KEY = process.env.SILICONFLOW_API_KEY;
const SUN_LM_URL = process.env.SILICONFLOW_BASE_URL;
const SUN_LM_MODEL = process.env.SILICONFLOW_MODEL || 'deepseek-ai/DeepSeek-V4-Flash';

SUN_router.post('/', async function (req, res) {
  try {
    const SUN_messages = Array.isArray(req.body && req.body.messages)
      ? req.body.messages
      : null;
    const SUN_question = (req.body && req.body.question) || '';

    let SUN_finalMessages;
    if (SUN_messages) {
      SUN_finalMessages = SUN_messages;
    } else if (SUN_question) {
      SUN_finalMessages = [
        { role: 'system', content: '你是一个有用的助手，回答简明、有条理。' },
        { role: 'user', content: SUN_question }
      ];
    } else {
      return res.json({ code: 4001, msg: '缺少 messages 或 question 参数', data: null });
    }

    if (!SUN_LM_KEY || !SUN_LM_URL) {
      return res.json({ code: 5001, msg: '大模型服务未配置（请检查 .env 中的 SILICONFLOW_*）', data: null });
    }

    const SUN_payload = {
      model: SUN_LM_MODEL,
      messages: SUN_finalMessages,
      stream: false
    };

    console.log('========== [发给大模型] ==========');
    console.log(JSON.stringify(SUN_payload, null, 2));
    console.log('==================================');

    const SUN_resp = await fetch(SUN_LM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + SUN_LM_KEY
      },
      body: JSON.stringify(SUN_payload)
    });

    const SUN_data = await SUN_resp.json();

    console.log('========== [模型返回] ==========');
    console.log(JSON.stringify(SUN_data, null, 2));
    console.log('==================================');

    if (!SUN_resp.ok || (SUN_data && SUN_data.error)) {
      const SUN_errMsg = (SUN_data && SUN_data.error && (SUN_data.error.message || SUN_data.error)) ||
        'HTTP ' + SUN_resp.status;
      return res.json({ code: 5002, msg: '大模型返回错误：' + SUN_errMsg, data: null });
    }

    const SUN_reply =
      (SUN_data.choices &&
        SUN_data.choices[0] &&
        SUN_data.choices[0].message &&
        SUN_data.choices[0].message.content) ||
      '';

    res.json({
      code: 0,
      msg: 'ok',
      data: {
        SUN_reply: SUN_reply,
        SUN_model: SUN_data.model || SUN_LM_MODEL,
        SUN_usage: SUN_data.usage || null,
        SUN_request: SUN_payload,
        SUN_response: SUN_data
      }
    });
  } catch (SUN_err) {
    console.error('[AI Chat 异常]', SUN_err);
    res.json({
      code: 5099,
      msg: 'AI 调用异常：' + (SUN_err.message || String(SUN_err)),
      data: null
    });
  }
});

module.exports = SUN_router;
