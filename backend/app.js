/**
 * 姓名：孙跃铭 | 学号：24001011104 | 时间：2026-11-19 | 大模型：豆包大模型（Doubao）
 * 文件说明：后端入口。Express 服务固定 8325 端口，/api 前缀，静态托管 frontend。
 */
const path = require('path');

// 优先从 backend/.env 读取数据库与端口配置
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const SUN_apiRoutes = require('./routes/SUN_apiRoutes');

const SUN_app = express();
const SUN_PORT = Number(process.env.PORT) || 8325;
const SUN_frontendDir = path.join(__dirname, '..', 'frontend');

// ---------- 跨域：支持所有来源 ----------
SUN_app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
SUN_app.options('*', cors());

// ---------- 请求体解析 ----------
SUN_app.use(express.json({ limit: '2mb' }));
SUN_app.use(express.urlencoded({ extended: true }));

// ---------- 静态资源：托管 frontend 目录 ----------
// extensions: ['html'] 让 /news 也能命中 news.html
SUN_app.use(
  express.static(SUN_frontendDir, {
    extensions: ['html'],
    index: 'index.html'
  })
);

// ---------- RESTful 接口 ----------
SUN_app.use('/api', SUN_apiRoutes);

// 根路径显式返回首页
SUN_app.get('/', (req, res) => {
  res.sendFile(path.join(SUN_frontendDir, 'index.html'));
});

// ---------- /api 下的 404 ----------
SUN_app.use('/api', (req, res) => {
  console.warn('[API 404]', req.method, req.originalUrl);
  res.status(404).json({
    code: 404,
    msg: '接口不存在：' + req.originalUrl,
    data: null
  });
});

// ---------- 统一错误处理 ----------
SUN_app.use((SUN_err, req, res, next) => {
  console.error('[服务器错误]', SUN_err);
  res.status(500).json({
    code: 500,
    msg: '服务器内部错误：' + (SUN_err && SUN_err.message ? SUN_err.message : '未知错误'),
    data: null
  });
});

// ---------- 启动 ----------
SUN_app.listen(SUN_PORT, () => {
  console.log('============================================');
  console.log('  科技视界 TechScope 后端已启动');
  console.log('  姓名：孙跃铭 | 学号：24001011104');
  console.log('  访问地址：http://localhost:' + SUN_PORT);
  console.log('  接口前缀：http://localhost:' + SUN_PORT + '/api');
  console.log('  数据库：' + (process.env.DB_NAME || '(未配置)') + ' @ ' + (process.env.DB_HOST || '(未配置)'));
  console.log('============================================');
});
