# 发布到 DSH 插件市场指南

本插件通过 **npm 或 GitHub 仓库**分发，再由市场精选目录
[awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) 收录展示。
市场安装命令统一为：`dsh plugin --profile web add <包名或GitHub地址>`。

## 步骤 1：完善包信息

- 把 `package.json` 里的 `repository` / `homepage` / `bugs` 换成你自己的 GitHub 仓库地址
  （当前是 `your-name` 占位）。
- 确认 `name`（npm 唯一）、`version`、`description`、`keywords` 无误。

## 步骤 2：推送 GitHub 仓库

```bash
cd dsh-plugin-geo3d-modeling
git init
git add .
git commit -m "feat: geo3d-modeling skill - geological 3D modeling full workflow"
git remote add origin https://github.com/<your-name>/dsh-plugin-geo3d-modeling.git
git push -u origin main
```

## 步骤 3：（可选）发布到 npm

```bash
npm login
npm publish
```

只做 GitHub 也完全可以——市场同样支持 `github:<owner>/<repo>` 安装源。

## 步骤 4：向精选目录提 PR（上架关键一步）

市场插件列表来自 `awesome-dsh-plugin/awesome-dsh-plugin` 仓库的精选列表，
**去那边提 PR 加一条记录**，站点与市场会自动收录（通常一天内生效）。
参照 `plugins.json` 中的条目格式（类别选 `skill`）：

```json
{
  "name": "dsh-plugin-geo3d-modeling",
  "owner": "<your-github-name>",
  "url": "https://github.com/<your-name>/dsh-plugin-geo3d-modeling",
  "category": "skill",
  "description": {
    "en": "Geological 3D modeling and 3D seismic data processing full workflow skill: SEG-Y volume parsing, horizon/fault interpretation parsing, CGCS2000 coordinate unification (zone-prefix restoration), raw data organization, fault surface modeling, fault representative line and exploration boundary shapefile output, multi-mine 3D geology platform and leadership reporting.",
    "zh": "地质三维建模与三维地震资料处理全流程 skill：SEG-Y 数据体解析、层位/断层解释解析、CGCS2000 坐标统一（带带号）、原始数据分类整理、断层面建模、断层代表线与勘探范围 shp 输出、多矿区三维地质平台与领导汇报交付。"
  },
  "npm": "dsh-plugin-geo3d-modeling",
  "install": "dsh plugin --profile web add dsh-plugin-geo3d-modeling"
}
```

> 提示：在 PR 前先看一眼该仓库 README 对条目字段的最新要求（可能新增
> `screenshots`、`tarball` 等可选字段——截图放 GitHub raw 链接即可，市场卡片会轮播）。

## 步骤 5：验证

1. 本地安装验证：`dsh plugin --profile web add link:<本目录绝对路径>`，刷新 web 页面；
2. 打开技能中心，确认 `geo3d-modeling` 出现在 bundled 分组；
3. 对话中说“帮我处理这个矿区的 SEG-Y 和层位数据”，确认模型自动加载 skill；
4. 上架后：在市场搜索 `geo3d-modeling`，确认卡片、安装命令、描述正确。

## 常见问题

- **市场只允许安装精选列表内的来源**：还没提 PR 上架时，用 `link:` 或 `github:` 直接安装测试。
- **npm 与 GitHub 二选一**：条目里 `npm` 填了就用 npm 源；留 `null` 则用 GitHub 源
  （`install` 字段写成 `dsh plugin --profile web add github:<owner>/<repo>`）。
- **改版发布**：改 `package.json` version → `npm publish` → 市场 CI 每日自动刷新版本与 star 数。
