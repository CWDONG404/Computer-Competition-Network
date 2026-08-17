# CCN 赛事数据全量核验记录（2026-08-17）

## 本次范围

- 核验对象：目录中的全部 70 场比赛。
- 核验时点：2026 年 8 月 17 日（Asia/Shanghai）。
- 资料边界：只采用主办方官网、官方规则、官方公告和官方赛事系统。
- 空值规则：官网未公布的日期继续为 `null`；多赛道、系列赛和聚合赛事不写虚假的统一截止日。
- 发布规则：监测到的页面变化先人工核验，本次确认后才写入公开目录；抓取失败不会自动修改公开数据。

## 核验结果

| 状态 | 数量 | 含义 |
| --- | ---: | --- |
| 报名中 | 7 | 官方仍有可参与窗口，或按项目持续接收申请 |
| 即将开始 | 12 | 当前报名已结束或资格受限，但官方已确认未来赛期 |
| 持续开放 | 8 | 滚动 Round、多场系列或按 term 开放 |
| 待官方公告 | 17 | 当前轮次或统一日程不足以安全写入 |
| 当前不可报名 | 26 | 报名机会或本轮赛事已结束；进行中的获选项目会在备注中单独说明 |

本轮有 37 场比赛获得至少一个可核验日期；70 场比赛的公开核验日期统一更新为 2026-08-17。

## 当前可行动机会

| 比赛 | 当前窗口 | 官方依据 |
| --- | --- | --- |
| 第八届中国研究生人工智能创新大赛 | 8 月 25 日报名截止，9 月 1 日作品截止 | [赛事主页](https://cpipc.acge.org.cn/cw/hp/2c9088a5696cbf370169a3f8101510bd) |
| 2026 科大讯飞 AI 开发者大赛 | 多赛题独立截止；当前可核验的最晚截止为 8 月 30 日 | [官方赛题目录](https://challenge.xfyun.cn/competition) |
| Junction 2026 | 9 月 6 日申请截止，11 月 13—15 日举行 | [Junction 2026](https://2026.hackjunction.com/) |
| CUMCM 2026 | 9 月 10—13 日举行；境内报名按赛区和学校通知 | [中文官网](https://www.mcm.edu.cn/) / [海外通道](https://en.mcm.edu.cn/) |
| 华为杯第二十三届研究生数学建模竞赛 | 9 月 19 日报名截止，9 月 23—27 日比赛 | [官方赛事页](https://cpipc.acge.org.cn/cw/hp/4) |
| Pwn2Own Ireland 2026 | 10 月 1 日报名截止，10 月 6—9 日比赛 | [官方规则](https://www.zerodayinitiative.com/Pwn2OwnIreland2026Rules.html) |
| 开源之夏 2026 | 项目上线后持续报名、持续审核 | [2026 学生指南](https://blog2026.summer-ospp.ac.cn/help/student%20guide) |

## 已确认的近期赛期

- 中国大学生服务外包创新创业大赛：剩余决赛于 8 月 20—22 日举行。[官方通知](https://www.fwwb.org.cn/news/show/658)
- 中国软件杯：线上总决赛 8 月 21—23 日，A7 赛题 8 月 30 日评审。[官方通知](https://www.cnsoftbei.com/content-1-1357-1.html)
- CCF CSP43：9 月 13 日举行，报名窗口待公告。[官方年度通知](https://www.cspro.org/cms/show.action?channelid=0000000103&code=publish_4028807662f1ccee0162f55d6abc0037&newsid=3e9d3e8bac9a4da5aa2c8b75981add09&siteid=100000)
- Hack the North：9 月 18—20 日举行。[官网](https://hackthenorth.com/)
- HackMIT：9 月 19—20 日举行，申请已结束。[官网](https://hackmit.org/)
- WorldSkills Shanghai 2026：9 月 22—27 日举行，包含云计算与网络系统管理项目。[官网](https://worldskills.org/what/competitions/worldskills-shanghai-2026/)
- IEEEXtreme 20.0：10 月 31 日 00:00 UTC 开始，持续 24 小时。[官方说明](https://ieeextreme.org/proctor-eligibility-and-requirements/)
- NASA Space Apps：11 月 14—15 日举行；中国关联限制须在报名前核对。[2026 参赛条款](https://www.spaceappschallenge.org/legal/)
- SC26 Student Cluster Competition：11 月 16—18 日举行。[官方页面](https://sc26.supercomputing.org/students/student-cluster-competition/)
- 第 50 届 ICPC 世界总决赛：11 月 15—20 日在迪拜举行。[官方页面](https://worldfinals.icpc.global/2026/)

## 重要纠正

- Pwn2Own 已从结束的 Berlin 2026 切换为正在报名的 Ireland 2026。
- RoboMaster 2026 全国赛已结束，官方于 8 月 12 日发布获奖名单。
- Microsoft Imagine Cup 2026 已结束。
- HackZurich 官网明确处于暂停状态。
- AWS DeepRacer Student 已停止新注册且 Student Portal 已下线，不再作为活跃赛事展示。
- CCF BDCI 未找到 2026 届官方公告，撤回原目录中“2026 已启动”的表述。
- NASA 2026 条款包含与中国（含港澳）及中资实体、院校有关的参与限制；网站已在资格条件中明确提示。

## 动态页面与失败边界

本轮使用 Crawl4AI 对 NASA 条款页和 RoboMaster 公告页进行了动态页面复核，两页均成功提取；HackMIT 页面触发站点反自动化保护，因此没有绕过，而是改用其官方页面索引与官方申请子站交叉核验。生产监测中的 HTTP 403、JavaScript 依赖或正文过短任务仍保留在后台待审箱，不会因抓取失败改变公开资料。

## 数据落点

- `data/catalog-v2.mjs`：2026-08-17 赛事快照及官方来源。
- `scripts/seed.mjs`：目录版本升级为 4，继续遵守 `catalog_managed` 所有权保护。
- 数据库导入仍保留管理员接管条目，不覆盖 `catalog_managed = false` 的人工资料。
