<div align="center">

# 守习 · Stick Study

**一款为个人自学者打造的每日学习打卡工具 — 离线优先，无需注册，数据全在本地。**

中文名「守习」：守 = 坚守每日计划，习 = 温习学习；英文「Stick Study」寓意坚持打卡、专注学习。

[![Vue](https://img.shields.io/badge/Vue-3.5-42b883)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6)](https://www.typescriptlang.org/)
[![Capacitor](https://img.shields.io/badge/Capacitor-8.3-119eff)](https://capacitorjs.com/)

开源地址：<https://github.com/yezihack/stick-study>

如果这个项目对你有帮助，欢迎点个 ⭐ Star 支持一下，也欢迎赞助 ☕ 让它走得更远。

</div>

---

## ✨ 项目简介

守习是一款专为个人自学者设计的每日打卡工具。你可以创建自定义学习计划，每天按任务清单逐项打勾，形成连续打卡记录，并通过日历热力图和数据统计追踪长期学习进度。

适合：

- 自学外语（日语、英语等）的学习者
- 备考人群（JLPT、IELTS 等）
- 有计划学习习惯的个人用户

核心特性：

| 特性 | 说明 |
|------|------|
| 🎯 仪式感 | 每日打卡，形成习惯闭环 |
| 📊 可视化 | 日历热力图 + 数据统计，让进度看得见 |
| 🧩 灵活性 | 多计划并行，任务模板可按星期自定义 |
| 🪶 轻量化 | 数据本地存储（IndexedDB），无需注册账号 |
| 🌏 多语言 | 界面支持 简体中文 / English / 日本語 三语即时切换 |
| 🔒 隐私优先 | 100% 离线可用，不上传任何数据 |

---

## 🚀 功能模块

- **今日打卡（Today）** — 按当天星期自动生成任务清单，逐项打勾、进度条、连续天数（streak）、临时追加任务、学习笔记，全部完成触发庆祝横幅。
- **打卡日历（Calendar）** — 月历热力图（全完成 / 部分完成 / 未打卡），月份导航，统计卡片，历史记录列表与当日详情弹窗。
- **数据统计（Stats）** — 累计总览、分类累计、周完成柱状图、任务类型分布，支持本周 / 本月 / 全部时间范围切换。
- **学习计划（Plans）** — 创建 / 编辑 / 归档计划，多计划并行，任务模板系统，可按星期差异化任务，计划进度展示。
- **设置（Settings）** — 三语切换、深色模式、每日提醒通知、数据导入导出（JSON）、清除数据、存储体积显示。

---

## 🛠 技术栈

| 分类 | 技术 |
|------|------|
| 框架 | Vue 3（`<script setup>` + Composition API） |
| 构建 | Vite 5 + TypeScript 5 |
| 路由 | Vue Router 4 |
| 多语言 | vue-i18n 9（`legacy: false`） |
| 数据存储 | Dexie.js 3（IndexedDB） |
| 移动端打包 | Capacitor 8（Android / iOS） |
| 本地通知 | @capacitor/local-notifications |
| 代码规范 | ESLint + Prettier |

设计风格参考「日本手账」美学，移动端基准 375px 宽。

---

## 📁 目录结构

```
stick-study/
├── src/
│   ├── assets/
│   │   └── theme.css          # CSS 变量（色彩、字体、尺寸）
│   ├── components/            # 通用组件
│   │   ├── BottomNav.vue      # 底部导航
│   │   ├── TaskCard.vue       # 任务卡片
│   │   ├── ProgressBar.vue    # 进度条
│   │   ├── CompleteBanner.vue # 打卡完成横幅
│   │   ├── CalendarGrid.vue   # 日历格网
│   │   ├── DayDetailModal.vue # 当日详情弹窗
│   │   ├── BarChart.vue       # 周完成柱状图
│   │   ├── TypeProgressBar.vue# 任务类型分布条
│   │   ├── PlanCard.vue       # 计划卡片
│   │   ├── PlanForm.vue       # 计划编辑表单
│   │   └── TaskItemEditor.vue # 任务项编辑
│   ├── composables/           # 业务逻辑 hooks
│   │   ├── useToday.ts
│   │   ├── useCalendar.ts
│   │   ├── useStats.ts
│   │   ├── usePlans.ts
│   │   ├── useTaskTemplate.ts
│   │   ├── useDataManagement.ts
│   │   └── useNotifications.ts
│   ├── db/
│   │   ├── index.ts           # Dexie 实例 + 初始化
│   │   └── models.ts          # TS 接口 + TaskType 枚举
│   ├── i18n/
│   │   ├── index.ts           # vue-i18n 初始化
│   │   └── locales/           # zh-CN / en / ja
│   ├── pages/                 # 5 个页面
│   │   ├── Today.vue
│   │   ├── Calendar.vue
│   │   ├── Stats.vue
│   │   ├── Plans.vue
│   │   └── Settings.vue
│   ├── router/index.ts        # 路由配置，默认 /today
│   ├── App.vue                # 根组件
│   └── main.ts                # 入口
├── PRDS/                      # 产品需求文档与设计原型
├── capacitor.config.ts        # Capacitor 配置
├── vite.config.ts
└── package.json
```

---

## 💾 数据模型

所有数据存储于 Dexie.js（IndexedDB），数据库名 `StudyCheckInDB`，共 4 张表：

| 表 | 说明 |
|----|------|
| `plans` | 学习计划 |
| `taskTemplates` | 任务模板（按星期差异化） |
| `dailyLogs` | 每日打卡记录 |
| `config` | 应用配置（语言、深色模式、提醒） |

约定：ID 使用 `crypto.randomUUID()`（字符串），日期统一 `"YYYY-MM-DD"`，时间戳用 ISO 8601，`weekdays` 中 `0 = 周日`、`6 = 周六`。详细字段定义见 [`src/db/models.ts`](src/db/models.ts) 与 [`PRDS/PRD.md`](PRDS/PRD.md)。

---

## ⚡ 快速开始

### 环境要求

- Node.js 18+
- npm（或 pnpm / yarn）

### 安装与运行

```bash
# 安装依赖
npm install

# 启动开发服务器（默认端口 3000）
npm run dev

# 类型检查 + 生产构建
npm run build

# 本地预览构建产物
npm run preview

# 代码检查并自动修复
npm run lint

# 格式化 src/
npm run format
```

---

## 📦 打包为 App（Capacitor）

应用标识：`appId = com.study.checkin`，`appName = 学習打卡`，`webDir = dist`。

```bash
# 1. 构建 Web 产物
npm run build

# 2. 同步到原生平台
npx cap sync android

# 3. Android（需 Android Studio）
npm install @capacitor/android
npx cap add android      # 首次添加平台
npx cap open android     # 在 Android Studio 中构建 APK

# 4. iOS（需 macOS + Xcode，可选）
npx cap add ios
npx cap open ios
```

构建 Release APK（在 `android/` 目录下）：

```bash
cd android
./gradlew assembleRelease
```

---

## 🌏 多语言说明

- 支持 `zh-CN`（默认）/ `en` / `ja`，fallback 为 `zh-CN`。
- 首次启动自动检测系统语言，用户也可在「设置」页随时切换，偏好持久化至 config 表。
- 翻译 key 结构为 `<页面>.<功能>.<字段>`，例如 `today.progress.title`。
- 所有 UI 文字走 i18n；用户自己输入的计划名、任务描述、笔记保持原文。
- 新增文案需同步更新 `src/i18n/locales/` 下的三个语言文件。

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request。提交代码前请确保：

1. `npm run build` 通过类型检查且无编译错误
2. `npm run lint` 无报错
3. 新增 UI 文案已同步三语翻译

---

## 📄 许可证

本项目基于 ISC 许可证开源。

---

<div align="center">

坚持每一天，温习每一课。⭐ 喜欢就点个 Star 吧！

</div>
