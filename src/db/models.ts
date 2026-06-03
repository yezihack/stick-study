// Data Models and TypeScript Interfaces

export enum TaskType {
  QUESTIONS = 'questions',
  GRAMMAR = 'grammar',
  PAGES = 'pages',
  LISTENING = 'listening',
  VOCAB = 'vocab',
  CUSTOM = 'custom'
}

export interface Plan {
  id: string // UUID
  name: string // 计划名称（用户输入，不翻译）
  bookTitle: string // 关联书籍名
  startDate: string // ISO 日期 "YYYY-MM-DD"
  endDate: string
  isActive: boolean // 是否启用
  color: string // 主题色（hex）
  createdAt: string // ISO timestamp
}

export interface TaskItem {
  id: string
  type: TaskType
  count: number // 数量
  unit: string // 单位（问题/页/分钟等，多语言 key）
  description: string // 用户填写的描述
}

export interface TaskTemplate {
  id: string
  planId: string
  weekdays: number[] // 0=日 1=月 ... 6=六，空数组=每天
  items: TaskItem[]
}

export interface TaskLog {
  taskItemId: string
  isTemp: boolean // 是否为临时追加任务
  tempDescription?: string // 临时任务描述
  completed: boolean
  completedTime: string | null // ISO timestamp
}

export interface DailyLog {
  id: string
  date: string // "YYYY-MM-DD"
  planId: string
  tasks: TaskLog[]
  note: string // 学习笔记
  completedAt: string | null // 全部完成的时间戳
}

export interface AppConfig {
  id?: number // Dexie auto-increment
  language: 'zh-CN' | 'en' | 'ja'
  darkMode: boolean
  reminderEnabled: boolean
  reminderTime: string // "HH:mm"
}
