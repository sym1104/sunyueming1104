/**
 * 姓名：孙跃铭 | 学号：24001011104 | 时间：2026-11-19 | 大模型：豆包大模型（Doubao）
 * 文件说明：数据库连接测试路由 /api/database
 */
const express = require('express');
const SUN_router = express.Router();
const SUN_databaseController = require('../controllers/SUN_databaseController');

// POST /api/database/test —— 使用页面传入的用户名、密码测试连接
SUN_router.post('/test', SUN_databaseController.SUN_testDatabase);

// GET /api/database/status —— 使用 .env 凭据检查连接状态
SUN_router.get('/status', SUN_databaseController.SUN_databaseStatus);

module.exports = SUN_router;
