# 一键发布 dsh-plugin-geo3d-modeling（双击或右键"使用 PowerShell 运行"）
# 前置：已安装 GitHub CLI 并登录一次（gh auth login），或手动在 GitHub 网页建好空仓库。
$ErrorActionPreference = "Stop"
$repo = "nineknineTK/dsh-plugin-geo3d-modeling"
$dir  = "M:\12_有原始数据的地质资料三维建模\dsh-plugin-geo3d-modeling"
$git  = "C:\Program Files\Git\cmd\git.exe"

Set-Location $dir

Write-Host "== 1/4 检查 GitHub CLI ==" -ForegroundColor Cyan
$gh = Get-Command gh -ErrorAction SilentlyContinue
if (-not $gh) {
    Write-Host "未安装 GitHub CLI。请先："
    Write-Host "  1) winget install --id GitHub.cli -e"
    Write-Host "  2) gh auth login（浏览器登录）"
    Write-Host "  3) 重新运行本脚本"
    exit 1
}
gh auth status 2>&1 | Select-Object -First 2

Write-Host "== 2/4 确保远程仓库存在 ==" -ForegroundColor Cyan
gh repo view $repo 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "创建仓库 $repo ..."
    gh repo create $repo --public --source $dir --push
} else {
    Write-Host "仓库已存在"
}

Write-Host "== 3/4 推送 ==" -ForegroundColor Cyan
& $git remote remove origin 2>$null
& $git remote add origin "https://github.com/$repo.git"
& $git branch -M main
& $git push -u origin main
Write-Host "推送成功：https://github.com/$repo"

Write-Host "== 4/4 （可选）发布 npm ==" -ForegroundColor Cyan
$answer = Read-Host "是否发布到 npm？(y/n，仅 GitHub 也完全可用)"
if ($answer -eq "y") {
    npm login
    npm publish
}

Write-Host ""
Write-Host "== 上架市场最后一步（网页操作，约 2 分钟）==" -ForegroundColor Green
Write-Host "1. 打开 https://github.com/awesome-dsh-plugin/awesome-dsh-plugin"
Write-Host "2. 找到插件列表文件，点编辑（铅笔图标），加一条记录并提交 PR："
Write-Host @'
{
  "name": "dsh-plugin-geo3d-modeling",
  "owner": "nineknineTK",
  "url": "https://github.com/nineknineTK/dsh-plugin-geo3d-modeling",
  "category": "skill",
  "description": {
    "en": "Geological 3D modeling and 3D seismic data processing full workflow skill: SEG-Y volume parsing, horizon/fault interpretation parsing, CGCS2000 coordinate unification (zone-prefix restoration), raw data organization, fault surface modeling, fault representative line and exploration boundary shapefile output, multi-mine 3D geology platform.",
    "zh": "地质三维建模与三维地震资料处理全流程 skill：SEG-Y 数据体解析、层位/断层解释解析、CGCS2000 坐标统一（带带号）、原始数据分类整理、断层面建模、断层代表线与勘探范围 shp 输出、多矿区三维地质平台。"
  },
  "npm": null,
  "install": "dsh plugin --profile web add github:nineknineTK/dsh-plugin-geo3d-modeling"
}
'@
Write-Host "3. PR 合并后约一天内自动上架市场"
