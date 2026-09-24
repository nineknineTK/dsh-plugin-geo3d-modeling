---
name: geo3d-modeling
description: "Geological 3D modeling and 3D seismic data processing full workflow: SEG-Y volume parsing, horizon/fault interpretation file parsing, CGCS2000 coordinate unification (zone-prefix restoration), raw data organization, fault surface modeling, fault representative line and exploration boundary shapefile output, multi-mine 3D geology platform building and leadership report delivery."
whenToUse: "地质三维建模任务：处理 SEG-Y 地震数据体、层位/断层解释文件（UDF/P701/FLT）、勘探范围边界；坐标系转换与带号恢复；原始数据分类整理；生成带坐标系的断层线/勘探范围 shp；搭建多矿区三维地质平台；撰写领导汇报稿。"
---

# 地质三维建模与三维地震资料处理全流程（geo3d-modeling）

本 skill 沉淀了一套经过真实项目验证的煤田地质三维建模全流程：从三维地震勘探原始数据（SEG-Y、层位、断层解释）出发，经坐标统一、分类整理、三维建模、标准 GIS 成果输出，到多矿区三维平台建设与领导汇报交付。所有格式、参数、坑都是实测值，可直接复用。

## 适用场景

- 物探/地质队（煤田、金属矿等）三维地震资料 → 三维地质建模
- 多源原始数据坐标统一（带号恢复）与标准化整理归档
- 断层面、层位面、数据体、属性体的三维可视化与 B/S 平台建设
- 向 ArcGIS / MapGIS / QGIS 交付带坐标系的标准 shp 成果
- 项目方案、建设清单、领导汇报稿的生成

## 阶段 0：数据资产盘点

典型项目目录资产（先盘点再动手）：

| 类别 | 典型路径/文件 | 说明 |
|---|---|---|
| 数据体 | `原始数据\数据体\*.sgy` | 三维叠前/叠后偏移数据体 |
| 层位 | `原始数据\层位\*.udf` | 层位解释（X Y T） |
| 断层 | `原始数据\断层\*.udf` | 断层解释（PROFILE 分段 + X Y T） |
| 断层边界 | `原始数据\断层边界\*.p701` | 断层在层位上的交线 |
| 勘探范围 | `测区范围\测区范围.shp` | PolyLineZ 边界（14 顶点） |
| 成果资料 | 报告（.doc/.wps/.docx）、剖面图、平面图 | 用于成果查看模块 |
| 公开背景数据 | 省级地质图 MapGIS 等 | 区域地质背景底图 |
| 配准参数 | `config.REG`（origin、inline_vec、xline_vec） | SEG-Y 空间定位依据 |

## 阶段 1：数据格式解析（实测字节布局）

### SEG-Y 数据体（已验证布局）

- 卷头：**3600 字节**文本头 + **240 字节**二进制头（EBCDIC/ASCII 皆可，只读关键值）。
- 道头：**240 字节**；道数据：**5040 字节**（1200 采样点 × 4 字节 IEEE **大端 float32**），采样率 1 ms。
- 道头关键字段（大端 int32）：`il`（inline 号）= 字节 9–12，`xl`（crossline 号）= 字节 13–16。
- **道头字节 73–88 不是可用 XY**（实测为 (355, 2334) 之类的索引），不要把它当坐标。
- 坐标定位靠测网配准参数 `config.REG`：
  ```
  origin = (400366.778, 3887496.334)      # 起始点（去带号 X, 北坐标 Y）
  inline_vec = (-4.64, 8.86)   # 每 10 m（一个 inline 间距）
  xline_vec  = (-4.43, -2.32)  # 每 5 m（一个 xline 间距）
  ```
  任意道坐标 = origin + il×inline_vec + xl×xline_vec。
- 只读解析用 numpy `frombuffer(..., dtype='>i4')` / `'>f4'`，勿整卷读进内存（1.6 GB 级）。

### 层位解释 UDF

```
<第1行头>
<第2行头>
    397917.12    3887137.60     517.00
    ...          ...            ...
```
- 前 2 行头部原样保留；数据行 = `X Y T`（X 去带号、Y 北坐标、T 时间 ms）。
- 解析：跳过头部，`float` 解析三列；保留其他非数据行（如注释）原样。

### 断层解释 UDF（dl_DF 类）

- 行类型：`PROFILE` / `SNAPPING` / `EOD` 标记行 + 数据行 `X Y T`。
- 转换时只改数据行三列的第一个数（X），标记行原样保留——结构不能破坏。

### 断层边界 P701

```
    X        Y        polyId     T      faultName  horizonName
36396608.80 3889927.60    1    -999.3    ckq        T2
```
- 数据行 = `X Y polyId T 断层名 层位名`；只改 X，其余列原样拼接保留。

### 勘探范围（测区范围.shp）

- PolyLineZ，14 顶点，首尾闭合。读回后 X 需加带号。

## 阶段 2：坐标系统一（加带号）——本流程的核心

### 规则（CGCS2000 3° 带高斯-克吕格）

- 中国煤田常用 **CGCS2000，高斯-克吕格 3° 带**；原始文件常**去掉带号**存储：
  `X = 东坐标 − 36,000,000`（36 带，中央经线 108°E），`Y = 北坐标`（完整值）。
- **统一操作：全部 X 加 36,000,000 恢复带号；Y 不动。**
- 通用公式：带号 = round(中央经线 / 3)；去带号 X + 带号×1,000,000 = 带带号 X。

### EPSG 对照表（易错，务必核对中央经线）

| 需求 | EPSG | 名称要点 | 东伪偏移 |
|---|---|---|---|
| **带带号**（本流程输出标准） | **4524** | 3-degree Gauss-Kruger zone 36 | **36,500,000** |
| 不带带号（CM 108E） | 4545 | 3-degree Gauss-Kruger CM 108E | 500,000 |
| 易误用 | 4547 | CM **114E**（别用！与 36 带不符） | — |

坑：`CRS.from_epsg(4547)` 名字里带 "CM 114E"，别凭印象选号——先用
`CRS.from_epsg(code).to_dict()` 核对 `lon_0` 与 `x_0` 再写入。

### .prj 与 dbf 规范（GIS 软件能读的前提）

1. **文件名**：与 shp 同基名——`断层投影线.prj`，**不是** `断层投影线.shp.prj`。
2. **格式**：ESRI WKT1（ArcGIS/MapGIS/CASS 兼容性最好）：
   ```python
   from pyproj import CRS
   wkt = CRS.from_epsg(4524).to_wkt(version="WKT1_ESRI")
   ```
3. **中文字段/值**：dbf 用 GBK 字节，并把 .dbf 头第 29 字节（语言驱动码）置为 `0x4D`（cp936）：
   ```python
   b = bytearray(Path(shp).with_suffix(".dbf").read_bytes())
   b[29] = 0x4D
   Path(shp).with_suffix(".dbf").write_bytes(b)
   ```
   否则 ArcGIS/QGIS/geopandas 会把 `断层名`/`线别` 读成乱码（pyshp 默认写的 0x00 语言驱动码不生效）。
4. **验证**（交付前必跑）：
   ```python
   import geopandas as gpd
   g = gpd.read_file(shp)
   assert g.crs.to_epsg() == 4524
   assert list(g.columns)[:2] == ["断层名", "线别"]   # 中文列名必须正确
   ```

## 阶段 3：原始数据分类整理

统一到一个**新建的空文件夹**（例：`华亭大柳数据整理\`），子目录模板：

```
<工作区名>数据整理\
├── 01层位\        # 转换后的 UDF（X 已加带号，头部保留）
├── 02断层\        # 转换后的断层 UDF（PROFILE 结构保留）
├── 03断层边界\    # 转换后的 P701
├── 04数据体\      # SEG-Y 原样复制（道头无 XY，坐标由测网配准定义，README 说明）
├── 05勘探范围\    # 测区范围多边形 shp（带号 + .prj）
├── 断层投影线\    # 每断层一个代表线 shp（见阶段 5）
├── 勘探范围.shp   # 交付用多边形 shp
└── README.md      # 坐标系声明 + 目录说明（模板见下）
```

README 必写三件事：统一后的坐标系（EPSG + 中央经线 + 带号）、加带号操作说明、SEG-Y 无道头 XY 而由测网配准定义的说明。

## 阶段 4：三维建模

### 断层面 JSON 规范（建模中间产物）

```json
[ {"name": "断面一", "n": 40, "points": [x1,y1,z1, x2,y2,z2, ... ]}, ... ]
```
- `points` 为扁平数组，共 `2n × 3` 个数：**前 n 个三元组 = 上缘线，后 n 个 = 下缘线**（顶点一一对应）。
- 建模输入：断层解释 UDF（面内散点） + 断层边界 P701（与层位的交线）。

### 其他建模产物（GeoVis3D data_out 约定）

- `horizons.json`（层位面）、`scene.json`（场景组装）、`boundaries.json`（边界）、
  `contours.json`（等值线）、`sticks.json`（井轨迹）、`corner_grid.npz`（角点网格）。
- 地震属性体：`attr_amp.npz / attr_env.npz / attr_instf.npz / attr_rms.npz / attr_sweet.npz`
  （振幅、包络、瞬时频率、RMS、甜点），支撑岩性解释与储层预测。

## 阶段 5：GIS 成果输出（shp）

### 断层代表线（每断层一个 shp，POLYLINE）

需求口径（来自真实项目演进）：断层投影到 XY 平面得到上、下两条缘线 → 取**中线**为该断层的代表线 → **每个断层一个 shp 文件** → 属性表含 `断层名`、`线别`（=“中线”）两列。

```python
import json, numpy as np, shapefile
from pyproj import CRS
from pathlib import Path

ZONE = 36_000_000.0
PRJ = CRS.from_epsg(4524).to_wkt(version="WKT1_ESRI")

def fix_dbf_936(shp):
    dbf = Path(shp).with_suffix(".dbf")
    b = bytearray(dbf.read_bytes())
    b[29] = 0x4D                                          # cp936/GBK
    dbf.write_bytes(b)

faults = json.loads(Path("faults.json").read_text(encoding="utf-8"))
out_dir = Path("断层投影线"); out_dir.mkdir(exist_ok=True)
for f in faults:
    pts = np.asarray(f["points"], float).reshape(f["n"], 2, 3)
    top, bot = pts[:, 0, :2], pts[:, 1, :2]               # 投影到 XY
    mid = (top + bot) / 2.0 + np.array([ZONE, 0.0])       # 中线 + 带号
    shp = out_dir / (f["name"] + ".shp")
    w = shapefile.Writer(str(shp), shapeType=shapefile.POLYLINE, encoding="gbk")
    w.field("断层名", "C", 40); w.field("线别", "C", 10)
    w.line([mid.tolist()]); w.record(f["name"], "中线")
    w.close(); fix_dbf_936(shp)
    Path(str(shp)).with_suffix(".prj").write_text(PRJ, encoding="utf-8")
```

### 勘探范围（POLYGON，闭合）

- 从 `测区范围.shp` 读 14 顶点（X 加带号），写 POLYGON，字段如 `名称`；
- 同样 GBK dbf + 0x4D + `<stem>.prj`（EPSG:4524）。

### 交付检查清单

- [ ] X 全部带带号（35,xxx,xxx ~ 37,xxx,xxx 区间抽查）
- [ ] .prj 文件名为 `<stem>.prj`，WKT 中 CM=108E、x_0=36500000
- [ ] geopandas 读回：crs=EPSG:4524、中文列名/值正确、要素数与顶点数符合预期
- [ ] 多边形首尾闭合；断层 shp 每文件 1 条代表线、线别=中线

## 阶段 6：多矿区三维平台建设（B/S）

### 平台目录约定（GeoVis3D 系）

```
<工作区根>\
├── 原始数据\             # 数据体/层位/断层/断层边界（源头不动）
├── GeoVis3D\             # 后端（config.py/modeling.py）+ scripts
│   └── data_out\         # scene.json、faults.json、horizons.json、attr_*.npz…
├── 其他矿区的数据\        # 矿区1/2/3…（各含 数据体/层位/断层/断面/成果数据与报告）
├── 个人保存断面\          # 断面数据清洗模块的个人断面 JSON
└── 测区范围\
```

### 平台六大模块（对应建设清单，均为多工作区共用）

1. **可视化首页**：项目概况、服务范围、科研项目、设备与成果资料 + 系统入口
2. **项目资料管理**：行政区划—项目—采区三级目录，检索/维护/上传/删除
3. **GIS 地图展示**：项目范围、采区、剖面线，资料与地图联动定位
4. **成果查看与对比**：成果图预览/缩放/全屏，剖面图与平面图关联对比
5. **三维建模模块**：SHP 入库 → 发布服务 → 地图叠加 → 框选区域 → 自动调用建模脚本
6. **断面数据清洗模块**：人工修改断面并保存（个人保存断面）

多矿区实践：一套平台承载 4 个工作区（主矿区 + 其他矿区目录），各矿区按统一标准化流程接入，发布版统一入口按区切换。**任何汇报/文档必须按“队级平台、多工作区”口径写，不要只写单个矿区。**

## 阶段 7：领导汇报交付

汇报稿结构模板（七个部分）：

1. 项目概述（队级统一平台、多工作区，避免“一区一系统”）
2. 建设清单概览（模块功能表 + 单价待定价说明）
3. 已完成的成功工作流程（按流程写：数据接入解析 → 坐标统一整理 → 三维建模 → 平台功能落地 → 多区统一发布；每段先讲“标准化流程、多区验证”）
4. 技术亮点（多工作区统一框架 / 全流程贯通 / 多源数据融合 / 标准 GIS 成果）
5. 投资概算（单价待询价回填）
6. 下一步工作计划
7. 恳请领导指示

生成 Word 版：python-docx，标题黑体、正文宋体 12pt、首行缩进 2 字符（Pt(24)）、`w:eastAsia` 字体设置。

## 坑与教训（实战 checklist）

1. **中文路径**：作为文件字面量可用；经 argv/shell 传参容易乱码——脚本内用绝对路径字面量最稳。
2. **Windows 控制台编码**：输出中文用 `sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')`；PowerShell 5.1 跑含中文的 .ps1 需要 UTF-8 BOM。
3. **文件被占用**：Word 打开着的 docx 会 PermissionError——另存新文件名或提示用户关闭。
4. **pyshp 中文乱码**：必须 GBK + dbf 头第 29 字节 0x4D（见阶段 2），pyshp Reader 自己默认 utf-8 读 GBK 字段名会报错，验证请用 geopandas。
5. **EPSG 编号错配**：4547 是 CM 114E；带带号用 4524、不带带号用 4545，先核对 `lon_0/x_0`。
6. **SEG-Y 道头无 XY**：73–88 字节是索引不是坐标；空间框架来自 config.REG 测网参数。
7. **UDF/P701 结构保留**：转换只动数据行 X 列，PROFILE/SNAPPING/EOD/头部行原样保留，否则解释软件打不开。
8. **勘探范围**：原始是 PolyLineZ，交付转 POLYGON 并确认首尾闭合（14 顶点）。
9. **带号区间自检**：转换后 X 必须落在 35,xxx,xxx~37,xxx,xxx（36 带），越界即加错。
10. **断层 shp 需求常见演进**：两条缘线 → 中线代表线 → 每断层一个文件 → 加“线别”属性列；先和用户确认口径再批量生成。

## 常用命令速查

```powershell
# 解析 SEG-Y 道头（只读，大端 int32）
python -c "import numpy as np; h=np.fromfile(r'xx.sgy', dtype=np.uint8, count=3600+240+240).reshape(-1,240); ..."

# 核对 EPSG 参数
python -c "from pyproj import CRS; print(CRS.from_epsg(4524).to_dict())"

# shp 读回验证
python -c "import geopandas as gpd; g=gpd.read_file(r'xx.shp'); print(g.crs.to_epsg(), list(g.columns), len(g))"
```
