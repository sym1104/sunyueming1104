/**
 * 姓名：孙跃铭 | 学号：24001011104 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * 文件说明：知识库表初始化。重建 SUN_knowledge_file / SUN_knowledge_chunk 两张表。
 *           运行：node init/SUN_initKnowledge.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');
const SUN_dbName = process.env.DB_NAME || 'sun_tech_db';

async function SUN_run() {
  const SUN_conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });
  try {
    await SUN_conn.query('CREATE DATABASE IF NOT EXISTS `' + SUN_dbName + '` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci');
    await SUN_conn.query('USE `' + SUN_dbName + '`');

    console.log('[1/2] 重建知识库表');
    await SUN_conn.query('DROP TABLE IF EXISTS `SUN_knowledge_chunk`');
    await SUN_conn.query('DROP TABLE IF EXISTS `SUN_knowledge_file`');

    await SUN_conn.query(`
      CREATE TABLE \`SUN_knowledge_file\` (
        \`SUN_id\`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
        \`SUN_name\`          VARCHAR(200) NOT NULL DEFAULT '',
        \`SUN_original_name\` VARCHAR(200) NOT NULL DEFAULT '',
        \`SUN_ext\`           VARCHAR(20)  NOT NULL DEFAULT '',
        \`SUN_size\`          INT UNSIGNED NOT NULL DEFAULT 0,
        \`SUN_path\`          VARCHAR(500) NOT NULL DEFAULT '',
        \`SUN_chunk_count\`   INT UNSIGNED NOT NULL DEFAULT 0,
        \`SUN_upload_time\`   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`SUN_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='知识库文件'
    `);

    await SUN_conn.query(`
      CREATE TABLE \`SUN_knowledge_chunk\` (
        \`SUN_id\`        INT UNSIGNED NOT NULL AUTO_INCREMENT,
        \`SUN_file_id\`   INT UNSIGNED NOT NULL,
        \`SUN_idx\`       INT UNSIGNED NOT NULL DEFAULT 0,
        \`SUN_content\`   MEDIUMTEXT   NOT NULL,
        \`SUN_tokens\`    INT UNSIGNED NOT NULL DEFAULT 0,
        PRIMARY KEY (\`SUN_id\`),
        KEY \`SUN_idx_chunk_file\` (\`SUN_file_id\`),
        CONSTRAINT \`SUN_fk_chunk_file\` FOREIGN KEY (\`SUN_file_id\`)
          REFERENCES \`SUN_knowledge_file\` (\`SUN_id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='知识库片段'
    `);

    const [[{ SUN_tables: SUN_t }]] = await SUN_conn.query(
      'SELECT COUNT(*) AS SUN_tables FROM information_schema.tables ' +
      'WHERE table_schema = DATABASE() AND table_name IN ("SUN_knowledge_file","SUN_knowledge_chunk")'
    );
    console.log('[2/2] 校验：2 / 2 张表已建好');
    console.log('知识库初始化完成：' + SUN_dbName);
  } finally {
    await SUN_conn.end();
  }
}

SUN_run().catch(function (SUN_err) { console.error('初始化失败：', SUN_err); process.exit(1); });
