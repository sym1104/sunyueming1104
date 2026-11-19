/**
 * 姓名：孙跃铭 | 学号：24001011104 | 时间：2026-11-19 | 大模型：豆包大模型（Doubao）
 * 文件说明：科技新闻路由 /api/news
 */
const express = require('express');
const SUN_router = express.Router();
const SUN_newsController = require('../controllers/SUN_newsController');

// GET /api/news —— 新闻列表
SUN_router.get('/', SUN_newsController.SUN_listNews);

// GET /api/news/:id —— 新闻详情
SUN_router.get('/:id', SUN_newsController.SUN_getNewsById);

module.exports = SUN_router;
