# Computer Competition Network

面向中文用户的计算机比赛、黑客松与职业证书资料库。公开页面提供搜索、分类、适用人群和时间状态筛选；单管理员后台用于持续新增、核验、发布和归档条目。

## 主要功能

- 比赛与考证两个独立内容类型，共用统一目录和详情页。
- 支持关键词、状态、适用人群和技能方向筛选。
- 每条资料保留官方入口、信息来源、核验日期和编辑推荐理由。
- 单管理员后台支持草稿、发布、精选、新增、编辑和删除。
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

容器启动时会自动运行幂等迁移和种子数据检查。应用容器同时加入现有 `h2-growth-roadmap_default` 网络，供 Caddy 通过 `ccn-app:3000` 访问；PostgreSQL 只存在于项目内部网络，不映射宿主机端口。

生产域名的 Caddy 配置片段位于 `deploy/Caddyfile.ccn`。服务器现有 Caddy 仍负责证书与 HTTPS，不应再启动第二个占用 80/443 的代理。

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
