/**
 * 姓名：孙跃铭 | 学号：24001011104 | 时间：2026-11-19 | 大模型：豆包大模型（Doubao）
 * 文件说明：数据库连接池配置（凭据全部来自 backend/.env，不在代码中硬编码）。
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mysql = require('mysql2/promise');

// 全局连接池：供 models 层复用，避免每个请求重新建立连接
const SUN_pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
  // 让 DATETIME 以字符串返回，前端直接展示即可
  dateStrings: true
});

/**
 * 统一的查询方法：返回 [rows, fields]
 * @param {string} SUN_sql  SQL 语句（使用 ? 占位符）
 * @param {Array} SUN_params 占位符参数
 */
async function SUN_query(SUN_sql, SUN_params) {
  return SUN_pool.query(SUN_sql, SUN_params || []);
}

module.exports = {
  SUN_pool,
  SUN_query
};
