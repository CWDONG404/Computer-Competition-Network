const VERIFIED_AT = "2026-08-04";

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

const competitions = [
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
].map(makeCompetition);

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
  next_review_at: item.kind === "certification" ? "2026-09-04" : "2026-08-11"
}));

export const catalogCounts = {
  competition: competitions.length,
  certification: certifications.length,
  platform: platforms.length
};
