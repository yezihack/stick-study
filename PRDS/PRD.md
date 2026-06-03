# 学習打卡 App · 产品需求文档 (PRD)

**版本：** v1.0.0  
**日期：** 2026-06-02  
**技术栈：** Vue 3 + Vite + Dexie.js + Capacitor

---

## 1. 产品概述

### 1.1 产品定位

一款专为个人自学者设计的每日打卡工具。用户可创建自定义学习计划，每天按任务清单逐项打勾，形成连续打卡记录，追踪长期学习进度。

### 1.2 目标用户

- 自学外语（日语、英语等）的学习者
- 备考人群（JLPT、IELTS 等）
- 有计划学习习惯的个人用户

### 1.3 核心价值

| 价值点 | 说明 |
|--------|------|
| 仪式感 | 每日打卡，形成习惯闭环 |
| 可视化 | 日历热力图 + 数据统计，让进度看得见 |
| 灵活性 | 多计划并行，任务模板可自定义 |
| 轻量化 | 数据本地存储，无需注册账号 |
| 多语言 | 界面支持中文 / English / 日本語 三语切换 |

---

## 2. 多语言支持

### 2.1 支持语言

| 语言 | 代码 | 备注 |
|------|------|------|
| 简体中文 | `zh-CN` | 默认语言 |
| English | `en` | |
| 日本語 | `ja` | |

### 2.2 语言切换规则

- 首次启动：自动检测系统语言，匹配最近支持的语言，fallback 为 `zh-CN`
- 用户可在「设置」页随时手动切换语言
- 语言偏好持久化保存至 Dexie 配置表
- 切换后**无需重启**，界面即时刷新

### 2.3 多语言范围

- 所有 UI 文字（导航、标签、按钮、提示）
- 任务类型名称（题目 / Questions / 問題 等）
- 系统通知文案
- 日期格式本地化（中：2025年6月2日 / EN：Jun 2, 2025 / 日：2025年6月2日）

> **不纳入翻译：** 用户自己输入的计划名称、任务描述、学习笔记——保持原文显示。

---

## 3. 功能模块

### 3.1 今日打卡（Today）

**核心流程：** 进入 App → 查看当日任务清单 → 逐项打勾 → 全部完成触发庆祝动画

#### 功能清单

| # | 功能 | 说明 |
|---|------|------|
| 3.1.1 | 每日任务生成 | 根据当天星期，从对应计划的任务模板自动生成当日清单 |
| 3.1.2 | 任务打勾 | 点击任务卡片切换完成/未完成状态；完成态显示划线+灰色 |
| 3.1.3 | 进度条 | 实时显示「已完成 / 总数」及百分比进度条 |
| 3.1.4 | 打卡成功动画 | 全部完成后显示庆祝横幅，记录当天完成时间 |
| 3.1.5 | 临时追加任务 | 点击「+ 追加」可添加当日一次性额外任务 |
| 3.1.6 | 学习笔记 | 可选填写当天学习笔记，保存至当日 DailyLog |
| 3.1.7 | 连续打卡展示 | 顶部显示当前 streak 天数徽章 |
| 3.1.8 | 计划标签 | 显示当前活跃计划名称及结束日期 |

#### 任务状态机

```
未完成 ──(点击)──▶ 完成
完成   ──(点击)──▶ 未完成
```

---

### 3.2 打卡日历（Calendar）

| # | 功能 | 说明 |
|---|------|------|
| 3.2.1 | 月历视图 | 显示当月每天打卡状态 |
| 3.2.2 | 热力图着色 | 🟥全完成 · 🟡部分完成 · ⬜未打卡 |
| 3.2.3 | 月份导航 | 左右箭头切换月份，可查看历史 |
| 3.2.4 | 统计卡片 | 连续天数 / 本月完成天数 / 本月达成率 |
| 3.2.5 | 历史记录列表 | 最近打卡记录，显示完成任务摘要 |
| 3.2.6 | 历史详情 | 点击历史某天 → 弹出当日任务完成情况 + 笔记 |

---

### 3.3 数据统计（Stats）

| # | 功能 | 说明 |
|---|------|------|
| 3.3.1 | 累计总览 | 总完成任务数、总学习天数 |
| 3.3.2 | 分类累计 | 各任务类型累计数量（共做了多少道题、读了多少页） |
| 3.3.3 | 周完成柱状图 | 当周每天完成任务数的柱形图 |
| 3.3.4 | 任务类型分布 | 各类型占比进度条 |
| 3.3.5 | 时间范围切换 | 本周 / 本月 / 全部 |

---

### 3.4 学习计划（Plans）

| # | 功能 | 说明 |
|---|------|------|
| 3.4.1 | 创建计划 | 填写计划名、关联书籍名称、开始/结束日期 |
| 3.4.2 | 多计划并行 | 可同时激活多个计划，任务合并显示在今日清单 |
| 3.4.3 | 任务模板 | 每个计划包含多个任务项，定义每日需完成的内容 |
| 3.4.4 | 按星期差异化 | 为不同星期设置不同任务模板（如周末加量） |
| 3.4.5 | 编辑/归档计划 | 可修改进行中的计划，完成后归档保留历史 |
| 3.4.6 | 计划进度 | 显示计划剩余天数及总体完成进度 |

---

### 3.5 设置（Settings）

| # | 功能 | 说明 |
|---|------|------|
| 3.5.1 | **语言切换** | 中文 / English / 日本語 三语选择，即时生效 |
| 3.5.2 | 提醒通知 | 每日学习提醒开关 + 自定义时刻 |
| 3.5.3 | 深色模式 | 切换深色/浅色主题 |
| 3.5.4 | 导出数据 | 导出 JSON 备份文件至本地 |
| 3.5.5 | 导入数据 | 从 JSON 文件恢复全部数据 |
| 3.5.6 | 清除数据 | 二次确认后清除全部本地数据 |
| 3.5.7 | 数据体积提示 | 显示当前本地存储占用大小 |

---

## 4. 数据模型

所有数据存储于 **Dexie.js (IndexedDB)**，结构化 JSON。

### 4.1 实体定义

#### Plan（学习计划）

```ts
interface Plan {
  id: string;           // UUID
  name: string;         // 计划名称（用户输入，不翻译）
  bookTitle: string;    // 关联书籍名
  startDate: string;    // ISO 日期 "YYYY-MM-DD"
  endDate: string;
  isActive: boolean;    // 是否启用
  color: string;        // 主题色（hex）
  createdAt: string;
}
```

#### TaskTemplate（任务模板）

```ts
interface TaskTemplate {
  id: string;
  planId: string;
  weekdays: number[];   // 0=日 1=月 ... 6=土，空数组=每天
  items: TaskItem[];
}
```

#### TaskItem（任务项）

```ts
interface TaskItem {
  id: string;
  type: TaskType;       // 见下方枚举
  count: number;        // 数量
  unit: string;         // 单位（问题/页/分钟等，多语言 key）
  description: string;  // 用户填写的描述
}

type TaskType = 
  | 'questions'   // 题目
  | 'grammar'     // 语法
  | 'pages'       // 页数
  | 'listening'   // 听力
  | 'vocab'       // 单词
  | 'custom';     // 自定义
```

#### DailyLog（每日打卡记录）

```ts
interface DailyLog {
  id: string;
  date: string;         // "YYYY-MM-DD"
  planId: string;
  tasks: TaskLog[];
  note: string;         // 学习笔记
  completedAt: string | null;  // 全部完成的时间戳
}
```

#### TaskLog（单任务完成状态）

```ts
interface TaskLog {
  taskItemId: string;
  isTemp: boolean;      // 是否为临时追加任务
  tempDescription?: string;  // 临时任务描述
  completed: boolean;
  completedTime: string | null;
}
```

#### AppConfig（应用配置）

```ts
interface AppConfig {
  language: 'zh-CN' | 'en' | 'ja';
  darkMode: boolean;
  reminderEnabled: boolean;
  reminderTime: string;  // "HH:mm"
}
```

### 4.2 Dexie 表结构

```ts
class StudyDB extends Dexie {
  plans: Table<Plan>;
  taskTemplates: Table<TaskTemplate>;
  dailyLogs: Table<DailyLog>;
  config: Table<AppConfig>;
}

// 索引
plans: '++id, isActive'
taskTemplates: '++id, planId'
dailyLogs: '++id, date, planId'
```

---

## 5. 多语言 i18n 实现

### 5.1 技术方案

使用 **vue-i18n v9**，配合 Vite，按语言懒加载。

```
src/
  i18n/
    index.ts         # i18n 初始化
    locales/
      zh-CN.json
      en.json
      ja.json
```

### 5.2 语言文件结构示例

```json
// zh-CN.json
{
  "nav": {
    "today": "今日",
    "calendar": "日历",
    "stats": "统计",
    "plans": "计划",
    "settings": "设置"
  },
  "today": {
    "greeting": "早上好",
    "progress": "今日进度",
    "completed": "{done} / {total} 已完成",
    "tasks": "任务",
    "addTask": "+ 追加",
    "note": "今日笔记",
    "notePlaceholder": "写下今天学到的内容…",
    "allDone": "打卡完成！",
    "allDoneSub": "太棒了！连续第 {days} 天"
  },
  "taskType": {
    "questions": "题目",
    "grammar": "语法",
    "pages": "阅读",
    "listening": "听力",
    "vocab": "词汇",
    "custom": "自定义"
  },
  "settings": {
    "language": "语言",
    "darkMode": "深色模式",
    "reminder": "学习提醒",
    "reminderTime": "提醒时间",
    "export": "导出数据",
    "import": "导入数据",
    "deleteData": "清除数据",
    "deleteConfirm": "确认清除所有数据？此操作不可撤销。"
  }
}
```

---

## 6. 界面设计规范

参考原型（`japanese-study-app.html`）的「日本手账」美学风格。

### 6.1 色彩

| Token | 值 | 用途 |
|-------|----|------|
| `--ink` | `#1a1f1a` | 背景深墨绿 |
| `--paper` | `#f4f0e8` | 纸张米白 |
| `--sakura` | `#c0544a` | 樱花红，主强调色 |
| `--gold` | `#b8962a` | 金色，次强调 |
| `--moss` | `#4a6741` | 苔绿，成功状态 |

### 6.2 字体

- 正文：Noto Sans JP / Noto Sans SC
- 标题/日期：Noto Serif JP
- 数字/代码：DM Mono

### 6.3 移动端尺寸

- 设计基准：375 × 812（iPhone 标准）
- 底部导航高度：72px
- 内容区圆角：16px / 10px

---

## 7. 技术架构

### 7.1 目录结构

```
src/
  assets/          # 静态资源
  components/      # 通用组件
    TaskCard.vue
    ProgressBar.vue
    CalendarGrid.vue
    BarChart.vue
  composables/     # 业务逻辑 hooks
    useToday.ts
    useCalendar.ts
    useStats.ts
    usePlans.ts
    useI18n.ts
  db/
    index.ts       # Dexie 实例
    models.ts      # 类型定义
  i18n/
    index.ts
    locales/       # 语言文件
  pages/
    Today.vue
    Calendar.vue
    Stats.vue
    Plans.vue
    Settings.vue
  router/
    index.ts
  App.vue
  main.ts
```

### 7.2 依赖清单

```json
{
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.3.0",
    "vue-i18n": "^9.13.0",
    "dexie": "^3.2.7",
    "@capacitor/core": "^6.0.0",
    "@capacitor/local-notifications": "^6.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "vite": "^5.0.0"
  }
}
```

### 7.3 Capacitor 打包流程

```sh
# 1. 构建 Web 产物
npm run build

# 2. 同步到原生平台
npx cap sync

# 3. Android
npx cap open android   # 在 Android Studio 中构建 APK

# 4. iOS
npx cap open ios       # 在 Xcode 中构建 IPA
```

---

## 8. 数据管理

### 8.1 导出格式

```json
{
  "exportedAt": "2025-06-02T09:41:00Z",
  "version": "1.0.0",
  "data": {
    "plans": [...],
    "taskTemplates": [...],
    "dailyLogs": [...],
    "config": {...}
  }
}
```

### 8.2 数据体积估算

| 场景 | 估算大小 |
|------|---------|
| 1年每日打卡（6任务/天） | ≈ 500 KB |
| 含每日笔记（200字均值） | ≈ 2 MB |
| IndexedDB 上限 | 通常 50MB+ |

---

## 9. 非功能需求

| 项目 | 要求 |
|------|------|
| 离线可用 | 100%，无需网络 |
| 首屏加载 | < 1.5s（本地设备） |
| 动画帧率 | 60fps |
| 最低系统 | Android 7.0+ / iOS 13+ |
| 数据安全 | 全部本地存储，不上传任何数据 |
| 无障碍 | 颜色对比度满足 WCAG AA |

---

## 10. 里程碑计划

| 阶段 | 内容 | 目标 |
|------|------|------|
| M1 | 基础框架 + 数据层 + 多语言骨架 | 可运行的空壳 |
| M2 | 今日打卡页（核心功能） | 可完整打卡 |
| M3 | 日历 + 统计页 | 数据可视化 |
| M4 | 计划管理 + 模板系统 | 完整功能 |
| M5 | 设置 + 导入导出 + 通知 | 功能完备 |
| M6 | Capacitor 打包 + 测试 | 可安装 APK |

---

## 附录：任务类型多语言对照表

| type key | 中文 | English | 日本語 |
|----------|------|---------|--------|
| `questions` | 题目 | Questions | 問題 |
| `grammar` | 语法 | Grammar | 文法 |
| `pages` | 页数 | Pages | ページ |
| `listening` | 听力 | Listening | 聴解 |
| `vocab` | 词汇 | Vocabulary | 語彙 |
| `custom` | 自定义 | Custom | カスタム |
