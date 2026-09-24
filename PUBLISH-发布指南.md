# 发布到 DSH 插件市场指南

本插件通过 **GitHub 仓库**分发，由市场精选目录
[awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) 收录展示。
市场安装命令统一为：`dsh plugin --profile web add <包名或GitHub地址>`。

## 发布状态（已完成）

| 事项 | 状态 |
|---|---|
| GitHub 仓库 | ✅ https://github.com/nineknineTK/dsh-plugin-geo3d-modeling（public，main 分支） |
| 市场收录 PR | ✅ https://github.com/awesome-dsh-plugin/awesome-dsh-plugin/pull/5804 |
| npm 包 | ⏸ 预留包名 `dsh-plugin-geo3d-modeling`，未发布（市场支持纯 GitHub 源） |
| 本地验证 | ✅ 真实 dsh-skill 环境功能测试 + `npm pack` 清单检查（`node verify.mjs`） |

安装命令：

```bash
dsh plugin --profile web add github:nineknineTK/dsh-plugin-geo3d-modeling
```

PR 合并后（通常一天内），市场会出现本插件的卡片与一键安装。

## 改版发布（后续版本更新）

1. 修改 `package.json` 的 `version`；
2. 提交并推送：
   ```bash
   git add -A
   git commit -m "feat: ..."
   git push
   ```
3. （可选）发布 npm：`npm login && npm publish`；
4. 市场目录站 CI 每日自动刷新版本与 star 数，无需再次提 PR（除非要改描述/截图）。

## 补充市场卡片截图（可选）

往本仓库放截图（如 `assets/screenshot-1.png`，GitHub raw 链接即可），
然后在 awesome-dsh-plugin 的条目文件 `data/plugins/nineknineTK__dsh-plugin-geo3d-modeling.yml`
中加 `screenshots` 字段，再更新 PR #5804。

## 本地开发与验证

```bash
# 语法检查
node --check lib/index.js
# 功能验证（node_modules 为 DSH 桌面端依赖的 junction）
node verify.mjs
# 打包清单检查
npm pack --dry-run
# 本地链接安装（改完立即生效，无需发版）
dsh plugin --profile web add link:<本目录绝对路径>
dsh plugin --profile web remove dsh-plugin-geo3d-modeling
```

## License

MIT
