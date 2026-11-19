/**
 * 姓名：孙跃铭 | 学号：24001011104 | 时间：2026-11-19 | 大模型：豆包大模型（Doubao）
 * 文件说明：图文数据访问层（Model）。
 */
const { SUN_query } = require('../config/SUN_dbConfig');

/**
 * 查询全部图文，按创建时间倒序
 */
async function SUN_findAllGallery() {
  const SUN_sql = `
    SELECT SUN_id, SUN_title, SUN_image, SUN_intro,
           SUN_tag, SUN_create_time
    FROM SUN_gallery
    ORDER BY SUN_create_time DESC, SUN_id DESC
  `;
  const [SUN_rows] = await SUN_query(SUN_sql);
  return SUN_rows;
}

/**
 * 按主键查询单条图文
 * @param {number} SUN_id 图文 ID
 */
async function SUN_findGalleryById(SUN_id) {
  const SUN_sql = `
    SELECT SUN_id, SUN_title, SUN_image, SUN_intro,
           SUN_tag, SUN_create_time
    FROM SUN_gallery
    WHERE SUN_id = ?
  `;
  const [SUN_rows] = await SUN_query(SUN_sql, [SUN_id]);
  return SUN_rows[0] || null;
}

module.exports = {
  SUN_findAllGallery,
  SUN_findGalleryById
};
