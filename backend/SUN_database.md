# SUN_database.md · 数据库记录

> 姓名：孙跃铭 | 学号：24001011104 | 时间：2026-11-19 | 大模型：豆包大模型（Doubao）
> 说明：本文件按执行顺序记录建库、建表与测试数据，只追加不覆盖。
> 仅凭本文件即可在新机器上完整重建数据库（MySQL 8.0，字符集 utf8mb4）。
> 环境提示：Windows 下 MySQL 默认 `lower_case_table_names=1`，建表时写的 `SUN_news`/`SUN_gallery` 在 `SHOW TABLES` 中会显示为全小写 `sun_news`/`sun_gallery`；字段名仍保留 `SUN_` 大小写，接口读写不受影响。

---

## 1. 建库（2026-11-19 09:55）

```sql
CREATE DATABASE IF NOT EXISTS `sun_tech_db`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE `sun_tech_db`;
```

---

## 2. 科技新闻表 SUN_news（2026-11-19 09:56）

```sql
DROP TABLE IF EXISTS `SUN_news`;

CREATE TABLE `SUN_news` (
  `SUN_id`           INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '新闻主键',
  `SUN_title`        VARCHAR(200) NOT NULL                COMMENT '标题',
  `SUN_summary`      VARCHAR(500) NOT NULL DEFAULT ''     COMMENT '摘要',
  `SUN_source`       VARCHAR(100) NOT NULL DEFAULT ''     COMMENT '来源',
  `SUN_category`     VARCHAR(50)  NOT NULL DEFAULT ''     COMMENT '分类',
  `SUN_publish_time` DATETIME     NOT NULL                COMMENT '发布时间',
  `SUN_image`        VARCHAR(500) NOT NULL DEFAULT ''     COMMENT '配图地址',
  `SUN_views`        INT UNSIGNED NOT NULL DEFAULT 0      COMMENT '浏览量',
  PRIMARY KEY (`SUN_id`),
  KEY `SUN_idx_publish_time` (`SUN_publish_time`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_general_ci
  COMMENT='科技新闻表';
```

### 2.1 科技新闻测试数据（8 条，示例内容，非真实新闻事实）

```sql
INSERT INTO `SUN_news`
  (`SUN_title`, `SUN_summary`, `SUN_source`, `SUN_category`, `SUN_publish_time`, `SUN_image`, `SUN_views`)
VALUES
('多模态大模型端侧推理成本下降三成，轻量化成为新赛点',
 '多家开源社区发布面向移动端的量化版本，7B 级模型在中端手机上即可实现每秒 20 token 以上的输出，推理能耗同步下降。',
 '科技前线', '人工智能', '2026-11-18 09:20:00', '/images/SUN_tech_03.png', 1286),
('新一代移动芯片发布：4nm 制程配独立 NPU，能效比提升约 25%',
 '新平台把图形、影像与 AI 计算拆分为三个独立单元，长时间高负载下的机身温度比上一代低 4 摄氏度左右。',
 '芯片观察', '半导体', '2026-11-17 14:05:00', '/images/SUN_tech_03.png', 962),
('一体化算力网新增 8 个智算节点，公共算力调度平台上线试运行',
 '新增节点覆盖东中西部，跨区域调度可将空闲算力按小时粒度分配给高校与中小企业，试用期按实际用量计费。',
 '算力周刊', '基础设施', '2026-11-16 10:30:00', '/images/SUN_tech_01.png', 745),
('量子计算原型机完成 512 比特纠错演示，逻辑比特寿命提升 3 倍',
 '研究团队采用表面码方案，在低温环境下连续运行 6 小时，逻辑比特错误率首次低于物理比特的平均水平。',
 '量子前沿', '量子计算', '2026-11-15 16:40:00', '/images/SUN_tech_02.png', 531),
('低轨卫星互联网完成首次组网测试，端到端时延低于 30 毫秒',
 '测试覆盖三段跨洲链路，地面关口站完成 12 次无感切换，视频会议与远程运维场景均通过验收。',
 '空天通讯', '卫星互联网', '2026-11-14 08:50:00', '/images/SUN_tech_04.png', 908),
('固态电池中试线投产，单体能量密度达到 400 Wh/kg',
 '中试线采用硫化物电解质与干法电极工艺，首批样品通过 300 次循环测试，容量保持率仍在 90% 以上。',
 '新能源观察', '新能源', '2026-11-13 11:15:00', '/images/SUN_tech_05.png', 1024),
('开源操作系统生态设备规模突破 10 亿，开发工具链同步升级',
 '新版本工具链支持一次编译多端部署，分布式软总线调试面板可直接查看跨设备任务迁移过程。',
 '开源社区日报', '操作系统', '2026-11-12 17:25:00', '/images/SUN_tech_07.png', 673),
('AI 辅助编程进入企业研发流程，代码评审平均耗时缩短 40%',
 '在 20 家试点企业的统计中，静态缺陷提前拦截率提高到 62%，人工评审更多聚焦架构与业务逻辑。',
 '软件工程周刊', '软件工程', '2026-11-10 09:10:00', '/images/SUN_tech_08.png', 845);
```

---

## 3. 图文列表 SUN_gallery（2026-11-19 10:10）

```sql
DROP TABLE IF EXISTS `SUN_gallery`;

CREATE TABLE `SUN_gallery` (
  `SUN_id`          INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '图文主键',
  `SUN_title`       VARCHAR(200) NOT NULL                COMMENT '标题',
  `SUN_image`       VARCHAR(500) NOT NULL DEFAULT ''     COMMENT '图片地址',
  `SUN_intro`       VARCHAR(500) NOT NULL DEFAULT ''     COMMENT '简介',
  `SUN_tag`         VARCHAR(50)  NOT NULL DEFAULT ''     COMMENT '标签',
  `SUN_create_time` DATETIME     NOT NULL                COMMENT '创建时间',
  PRIMARY KEY (`SUN_id`),
  KEY `SUN_idx_create_time` (`SUN_create_time`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_general_ci
  COMMENT='图文列表';
```

### 3.1 图文测试数据（8 条，示例内容）

```sql
INSERT INTO `SUN_gallery`
  (`SUN_title`, `SUN_image`, `SUN_intro`, `SUN_tag`, `SUN_create_time`)
VALUES
('智算中心机房：液冷机柜与夜间巡检',
 '/images/SUN_tech_01.png',
 '整排液冷机柜在夜间低负荷运行，状态指示灯连成一条流动的青绿色光带，巡检机器人沿过道缓慢移动。',
 '基础设施', '2026-11-19 08:30:00'),
('量子实验室：稀释制冷机内部结构',
 '/images/SUN_tech_02.png',
 '多层屏蔽线与同轴接口层层包裹，为超导比特提供接近绝对零度的工作环境，布线密度极高。',
 '量子科技', '2026-11-18 15:10:00'),
('晶圆与先进封装：从 12 英寸硅片到 Chiplet',
 '/images/SUN_tech_03.png',
 '晶圆表面密布重复的计算单元，切割后经由先进封装组合成完整芯片，互连间距进入微米级。',
 '芯片制造', '2026-11-17 09:45:00'),
('低轨卫星组网示意：三层星座与地面关口站',
 '/images/SUN_tech_04.png',
 '三层不同高度的轨道面交错运行，地面关口站负责星地链路切换与流量汇聚，形成连续覆盖。',
 '卫星通信', '2026-11-16 14:20:00'),
('固态电池中试线：叠片与等静压工序',
 '/images/SUN_tech_05.png',
 '固态电解质膜与极片交替叠放，经等静压后形成致密电芯结构，整线节拍控制在每分钟 12 片。',
 '新能源', '2026-11-15 10:05:00'),
('人形机器人装配线：关节模组与整机标定',
 '/images/SUN_tech_06.png',
 '六轴机械臂完成关节模组装配，随后在标定台上校准全身运动学参数，重复定位精度达到 0.02 毫米。',
 '机器人', '2026-11-14 16:35:00'),
('城市数字孪生：实时渲染的三维路网与能耗热力',
 '/images/SUN_tech_07.png',
 '道路、管网与楼宇以三维模型同步呈现，能耗热力图层叠加显示区域负荷，异常点位自动高亮。',
 '数字孪生', '2026-11-13 11:50:00'),
('AI 辅助编程工作台：从需求到单元测试',
 '/images/SUN_tech_08.png',
 '左侧是自然语言需求描述，右侧自动生成代码与测试用例，评审建议以行内标注的形式给出。',
 '软件工程', '2026-11-12 09:25:00');
```

---

## 4. 重建与校验（2026-11-19 11:20）

在新机器上按以下顺序执行即可完整重建：

```sql
-- 4.1 依次执行第 1 ~ 3 节的全部 SQL
-- 4.2 校验数据量
SELECT COUNT(*) AS SUN_total FROM `SUN_news`;     -- 期望 8
SELECT COUNT(*) AS SUN_total FROM `SUN_gallery`;  -- 期望 8

-- 4.3 查看表结构
SHOW CREATE TABLE `SUN_news`;
SHOW CREATE TABLE `SUN_gallery`;
```

> 也可以直接运行项目内脚本：`cd backend && node init/SUN_initDb.js`，脚本会读取 `.env` 自动完成上述全部操作。
