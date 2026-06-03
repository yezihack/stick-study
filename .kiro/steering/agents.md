---
inclusion: always
---

# 学習打卡 App — Agent 协作指南

本文档描述项目的上下文、约定、和持续开发规则，供 AI agent 在每次会话中参考。

---

## 项目概述

**名称：** 学習打卡（Stick Study）  
**定位：** 个人自学者的每日打卡工具，离线优先，无后端  
**技术栈：** Vue 3 + Vite + TypeScript + Dexie.js (IndexedDB) + Capacitor  
**最终目标：** 打包为 Android APK（iOS 可选）

---

## 当前进度（截至 2026-06-03）

| Milestone | 状态 | 说明 |
|-----------|------|------|
| M1.1 项目初始化 | ✅ 完成 | Vite + Vue3 + TS + ESLint + Prettier + Git |
| M1.2 目录结构 | ✅ 完成 | 完整 src/ 目录，5个空白页面 |
| M1.3 Dexie 数据层 | ✅ 完成 | models.ts + db/index.ts + 初始化逻辑 |
| M1.4 多语言 i18n | 🔄 进行中 | 骨架已建，翻译内容待补全 |
| M1.5 路由配置 | ✅ 完成 | 5个路由，默认 /today |
| M1.6 UI 基础框架 | ✅ 完成 | theme.css + Google Fonts + BottomNav |
| M2–M6 | ⏳ 待开始 | 见 TODO.md |

---

## 项目文件结构

```
stick-study/
├── src/
│   ├── assets/
│   │   └── theme.css          # CSS 变量，日本手账风格
│   ├── components/
│   │   └── BottomNav.vue      # 底部导航（已实现）
│   ├── composables/           # 业务 hooks（待填充）
│   ├── db/
│   │   ├── index.ts           # Dexie 实例 + initializeDatabase()
│   │   └── models.ts          # 所有 TS 接口和 TaskType 枚举
│   ├── i18n/
│   │   ├── index.ts           # vue-i18n 初始化 + loadLocaleFromDB()
│   │   └── locales/
│   │       ├── zh-CN.json     # 简体中文（目前仅 nav.*）
│   │       ├── en.json        # English（目前仅 nav.*）
│   │       └── ja.json        # 日本語（目前仅 nav.*）
│   ├── pages/
│   │   ├── Today.vue          # 今日打卡（空壳）
│   │   ├── Calendar.vue       # 日历（空壳）
│   │   ├── Stats.vue          # 统计（空壳）
│   │   ├── Plans.vue          # 计划（空壳）
│   │   └── Settings.vue       # 设置（临时 DB 测试 UI）
│   ├── router/
│   │   └── index.ts           # 5 个路由，默认 /today
│   ├── App.vue                # 根组件，挂载 BottomNav + router-view
│   ├── main.ts                # 入口：initDB → loadLocale → mount
│   └── vite-env.d.ts
├── PRDS/
│   ├── PRD.md                 # 产品需求文档（权威参考）
│   └── japanese-study-app.html  # UI 设计原型参考
├── TODO.md                    # 开发任务清单（进度跟踪）
├── package.json
├── vite.config.ts
├── tsconfig.json
└── .eslintrc.cjs
```

---

## 核心约定

### 数据库

- 数据库名：`StudyCheckInDB`，使用 Dexie v3
- 4张表：`plans` / `taskTemplates` / `dailyLogs` / `config`
- 所有 ID 用 `crypto.randomUUID()`，字符串类型
- 日期格式统一用 `"YYYY-MM-DD"`，时间戳用 ISO 8601
- 从 `@/db` 导入 `db`、`getConfig()`、`updateConfig()`

### i18n

- 使用 `vue-i18n` Composition API（`legacy: false`）
- 支持语言：`zh-CN` / `en` / `ja`，fallback 为 `zh-CN`
- 翻译 key 结构：`<页面>.<功能>.<字段>`，例如 `today.progress.title`
- **所有 UI 文字必须走 i18n**，用户输入内容（计划名、笔记）保持原文
- 新增文案时必须同步更新三个语言文件

### 组件规范

- 组件名 PascalCase，文件名同组件名
- 使用 `<script setup lang="ts">`，不用 Options API
- Props 用 TypeScript 接口定义
- Composable 文件名 `use<Name>.ts`，放在 `src/composables/`

### 样式规范

- 所有颜色使用 CSS 变量（`var(--ink)` 等），不硬编码 hex
- CSS 变量定义在 `src/assets/theme.css`
- 组件内样式用 `<style scoped>`
- 移动端设计基准 375px 宽

### CSS 变量速查

| 变量 | 值 | 用途 |
|------|----|------|
| `--ink` | `#1a1f1a` | 深墨绿，主文字/深色背景 |
| `--paper` | `#f4f0e8` | 纸张米白，背景色 |
| `--sakura` | `#c0544a` | 樱花红，主强调/按钮 |
| `--gold` | `#b8962a` | 金色，次强调 |
| `--moss` | `#4a6741` | 苔绿，成功/完成状态 |
| `--font-sans` | Noto Sans 系列 | 正文字体 |
| `--font-serif` | Noto Serif 系列 | 标题/日期 |
| `--font-mono` | DM Mono | 数字/代码 |
| `--radius-sm` | `10px` | 小圆角 |
| `--radius-md` | `16px` | 标准圆角 |
| `--nav-height` | `72px` | 底部导航高度 |

---

## 数据模型速查

```typescript
// 所有接口定义在 src/db/models.ts

interface Plan {
  id: string            // UUID
  name: string          // 用户输入，不翻译
  bookTitle: string
  startDate: string     // "YYYY-MM-DD"
  endDate: string
  isActive: boolean
  color: string         // hex
  createdAt: string     // ISO timestamp
}

interface TaskTemplate {
  id: string
  planId: string
  weekdays: number[]    // 0=日 1=月...6=六，空数组=每天
  items: TaskItem[]
}

interface TaskItem {
  id: string
  type: TaskType        // 枚举
  count: number
  unit: string          // i18n key
  description: string
}

interface DailyLog {
  id: string
  date: string          // "YYYY-MM-DD"
  planId: string
  tasks: TaskLog[]
  note: string
  completedAt: string | null
}

interface TaskLog {
  taskItemId: string
  isTemp: boolean
  tempDescription?: string
  completed: boolean
  completedTime: string | null
}

interface AppConfig {
  id?: number           // Dexie auto-increment
  language: 'zh-CN' | 'en' | 'ja'
  darkMode: boolean
  reminderEnabled: boolean
  reminderTime: string  // "HH:mm"
}

enum TaskType {
  QUESTIONS = 'questions',
  GRAMMAR = 'grammar',
  PAGES = 'pages',
  LISTENING = 'listening',
  VOCAB = 'vocab',
  CUSTOM = 'custom'
}
```

---

## 开发工作流

```bash
npm run dev      # 启动开发服务器，端口 3000
npm run build    # vue-tsc 类型检查 + vite 构建
npm run lint     # ESLint 检查并修复
npm run format   # Prettier 格式化 src/
```

**每完成一个子任务后：**
1. 运行 `npm run build` 确认无编译错误
2. 更新 `TODO.md` 中对应任务为 `[x]`
3. `git commit -m "<英文描述>"`

---

## 接下来要做的任务（优先级从高到低）

1. **M1.4 多语言补全** — 填充三语言文件的完整翻译 key（今日/日历/统计/计划/设置）
2. **M1.7 测试验证** — 确认 M1 所有完成标准通过
3. **M2.1 useToday composable** — 每日任务生成、打勾、进度、streak
4. **M2.2 UI 组件** — TaskCard、ProgressBar、CompleteBanner
5. **M2.3 Today 页面** — 实现完整打卡流程

---

## 注意事项

- **Settings.vue** 目前含临时 DB 测试 UI，M5 实现设置页时替换掉
- **weekdays 约定**：`0 = 周日`，`6 = 周六`（与 JS `Date.getDay()` 一致）
- **多计划并行**：Today 页面需要合并所有 `isActive = true` 的计划的任务
- `npm run dev` 是长时间运行命令，用 `control_pwsh_process` 工具启动，不要用普通 execute_pwsh
- 项目在 Windows 环境，shell 为 cmd/PowerShell
