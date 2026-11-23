/**
 * 姓名：孙跃铭 | 学号：24001011104 | 时间：2026-11-19 | 大模型：豆包大模型（Doubao）
 * 文件说明：接口总路由，统一挂载到 /api 前缀下。
 */
const express = require('express');
const SUN_router = express.Router();

const SUN_databaseRoutes = require('./SUN_databaseRoutes');
const SUN_newsRoutes = require('./SUN_newsRoutes');
const SUN_galleryRoutes = require('./SUN_galleryRoutes');
const SUN_chatRoutes = require('./SUN_chatRoutes');
const SUN_knowledgeRoutes = require('./SUN_knowledgeRoutes');

// GET /api —— 接口索引，便于课堂演示与自查
SUN_router.get('/', (req, res) => {
  res.json({
    code: 0,
    msg: 'TechScope API 服务运行中',
    data: {
      SUN_project: '科技视界 TechScope',
      SUN_student: '孙跃铭 / 24001011104',
      SUN_endpoints: [
        { method: 'POST', path: '/api/database/test', desc: '测试数据库连接' },
        { method: 'GET', path: '/api/database/status', desc: '检查默认数据库连接状态' },
        { method: 'GET', path: '/api/news', desc: '科技新闻列表' },
        { method: 'GET', path: '/api/news/:id', desc: '科技新闻详情' },
        { method: 'GET', path: '/api/gallery', desc: '图文列表' },
        { method: 'GET', path: '/api/gallery/:id', desc: '图文详情' },
        { method: 'POST', path: '/api/chat', desc: 'AI 对话（DeepSeek-V4-Flash, SiliconFlow）' },
        { method: 'POST', path: '/api/knowledge/upload', desc: '知识库文件上传（doc/docx/ppt/pptx/pdf/txt）' },
        { method: 'GET',  path: '/api/knowledge/files', desc: '知识库文件列表' },
        { method: 'DELETE', path: '/api/knowledge/files/:id', desc: '删除知识库文件' },
        { method: 'POST', path: '/api/knowledge/ask', desc: '基于知识库的 RAG 问答' }
      ]
    }
  });
});

SUN_router.use('/database', SUN_databaseRoutes);
SUN_router.use('/news', SUN_newsRoutes);
SUN_router.use('/gallery', SUN_galleryRoutes);
SUN_router.use('/chat', SUN_chatRoutes);
SUN_router.use('/knowledge', SUN_knowledgeRoutes);

module.exports = SUN_router;
