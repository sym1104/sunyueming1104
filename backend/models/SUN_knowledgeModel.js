/**
 * 姓名：孙跃铭 | 学号：24001011104 | 时间：2026-11-23 | 大模型：DeepSeek-V4.1-Flash
 * 文件说明：知识库文件 / 片段数据访问层。
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const mysql = require('mysql2/promise');

const SUN_pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'sun_tech_db',
  waitForConnections: true,
  connectionLimit: 5,
  charset: 'utf8mb4'
});

// ============ SUN_knowledge_file ============

async function SUN_createFile(SUN_data) {
  const [res] = await SUN_pool.execute(
    `INSERT INTO SUN_knowledge_file
       (SUN_name, SUN_original_name, SUN_ext, SUN_size, SUN_path, SUN_chunk_count)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      SUN_data.name,
      SUN_data.original_name,
      SUN_data.ext,
      SUN_data.size,
      SUN_data.path,
      SUN_data.chunk_count || 0
    ]
  );
  return res.insertId;
}

async function SUN_listFiles() {
  const [rows] = await SUN_pool.execute(
    `SELECT SUN_id, SUN_name, SUN_original_name, SUN_ext, SUN_size,
            SUN_chunk_count, SUN_upload_time
     FROM SUN_knowledge_file
     ORDER BY SUN_upload_time DESC`
  );
  return rows;
}

async function SUN_deleteFile(SUN_id) {
  await SUN_pool.execute('DELETE FROM SUN_knowledge_chunk WHERE SUN_file_id = ?', [SUN_id]);
  await SUN_pool.execute('DELETE FROM SUN_knowledge_file WHERE SUN_id = ?', [SUN_id]);
}

// ============ SUN_knowledge_chunk ============

async function SUN_insertChunks(SUN_fileId, SUN_chunks) {
  if (!SUN_chunks.length) return;
  const SUN_rows = SUN_chunks.map(function (SUN_c, SUN_i) {
    return [SUN_fileId, SUN_i, SUN_c.content, SUN_c.tokens || SUN_c.content.length];
  });
  await SUN_pool.query(
    `INSERT INTO SUN_knowledge_chunk
       (SUN_file_id, SUN_idx, SUN_content, SUN_tokens)
     VALUES ?`,
    [SUN_rows]
  );
}

async function SUN_searchChunks(SUN_fileIds, SUN_topK) {
  let SUN_sql = 'SELECT c.SUN_id, c.SUN_file_id, c.SUN_idx, c.SUN_content, ' +
    'f.SUN_original_name, f.SUN_name, f.SUN_ext ' +
    'FROM SUN_knowledge_chunk c JOIN SUN_knowledge_file f ON c.SUN_file_id = f.SUN_id ';
  if (SUN_fileIds && SUN_fileIds.length) {
    const SUN_ph = SUN_fileIds.map(function () { return '?'; }).join(',');
    SUN_sql += 'WHERE c.SUN_file_id IN (' + SUN_ph + ') ';
  }
  SUN_sql += 'ORDER BY c.SUN_idx ASC LIMIT ' + Number(SUN_topK || 20);
  const [rows] = await SUN_pool.execute(SUN_sql, SUN_fileIds || []);
  return rows;
}

async function SUN_poolEnd() {
  await SUN_pool.end();
}

module.exports = {
  SUN_pool: SUN_pool,
  SUN_createFile: SUN_createFile,
  SUN_listFiles: SUN_listFiles,
  SUN_deleteFile: SUN_deleteFile,
  SUN_insertChunks: SUN_insertChunks,
  SUN_searchChunks: SUN_searchChunks,
  SUN_poolEnd: SUN_poolEnd
};
