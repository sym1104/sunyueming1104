/**
 * 姓名：孙跃铭 | 学号：24001011104 | 时间：2026-11-19 | 大模型：豆包大模型（Doubao）
 * 文件说明：科技新闻数据访问层（Model）。
 */
const { SUN_query } = require('../config/SUN_dbConfig');

/**
 * 查询全部新闻，按发布时间倒序
 */
async function SUN_findAllNews() {
  const SUN_sql = `
    SELECT SUN_id, SUN_title, SUN_summary, SUN_source,
           SUN_category, SUN_publish_time, SUN_image, SUN_views
    FROM SUN_news
    ORDER BY SUN_publish_time DESC, SUN_id DESC
  `;
  const [SUN_rows] = await SUN_query(SUN_sql);
  return SUN_rows;
}

/**
 * 按主键查询单条新闻
 * @param {number} SUN_id 新闻 ID
 */
async function SUN_findNewsById(SUN_id) {
  const SUN_sql = `
    SELECT SUN_id, SUN_title, SUN_summary, SUN_source,
           SUN_category, SUN_publish_time, SUN_image, SUN_views
    FROM SUN_news
    WHERE SUN_id = ?
  `;
  const [SUN_rows] = await SUN_query(SUN_sql, [SUN_id]);
  return SUN_rows[0] || null;
}

module.exports = {
  SUN_findAllNews,
  SUN_findNewsById
};
