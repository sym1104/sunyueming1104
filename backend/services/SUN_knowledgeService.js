/**
 * 姓名：孙跃铭 | 学号：24001011104 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * 文件说明：知识库服务。负责：
 *   1) parseFile — 按扩展名解析文件得到纯文本
 *   2) chunkText — 固定大小 + overlap 切分
 *   3) bm25Rank  — 简易 BM25 关键词打分，返回前 N 条最相关 chunk
 *   4) buildRagPrompt — 把 Top-K 片段拼成 system prompt
 */
const fs = require('fs');
const path = require('path');

/** 扩展名 → 解析器 */
const SUN_PARSERS = {
  '.txt': 'plain', '.md': 'plain', '.csv': 'plain', '.json': 'plain', '.rtf': 'plain',
  '.docx': 'office', '.pptx': 'office', '.xlsx': 'office', '.pdf': 'pdf', '.epub': 'office',
  '.doc': 'doc-old', '.ppt': 'ppt-old'
};

/**
 * 解析一个文件为纯文本。
 * @param {string} SUN_absPath 绝对路径
 * @param {string} SUN_ext     扩展名（带点）
 * @returns {Promise<string>}
 */
async function SUN_parseFile(SUN_absPath, SUN_ext) {
  const SUN_kind = SUN_PARSERS[(SUN_ext || '').toLowerCase()] || 'plain';
  switch (SUN_kind) {
    case 'plain': {
      const SUN_buf = fs.readFileSync(SUN_absPath);
      // 尝试 utf-8 解码；含乱码就退回 latin1
      let SUN_text = SUN_buf.toString('utf8');
      if (/[\uFFFD]/.test(SUN_text)) SUN_text = SUN_buf.toString('latin1');
      return SUN_text;
    }
    case 'office': {
      const SUN_OfficeParser = require('officeparser');
      const SUN_obj = await SUN_OfficeParser.parseFile(SUN_absPath);
      if (typeof SUN_obj === 'string') return SUN_obj;
      if (SUN_obj && SUN_obj.text) return SUN_obj.text;
      if (SUN_obj && SUN_obj.content) return SUN_obj.content;
      return JSON.stringify(SUN_obj);
    }
    case 'doc-old': {
      const SUN_WE = require('word-extractor');
      const SUN_we = new SUN_WE();
      const SUN_doc = await SUN_we.extract(SUN_absPath);
      return SUN_doc.getText();
    }
    case 'pdf': {
      const SUN_Parse = require('pdf-parse');
      const SUN_buf = fs.readFileSync(SUN_absPath);
      const SUN_data = await SUN_Parse(SUN_buf);
      return SUN_data.text || '';
    }
    case 'ppt-old': {
      // 老版 ppt：尝试 officeparser，不行就退 OLE 文本抽取
      try {
        const SUN_OfficeParser = require('officeparser');
        const SUN_obj = await SUN_OfficeParser.parseFile(SUN_absPath);
        if (typeof SUN_obj === 'string') return SUN_obj;
        if (SUN_obj && SUN_obj.text) return SUN_obj.text;
      } catch (_) { /* fallthrough */ }
      const SUN_cfb = require('cfb');
      const SUN_wb = SUN_cfb.read(fs.readFileSync(SUN_absPath));
      let SUN_out = '';
      Object.keys(SUN_wb.Sector || {}).forEach(function () { /* ignore */ });
      Object.keys(SUN_wb.File || {}).forEach(function (SUN_name) {
        const SUN_entry = SUN_wb.File[SUN_name];
        if (!SUN_entry || !SUN_entry.content) return;
        try {
          const SUN_t = SUN_entry.content.toString('utf8');
          if (/[一-龥A-Za-z]{4,}/.test(SUN_t)) SUN_out += SUN_t + '\n';
        } catch (_) { /* ignore */ }
      });
      return SUN_out;
    }
    default:
      throw new Error('不支持的文件格式：' + SUN_ext);
  }
}

/**
 * 按字符数切分文本，带 overlap。
 * @param {string} SUN_text   原文本
 * @param {number} SUN_size   每块字符数（默认 500）
 * @param {number} SUN_overlap 重叠字符数（默认 60）
 */
function SUN_chunkText(SUN_text, SUN_size, SUN_overlap) {
  SUN_text = String(SUN_text || '').replace(/\r\n/g, '\n').replace(/ +/g, ' ').trim();
  if (!SUN_text) return [];
  const SUN_chunkSize = SUN_size || 500;
  const SUN_ov = SUN_overlap == null ? 60 : SUN_overlap;
  const SUN_chunks = [];
  let SUN_start = 0;
  while (SUN_start < SUN_text.length) {
    const SUN_end = Math.min(SUN_start + SUN_chunkSize, SUN_text.length);
    let SUN_piece = SUN_text.slice(SUN_start, SUN_end).trim();
    if (SUN_piece) SUN_chunks.push({ content: SUN_piece, tokens: SUN_piece.length });
    if (SUN_end >= SUN_text.length) break;
    SUN_start = Math.max(0, SUN_end - SUN_ov);
  }
  return SUN_chunks;
}

/** 简易分词（中文按单字 bi-gram + 英文按单词） */
function SUN_tokenize(SUN_text) {
  const SUN_lower = String(SUN_text || '').toLowerCase();
  const SUN_tokens = [];
  // 英文单词
  const SUN_words = SUN_lower.match(/[a-zA-Z0-9_]{2,}/g) || [];
  SUN_words.forEach(function (SUN_w) { SUN_tokens.push(SUN_w); });
  // 中文 bi-gram
  const SUN_zh = SUN_lower.replace(/[^\u4e00-\u9fff]/g, '');
  for (let i = 0; i < SUN_zh.length - 1; i++) {
    SUN_tokens.push(SUN_zh.slice(i, i + 2));
  }
  return SUN_tokens;
}

/** 简易 BM25 打分（够课堂演示用） */
function SUN_bm25Rank(SUN_query, SUN_chunks, SUN_topK) {
  const SUN_qTokens = SUN_tokenize(SUN_query);
  if (!SUN_qTokens.length || !SUN_chunks.length) return SUN_chunks.slice(0, SUN_topK || 5);

  // 数据库返回的字段是 SUN_content，分块时用的是 content —— 统一
  SUN_chunks = SUN_chunks.map(function (c) {
    if (c.SUN_content !== undefined && c.content === undefined) c.content = c.SUN_content;
    return c;
  });

  const SUN_N = SUN_chunks.length;
  const SUN_docLenAvg = SUN_chunks.reduce(function (s, c) { return s + (c.content || '').length; }, 0) / Math.max(1, SUN_N);

  // 每个 chunk 的 term freq + doc freq
  const SUN_docTokenized = SUN_chunks.map(function (SUN_c) {
    const SUN_toks = SUN_tokenize(SUN_c.content);
    const SUN_tf = {};
    SUN_toks.forEach(function (SUN_t) { SUN_tf[SUN_t] = (SUN_tf[SUN_t] || 0) + 1; });
    return { chunk: SUN_c, tokens: SUN_toks, tf: SUN_tf };
  });

  const SUN_df = {};
  SUN_docTokenized.forEach(function (SUN_d) {
    Object.keys(SUN_d.tf).forEach(function (SUN_t) { SUN_df[SUN_t] = (SUN_df[SUN_t] || 0) + 1; });
  });

  const SUN_k1 = 1.2, SUN_b = 0.75;
  const SUN_scored = SUN_docTokenized.map(function (SUN_d) {
    const SUN_len = SUN_d.tokens.length;
    let SUN_score = 0;
    SUN_qTokens.forEach(function (SUN_t) {
      if (!SUN_d.tf[SUN_t]) return;
      const SUN_tf = SUN_d.tf[SUN_t];
      const SUN_idf = Math.log(1 + (SUN_N - (SUN_df[SUN_t] || 0) + 0.5) / ((SUN_df[SUN_t] || 0) + 0.5));
      const SUN_norm = 1 - SUN_b + SUN_b * (SUN_len / Math.max(1, SUN_docLenAvg));
      SUN_score += SUN_idf * (SUN_tf * (SUN_k1 + 1)) / (SUN_tf + SUN_k1 * SUN_norm);
    });
    return { chunk: SUN_d.chunk, score: SUN_score };
  });

  SUN_scored.sort(function (a, b) { return b.score - a.score; });
  return SUN_scored.slice(0, SUN_topK || 5).map(function (x) { return x.chunk; });
}

/** 把 Top-K 片段拼成 system prompt */
function SUN_buildRagPrompt(SUN_question, SUN_topChunks, SUN_extraSystem) {
  let SUN_knowledge = '';
  SUN_topChunks.forEach(function (SUN_c, SUN_i) {
    const SUN_src = (SUN_c.SUN_original_name || SUN_c.SUN_name || '知识片段') +
      '（#' + ((SUN_c.SUN_idx != null ? SUN_c.SUN_idx : 0) + 1) + '）';
    const SUN_text = SUN_c.content !== undefined ? SUN_c.content : SUN_c.SUN_content;
    SUN_knowledge += '\n[' + (SUN_i + 1) + '] 来源：' + SUN_src + '\n' + SUN_text + '\n';
  });
  return (
    (SUN_extraSystem || '你是一个基于知识库的智能问答助手，请严格根据下面提供的知识片段回答用户问题。\n' +
      '如果知识片段中找不到答案，请明确说"根据现有知识库，我暂时无法回答这个问题"，不要编造内容。\n' +
      '回答中请在相关内容后用方括号标注来源编号，如"根据知识片段[1]……"。\n\n') +
      '===== 知识库片段 =====' + SUN_knowledge + '======================\n\n' +
      '用户问题：' + SUN_question
  );
}

module.exports = {
  SUN_parseFile: SUN_parseFile,
  SUN_chunkText: SUN_chunkText,
  SUN_bm25Rank: SUN_bm25Rank,
  SUN_buildRagPrompt: SUN_buildRagPrompt
};
