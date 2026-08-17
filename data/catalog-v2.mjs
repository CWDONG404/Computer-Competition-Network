const VERIFIED_AT = "2026-08-04";
const LIVE_COMPETITION_VERIFIED_AT = "2026-08-17";

export const evidenceLabels = {
  government: "政府部门主办或指导",
  cahe_catalog: "中国高等教育学会竞赛目录",
  international_org: "国际专业组织",
  national_qualification: "国家职业资格",
  official_vendor: "厂商官方认证",
  hands_on_exam: "实操型考试",
  experience_required: "工作经验要求",
  public_output: "公开排行榜或作品产出",
  renewal_required: "继续教育或续证要求"
};

const trackCopy = {
  "算法与程序设计": ["算法设计、程序实现与限时协作", "希望系统训练算法并用公开成绩检验阶段水平的学习者"],
  "人工智能与数据": ["数据分析、建模、机器学习与可复现实验", "希望积累数据项目、研究成果或建模作品的学习者"],
  "网络安全": ["漏洞分析、攻防实践、取证与安全工程", "已经具备计算机基础并希望进入安全方向的学习者"],
  "软件工程与开源": ["需求分析、工程实现、协作开发与开源贡献", "希望把课程能力转化为真实软件作品的学习者"],
  "创新创业与黑客松": ["快速原型、跨专业协作、产品表达与现场交付", "希望在短周期内完成可展示产品的团队"],
  "云计算与网络": ["云平台、网络架构、自动化运维与故障排查", "希望验证基础设施与网络实践能力的学习者"],
  "系统与高性能计算": ["系统实现、并行计算、嵌入式与软硬件协同", "对底层系统、算力平台或智能硬件感兴趣的学习者"],
  "国内职业资格": ["国内信息技术专业能力与职业资格知识体系", "需要职称、岗位能力证明或系统化学习路径的在职人员"],
  "云平台": ["公有云架构、部署、安全与成本治理", "从事云平台开发、架构或运维工作的技术人员"],
  "网络": ["企业网络设计、配置、排障与安全基础", "从事网络工程、基础设施或技术支持工作的人员"],
  "Linux与云原生": ["Linux、容器编排、自动化与云原生平台工程", "从事运维、SRE、平台工程或云原生开发的人员"],
  "数据与软件工程": ["数据库、数据工程、软件开发与开发者平台", "希望验证数据或软件工程专项能力的技术人员"]
};

const competitionDefaults = {
  kind: "competition",
  audience: ["大学生"],
  level: "公开规则与官方结果可核验",
  format: "以本届官方规则为准",
  region: "不限",
  registration_start: null,
  registration_end: null,
  event_start: null,
  event_end: null,
  status: "awaiting",
  cycle_type: "annual",
  eligibility: "参赛资格与组队要求以本届官方规则为准",
  language: "中文或英文",
  validity_period: null,
  featured: false,
  published: true,
  verified_at: VERIFIED_AT
};

const certificationDefaults = {
  kind: "certification",
  audience: ["在职", "大学生"],
  level: "方向认可",
  format: "线上监考或授权考试中心",
  region: "全球或中国大陆考点",
  registration_start: null,
  registration_end: null,
  event_start: null,
  event_end: null,
  status: "year_round",
  cycle_type: "on_demand",
  eligibility: "报考条件、考试语言与考点供应以认证方最新政策为准",
  language: "中文或英文，以官方可选语言为准",
  validity_period: "以认证方续证政策为准",
  featured: false,
  published: true,
  verified_at: VERIFIED_AT
};

function makeCompetition([title, slug, organizer, official_url, track, options = {}]) {
  const [ability, audienceValue] = trackCopy[track];
  const evidence = options.evidence ?? ["public_output"];
  return {
    ...competitionDefaults,
    ...options,
    title,
    slug,
    organizer,
    official_url,
    source_url: options.source_url ?? official_url,
    short_title: options.short_title ?? null,
    summary: options.summary ?? `${title}由${organizer}组织，重点考察${ability}。`,
    categories: [track, ...(options.categories ?? [])],
    schedule_note: options.schedule_note ?? "本期时间尚未从官方页面确认；请查看官网最新公告，本站不会按往年日期推算。",
    recognition: options.recognition ?? `可核验证据包括：${evidence.map((code) => evidenceLabels[code]).join("、")}。具体校内认定以所在学校政策为准。`,
    recommendation: options.recommendation ?? `适合${audienceValue}，建议先阅读规则、往届任务与结果，再评估准备周期。`,
    fee: options.fee ?? null,
    team_size: options.team_size ?? null,
    evidence
  };
}

function makeCertification([title, slug, organizer, official_url, track, options = {}]) {
  const [ability, audienceValue] = trackCopy[track];
  const evidence = options.evidence ?? ["official_vendor"];
  return {
    ...certificationDefaults,
    ...options,
    title,
    slug,
    organizer,
    official_url,
    source_url: options.source_url ?? official_url,
    short_title: options.short_title ?? null,
    summary: options.summary ?? `${title}由${organizer}提供，用于验证${ability}。`,
    categories: [track, ...(options.categories ?? [])],
    schedule_note: options.schedule_note ?? "通常可按认证方开放的考试窗口预约；考位、费用和版本变化请以官网为准。",
    recognition: options.recognition ?? `可核验证据包括：${evidence.map((code) => evidenceLabels[code]).join("、")}。本站不将证书等同于就业承诺。`,
    recommendation: options.recommendation ?? `适合${audienceValue}；报考前应核对先修经验、考试版本、续证要求与所在地区考位。`,
    fee: options.fee ?? "以认证方结算页面为准",
    team_size: null,
    evidence
  };
}

const competitionEntries = [
  // 算法与程序设计 · 14
  ["ICPC 国际大学生程序设计竞赛", "icpc", "ICPC Foundation", "https://icpc.global/", "算法与程序设计", { evidence: ["international_org", "public_output"], featured: true, team_size: "通常为高校三人队，按区域赛规则报名" }],
  ["CCPC 中国大学生程序设计竞赛", "ccpc", "中国大学生程序设计竞赛组委会", "https://ccpc.io/", "算法与程序设计", { evidence: ["cahe_catalog", "public_output"], featured: true }],
  ["蓝桥杯全国软件和信息技术专业人才大赛", "lanqiao-cup", "蓝桥杯大赛组委会", "https://dasai.lanqiao.cn/", "算法与程序设计", { evidence: ["cahe_catalog", "public_output"], featured: true }],
  ["CCF 计算机软件能力认证 CSP", "ccf-csp", "中国计算机学会", "https://www.cspro.org/", "算法与程序设计", { evidence: ["public_output"], audience: ["大学生", "在职"] }],
  ["中国高校计算机大赛—团体程序设计天梯赛", "gplt", "中国高校计算机大赛组委会", "https://gplt.patest.cn/regulation", "算法与程序设计", { evidence: ["cahe_catalog", "public_output"], team_size: "高校组队参赛，以当届规则为准" }],
  ["全国大学生计算机系统能力大赛—编译系统设计赛", "educg-compiler", "全国大学生计算机系统能力大赛组委会", "https://compiler.educg.net/", "算法与程序设计", { evidence: ["cahe_catalog", "public_output"], categories: ["编译原理"] }],
  ["PAT 计算机程序设计能力考试", "pat", "浙江大学", "https://www.patest.cn/", "算法与程序设计", { evidence: ["public_output"], audience: ["大学生", "在职"], cycle_type: "rolling" }],
  ["Codeforces Round", "codeforces-round", "Codeforces", "https://codeforces.com/contests", "算法与程序设计", { evidence: ["public_output"], audience: ["大学生", "在职", "社会人士"], cycle_type: "rolling", status: "year_round" }],
  ["AtCoder Contest", "atcoder-contest", "AtCoder", "https://atcoder.jp/contests/", "算法与程序设计", { evidence: ["public_output"], audience: ["大学生", "在职", "社会人士"], cycle_type: "rolling", status: "year_round" }],
  ["Meta Hacker Cup", "meta-hacker-cup", "Meta", "https://www.facebook.com/codingcompetitions/hacker-cup", "算法与程序设计", { evidence: ["official_vendor", "public_output"], audience: ["大学生", "在职", "社会人士"] }],
  ["LeetCode 周赛与双周赛", "leetcode-contests", "LeetCode", "https://leetcode.cn/contest/", "算法与程序设计", { evidence: ["public_output"], audience: ["大学生", "在职", "社会人士"], cycle_type: "rolling", status: "year_round" }],
  ["牛客编程挑战赛", "nowcoder-contests", "牛客", "https://ac.nowcoder.com/acm/contest/vip-index", "算法与程序设计", { evidence: ["public_output"], audience: ["大学生", "在职"], cycle_type: "rolling", status: "year_round" }],
  ["百度之星程序设计大赛", "baidu-astar", "百度", "https://astar.baidu.com/", "算法与程序设计", { evidence: ["official_vendor", "public_output"] }],
  ["IEEEXtreme 编程竞赛", "ieeextreme", "IEEE", "https://ieeextreme.org/", "算法与程序设计", { evidence: ["international_org", "public_output"], team_size: "IEEE 学生会员组队，按当届规则报名" }],

  // 人工智能与数据 · 12
  ["KDD Cup", "kdd-cup", "ACM SIGKDD", "https://kdd.org/kdd-cup", "人工智能与数据", { evidence: ["international_org", "public_output"], featured: true }],
  ["CCF 大数据与计算智能大赛 BDCI", "ccf-bdci", "中国计算机学会", "https://www.datafountain.cn/competitions", "人工智能与数据", { evidence: ["public_output"], featured: true, schedule_note: "2026 届已由主办方宣布启动；具体赛题、报名截止和赛程请以 DataFountain 大赛专区后续发布为准。" }],
  ["科大讯飞 AI 开发者大赛", "iflytek-ai-developer", "科大讯飞", "https://challenge.xfyun.cn/", "人工智能与数据", { evidence: ["official_vendor", "public_output"] }],
  ["全国大学生数学建模竞赛", "cumcm", "中国工业与应用数学学会", "https://www.mcm.edu.cn/", "人工智能与数据", { evidence: ["cahe_catalog", "public_output"], categories: ["数学建模"] }],
  ["美国大学生数学建模竞赛 MCM/ICM", "comap-mcm-icm", "COMAP", "https://www.comap.com/contests/mcm-icm", "人工智能与数据", { evidence: ["international_org", "public_output"], categories: ["数学建模"] }],
  ["全国大学生统计建模大赛", "stats-modeling", "中国统计教育学会", "https://tjjmds.ai-learning.net/", "人工智能与数据", { evidence: ["cahe_catalog", "public_output"], categories: ["统计建模"] }],
  ["泰迪杯数据挖掘挑战赛", "tipdm-cup", "泰迪杯数据挖掘挑战赛组委会", "https://www.tipdm.org/", "人工智能与数据", { evidence: ["public_output"], categories: ["数据挖掘"] }],
  ["MathorCup 高校数学建模挑战赛", "mathorcup", "MathorCup 组委会", "https://www.mathorcup.org/", "人工智能与数据", { evidence: ["public_output"], categories: ["数学建模"] }],
  ["华为杯中国研究生数学建模竞赛", "graduate-math-modeling", "中国学位与研究生教育学会", "https://cpipc.acge.org.cn/cw/hp/4", "人工智能与数据", { evidence: ["government", "public_output"], audience: ["研究生"] }],
  ["中国研究生人工智能创新大赛", "graduate-ai-innovation", "中国学位与研究生教育学会", "https://cpipc.acge.org.cn/cw/hp/6", "人工智能与数据", { evidence: ["government", "public_output"], audience: ["研究生"] }],
  ["AI City Challenge", "ai-city-challenge", "AI City Challenge", "https://www.aicitychallenge.org/", "人工智能与数据", { evidence: ["international_org", "public_output"], categories: ["计算机视觉"] }],
  ["BraTS 脑肿瘤分割挑战赛", "brats-challenge", "BraTS Consortium", "https://www.synapse.org/brats", "人工智能与数据", { evidence: ["public_output"], categories: ["医学影像"] }],

  // 网络安全 · 10
  ["全国大学生信息安全竞赛创新实践能力赛", "ciscn-practice", "全国大学生信息安全竞赛组委会", "https://www.ciscn.cn/", "网络安全", { evidence: ["cahe_catalog", "public_output"], featured: true }],
  ["全国大学生信息安全竞赛作品赛", "ciscn-works", "全国大学生信息安全竞赛组委会", "https://www.ciscn.cn/", "网络安全", { evidence: ["cahe_catalog", "public_output"], categories: ["安全创新"] }],
  ["XCTF 国际联赛", "xctf", "XCTF 组委会", "https://www.xctf.org.cn/", "网络安全", { evidence: ["public_output"] }],
  ["强网杯全国网络安全挑战赛", "qiangwang-cup", "强网杯组委会", "https://www.qiangwangbei.com/", "网络安全", { evidence: ["government", "public_output"] }],
  ["网鼎杯网络安全大赛", "wangding-cup", "网鼎杯组委会", "https://www.wangdingcup.com/", "网络安全", { evidence: ["government", "public_output"] }],
  ["DEF CON CTF", "defcon-ctf", "DEF CON", "https://defcon.org/html/links/dc-ctf.html", "网络安全", { evidence: ["public_output"] }],
  ["Google Capture The Flag", "google-ctf", "Google", "https://capturetheflag.withgoogle.com/", "网络安全", { evidence: ["official_vendor", "public_output"] }],
  ["picoCTF", "picoctf", "Carnegie Mellon University", "https://picoctf.org/", "网络安全", { evidence: ["public_output"], audience: ["大学生", "中小学生", "社会人士"] }],
  ["Hack The Box University CTF", "htb-university-ctf", "Hack The Box", "https://ctf.hackthebox.com/", "网络安全", { evidence: ["official_vendor", "public_output"] }],
  ["Pwn2Own", "pwn2own", "Zero Day Initiative", "https://www.zerodayinitiative.com/blog/2026/3/11/announcing-pwn2own-berlin-for-2026", "网络安全", { evidence: ["official_vendor", "public_output"], audience: ["在职", "社会人士"], registration_end: "2026-05-07", event_start: "2026-05-14", status: "closed", schedule_note: "Pwn2Own Berlin 2026 已结束；下一站报名与目标范围等待 ZDI 官方公告。" }],

  // 软件工程与开源 · 10
  ["开源之夏 OSPP", "ospp", "中国科学院软件研究所开源软件供应链点亮计划组委会", "https://summer-ospp.ac.cn/", "软件工程与开源", { evidence: ["government", "public_output"], featured: true }],
  ["Google Summer of Code", "google-summer-of-code", "Google Open Source Programs Office", "https://summerofcode.withgoogle.com/", "软件工程与开源", { evidence: ["official_vendor", "public_output"], audience: ["大学生", "在职", "社会人士"] }],
  ["LFX Mentorship", "lfx-mentorship", "Linux Foundation", "https://mentorship.lfx.linuxfoundation.org/", "软件工程与开源", { evidence: ["international_org", "public_output"], audience: ["大学生", "在职"] }],
  ["中国软件杯大学生软件设计大赛", "china-software-cup", "中国软件杯组委会", "https://www.cnsoftbei.com/", "软件工程与开源", { evidence: ["government", "cahe_catalog", "public_output"] }],
  ["中国大学生服务外包创新创业大赛", "service-outsourcing-cup", "中国大学生服务外包创新创业大赛组委会", "http://www.fwwb.org.cn/", "软件工程与开源", { evidence: ["cahe_catalog", "public_output"] }],
  ["中国大学生计算机设计大赛", "computer-design-contest", "中国大学生计算机设计大赛组织委员会", "https://jsjds.blcu.edu.cn/", "软件工程与开源", { evidence: ["cahe_catalog", "public_output"] }],
  ["中国高校计算机大赛—移动应用创新赛", "mobile-app-innovation", "浙江大学与 Apple", "https://www.appcontest.net/", "软件工程与开源", { evidence: ["cahe_catalog", "official_vendor", "public_output"] }],
  ["中国高校计算机大赛—微信小程序应用开发赛", "wechat-mini-program", "微信与高校计算机大赛组委会", "https://developers.weixin.qq.com/community/competition", "软件工程与开源", { evidence: ["official_vendor", "public_output"] }],
  ["全国大学生软件测试大赛", "software-testing-contest", "全国大学生软件测试大赛组委会", "https://www.cnsofttesting.com/", "软件工程与开源", { evidence: ["public_output"], categories: ["软件测试"] }],
  ["OpenHarmony 开发者创新大赛", "openharmony-innovation", "OpenAtom OpenHarmony", "https://forums.openharmony.cn/forum.php?mod=viewthread&tid=4355", "软件工程与开源", { evidence: ["public_output"], categories: ["OpenHarmony"], schedule_note: "官方社区已披露第三届开放原子大赛开源鸿蒙创新应用挑战赛；具体赛项窗口以官方社区后续通知为准。" }],

  // 创新创业与黑客松 · 10
  ["中国国际大学生创新大赛", "china-international-college-innovation", "中华人民共和国教育部等部门", "https://cy.ncss.cn/", "创新创业与黑客松", { source_url: "https://www.moe.gov.cn/srcsite/A08/s5672/202505/t20250509_1189810.html", evidence: ["government", "cahe_catalog", "public_output"], featured: true }],
  ["挑战杯全国大学生课外学术科技作品竞赛", "challenge-cup", "共青团中央等单位", "https://www.tiaozhanbei.net/", "创新创业与黑客松", { evidence: ["government", "cahe_catalog", "public_output"] }],
  ["Microsoft Imagine Cup", "microsoft-imagine-cup", "Microsoft", "https://imaginecup.microsoft.com/", "创新创业与黑客松", { evidence: ["official_vendor", "public_output"] }],
  ["NASA International Space Apps Challenge", "nasa-space-apps", "NASA", "https://www.spaceappschallenge.org/", "创新创业与黑客松", { evidence: ["government", "public_output"], audience: ["大学生", "在职", "社会人士"] }],
  ["ETHGlobal Hackathon", "ethglobal-hackathon", "ETHGlobal", "https://ethglobal.com/events", "创新创业与黑客松", { evidence: ["public_output"], audience: ["大学生", "在职", "社会人士"], cycle_type: "rolling", status: "year_round" }],
  ["HackMIT", "hackmit", "MIT", "https://hackmit.org/", "创新创业与黑客松", { evidence: ["public_output"] }],
  ["PennApps", "pennapps", "University of Pennsylvania", "https://pennapps.com/", "创新创业与黑客松", { evidence: ["public_output"] }],
  ["Hack the North", "hack-the-north", "University of Waterloo", "https://hackthenorth.com/", "创新创业与黑客松", { evidence: ["public_output"] }],
  ["Junction Hackathon", "junction-hackathon", "Junction", "https://www.junctionplatform.com/", "创新创业与黑客松", { evidence: ["public_output"], audience: ["大学生", "在职"] }],
  ["HackZurich", "hackzurich", "HackZurich", "https://www.hackzurich.com/", "创新创业与黑客松", { evidence: ["public_output"], audience: ["大学生", "在职"] }],

  // 云计算与网络 · 8
  ["华为 ICT 大赛", "huawei-ict-competition", "华为 ICT 学院", "https://e.huawei.com/cn/talent/ict-academy/#/ict-contest", "云计算与网络", { evidence: ["official_vendor", "cahe_catalog", "public_output"], featured: true }],
  ["华为开发者大赛", "huawei-developer-competition", "华为云", "https://competition.huaweicloud.com/", "云计算与网络", { evidence: ["official_vendor", "public_output"], audience: ["大学生", "在职", "社会人士"] }],
  ["中国高校计算机大赛—网络技术挑战赛", "c4-network-technology", "中国高校计算机大赛组委会", "https://net.c4best.cn/", "云计算与网络", { evidence: ["cahe_catalog", "public_output"] }],
  ["Cisco NetAcad Riders", "cisco-netacad-riders", "Cisco Networking Academy", "https://www.netacad.com/", "云计算与网络", { evidence: ["official_vendor", "public_output"] }],
  ["AWS DeepRacer Student League", "aws-deepracer-student", "Amazon Web Services", "https://aws.amazon.com/deepracer/student/", "云计算与网络", { evidence: ["official_vendor", "public_output"], categories: ["强化学习"] }],
  ["AWS GameDay", "aws-gameday", "Amazon Web Services", "https://aws.amazon.com/gameday/", "云计算与网络", { evidence: ["official_vendor", "public_output"], audience: ["大学生", "在职"] }],
  ["WorldSkills Cloud Computing", "worldskills-cloud-computing", "WorldSkills International", "https://worldskills.org/skills/id/545/", "云计算与网络", { evidence: ["international_org", "public_output"], audience: ["职业院校", "大学生"] }],
  ["WorldSkills IT Network Systems Administration", "worldskills-network-systems", "WorldSkills International", "https://worldskills.org/skills/id/212/", "云计算与网络", { evidence: ["international_org", "public_output"], audience: ["职业院校", "大学生"] }],

  // 系统与高性能计算 · 6
  ["ASC 世界大学生超级计算机竞赛", "asc-student-supercomputer", "ASC 组委会", "https://www.asc-events.org/", "系统与高性能计算", { evidence: ["international_org", "public_output"], featured: true }],
  ["ISC Student Cluster Competition", "isc-student-cluster", "ISC High Performance", "https://isc-hpc.com/program/student-cluster-competition/", "系统与高性能计算", { evidence: ["international_org", "public_output"], registration_start: "2025-08-01", registration_end: "2025-11-14", event_start: "2026-03-23", event_end: "2026-06-25", status: "closed", schedule_note: "ISC 2026 学生集群竞赛已结束；下一周期等待 ISC High Performance 官方发布。" }],
  ["SC Student Cluster Competition", "sc-student-cluster", "SC Conference", "https://www.studentclustercompetition.us/", "系统与高性能计算", { evidence: ["international_org", "public_output"] }],
  ["RoboMaster 机甲大师超级对抗赛", "robomaster", "DJI", "https://www.robomaster.com/", "系统与高性能计算", { evidence: ["official_vendor", "cahe_catalog", "public_output"], categories: ["机器人"] }],
  ["全国大学生物联网设计竞赛", "national-iot-design", "全国大学生物联网设计竞赛组委会", "https://iot.sjtu.edu.cn/", "系统与高性能计算", { evidence: ["cahe_catalog", "public_output"], categories: ["物联网"] }],
  ["全国大学生嵌入式芯片与系统设计竞赛", "embedded-chip-system", "中国电子学会", "https://www.socchina.net/", "系统与高性能计算", { evidence: ["cahe_catalog", "public_output"], categories: ["嵌入式"] }]
];

// 2026-08-17 编辑部全量核验快照。这里只写入官方页面能够支持的事实；
// 多赛道与系列赛事不强塞单一截止日，未公布的日期继续保留 null。
const competitionRealtimeUpdates = {
  icpc: {
    status: "upcoming",
    event_start: "2026-11-15",
    event_end: "2026-11-20",
    source_url: "https://worldfinals.icpc.global/2026/",
    schedule_note: "第 50 届 ICPC 世界总决赛将于 2026 年 11 月 15—20 日在迪拜举行；参赛队须从区域赛晋级。"
  },
  ccpc: {
    status: "closed",
    registration_end: "2026-03-27",
    event_start: "2026-04-24",
    event_end: "2026-04-26",
    source_url: "https://ccpc.io/uploads/20260317/%E7%AC%AC%E5%8D%81%E4%B8%80%E5%B1%8A%E4%B8%AD%E5%9B%BD%E5%A4%A7%E5%AD%A6%E7%94%9F%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%E7%AB%9E%E8%B5%9B%E6%80%BB%E5%86%B3%E8%B5%9B%E9%82%80%E8%AF%B7%E5%87%BD_%E7%9B%96%E7%AB%A0%E7%89%88.pdf",
    schedule_note: "第 11 届 CCPC 总决赛已于 2026 年 4 月 24—26 日举行；3 月 27 日是晋级队伍注册缴费截止，并非公众报名窗口。"
  },
  "lanqiao-cup": {
    status: "closed",
    registration_start: "2025-10-20",
    registration_end: "2026-03-11",
    source_url: "https://dasai.lanqiao.cn/",
    schedule_note: "第 17 届软件赛与电子赛报名已于 2026 年 3 月 11 日结束；不同科目赛期不使用一个推测日期代替。"
  },
  "ccf-csp": {
    status: "upcoming",
    event_start: "2026-09-13",
    event_end: "2026-09-13",
    source_url: "https://www.cspro.org/cms/show.action?channelid=0000000103&code=publish_4028807662f1ccee0162f55d6abc0037&newsid=3e9d3e8bac9a4da5aa2c8b75981add09&siteid=100000",
    schedule_note: "官方年度通知确认 CSP43 于 2026 年 9 月 13 日举行；报名窗口等待 CCF CSP 后续公告。"
  },
  gplt: {
    status: "awaiting",
    source_url: "https://gplt.patest.cn/regulation",
    schedule_note: "截至 2026 年 8 月 17 日，官网未发布可核验的 2026 当前轮次统一日期，继续等待官方公告。"
  },
  "educg-compiler": {
    status: "awaiting",
    source_url: "https://compiler.educg.net/en/index.html",
    schedule_note: "官网已展示 2026 华为毕昇杯编译系统设计赛，但未公开可核验的统一报名与比赛日期。"
  },
  pat: {
    status: "awaiting",
    source_url: "https://www.patest.cn/",
    schedule_note: "截至 2026 年 8 月 17 日，PAT 官网未发布可核验的 2026 当前场次统一日程。"
  },
  "codeforces-round": {
    status: "year_round",
    cycle_type: "rolling",
    source_url: "https://codeforces.com/contests",
    schedule_note: "官方竞赛列表持续滚动并包含可报名场次；聚合条目不绑定某一场短期 Round 的日期。"
  },
  "atcoder-contest": {
    status: "year_round",
    cycle_type: "rolling",
    source_url: "https://atcoder.jp/contests/",
    schedule_note: "官方列表持续滚动；截至核验日已列出 8 月 22 日 ABC472 等后续场次，具体时间以单场页面为准。"
  },
  "meta-hacker-cup": {
    status: "awaiting",
    source_url: "https://www.facebook.com/codingcompetitions/hacker-cup",
    schedule_note: "截至 2026 年 8 月 17 日，Meta 官方未发布 2026 Hacker Cup 赛季公告，不沿用往年日期。"
  },
  "leetcode-contests": {
    status: "year_round",
    cycle_type: "rolling",
    source_url: "https://leetcode.cn/contest/",
    schedule_note: "LeetCode 保持周赛与双周赛的长期机制；当前动态页未给出可稳定写入的单场日期。"
  },
  "nowcoder-contests": {
    status: "year_round",
    cycle_type: "rolling",
    source_url: "https://ac.nowcoder.com/acm/contest/vip-index",
    schedule_note: "官方列表持续滚动且当前有多场报名中；聚合条目不把任一单场截止日冒充平台统一截止。"
  },
  "baidu-astar": {
    status: "awaiting",
    source_url: "https://astar.baidu.com/",
    schedule_note: "截至 2026 年 8 月 17 日，百度之星官网未发布可核验的 2026 当前轮次公告。"
  },
  ieeextreme: {
    status: "upcoming",
    event_start: "2026-10-31",
    event_end: "2026-10-31",
    source_url: "https://ieeextreme.org/proctor-eligibility-and-requirements/",
    schedule_note: "IEEEXtreme 20.0 将于 2026 年 10 月 31 日 00:00 UTC 开始并持续 24 小时；当前仅能确认监考人注册已开放。"
  },
  "kdd-cup": {
    official_url: "https://kdd2026.kdd.org/call-for-kdd-cup-proposals/",
    source_url: "https://kdd2026.kdd.org/schedule-at-a-glance/",
    status: "closed",
    event_start: "2026-03-01",
    event_end: "2026-08-12",
    schedule_note: "KDD 2026 官方征集页将竞赛启动列为 3 月 1 日，KDD Cup 会议环节已于 8 月 12 日结束；未公开统一选手报名截止。"
  },
  "ccf-bdci": {
    status: "awaiting",
    source_url: "https://www.datafountain.cn/special",
    schedule_note: "截至 2026 年 8 月 17 日，官方专题页仍未发布 2026 CCF BDCI 轮次；此前“2026 已启动”的描述已撤回。"
  },
  "iflytek-ai-developer": {
    official_url: "https://challenge.xfyun.cn/competition",
    source_url: "https://challenge.xfyun.cn/competition",
    status: "open",
    schedule_note: "2026 大赛包含 72 个以上独立赛题且截止日不同；截至 8 月 17 日仍有赛题开放，当前可核验的最晚截止为 8 月 30 日。"
  },
  cumcm: {
    status: "open",
    event_start: "2026-09-10",
    event_end: "2026-09-13",
    source_url: "https://en.mcm.edu.cn/",
    schedule_note: "CUMCM 2026 于 9 月 10—13 日举行；海外高校英文通道截止 9 月 9 日，境内及港澳台须按中文站、赛区和学校通知报名。"
  },
  "comap-mcm-icm": {
    status: "closed",
    registration_end: "2026-01-29",
    event_start: "2026-01-29",
    event_end: "2026-02-02",
    source_url: "https://contest.comap.com/undergraduate/contests/mcm/instructions.html",
    schedule_note: "MCM/ICM 2026 已于 1 月 29 日至 2 月 2 日举行，官方结果已发布。"
  },
  "stats-modeling": {
    official_url: "https://www.ai-learning.net/p91/index.html",
    source_url: "https://www.ai-learning.net/dstz/37119.jhtml",
    status: "closed",
    event_start: "2026-03-10",
    schedule_note: "第十二届全国大学生统计建模大赛 3 月启动，报名推荐阶段已结束；国赛答辩精确日期仍待官方通知。"
  },
  "tipdm-cup": {
    source_url: "https://www.tipdm.org/dssj14/2527.jhtml",
    status: "closed",
    registration_start: "2026-02-01",
    registration_end: "2026-04-10",
    event_start: "2026-04-11",
    event_end: "2026-04-24",
    schedule_note: "第十四届泰迪杯报名及竞赛阶段均已结束；报名为 2 月 1 日至 4 月 10 日，竞赛为 4 月 11—24 日。"
  },
  mathorcup: {
    official_url: "https://mathorcup.org/",
    source_url: "https://mathorcup.org/detail/2492",
    status: "closed",
    registration_start: "2025-12-30",
    registration_end: "2026-04-16",
    event_start: "2026-04-17",
    event_end: "2026-04-21",
    schedule_note: "第十六届 MathorCup 已结束；报名截止 4 月 16 日，竞赛于 4 月 17—21 日举行。"
  },
  "graduate-math-modeling": {
    status: "open",
    registration_start: "2026-06-01",
    registration_end: "2026-09-19",
    event_start: "2026-09-23",
    event_end: "2026-09-27",
    source_url: "https://cpipc.acge.org.cn/cw/contestNews/detail/4/2c9080189dcfa24e019dddacc24a1314?page=0",
    schedule_note: "华为杯第二十三届研究生数学建模竞赛报名至 9 月 19 日 17:00，比赛于 9 月 23—27 日举行。"
  },
  "graduate-ai-innovation": {
    official_url: "https://cpipc.acge.org.cn/cw/hp/2c9088a5696cbf370169a3f8101510bd",
    source_url: "https://cpipc.acge.org.cn/cw/hp/2c9088a5696cbf370169a3f8101510bd",
    status: "open",
    registration_start: "2026-05-22",
    registration_end: "2026-08-25",
    event_start: "2026-05-22",
    event_end: "2026-09-01",
    schedule_note: "第八届研究生人工智能创新大赛报名至 8 月 25 日，作品提交至 9 月 1 日；参赛对象为正式学籍研究生。"
  },
  "ai-city-challenge": {
    source_url: "https://www.aicitychallenge.org/",
    status: "closed",
    event_start: "2026-04-20",
    event_end: "2026-07-10",
    schedule_note: "第十届 AI City Challenge 提交已于 7 月 10 日截止；ECCV 2026 展示与颁奖安排在 9 月 8 日。"
  },
  "brats-challenge": {
    official_url: "https://www.synapse.org/Synapse%3Asyn74274097",
    source_url: "https://www.synapse.org/Synapse%3Asyn74274097/discussion/threadId%3D13514",
    status: "closed",
    event_end: "2026-07-30",
    schedule_note: "BraTS 2026 正式参赛提交已关闭；最终 Docker 提交延期截止为 7 月 30 日。"
  },
  "ciscn-practice": {
    source_url: "https://www.ciscn.cn/announcement/view/396",
    status: "closed",
    event_start: "2025-12-28",
    schedule_note: "第十九届创新实践能力赛官方赛程从 2025 年 12 月延续至 2026 年 7 月；决赛精确日期未公开，当前轮次已结束。"
  },
  "ciscn-works": {
    source_url: "https://www.ciscn.cn/announcement/view/412",
    status: "closed",
    schedule_note: "第十九届作品赛自由赛道与挑战赛道均已停止报名；官网截至 8 月 17 日仍显示赛事进行中，精确日程未以可核验文本公开。"
  },
  xctf: {
    source_url: "https://adworld.xctf.org.cn/competitions-hall/competitions/security-detail/6432fe7aef6895a42390667e589ce310",
    status: "awaiting",
    schedule_note: "官方已确认第十届 XCTF 联赛及 2026 资格赛，但总决赛时间地点待定；多分站联赛不写单站统一截止。"
  },
  "qiangwang-cup": {
    source_url: "https://www.cac.gov.cn/2025-09/09/c_1759136409566616.htm",
    status: "awaiting",
    schedule_note: "截至 2026 年 8 月 17 日，官网仍为 2025 第九届轮次，未找到 2026 官方公告。"
  },
  "wangding-cup": {
    status: "awaiting",
    source_url: "https://www.wangdingcup.com/",
    schedule_note: "截至 2026 年 8 月 17 日，官网仍展示 2024 第四届赛程，未发布 2026 官方轮次。"
  },
  "defcon-ctf": {
    source_url: "https://forum.defcon.org/node/255475",
    status: "closed",
    event_start: "2026-05-22",
    schedule_note: "DEF CON 34 CTF 资格赛于 5 月 22—24 日举行，年度大会已于 8 月 9 日结束；官方未单列决赛精确起止日。"
  },
  "google-ctf": {
    source_url: "https://capturetheflag.withgoogle.com/rules",
    status: "awaiting",
    schedule_note: "截至 2026 年 8 月 17 日，官网与规则页仍为 2025 Google CTF，未发布 2026 轮次。"
  },
  picoctf: {
    official_url: "https://picoctf.org/competitions/2026-spring.html",
    source_url: "https://picoctf.org/competitions/2026-spring.html",
    status: "closed",
    registration_start: "2026-02-01",
    registration_end: "2026-03-16",
    event_start: "2026-03-09",
    event_end: "2026-03-19",
    schedule_note: "picoCTF 2026 春季赛已结束；报名为 2 月 1 日至 3 月 16 日，比赛为 3 月 9—19 日。"
  },
  "htb-university-ctf": {
    source_url: "https://www.hackthebox.com/blog/htb-university-ctf-2024",
    status: "awaiting",
    schedule_note: "截至 2026 年 8 月 17 日，Hack The Box 官方未发布 2026 University CTF 公告或日程。"
  },
  pwn2own: {
    official_url: "https://www.zerodayinitiative.com/blog/2026/7/21/pwn2own-ireland-2026-new-targets-and-categories",
    source_url: "https://www.zerodayinitiative.com/Pwn2OwnIreland2026Rules.html",
    status: "open",
    registration_start: null,
    registration_end: "2026-10-01",
    event_start: "2026-10-06",
    event_end: "2026-10-09",
    eligibility: "须到爱尔兰科克现场演示并满足 ZDI 研究者资格；完整例外和注册上限以官方规则为准",
    schedule_note: "Pwn2Own Ireland 2026 报名于 10 月 1 日 17:00（爱尔兰时间）截止，比赛于 10 月 6—9 日举行。"
  },
  ospp: {
    source_url: "https://blog2026.summer-ospp.ac.cn/help/student%20guide",
    status: "open",
    cycle_type: "rolling",
    schedule_note: "开源之夏 2026 改为项目上线后持续报名、持续审核，并按各项目详情执行开发周期，因此没有统一截止日。"
  },
  "google-summer-of-code": {
    official_url: "https://summerofcode.withgoogle.com/programs/2026",
    source_url: "https://summerofcode.withgoogle.com/rules",
    status: "closed",
    registration_start: "2026-03-16",
    registration_end: "2026-03-31",
    event_start: "2026-01-19",
    event_end: "2026-11-11",
    schedule_note: "GSoC 2026 贡献者提案期已于 3 月 31 日结束；获选项目仍在执行，完整计划期至 11 月 11 日。"
  },
  "lfx-mentorship": {
    source_url: "https://docs.linuxfoundation.org/lfx/mentorship/mentorship-program-timelines",
    status: "year_round",
    cycle_type: "rolling",
    schedule_note: "LFX 按春、夏、秋及项目自定义 term 滚动开放，具体申请窗口因项目而异，不设置统一截止日。"
  },
  "china-software-cup": {
    source_url: "https://www.cnsoftbei.com/content-1-1357-1.html",
    status: "upcoming",
    registration_end: "2026-07-20",
    event_start: "2026-08-21",
    event_end: "2026-08-30",
    schedule_note: "第十五届报名与初赛提交已截止；线上总决赛为 8 月 21—23 日，A7 赛题于 8 月 30 日单独评审。"
  },
  "service-outsourcing-cup": {
    official_url: "https://www.fwwb.org.cn/",
    source_url: "https://www.fwwb.org.cn/news/show/658",
    status: "upcoming",
    registration_end: "2026-03-31",
    event_start: "2026-08-12",
    event_end: "2026-08-22",
    schedule_note: "第十七届 D02/D03 决赛已于 8 月 12—13 日举行，其余 A/B/C 与 D01/D04—D06 决赛于 8 月 20—22 日举行。"
  },
  "computer-design-contest": {
    source_url: "https://jsjds.blcu.edu.cn/info/1042/2294.htm",
    status: "closed",
    event_start: "2026-07-17",
    event_end: "2026-08-20",
    schedule_note: "2026 年六个国赛决赛区依次于 7 月 17 日至 8 月 20 日举行；当前仅已晋级项目参赛，公众报名已结束。"
  },
  "mobile-app-innovation": {
    official_url: "https://www.appcontest.net/home/homepage",
    source_url: "https://www.appcontest.net/prod-api/home/competition/competition/lastRound?groupId=106460",
    status: "closed",
    registration_start: "2026-07-24",
    registration_end: "2026-08-10",
    event_start: "2026-03-31",
    event_end: "2026-10-01",
    schedule_note: "第十一届报名已于 8 月 10 日结束，赛事周期仍持续至 10 月 1 日；当前不再接受新报名。"
  },
  "wechat-mini-program": {
    status: "awaiting",
    source_url: "https://developers.weixin.qq.com/community/competition",
    schedule_note: "截至 2026 年 8 月 17 日，官方社区未发布可核验的 2026 报名与赛程公告。"
  },
  "software-testing-contest": {
    status: "awaiting",
    source_url: "https://www.cnsofttesting.com/",
    schedule_note: "截至 2026 年 8 月 17 日，官网未发布可核验的 2026 当前轮次日期。"
  },
  "openharmony-innovation": {
    official_url: "https://competition.openatom.tech/competitionInfo?id=67a2bfabddf910caee6f422ed8760bf0",
    source_url: "https://competition.openatom.tech/competitionInfo?id=67a2bfabddf910caee6f422ed8760bf0",
    status: "closed",
    registration_start: "2025-08-07",
    registration_end: "2025-11-15",
    event_start: "2025-12-20",
    event_end: "2025-12-21",
    schedule_note: "第三届开放原子大赛开源鸿蒙专项已完成，官网已公布决赛、颁奖和结果。"
  },
  "china-international-college-innovation": {
    status: "awaiting",
    schedule_note: "截至 2026 年 8 月 17 日，教育部最新办赛通知仍为 2025 届，未发布 2026 届办赛日程。"
  },
  "challenge-cup": {
    status: "awaiting",
    source_url: "https://www.tiaozhanbei.net/tzb",
    schedule_note: "当前官方活动主要为创业计划竞赛及专项赛，尚未发布下一届课外学术科技作品竞赛的具体日程，不能混写。"
  },
  "microsoft-imagine-cup": {
    official_url: "https://imaginecup.microsoft.com/en-us",
    source_url: "https://imaginecup.microsoft.com/en-us/category/33",
    status: "closed",
    event_end: "2026-06-02",
    schedule_note: "微软官方已标注 2026 Imagine Cup 结束，冠军于 6 月 2 日公布；未公开精确报名起止日。"
  },
  "nasa-space-apps": {
    source_url: "https://www.spaceappschallenge.org/legal/",
    status: "upcoming",
    event_start: "2026-11-14",
    event_end: "2026-11-15",
    eligibility: "须在活动开始前注册；与中国（含港澳）或中资实体、院校存在参赛关联者受 NASA 2026 参赛条款限制，国籍本身不是判断标准",
    schedule_note: "NASA Space Apps 2026 于 11 月 14—15 日举行；报名起止未公布，且 2026 条款新增中国关联限制，报名前必须阅读官方规则。"
  },
  "ethglobal-hackathon": {
    official_url: "https://ethglobal.com/events",
    source_url: "https://ethglobal.com/events",
    status: "year_round",
    cycle_type: "rolling",
    schedule_note: "这是系列赛事；当前官网列出 ETHOnline（9 月 4—16 日）、Tokyo（9 月 25—27 日）和 Mumbai（11 月 6—8 日）。"
  },
  hackmit: {
    status: "upcoming",
    registration_start: "2026-06-08",
    registration_end: "2026-07-04",
    event_start: "2026-09-19",
    event_end: "2026-09-20",
    eligibility: "面向 2026 年秋季仍在读的本科生及 MIT M.Eng 学生；通常须在活动日前年满 18 岁，以官网例外规则为准",
    schedule_note: "HackMIT 2026 申请已于 7 月 4 日结束，活动于 9 月 19—20 日在 MIT 举行。"
  },
  pennapps: {
    status: "awaiting",
    source_url: "https://pennapps.com/",
    schedule_note: "截至 2026 年 8 月 17 日，官网仍展示 2025 年 PennApps XXVI，未发布 2026 当前轮次。"
  },
  "hack-the-north": {
    status: "upcoming",
    registration_end: "2026-07-27",
    event_start: "2026-09-18",
    event_end: "2026-09-20",
    source_url: "https://hackthenorth.com/",
    schedule_note: "Hack the North 2026 申请已于 7 月 27 日结束，活动于 9 月 18—20 日线下举行。"
  },
  "junction-hackathon": {
    official_url: "https://2026.hackjunction.com/",
    source_url: "https://2026.hackjunction.com/",
    status: "open",
    registration_end: "2026-09-06",
    event_start: "2026-11-13",
    event_end: "2026-11-15",
    schedule_note: "Junction 2026 正在申请，截止 9 月 6 日；主赛于 11 月 13—15 日在芬兰 Espoo 举行。"
  },
  hackzurich: {
    official_url: "https://hackzurich.com/",
    source_url: "https://hackzurich.com/",
    status: "closed",
    schedule_note: "HackZurich 官网明确说明当前处于 hiatus，暂无可报名轮次。"
  },
  "huawei-ict-competition": {
    official_url: "https://www.huawei.com/minisite/ict-competition-2025-2026-global/en/",
    source_url: "https://www.huawei.com/en/news/2026/6/ict-competition-global",
    status: "closed",
    event_start: "2026-06-02",
    event_end: "2026-06-05",
    schedule_note: "第十届华为 ICT 大赛全球总决赛于 6 月 2—5 日举行，华为已于 6 月 9 日宣布本届结束。"
  },
  "huawei-developer-competition": {
    official_url: "https://developer.huaweicloud.com/competition",
    source_url: "https://developer.huaweicloud.com/competition",
    status: "year_round",
    cycle_type: "rolling",
    schedule_note: "官网持续发布揭榜挂帅、软件精英和算法挑战等多项赛事；各赛项日期独立，不设置统一截止。"
  },
  "c4-network-technology": {
    status: "awaiting",
    source_url: "https://net.c4best.cn/home/signUp?competitionId=104379&competitionName=2026%E5%B9%B4%E7%BD%91%E7%BB%9C%E6%8A%80%E6%9C%AF%E6%8C%91%E6%88%98%E8%B5%9BA&competitionYear=2026",
    schedule_note: "官方报名系统可确认 2026 网络技术挑战赛 A 存在，但公开页没有可核验的截止与比赛日期，也不能据登录表单断言仍开放。"
  },
  "cisco-netacad-riders": {
    source_url: "https://gblogs.cisco.com/jp/2026/07/apjc-netacad-riders2026/",
    status: "closed",
    schedule_note: "Cisco 官方文章确认 APJC NetAcad Riders 2026 已于 3—5 月举行并结束；未公开精确日期。"
  },
  "aws-deepracer-student": {
    official_url: "https://aws.amazon.com/deepracer/",
    source_url: "https://aws.amazon.com/blogs/machine-learning/update-on-the-aws-deepracer-student-portal/",
    status: "closed",
    schedule_note: "AWS 已停止 DeepRacer Student：新注册自 2025 年 7 月 14 日停用，Student Portal 自 2025 年 9 月 15 日不可用。"
  },
  "aws-gameday": {
    source_url: "https://aws.amazon.com/gameday/",
    status: "year_round",
    cycle_type: "rolling",
    schedule_note: "AWS GameDay 是随 Summit 与合作活动反复举办的活动体系，不是单场固定赛事；具体报名以各场活动页为准。"
  },
  "worldskills-cloud-computing": {
    source_url: "https://worldskills.org/what/competitions/worldskills-shanghai-2026/",
    status: "upcoming",
    event_start: "2026-09-22",
    event_end: "2026-09-27",
    schedule_note: "Cloud Computing 已列入 WorldSkills Shanghai 2026 技能项目，赛事于 9 月 22—27 日举行。"
  },
  "worldskills-network-systems": {
    source_url: "https://worldskills.org/what/competitions/worldskills-shanghai-2026/",
    status: "upcoming",
    event_start: "2026-09-22",
    event_end: "2026-09-27",
    schedule_note: "IT Network Systems Administration 已列入 WorldSkills Shanghai 2026，赛事于 9 月 22—27 日举行。"
  },
  "asc-student-supercomputer": {
    official_url: "https://www.asc-events.net/StudentChallenge/ASC26/Register.php",
    source_url: "https://www.asc-events.net/StudentChallenge/ASC26/Register.php",
    status: "closed",
    registration_start: "2025-11-06",
    registration_end: "2026-01-12",
    event_start: "2026-05-16",
    event_end: "2026-05-20",
    schedule_note: "ASC26 报名为 2025 年 11 月 6 日至 2026 年 1 月 12 日，总决赛于 5 月 16—20 日举行，当前已结束。"
  },
  "isc-student-cluster": {
    status: "closed",
    registration_start: "2025-08-01",
    registration_end: "2025-11-14",
    event_start: "2026-03-23",
    event_end: "2026-06-25",
    source_url: "https://isc-hpc.com/program/student-cluster-competition/",
    schedule_note: "ISC26 虚拟赛于 3 月 23 日启动，6 月 25 日现场颁奖，官方已公布 2026 获奖队伍。"
  },
  "sc-student-cluster": {
    official_url: "https://sc26.supercomputing.org/students/student-cluster-competition/",
    source_url: "https://sc26.supercomputing.org/students/student-cluster-competition/",
    status: "upcoming",
    registration_start: "2026-03-02",
    registration_end: "2026-05-15",
    event_start: "2026-11-16",
    event_end: "2026-11-18",
    schedule_note: "SC26 申请已于 5 月 15 日结束，学生集群竞赛于 11 月 16—18 日举行。"
  },
  robomaster: {
    official_url: "https://www.robomaster.com/zh-CN/robo/rm?djifrom=nav",
    source_url: "https://www.robomaster.com/zh-CN/resource/pages/announcement/1925",
    status: "closed",
    registration_start: "2025-10-29",
    registration_end: "2025-11-06",
    schedule_note: "RoboMaster 2026 全国赛获奖名单已于 8 月 12 日发布，当前轮次结束；全国赛精确起止未在该公告公开。"
  },
  "national-iot-design": {
    official_url: "https://iot.sjtu.edu.cn/Default.aspx",
    source_url: "https://iot.sjtu.edu.cn/ueditor/net/upload/file/20260326/6391013243710844328303068.pdf",
    status: "upcoming",
    registration_start: "2026-04-01",
    registration_end: "2026-06-15",
    event_start: "2026-08-20",
    event_end: "2026-08-31",
    schedule_note: "2026 全国大学生物联网设计竞赛报名已结束，全国总决赛暨颁奖窗口为 8 月 20—31 日。"
  },
  "embedded-chip-system": {
    official_url: "https://www.socchina.net/home?trackType=2",
    source_url: "https://www.socchina.net/details?id=74465cd4e9e4495db923c666c70ed96a",
    status: "closed",
    registration_end: "2026-04-20",
    event_start: "2026-08-10",
    event_end: "2026-08-13",
    schedule_note: "第九届嵌入式芯片与系统设计竞赛报名已于 4 月 20 日结束，总决赛于 8 月 10—13 日举行。"
  }
};

const competitionSlugs = new Set(competitionEntries.map(([, slug]) => slug));
const missingRealtimeUpdates = [...competitionSlugs].filter((slug) => !competitionRealtimeUpdates[slug]);
const unknownRealtimeUpdates = Object.keys(competitionRealtimeUpdates).filter((slug) => !competitionSlugs.has(slug));
if (missingRealtimeUpdates.length || unknownRealtimeUpdates.length) {
  throw new Error(`赛事实时快照映射异常：缺少 ${missingRealtimeUpdates.join(", ") || "无"}；未知 ${unknownRealtimeUpdates.join(", ") || "无"}`);
}

const competitions = competitionEntries.map(makeCompetition).map((item) => ({
  ...item,
  ...(competitionRealtimeUpdates[item.slug] ?? {}),
  verified_at: LIVE_COMPETITION_VERIFIED_AT
}));

const certifications = [
  // 国内职业资格 · 8
  ["软考高级：信息系统项目管理师", "ruankao-information-system-project-manager", "工业和信息化部教育与考试中心", "https://www.ruankao.org.cn/", "国内职业资格", { evidence: ["national_qualification"], cycle_type: "fixed", status: "awaiting", validity_period: "长期有效，具体职称聘任以当地政策为准" }],
  ["软考高级：系统架构设计师", "ruankao-system-architect", "工业和信息化部教育与考试中心", "https://www.ruankao.org.cn/", "国内职业资格", { evidence: ["national_qualification"], cycle_type: "fixed", status: "awaiting" }],
  ["软考中级：网络工程师", "ruankao-network-engineer", "工业和信息化部教育与考试中心", "https://www.ruankao.org.cn/", "国内职业资格", { evidence: ["national_qualification"], cycle_type: "fixed", status: "awaiting" }],
  ["软考中级：软件设计师", "ruankao-software-designer", "工业和信息化部教育与考试中心", "https://www.ruankao.org.cn/", "国内职业资格", { evidence: ["national_qualification"], cycle_type: "fixed", status: "awaiting" }],
  ["软考中级：数据库系统工程师", "ruankao-database-engineer", "工业和信息化部教育与考试中心", "https://www.ruankao.org.cn/", "国内职业资格", { evidence: ["national_qualification"], cycle_type: "fixed", status: "awaiting" }],
  ["软考中级：信息安全工程师", "ruankao-information-security-engineer", "工业和信息化部教育与考试中心", "https://www.ruankao.org.cn/", "国内职业资格", { evidence: ["national_qualification"], cycle_type: "fixed", status: "awaiting" }],
  ["软考中级：系统集成项目管理工程师", "ruankao-system-integration-manager", "工业和信息化部教育与考试中心", "https://www.ruankao.org.cn/", "国内职业资格", { evidence: ["national_qualification"], cycle_type: "fixed", status: "awaiting" }],
  ["通信专业技术人员职业水平考试", "communications-professional-qualification", "工业和信息化部与人力资源社会保障部", "https://www.txks.org.cn/", "国内职业资格", { evidence: ["national_qualification"], cycle_type: "fixed", status: "awaiting" }],

  // 网络安全 · 10
  ["ISC2 Certified in Cybersecurity", "isc2-cc", "ISC2", "https://www.isc2.org/certifications/cc", "网络安全", { short_title: "ISC2 CC", evidence: ["international_org", "renewal_required"] }],
  ["ISC2 Systems Security Certified Practitioner", "isc2-sscp", "ISC2", "https://www.isc2.org/certifications/sscp", "网络安全", { short_title: "SSCP", evidence: ["international_org", "experience_required", "renewal_required"] }],
  ["ISC2 Certified Information Systems Security Professional", "isc2-cissp", "ISC2", "https://www.isc2.org/certifications/cissp", "网络安全", { short_title: "CISSP", evidence: ["international_org", "experience_required", "renewal_required"], featured: true }],
  ["ISC2 Certified Cloud Security Professional", "isc2-ccsp", "ISC2", "https://www.isc2.org/certifications/ccsp", "网络安全", { short_title: "CCSP", evidence: ["international_org", "experience_required", "renewal_required"] }],
  ["ISACA Certified Information Systems Auditor", "isaca-cisa", "ISACA", "https://www.isaca.org/credentialing/cisa", "网络安全", { short_title: "CISA", evidence: ["international_org", "experience_required", "renewal_required"], featured: true }],
  ["ISACA Certified Information Security Manager", "isaca-cism", "ISACA", "https://www.isaca.org/credentialing/cism", "网络安全", { short_title: "CISM", evidence: ["international_org", "experience_required", "renewal_required"] }],
  ["CompTIA Security+", "comptia-security-plus", "CompTIA", "https://www.comptia.org/certifications/security", "网络安全", { evidence: ["international_org", "renewal_required"] }],
  ["CompTIA Cybersecurity Analyst", "comptia-cysa-plus", "CompTIA", "https://www.comptia.org/certifications/cybersecurity-analyst", "网络安全", { short_title: "CySA+", evidence: ["international_org", "renewal_required"] }],
  ["OffSec Certified Professional", "offsec-oscp", "OffSec", "https://www.offsec.com/courses/pen-200/", "网络安全", { short_title: "OSCP", evidence: ["official_vendor", "hands_on_exam"], featured: true }],
  ["GIAC Security Essentials", "giac-gsec", "GIAC", "https://www.giac.org/certifications/security-essentials-gsec/", "网络安全", { short_title: "GSEC", evidence: ["international_org", "hands_on_exam", "renewal_required"] }],

  // 云平台 · 10
  ["AWS Certified Cloud Practitioner", "aws-cloud-practitioner", "Amazon Web Services", "https://aws.amazon.com/certification/certified-cloud-practitioner/", "云平台", { evidence: ["official_vendor", "renewal_required"] }],
  ["AWS Certified Solutions Architect – Associate", "aws-solutions-architect-associate", "Amazon Web Services", "https://aws.amazon.com/certification/certified-solutions-architect-associate/", "云平台", { evidence: ["official_vendor", "renewal_required"], featured: true }],
  ["AWS Certified Developer – Associate", "aws-developer-associate", "Amazon Web Services", "https://aws.amazon.com/certification/certified-developer-associate/", "云平台", { evidence: ["official_vendor", "renewal_required"] }],
  ["AWS Certified CloudOps Engineer – Associate", "aws-cloudops-engineer-associate", "Amazon Web Services", "https://aws.amazon.com/certification/certified-cloudops-engineer-associate/", "云平台", { evidence: ["official_vendor", "renewal_required"] }],
  ["AWS Certified Security – Specialty", "aws-security-specialty", "Amazon Web Services", "https://aws.amazon.com/certification/certified-security-specialty/", "云平台", { evidence: ["official_vendor", "renewal_required"], categories: ["云安全"] }],
  ["Microsoft Certified: Azure Fundamentals", "azure-fundamentals", "Microsoft", "https://learn.microsoft.com/credentials/certifications/azure-fundamentals/", "云平台", { short_title: "AZ-900", evidence: ["official_vendor"] }],
  ["Microsoft Certified: Azure Administrator Associate", "azure-administrator", "Microsoft", "https://learn.microsoft.com/credentials/certifications/azure-administrator/", "云平台", { short_title: "AZ-104", evidence: ["official_vendor", "renewal_required"] }],
  ["Microsoft Certified: Azure Solutions Architect Expert", "azure-solutions-architect-expert", "Microsoft", "https://learn.microsoft.com/credentials/certifications/azure-solutions-architect/", "云平台", { short_title: "AZ-305", evidence: ["official_vendor", "renewal_required"] }],
  ["Google Cloud Associate Cloud Engineer", "google-cloud-associate-engineer", "Google Cloud", "https://cloud.google.com/learn/certification/cloud-engineer", "云平台", { evidence: ["official_vendor", "renewal_required"] }],
  ["Google Cloud Professional Cloud Architect", "google-cloud-professional-architect", "Google Cloud", "https://cloud.google.com/learn/certification/cloud-architect", "云平台", { evidence: ["official_vendor", "renewal_required"], featured: true }],

  // 网络 · 6
  ["Cisco Certified Network Associate", "cisco-ccna", "Cisco", "https://www.cisco.com/site/us/en/learn/training-certifications/certifications/enterprise/ccna/index.html", "网络", { short_title: "CCNA", evidence: ["official_vendor", "renewal_required"], featured: true }],
  ["Cisco Certified Network Professional Enterprise", "cisco-ccnp-enterprise", "Cisco", "https://www.cisco.com/site/us/en/learn/training-certifications/certifications/enterprise/ccnp-enterprise/index.html", "网络", { short_title: "CCNP Enterprise", evidence: ["official_vendor", "renewal_required"] }],
  ["Cisco Certified Internetwork Expert Enterprise Infrastructure", "cisco-ccie-enterprise-infrastructure", "Cisco", "https://www.cisco.com/site/us/en/learn/training-certifications/certifications/enterprise/ccie-enterprise-infrastructure/index.html", "网络", { short_title: "CCIE Enterprise Infrastructure", evidence: ["official_vendor", "hands_on_exam", "renewal_required"] }],
  ["Huawei Certified ICT Associate – Datacom", "huawei-hcia-datacom", "Huawei", "https://e.huawei.com/en/talent/#/cert/product-details?certifiedProductId=383&authenticationLevel=CTYPE_CARE_HCIA", "网络", { short_title: "HCIA-Datacom", evidence: ["official_vendor", "renewal_required"] }],
  ["Huawei Certified ICT Professional – Datacom", "huawei-hcip-datacom", "Huawei", "https://e.huawei.com/en/talent/#/cert/product-details?certifiedProductId=384&authenticationLevel=CTYPE_CARE_HCIP", "网络", { short_title: "HCIP-Datacom", evidence: ["official_vendor", "renewal_required"] }],
  ["Huawei Certified ICT Expert – Datacom", "huawei-hcie-datacom", "Huawei", "https://e.huawei.com/en/talent/#/cert/product-details?certifiedProductId=385&authenticationLevel=CTYPE_CARE_HCIE", "网络", { short_title: "HCIE-Datacom", evidence: ["official_vendor", "hands_on_exam", "renewal_required"] }],

  // Linux 与云原生 · 8
  ["Red Hat Certified System Administrator", "red-hat-rhcsa", "Red Hat", "https://www.redhat.com/en/services/certification/rhcsa", "Linux与云原生", { short_title: "RHCSA", evidence: ["official_vendor", "hands_on_exam", "renewal_required"] }],
  ["Red Hat Certified Engineer", "red-hat-rhce", "Red Hat", "https://www.redhat.com/en/services/certification/rhce", "Linux与云原生", { short_title: "RHCE", evidence: ["official_vendor", "hands_on_exam", "renewal_required"], featured: true }],
  ["Linux Foundation Certified System Administrator", "linux-foundation-lfcs", "Linux Foundation", "https://training.linuxfoundation.org/certification/linux-foundation-certified-sysadmin-lfcs/", "Linux与云原生", { short_title: "LFCS", evidence: ["international_org", "hands_on_exam", "renewal_required"] }],
  ["Certified Kubernetes Administrator", "cncf-cka", "Linux Foundation / CNCF", "https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/", "Linux与云原生", { short_title: "CKA", evidence: ["international_org", "hands_on_exam", "renewal_required"], featured: true }],
  ["Certified Kubernetes Application Developer", "cncf-ckad", "Linux Foundation / CNCF", "https://training.linuxfoundation.org/certification/certified-kubernetes-application-developer-ckad/", "Linux与云原生", { short_title: "CKAD", evidence: ["international_org", "hands_on_exam", "renewal_required"] }],
  ["Certified Kubernetes Security Specialist", "cncf-cks", "Linux Foundation / CNCF", "https://training.linuxfoundation.org/certification/certified-kubernetes-security-specialist/", "Linux与云原生", { short_title: "CKS", evidence: ["international_org", "hands_on_exam", "renewal_required"] }],
  ["Kubernetes and Cloud Native Associate", "cncf-kcna", "Linux Foundation / CNCF", "https://training.linuxfoundation.org/certification/kubernetes-cloud-native-associate/", "Linux与云原生", { short_title: "KCNA", evidence: ["international_org", "renewal_required"] }],
  ["HashiCorp Certified: Terraform Associate", "hashicorp-terraform-associate", "HashiCorp", "https://developer.hashicorp.com/certifications/infrastructure-automation", "Linux与云原生", { evidence: ["official_vendor", "renewal_required"], categories: ["基础设施即代码"] }],

  // 数据与软件工程 · 8
  ["Oracle Certified Professional: Java SE Developer", "oracle-java-developer", "Oracle", "https://education.oracle.com/java-se-17-developer/pexam_1Z0-829", "数据与软件工程", { evidence: ["official_vendor"], categories: ["Java"] }],
  ["Oracle Database SQL Certified Associate", "oracle-database-sql-associate", "Oracle", "https://education.oracle.com/oracle-database-sql/pexam_1Z0-071", "数据与软件工程", { evidence: ["official_vendor"], categories: ["数据库"] }],
  ["Databricks Certified Data Engineer Associate", "databricks-data-engineer-associate", "Databricks", "https://www.databricks.com/learn/certification/data-engineer-associate", "数据与软件工程", { evidence: ["official_vendor", "renewal_required"], categories: ["数据工程"] }],
  ["SnowPro Core Certification", "snowflake-snowpro-core", "Snowflake", "https://learn.snowflake.com/en/certifications/", "数据与软件工程", { evidence: ["official_vendor", "renewal_required"], categories: ["数据平台"] }],
  ["MongoDB Associate Developer", "mongodb-associate-developer", "MongoDB", "https://learn.mongodb.com/pages/mongodb-associate-developer-exam", "数据与软件工程", { evidence: ["official_vendor"], categories: ["数据库"] }],
  ["NVIDIA-Certified Associate: Generative AI LLMs", "nvidia-generative-ai-llm-associate", "NVIDIA", "https://www.nvidia.com/en-us/learn/certification/generative-ai-llm-associate/", "数据与软件工程", { evidence: ["official_vendor", "renewal_required"], categories: ["生成式AI"] }],
  ["GitHub Foundations", "github-foundations", "GitHub", "https://resources.github.com/learn/certifications/", "数据与软件工程", { evidence: ["official_vendor", "renewal_required"], categories: ["开发协作"] }],
  ["GitHub Actions", "github-actions-certification", "GitHub", "https://resources.github.com/learn/certifications/", "数据与软件工程", { evidence: ["official_vendor", "renewal_required"], categories: ["CI/CD"] }]
].map(makeCertification);

const platforms = [
  {
    ...competitionDefaults,
    kind: "platform",
    slug: "kaggle-competitions",
    title: "Kaggle Competitions",
    short_title: "Kaggle",
    summary: "持续发布数据科学与机器学习任务的平台，适合按赛题、数据许可和截止时间寻找具体项目。",
    organizer: "Kaggle",
    official_url: "https://www.kaggle.com/competitions",
    source_url: "https://www.kaggle.com/competitions",
    audience: ["大学生", "在职", "社会人士"],
    categories: ["人工智能与数据", "竞赛平台"],
    level: "持续机会平台",
    format: "线上",
    region: "全球",
    schedule_note: "平台持续更新，具体日期以每个赛题页面为准。",
    recognition: "平台提供公开排行榜、Notebook 与讨论区；单项赛事认可度需分别判断。",
    recommendation: "先查看任务授权、队伍规则、奖金与截止时间，再选择与能力方向一致的具体比赛。",
    cycle_type: "rolling",
    status: "year_round",
    eligibility: "以具体赛题规则为准",
    evidence: ["public_output"]
  },
  {
    ...competitionDefaults,
    kind: "platform",
    slug: "aliyun-tianchi",
    title: "阿里云天池竞赛平台",
    short_title: "天池",
    summary: "持续发布产业数据、算法与工程赛题的平台，具体比赛由不同主办方提供。",
    organizer: "阿里云",
    official_url: "https://tianchi.aliyun.com/competition/gameList/activeList",
    source_url: "https://tianchi.aliyun.com/competition/gameList/activeList",
    audience: ["大学生", "在职", "社会人士"],
    categories: ["人工智能与数据", "竞赛平台"],
    level: "持续机会平台",
    format: "线上",
    region: "不限",
    schedule_note: "平台持续更新，具体日期以每个赛题页面为准。",
    recognition: "平台由阿里云运营并公开具体赛题规则与排行榜；单项赛事需分别核验。",
    recommendation: "适合从产业数据题中寻找作品机会，但应区分练习赛、正式赛与招聘赛。",
    cycle_type: "rolling",
    status: "year_round",
    eligibility: "以具体赛题规则为准",
    evidence: ["official_vendor", "public_output"]
  },
  {
    ...competitionDefaults,
    kind: "platform",
    slug: "devpost-hackathons",
    title: "Devpost Hackathons",
    short_title: "Devpost",
    summary: "聚合企业、学校与社区黑客松的平台，可按线上、线下、主题和截止时间筛选。",
    organizer: "Devpost",
    official_url: "https://devpost.com/hackathons",
    source_url: "https://devpost.com/hackathons",
    audience: ["大学生", "在职", "社会人士"],
    categories: ["创新创业与黑客松", "竞赛平台"],
    level: "持续机会平台",
    format: "线上或线下",
    region: "全球",
    schedule_note: "平台持续更新，具体日期以每个活动页面为准。",
    recognition: "平台公开主办方、规则、作品与获奖结果；每场活动需独立判断质量。",
    recommendation: "优先选择主办方明确、规则完整、评审公开且允许展示作品的活动。",
    cycle_type: "rolling",
    status: "year_round",
    eligibility: "以具体活动规则为准",
    evidence: ["public_output"]
  }
];

export const catalog = [...competitions, ...certifications, ...platforms].map((item) => ({
  ...item,
  next_review_at: item.kind === "certification"
    ? "2026-09-04"
    : item.kind === "competition" && ["open", "upcoming"].includes(item.status)
      ? "2026-08-18"
      : "2026-08-24"
}));

export const catalogCounts = {
  competition: competitions.length,
  certification: certifications.length,
  platform: platforms.length
};
