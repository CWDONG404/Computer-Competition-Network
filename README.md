# Computer Competition Network（CCN）

面向中文用户的计算机比赛、黑客松与职业证书技术情报台。主目录固定收录 70 场具体比赛与 50 项具体证书；Kaggle、天池、Devpost 等持续机会单列为平台，不占核心项目数量。

> 数据状态：70 场比赛已于 **2026-08-17** 按主办方官网和官方规则完成全量核验。当前包含 7 场报名中、12 场即将开始、8 个持续系列；日期无法确认的项目继续标记为“待官方公告”。[查看本次核验记录](docs/DATA_REFRESH_2026-08-17.md)。

## 主要功能

- 首页直接提供全站搜索、临近截止、大学生/在职入口与最近核验。
- 目录支持关键词、类型、人群、方向、证据、状态和排序筛选，并兼容旧查询参数。
- 日历按 7 天、30 天、季度和全年查看已确认时间节点。
- 每条公开资料均绑定官方网站、事实证据标签、适用人群、时间状态和核验日期。
- 单管理员后台支持手动新增、编辑、发布，以及页面变化待审箱；访客不能投稿。
- 轻量监测器只创建待审任务，绝不自动修改公开资料；受验证码或脚本限制的来源转人工核验。
- PostgreSQL 持久化，Docker Compose 一键启动。
- 应用只绑定 `127.0.0.1:3003`，由 Caddy 通过 `ccn.cwdzone.top` 反向代理。
- GitHub Actions 自动执行 Lint、类型检查和生产构建；配置部署 Secrets 后自动发布。

## 本地开发

要求 Node.js 22+ 和 PostgreSQL。

```bash
npm install
cp .env.example .env.local
npm run db:migrate
npm run db:seed
npm run db:validate
npm run dev
```

生成管理员密码哈希：

```bash
npm run auth:hash -- "你的高强度密码"
```

将输出写入 `ADMIN_PASSWORD_HASH`。生产环境不要提交任何 `.env` 文件。

## 容器部署

复制并填写环境文件：

```bash
cp .env.example .env.production
docker compose --env-file .env.production up -d --build
```

容器启动时会自动运行增量迁移和幂等种子导入。应用容器同时加入现有 `h2-growth-roadmap_default` 网络，供 Caddy 通过 `ccn-app:3000` 访问；PostgreSQL 只存在于项目内部网络，不映射宿主机端口。监测容器限制为约 128MB 内存和 0.25 CPU。

生产域名的 Caddy 配置片段位于 `deploy/Caddyfile.ccn`。服务器现有 Caddy 仍负责证书与 HTTPS，不应再启动第二个占用 80/443 的代理。

服务器资源有限时，可使用 `deploy/Dockerfile.prebuilt-release` 基于已验证的运行镜像制作轻量覆盖层；它接收本地已通过验收的 Next.js 编译产物及 `data/`、`scripts/`，生产机不再安装依赖或编译 Next.js。

其构建上下文包含 `runtime/server.js`、`runtime/.next/`、`.next/static/` 对应的 `static/`，以及 `data/`、`scripts/`；基础镜像继续提供已验证的 Linux 依赖与公共静态目录。

## GitHub Actions Secrets

如需自动发布，在仓库 `Settings → Secrets and variables → Actions` 中添加：

- `ECS_HOST`
- `ECS_PORT`
- `ECS_USER`
- `ECS_SSH_PRIVATE_KEY`

必须使用专用低权限 `deploy` 用户和独立 SSH 密钥，不要上传 ECS 的 root 私钥。Secrets 未配置时，工作流只执行质量检查。

## 数据原则

- 优先使用主办方或认证方的一手来源。
- 没有可靠公告时不推算报名和考试日期，统一标为“待官方公告”。
- 推荐理由说明适合人群和能力方向，不提供就业、获奖或证书价值保证。
- 报名资格、费用、考试版本与有效期始终以官网最新通知为准。

## 发布前验收

```bash
npm run catalog:validate
npm run lint
npm run typecheck
npm run build
npm run db:migrate
npm run db:seed
npm run db:validate
npm run monitor:test
npm run test:e2e
```

端到端测试覆盖首页、目录、日历、详情、收录标准和后台待审登录页，并在 320、375、414、768、1280px 检查横向溢出、导航重复、44px 点击区域和可见键盘焦点。
