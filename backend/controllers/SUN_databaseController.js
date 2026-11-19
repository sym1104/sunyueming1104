/**
 * 姓名：孙跃铭 | 学号：24001011104 | 时间：2026-11-19 | 大模型：豆包大模型（Doubao）
 * 文件说明：数据库连接测试控制器。用于 database.html 页面验证 MySQL 是否可用。
 */
const mysql = require('mysql2/promise');

const SUN_host = process.env.DB_HOST || '127.0.0.1';
const SUN_port = Number(process.env.DB_PORT) || 3306;
const SUN_dbName = process.env.DB_NAME || 'sun_tech_db';

/**
 * 把驱动层的报错转换成人类可读的提示
 * @param {Error} SUN_err 驱动抛出的错误
 */
function SUN_buildErrorMsg(SUN_err) {
  const SUN_code = SUN_err && SUN_err.code ? SUN_err.code : '';
  switch (SUN_code) {
    case 'ER_ACCESS_DENIED_ERROR':
      return '用户名或密码错误，请检查输入（默认 root / root，以 .env 实际配置为准）';
    case 'ECONNREFUSED':
      return 'MySQL 服务未启动或端口不通（' + SUN_host + ':' + SUN_port + '）';
    case 'ETIMEDOUT':
      return '连接超时，请确认 MySQL 服务与防火墙状态';
    case 'ER_BAD_DB_ERROR':
      return '数据库 ' + SUN_dbName + ' 不存在，请先执行 node init/SUN_initDb.js';
    default:
      return (SUN_err && SUN_err.message) || '未知连接错误';
  }
}

/**
 * POST /api/database/test
 * 请求体：{ "SUN_user": "root", "SUN_password": "root" }
 * 兼容简写：{ "user": "root", "password": "root" }
 */
async function SUN_testDatabase(req, res) {
  const SUN_body = req.body || {};
  const SUN_user = SUN_body.SUN_user || SUN_body.user || process.env.DB_USER;
  const SUN_password =
    SUN_body.SUN_password !== undefined
      ? SUN_body.SUN_password
      : SUN_body.password !== undefined
        ? SUN_body.password
        : process.env.DB_PASSWORD;

  // 记录一条服务端日志（不打印密码）
  console.log('[数据库测试] user=' + SUN_user + ' host=' + SUN_host + ':' + SUN_port);

  let SUN_connection = null;
  try {
    SUN_connection = await mysql.createConnection({
      host: SUN_host,
      port: SUN_port,
      user: SUN_user,
      password: SUN_password,
      connectTimeout: 8000
    });

    // 读取版本与主机信息
    const [SUN_verRows] = await SUN_connection.query(
      'SELECT VERSION() AS SUN_version, @@hostname AS SUN_server, @@port AS SUN_port'
    );

    // 检查目标数据库是否存在，存在则列出表名
    const [SUN_dbRows] = await SUN_connection.query('SHOW DATABASES LIKE ?', [SUN_dbName]);
    let SUN_tables = [];
    if (SUN_dbRows.length > 0) {
      const [SUN_tableRows] = await SUN_connection.query('SHOW TABLES FROM ??', [SUN_dbName]);
      SUN_tables = SUN_tableRows.map((SUN_row) => Object.values(SUN_row)[0]);
    }

    await SUN_connection.end();

    res.json({
      code: 0,
      msg: '数据库连接成功',
      data: {
        SUN_connected: true,
        SUN_user: SUN_user,
        SUN_host: SUN_host + ':' + SUN_port,
        SUN_server: SUN_verRows[0].SUN_server,
        SUN_version: SUN_verRows[0].SUN_version,
        SUN_database: SUN_dbName,
        SUN_database_exists: SUN_dbRows.length > 0,
        SUN_tables: SUN_tables
      }
    });
  } catch (SUN_err) {
    if (SUN_connection) {
      try {
        await SUN_connection.end();
      } catch (SUN_ignore) {
        // 关闭失败不影响结果
      }
    }
    const SUN_msg = SUN_buildErrorMsg(SUN_err);
    console.error('[数据库测试失败]', SUN_err && SUN_err.code, SUN_err && SUN_err.message);
    res.status(200).json({
      code: 1,
      msg: '数据库连接失败：' + SUN_msg,
      data: {
        SUN_connected: false,
        SUN_user: SUN_user,
        SUN_host: SUN_host + ':' + SUN_port,
        SUN_error_code: (SUN_err && SUN_err.code) || ''
      }
    });
  }
}

/**
 * GET /api/database/status
 * 使用 .env 中的凭据做一次连通性检查，供首页或排错时调用
 */
async function SUN_databaseStatus(req, res) {
  let SUN_connection = null;
  try {
    SUN_connection = await mysql.createConnection({
      host: SUN_host,
      port: SUN_port,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectTimeout: 8000
    });
    await SUN_connection.ping();
    const [SUN_rows] = await SUN_connection.query('SELECT DATABASE() AS SUN_db');
    await SUN_connection.end();
    res.json({
      code: 0,
      msg: '数据库可用',
      data: {
        SUN_connected: true,
        SUN_host: SUN_host + ':' + SUN_port,
        SUN_database: SUN_rows[0].SUN_db || SUN_dbName
      }
    });
  } catch (SUN_err) {
    if (SUN_connection) {
      try {
        await SUN_connection.end();
      } catch (SUN_ignore) {
        // ignore
      }
    }
    console.error('[数据库状态检查失败]', SUN_err && SUN_err.code);
    res.json({
      code: 1,
      msg: '数据库不可用：' + SUN_buildErrorMsg(SUN_err),
      data: { SUN_connected: false, SUN_host: SUN_host + ':' + SUN_port }
    });
  }
}

module.exports = {
  SUN_testDatabase,
  SUN_databaseStatus
};
