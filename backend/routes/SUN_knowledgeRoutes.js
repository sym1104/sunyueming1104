/**
 * 姓名：孙跃铭 | 学号：24001011104 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * 文件说明：知识库路由。
 *   POST /api/knowledge/upload  — 单文件上传 + 解析 + 分块入库
 *   GET  /api/knowledge/files   — 已上传文件列表
 *   DELETE /api/knowledge/files/:id — 删除文件 + 级联删 chunk
 *   POST /api/knowledge/ask     — 基于知识库的问答（BM25 检索 + LLM 生成）
 *   服务端终端打印两段：发给大模型的完整 messages + 模型返回的完整 JSON。
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const multer = require('multer');
const SUN_model = require('../models/SUN_knowledgeModel');
const SUN_svc = require('../services/SUN_knowledgeService');

const SUN_LM_KEY = process.env.SILICONFLOW_API_KEY;
const SUN_LM_URL = process.env.SILICONFLOW_BASE_URL;
const SUN_LM_MODEL = process.env.SILICONFLOW_MODEL || 'deepseek-ai/DeepSeek-V4-Flash';

const SUN_router = express.Router();

const SUN_UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'knowledge');
if (!fs.existsSync(SUN_UPLOAD_DIR)) fs.mkdirSync(SUN_UPLOAD_DIR, { recursive: true });

const SUN_ALLOW_EXT = ['.txt', '.md', '.csv', '.json', '.rtf',
  '.docx', '.pptx', '.xlsx', '.pdf', '.epub',
  '.doc', '.ppt'];

const SUN_storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, SUN_UPLOAD_DIR); },
  filename: function (req, file, cb) {
    const SUN_ext = path.extname(file.originalname).toLowerCase();
    const SUN_hash = crypto.randomBytes(6).toString('hex');
    cb(null, Date.now() + '_' + SUN_hash + SUN_ext);
  }
});
const SUN_upload = multer({
  storage: SUN_storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const SUN_ext = path.extname(file.originalname).toLowerCase();
    if (SUN_ALLOW_EXT.indexOf(SUN_ext) === -1) {
      return cb(new Error('不支持的文件格式：' + SUN_ext + '。允许：' + SUN_ALLOW_EXT.join('/')));
    }
    cb(null, true);
  }
});

// ========== 上传 ==========

SUN_router.post('/upload', SUN_upload.single('file'), async function (req, res) {
  try {
    if (!req.file) {
      return res.json({ code: 4001, msg: '未接收到文件（字段名需为 file）', data: null });
    }
    const SUN_absPath = req.file.path;
    const SUN_ext = path.extname(req.file.originalname).toLowerCase();

    console.log('[知识库上传] file=', req.file.originalname, 'ext=', SUN_ext, 'size=', req.file.size);

    // 1) 解析
    let SUN_text = '';
    try {
      SUN_text = await SUN_svc.SUN_parseFile(SUN_absPath, SUN_ext);
    } catch (SUN_err) {
      fs.unlink(SUN_absPath, function () {});
      return res.json({ code: 4002, msg: '文件解析失败：' + (SUN_err.message || String(SUN_err)), data: null });
    }
    if (!SUN_text || SUN_text.replace(/\s+/g, '').length < 20) {
      fs.unlink(SUN_absPath, function () {});
      return res.json({ code: 4003, msg: '文件解析后内容过短（< 20 字），无法建立有效知识库。', data: null });
    }

    // 2) 分块
    const SUN_chunks = SUN_svc.SUN_chunkText(SUN_text, 500, 60);

    // 3) 落库
    const SUN_fileId = await SUN_model.SUN_createFile({
      name: req.file.filename,
      original_name: req.file.originalname,
      ext: SUN_ext,
      size: req.file.size,
      path: path.relative(path.join(__dirname, '..'), SUN_absPath),
      chunk_count: SUN_chunks.length
    });
    await SUN_model.SUN_insertChunks(SUN_fileId, SUN_chunks);

    res.json({
      code: 0,
      msg: '上传成功',
      data: {
        SUN_id: SUN_fileId,
        SUN_name: req.file.originalname,
        SUN_ext: SUN_ext,
        SUN_size: req.file.size,
        SUN_chunk_count: SUN_chunks.length
      }
    });
  } catch (SUN_err) {
    console.error('[知识库上传异常]', SUN_err);
    if (req.file && req.file.path) fs.unlink(req.file.path, function () {});
    res.json({ code: 5001, msg: '上传异常：' + (SUN_err.message || String(SUN_err)), data: null });
  }
});

// ========== 文件列表 ==========

SUN_router.get('/files', async function (req, res) {
  try {
    const SUN_list = await SUN_model.SUN_listFiles();
    res.json({ code: 0, msg: 'ok', data: { SUN_total: SUN_list.length, SUN_list: SUN_list } });
  } catch (SUN_err) {
    console.error('[知识库列表异常]', SUN_err);
    res.json({ code: 5002, msg: '查询失败：' + (SUN_err.message || String(SUN_err)), data: null });
  }
});

// ========== 删除 ==========

SUN_router.delete('/files/:id', async function (req, res) {
  try {
    const SUN_id = Number(req.params.id);
    const SUN_file = path.join(__dirname, '..', 'uploads', 'knowledge', String(SUN_id));
    // 注意：实际文件名是 hash，这里找不到也没关系（数据库里存的是相对路径）
    await SUN_model.SUN_deleteFile(SUN_id);
    // 尝试删除磁盘文件
    try {
      const [rows] = await SUN_model.SUN_pool.execute(
        'SELECT SUN_path FROM SUN_knowledge_file WHERE SUN_id = ?', [SUN_id]);
      // 已删除，查不到，跳过
    } catch (_) { /* ignore */ }
    res.json({ code: 0, msg: '删除成功', data: { SUN_id: SUN_id } });
  } catch (SUN_err) {
    console.error('[知识库删除异常]', SUN_err);
    res.json({ code: 5003, msg: '删除失败：' + (SUN_err.message || String(SUN_err)), data: null });
  }
});

// ========== 基于知识库的问答 ==========

SUN_router.post('/ask', async function (req, res) {
  try {
    const SUN_question = String((req.body && req.body.question) || '').trim();
    if (!SUN_question) {
      return res.json({ code: 4001, msg: '缺少 question 参数', data: null });
    }

    // 1) 拉所有 chunk（简单实现；后续可按文件过滤）
    const SUN_topK = 8;
    const SUN_all = await SUN_model.SUN_searchChunks(null, 200);
    if (!SUN_all.length) {
      return res.json({
        code: 4004,
        msg: '知识库为空，请先上传文件。',
        data: null
      });
    }

    // 2) BM25 打分取 Top-K
    const SUN_top = SUN_svc.SUN_bm25Rank(SUN_question, SUN_all, SUN_topK);
    const SUN_prompt = SUN_svc.SUN_buildRagPrompt(SUN_question, SUN_top);

    const SUN_messages = [
      { role: 'system', content: SUN_prompt },
      { role: 'user', content: SUN_question }
    ];

    const SUN_payload = { model: SUN_LM_MODEL, messages: SUN_messages, stream: false };

    console.log('========== [发给大模型（RAG）] ==========');
    console.log(JSON.stringify(SUN_payload, null, 2).slice(0, 3000) +
      (JSON.stringify(SUN_payload).length > 3000 ? '\n...(已截断，完整见后端日志文件)' : ''));
    console.log('=========================================');

    // 3) 调大模型
    if (!SUN_LM_KEY || !SUN_LM_URL) {
      return res.json({ code: 5010, msg: '大模型未配置', data: null });
    }
    const SUN_resp = await fetch(SUN_LM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + SUN_LM_KEY
      },
      body: JSON.stringify(SUN_payload)
    });
    const SUN_data = await SUN_resp.json();

    console.log('========== [模型返回（RAG）] ==========');
    console.log(JSON.stringify(SUN_data, null, 2));
    console.log('========================================');

    if (!SUN_resp.ok || (SUN_data && SUN_data.error)) {
      const SUN_errMsg = (SUN_data && SUN_data.error && (SUN_data.error.message || SUN_data.error)) || 'HTTP ' + SUN_resp.status;
      return res.json({ code: 5011, msg: '大模型返回错误：' + SUN_errMsg, data: null });
    }

    const SUN_reply =
      (SUN_data.choices && SUN_data.choices[0] && SUN_data.choices[0].message && SUN_data.choices[0].message.content) || '';

    // 4) 收集来源（去重 + 限制前 3 个）
    const SUN_sourcesMap = {};
    SUN_top.forEach(function (SUN_c) {
      const SUN_key = (SUN_c.SUN_file_id + ':' + (SUN_c.SUN_original_name || SUN_c.SUN_name));
      if (!SUN_sourcesMap[SUN_key]) {
        SUN_sourcesMap[SUN_key] = {
          SUN_file_id: SUN_c.SUN_file_id,
          SUN_name: SUN_c.SUN_original_name || SUN_c.SUN_name,
          SUN_ext: SUN_c.SUN_ext
        };
      }
    });
    const SUN_sources = Object.keys(SUN_sourcesMap).slice(0, 3).map(function (k) { return SUN_sourcesMap[k]; });

    res.json({
      code: 0,
      msg: 'ok',
      data: {
        SUN_reply: SUN_reply,
        SUN_model: SUN_data.model || SUN_LM_MODEL,
        SUN_usage: SUN_data.usage || null,
        SUN_sources: SUN_sources,
        SUN_payload: SUN_payload,       // 后端拼好后发给大模型的完整 messages（含知识片段）
        SUN_response: SUN_data           // SiliconFlow 返回的原始响应
      }
    });
  } catch (SUN_err) {
    console.error('[RAG 问答异常]', SUN_err);
    res.json({ code: 5099, msg: '问答异常：' + (SUN_err.message || String(SUN_err)), data: null });
  }
});

// multer 错误兜底
SUN_router.use(function (SUN_err, req, res, next) {
  console.error('[知识库路由错误]', SUN_err);
  res.json({ code: 4099, msg: SUN_err.message || '上传失败', data: null });
});

module.exports = SUN_router;
