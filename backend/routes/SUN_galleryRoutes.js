/**
 * 姓名：孙跃铭 | 学号：24001011104 | 时间：2026-11-19 | 大模型：豆包大模型（Doubao）
 * 文件说明：图文列表路由 /api/gallery
 */
const express = require('express');
const SUN_router = express.Router();
const SUN_galleryController = require('../controllers/SUN_galleryController');

// GET /api/gallery —— 图文列表
SUN_router.get('/', SUN_galleryController.SUN_listGallery);

// GET /api/gallery/:id —— 图文详情
SUN_router.get('/:id', SUN_galleryController.SUN_getGalleryById);

module.exports = SUN_router;
