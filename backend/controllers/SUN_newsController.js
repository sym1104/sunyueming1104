/**
 * 姓名：孙跃铭 | 学号：24001011104 | 时间：2026-11-19 | 大模型：豆包大模型（Doubao）
 * 文件说明：科技新闻控制器（Controller）。统一返回 { code, msg, data }。
 */
const SUN_newsModel = require('../models/SUN_newsModel');

/**
 * GET /api/news 新闻列表
 */
async function SUN_listNews(req, res) {
  try {
    const SUN_list = await SUN_newsModel.SUN_findAllNews();
    res.json({
      code: 0,
      msg: '科技新闻查询成功，共 ' + SUN_list.length + ' 条',
      data: {
        SUN_total: SUN_list.length,
        SUN_list: SUN_list
      }
    });
  } catch (SUN_err) {
    console.error('[新闻接口异常]', SUN_err);
    res.json({
      code: 1,
      msg: '科技新闻查询失败：' + SUN_err.message,
      data: { SUN_list: [] }
    });
  }
}

/**
 * GET /api/news/:id 新闻详情
 */
async function SUN_getNewsById(req, res) {
  try {
    const SUN_id = Number(req.params.id);
    if (!SUN_id) {
      return res.json({ code: 2, msg: '参数错误：id 必须是数字', data: null });
    }
    const SUN_item = await SUN_newsModel.SUN_findNewsById(SUN_id);
    if (!SUN_item) {
      return res.json({ code: 3, msg: '未找到 id=' + SUN_id + ' 的新闻', data: null });
    }
    res.json({ code: 0, msg: '查询成功', data: { SUN_item: SUN_item } });
  } catch (SUN_err) {
    console.error('[新闻详情异常]', SUN_err);
    res.json({ code: 1, msg: '新闻详情查询失败：' + SUN_err.message, data: null });
  }
}

module.exports = {
  SUN_listNews,
  SUN_getNewsById
};
