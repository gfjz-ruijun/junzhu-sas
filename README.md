# JunZhu-SAS 个人学业分析系统

## 项目简介

**JunZhu-SAS**（JunZhu Student Academic System）是一个个人学业分析系统，帮助学生记录和分析自己的考试成绩。通过直观的成绩曲线可视化，用户可以清晰地了解自己的学业进度和趋势。

### 核心功能

**学科管理**：用户可以添加自定义名称的学科（如数学、英语、物理等），并为每个学科单独追踪成绩。

**考试成绩记录**：在每个学科内，用户可以记录考试信息，包括考试日期、考试类型（小测、周测、月考、期中考、期末考、模拟考、中考、高考、其他）、卷面总分、实际得分和难易程度。

**自动成绩计算**：系统自动计算成绩比值（实际得分/卷面总分），并将其转换为百分比形式，精确到小数点后四位。

**成绩趋势可视化**：系统绘制成绩曲线，显示每次考试的成绩比值变化趋势。曲线上标注考试日期和考试类型，困难题用红色标记和"难"字标签。

**智能趋势分析**：系统分析最近5次考试的成绩变化，自动判断成绩趋势。当成绩呈上升趋势时，页面周围显示绿色渐变背景并提示"分数呈上升趋势"；当成绩呈下降趋势时，显示红色渐变背景并提示"分数呈下降趋势"；当成绩跌宕起伏时，显示蓝色渐变背景。

**成绩等级划分**：系统根据成绩比值自动划分等级（100%满分、90-99%优秀、80-89%良好、70-79%及格、<70%需改进）。

**统计信息**：页面显示总考试次数、平均成绩、最高成绩和最低成绩等统计数据。

## 快速开始

### 系统要求

- Node.js 18+
- npm 或 pnpm
- MySQL 5.7+ 或 TiDB

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd junzhu-sas
   ```

2. **安装依赖**
   ```bash
   pnpm install
   ```

3. **配置环境变量**
   
   创建 `.env.local` 文件，配置以下变量：
   ```
   DATABASE_URL=mysql://user:password@localhost:3306/junzhu_sas
   JWT_SECRET=your-secret-key
   VITE_APP_ID=your-app-id
   OAUTH_SERVER_URL=https://api.manus.im
   VITE_OAUTH_PORTAL_URL=https://portal.manus.im
   ```

4. **初始化数据库**
   ```bash
   pnpm db:push
   ```

5. **启动开发服务器**
   ```bash
   pnpm dev
   ```

   访问 `http://localhost:3000` 查看应用。

## 使用指南

### 首页操作

首页显示所有已创建的学科。用户可以：

- **添加学科**：点击"添加学科"按钮，输入学科名称（如"数学"、"英语"），点击"创建"。
- **查看学科**：点击学科卡片进入该学科的详情页。
- **删除学科**：点击学科卡片右上角的删除按钮，确认删除。

### 学科详情页操作

进入学科详情页后，用户可以：

- **添加考试成绩**：点击"添加考试成绩"按钮，填写以下信息：
  - 考试日期：选择考试的具体日期（YYYY-MM-DD格式）
  - 考试类型：从下拉菜单选择（小测、周测、月考等）
  - 卷面总分：输入试卷的满分分数
  - 实际得分：输入自己的实际得分
  - 难易程度：选择该次考试的难度（简单、中等、困难）
  
  点击"保存"按钮后，考试记录将被保存并出现在列表中。

- **查看成绩曲线**：当有多条考试记录时，页面上方会显示成绩趋势曲线。曲线清晰展示成绩变化趋势，帮助用户了解学业进度。

- **查看统计信息**：在曲线下方显示总考试次数、平均成绩、最高成绩和最低成绩。

- **删除考试记录**：点击记录右侧的删除按钮，确认删除。

### 趋势分析

系统自动分析最近5次考试的成绩变化：

- **上升趋势**：成绩整体上升，页面背景变为绿色渐变，顶部显示"分数呈上升趋势"提示。
- **下降趋势**：成绩整体下降，页面背景变为红色渐变，顶部显示"分数呈下降趋势"提示。
- **波动趋势**：成绩跌宕起伏，页面背景变为蓝色渐变。

## 技术架构

### 前端技术栈

- **框架**：React 19 + TypeScript
- **样式**：Tailwind CSS + shadcn/ui
- **数据获取**：tRPC + React Query
- **图表**：Recharts
- **路由**：wouter
- **图标**：lucide-react

### 后端技术栈

- **服务器**：Express 4
- **RPC框架**：tRPC 11
- **ORM**：Drizzle ORM
- **数据库**：MySQL/TiDB
- **认证**：Manus OAuth
- **验证**：Zod

### 数据库架构

**users 表**：存储用户信息，包括ID、名称、邮箱、登录方式、角色和登录时间。

**subjects 表**：存储用户创建的学科，包括ID、用户ID、学科名称和创建时间。

**examRecords 表**：存储考试成绩记录，包括ID、学科ID、考试日期、考试类型、卷面总分、实际得分、成绩比值、难易程度和时间戳。

## API 文档

### 学科管理 API

**获取用户所有学科**
```typescript
trpc.subjects.list.useQuery()
```

**创建新学科**
```typescript
trpc.subjects.create.useMutation({
  name: "数学"
})
```

**删除学科**
```typescript
trpc.subjects.delete.useMutation({
  id: "subject_id"
})
```

### 考试成绩 API

**获取学科的所有考试记录**
```typescript
trpc.examRecords.list.useQuery({
  subjectId: "subject_id"
})
```

**创建考试记录**
```typescript
trpc.examRecords.create.useMutation({
  subjectId: "subject_id",
  examDate: "2024-01-15",
  examType: "月考",
  totalScore: 100,
  actualScore: 85,
  difficulty: "中等"
})
```

**删除考试记录**
```typescript
trpc.examRecords.delete.useMutation({
  id: "exam_id"
})
```

**更新考试记录**
```typescript
trpc.examRecords.update.useMutation({
  id: "exam_id",
  examDate: "2024-01-15",
  examType: "月考",
  totalScore: 100,
  actualScore: 90,
  difficulty: "困难"
})
```

## 项目结构

```
junzhu-sas/
├── client/                      # 前端代码
│   ├── src/
│   │   ├── pages/              # 页面组件
│   │   │   ├── Home.tsx        # 首页
│   │   │   └── SubjectDetail.tsx # 学科详情页
│   │   ├── components/         # 可复用组件
│   │   │   └── ScoreCurveChart.tsx # 成绩曲线图表
│   │   ├── lib/
│   │   │   └── trpc.ts         # tRPC客户端配置
│   │   ├── App.tsx             # 应用主组件
│   │   └── index.css           # 全局样式
│   └── public/                 # 静态资源
├── server/                      # 后端代码
│   ├── db.ts                   # 数据库查询函数
│   ├── routers.ts              # tRPC路由定义
│   └── _core/                  # 核心框架代码
├── drizzle/                     # 数据库架构
│   └── schema.ts               # 数据库表定义
├── shared/                      # 共享代码
└── README.md                    # 本文件
```

## 性能优化

系统采用多种优化策略确保高效运行：

**前端优化**：使用React.lazy进行代码分割，减少初始加载体积。tRPC查询自动缓存，避免重复请求。图表组件使用ResponsiveContainer自适应容器大小，确保在不同设备上的显示效果。

**后端优化**：Drizzle ORM使用精确的select().where()查询，避免N+1问题。考试记录按日期排序，方便前端展示。

**数据库优化**：MySQL/TiDB的高效索引支持快速查询。用户数据隔离，确保安全性。

## 常见问题

**Q: 如何修改已保存的考试成绩？**
A: 目前版本支持删除后重新添加。未来版本将支持直接编辑功能。

**Q: 系统支持多少个学科和考试记录？**
A: 系统理论上支持无限数量的学科和考试记录，实际受数据库容量限制。

**Q: 数据会被保留多久？**
A: 数据永久保留在数据库中，除非用户主动删除。

**Q: 支持导出数据吗？**
A: 当前版本暂不支持数据导出，未来版本将支持Excel和PDF导出。

## 许可证

本项目采用 MIT 许可证。详见 LICENSE 文件。

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件至 support@junzhu.com
- 访问官方网站 www.junzhu.com

## 更新日志

### v1.0.0 (2024-10-18)
- 初始版本发布
- 实现学科管理功能
- 实现考试成绩记录功能
- 实现成绩曲线可视化
- 实现趋势分析功能

---

感谢使用 JunZhu-SAS！祝学业进步！

