# dsh-plugin-geo3d-modeling

地质三维建模与三维地震资料处理全流程 skill（DeepSeek Harness 插件）。

> 从三维地震勘探原始数据（SEG-Y 数据体、层位/断层解释）出发，经坐标统一（CGCS2000 带带号）、
> 分类整理、三维建模，到标准 GIS 成果（断层代表线 / 勘探范围 shp）与多矿区三维平台、领导汇报交付——
> 一条经过真实煤田项目验证的完整工作流。

## 安装

```bash
dsh plugin --profile web add dsh-plugin-geo3d-modeling
# 或从 GitHub 安装
dsh plugin --profile web add github:<your-name>/dsh-plugin-geo3d-modeling
```

安装后会话中出现 **`geo3d-modeling`** skill：模型在遇到地质建模 / 地震资料处理任务时自动加载，
也可以手动 `/skill geo3d-modeling` 调用。

## Skill 覆盖范围

| 阶段 | 内容 |
|---|---|
| 0 数据盘点 | SEG-Y / 层位 / 断层 / 断层边界 / 勘探范围 / 成果资料 / 配准参数 |
| 1 格式解析 | SEG-Y 实测字节布局（3600/240/5040、il/xl 大端 int32）、UDF/P701/FLT 格式 |
| 2 坐标统一 | 加带号规则、EPSG 对照表（4524/4545/4547 陷阱）、.prj 与 GBK dbf(0x4D) 规范 |
| 3 分类整理 | 整理目录模板 + README 坐标系声明 |
| 4 三维建模 | faults.json（2n×3 上下缘线）等建模产物约定、属性体 |
| 5 GIS 成果 | 断层代表线（中线、每断层一个 shp、线别属性列）、勘探范围 shp、交付检查清单 |
| 6 平台建设 | 多矿区目录约定、B/S 平台六大模块 |
| 7 汇报交付 | 领导汇报稿七段式模板（多工作区口径） |
| 坑与教训 | 10 条实战 checklist（中文路径、编码、文件占用、EPSG、SEG-Y 道头…） |

## 本地开发

```bash
# 语法检查
node --check lib/index.js
# 本地链接安装（调试用）
dsh plugin --profile web add link:<本目录绝对路径>
```

## 发布到插件市场

见 [PUBLISH-发布指南.md](./PUBLISH-发布指南.md)。

## License

MIT
