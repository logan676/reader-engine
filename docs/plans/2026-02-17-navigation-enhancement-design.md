# Navigation Enhancement Design

> reader-engine 翻页导航增强设计文档，覆盖翻页动画、滑动手势、阅读位置恢复和自动翻页功能。

## 一、当前架构分析

### 现有翻页流程

```mermaid
sequenceDiagram
    participant User
    participant Engine as ReaderEngine
    participant Pag as Paginator
    participant DOM as Content DOM

    User->>Engine: nextPage() / prevPage()
    Engine->>Pag: nextPage() / prevPage()
    Pag->>Pag: clamp(page, 0, total-1)
    Pag->>DOM: style.transform = translateX(...)
    Note over DOM: 瞬间跳转，无动画
    Pag->>Engine: onPageChange(state)
    Engine->>User: onStateChange(readerState)
```

### 当前问题

| 问题 | 现状 | 目标 |
|------|------|------|
| 翻页无动画 | `translateX` 瞬间切换 | CSS transition 平滑过渡 |
| 无手势支持 | 仅 `nextPage()`/`prevPage()` API 调用 | 触摸滑动 + 跟手拖拽 |
| 无位置恢复 | 重新加载后从第 0 页开始 | 序列化/反序列化阅读位置 |
| 无自动翻页 | 不存在 | 定时器驱动自动翻页 |

---

## 二、翻页动画 (P1-6)

### 动画类型

| 动画模式 | CSS 属性 | 时长 | 缓动函数 | 适用场景 |
|---------|----------|------|---------|---------|
| `slide` | `transform: translateX()` | 300ms | `cubic-bezier(0.25, 0.1, 0.25, 1)` | 默认，模拟左右翻页 |
| `fade` | `opacity` | 250ms | `ease-in-out` | 淡入淡出过渡 |
| `none` | 无 | 0ms | - | 无动画（当前行为，保持兼容） |

### 动画状态机

```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Animating: goToPage() / nextPage() / prevPage()
    Animating --> Idle: transitionend 事件触发
    Animating --> Animating: 新翻页请求 → 取消当前动画，立即跳转到目标页

    note right of Idle
        接受翻页指令
        接受手势输入
    end note

    note right of Animating
        CSS transition 进行中
        记录目标页
        transitionend 后回调
    end note
```

### CSS Transition 策略

| 阶段 | 操作 |
|------|------|
| 初始化 | 在 content 元素上设置 `transition: transform <duration> <easing>` |
| 触发翻页 | 更新 `translateX` 值，浏览器自动执行过渡动画 |
| 动画完成 | 监听 `transitionend` 事件，更新内部状态，触发回调 |
| 快速翻页 | 动画期间收到新翻页指令时，临时移除 transition，瞬间跳转到中间状态，再重新设置 transition 到最终目标 |
| fade 模式 | 先淡出(opacity: 0) -> 切换 translateX(无 transition) -> 淡入(opacity: 1) |

### 新增配置项

| 配置字段 | 类型 | 默认值 | 说明 |
|---------|------|--------|------|
| `pageTransition` | `'slide' \| 'fade' \| 'none'` | `'slide'` | 翻页动画模式 |
| `transitionDuration` | `number` | `300` | 动画时长(ms) |

---

## 三、滑动手势翻页 (P1-7)

### 手势处理流程

```mermaid
flowchart TD
    TS[touchstart] --> Record["记录起始坐标 startX, startY<br/>记录起始时间 startTime<br/>标记 tracking = true"]
    Record --> TM[touchmove]
    TM --> CalcDelta["计算 deltaX = currentX - startX<br/>计算 deltaY = currentY - startY"]
    CalcDelta --> CheckDir{"abs(deltaX) > abs(deltaY)?"}
    CheckDir -->|否| Ignore["非水平滑动<br/>放弃跟踪"]
    CheckDir -->|是| CheckThreshold{"abs(deltaX) > 10px?"}
    CheckThreshold -->|否| TM
    CheckThreshold -->|是| Drag["preventDefault<br/>内容跟手偏移<br/>translateX = pageOffset + deltaX"]
    Drag --> TM
    Drag --> TE[touchend]
    TE --> CalcVelocity["计算滑动速度 velocity<br/>= deltaX / elapsed"]
    CalcVelocity --> Decision{"触发翻页?"}
    Decision -->|"abs(deltaX) > 容器宽度 30%<br/>或 velocity > 0.3px/ms"| Flip["执行翻页动画<br/>到目标页"]
    Decision -->|否| Snap["回弹动画<br/>恢复当前页位置"]
    Ignore --> TE
```

### 触摸事件参数

| 参数 | 说明 | 阈值 |
|------|------|------|
| `startX` / `startY` | touchstart 时的触摸坐标 | - |
| `deltaX` | 水平位移 (currentX - startX) | - |
| `directionLock` | 方向锁定标记 | 首次 move 时 `abs(deltaX) > abs(deltaY)` |
| `dragThreshold` | 最小拖拽距离，低于此值不视为拖拽 | 10px |
| `flipThreshold` | 触发翻页的最小滑动距离 | 容器宽度 30% |
| `velocityThreshold` | 触发翻页的最小速度 | 0.3 px/ms |
| `maxTrackDuration` | 超过此时间按距离判断而非速度 | 300ms |

### 手势与动画协作

| 阶段 | 行为 |
|------|------|
| 拖拽中 | 移除 CSS transition，内容跟手移动(实时更新 translateX) |
| 释放 - 翻页 | 恢复 CSS transition，translateX 动画到目标页偏移量 |
| 释放 - 回弹 | 恢复 CSS transition，translateX 动画回当前页偏移量 |
| 边界阻尼 | 在第一页向右滑或最后一页向左滑时，偏移量乘以 0.3 衰减系数 |

### 边界行为

```mermaid
flowchart LR
    FirstPage["第一页<br/>向右滑"] --> Damping1["阻尼效果<br/>deltaX * 0.3"]
    Damping1 --> Snapback1["释放回弹"]

    LastPage["最后一页<br/>向左滑"] --> CheckChapter{"有下一章?"}
    CheckChapter -->|是| ChapterHint["超出阈值时<br/>触发 onBoundaryReached 回调"]
    CheckChapter -->|否| Damping2["阻尼效果<br/>deltaX * 0.3"]
    Damping2 --> Snapback2["释放回弹"]
```

### 新增配置项

| 配置字段 | 类型 | 默认值 | 说明 |
|---------|------|--------|------|
| `swipeEnabled` | `boolean` | `true` | 是否启用滑动手势 |

---

## 四、阅读位置恢复 (P1-8)

### 位置数据结构

| 字段 | 类型 | 说明 |
|------|------|------|
| `bookId` | `string` | 书籍 ID |
| `chapterId` | `string` | 章节 ID |
| `chapterIndex` | `number` | 章节索引(冗余，用于快速定位) |
| `pageIndex` | `number` | 页码(分页模式下) |
| `scrollProgress` | `number` | 滚动进度 0-1(滚动模式下) |
| `readingMode` | `ReadingMode` | 保存时的阅读模式 |
| `timestamp` | `number` | 保存时间戳(Unix ms) |
| `version` | `number` | 数据格式版本号，当前为 1 |

### 位置序列化/反序列化流程

```mermaid
flowchart TD
    subgraph 保存位置
        S1["调用 engine.savePosition()"] --> S2["读取当前 ReaderState"]
        S2 --> S3["组装 ReadingPosition 对象"]
        S3 --> S4["返回 JSON 可序列化对象"]
        S4 --> S5["调用方自行持久化<br/>(localStorage / API)"]
    end

    subgraph 恢复位置
        R1["调用方读取已保存的位置数据"] --> R2["调用 engine.restorePosition(position)"]
        R2 --> R3{"readingMode 匹配?"}
        R3 -->|是| R4["loadChapter(chapterIndex)"]
        R3 -->|否| R4
        R4 --> R5{"分页模式?"}
        R5 -->|是| R6["goToPage(pageIndex)"]
        R5 -->|否| R7["scrollTo(scrollProgress)"]
        R6 --> R8["触发 onStateChange"]
        R7 --> R8
    end
```

### API 设计要点

| 方法 | 职责 | 说明 |
|------|------|------|
| `savePosition()` | 返回 `ReadingPosition` 对象 | 纯数据，不涉及持久化 |
| `restorePosition(pos)` | 异步恢复到指定位置 | 内部调用 `loadChapter` + `goToPage`/`scrollTo` |

**设计原则**：engine 只负责位置的序列化/反序列化和页面跳转，不负责持久化存储。持久化策略由调用方（Web/React 层）决定。

### 模式切换处理

| 场景 | 处理方式 |
|------|---------|
| 保存时分页模式，恢复时也是分页模式 | 直接使用 `pageIndex` |
| 保存时滚动模式，恢复时也是滚动模式 | 直接使用 `scrollProgress` |
| 保存时分页模式，恢复时改为滚动模式 | 由 `pageIndex` 估算 `scrollProgress = pageIndex / totalPages` |
| 保存时滚动模式，恢复时改为分页模式 | 由 `scrollProgress` 估算 `pageIndex = round(scrollProgress * totalPages)` |

---

## 五、自动翻页 (P3-13)

### 自动翻页状态机

```mermaid
stateDiagram-v2
    [*] --> Stopped
    Stopped --> Running: start(interval)
    Running --> Paused: pause() / 用户手动翻页 / 手势拖拽开始
    Paused --> Running: resume()
    Running --> Stopped: stop() / 到达最后一页
    Paused --> Stopped: stop()

    note right of Running
        定时器每 interval 毫秒触发一次
        调用 engine.nextPage()
    end note

    note right of Paused
        定时器已清除
        记住当前 interval 设置
    end note
```

### 预设间隔

| 间隔名称 | 毫秒值 | 对应 iOS 设置 |
|---------|--------|-------------|
| `fast` | 15000 | 15 秒 |
| `normal` | 30000 | 30 秒 |
| `slow` | 60000 | 60 秒 |

### 定时器管理策略

| 场景 | 行为 |
|------|------|
| 启动 | `setInterval(nextPage, interval)`，立即开始计时 |
| 用户手动翻页 | 暂停自动翻页，需要用户显式 `resume()` |
| 手势拖拽开始 | 暂停自动翻页 |
| 到达章节最后一页 | 触发章节切换，切换完成后继续自动翻页 |
| 到达全书最后一页 | 自动停止，状态变为 `Stopped` |
| 切换章节(手动) | 自动暂停 |
| 页面不可见(visibilitychange hidden) | 暂停定时器，避免后台消耗 |
| 页面恢复可见 | 恢复定时器 |
| `destroy()` | 清除定时器，释放事件监听 |

### 新增配置项

| 配置字段 | 类型 | 默认值 | 说明 |
|---------|------|--------|------|
| `autoPageInterval` | `number \| null` | `null` | 自动翻页间隔(ms)，null 表示关闭 |

---

## 六、模块架构

### 新增模块

```mermaid
graph TD
    Engine[ReaderEngine] --> Pag[Paginator]
    Engine --> SM[ScrollMode]
    Engine --> PA[PageAnimator<br/>新增]
    Engine --> GH[GestureHandler<br/>新增]
    Engine --> POS[PositionManager<br/>新增]
    Engine --> AP[AutoPager<br/>新增]

    PA -->|控制| Pag
    GH -->|触发| PA
    GH -->|通知| AP
    AP -->|调用| Engine

    subgraph core [core/]
        Pag
        SM
        PA
        GH
        AP
        POS
    end

    style PA fill:#4CAF50,color:#fff
    style GH fill:#4CAF50,color:#fff
    style POS fill:#4CAF50,color:#fff
    style AP fill:#4CAF50,color:#fff
```

### 模块职责

| 模块 | 文件 | 职责 |
|------|------|------|
| `PageAnimator` | `core/page-animator.ts` | 管理 CSS transition 生命周期，处理 slide/fade/none 模式切换 |
| `GestureHandler` | `core/gesture-handler.ts` | 触摸事件监听与解析，拖拽跟手、速度计算、方向锁定 |
| `PositionManager` | `core/position-manager.ts` | 位置序列化/反序列化，模式切换时的位置换算 |
| `AutoPager` | `core/auto-pager.ts` | 定时器管理，自动翻页状态机，可见性监听 |

### 模块交互时序

```mermaid
sequenceDiagram
    participant User as 用户触摸
    participant GH as GestureHandler
    participant PA as PageAnimator
    participant Pag as Paginator
    participant AP as AutoPager
    participant Engine as ReaderEngine

    Note over User,Engine: 滑动翻页流程
    User->>GH: touchstart
    GH->>AP: pause()
    GH->>PA: disableTransition()
    User->>GH: touchmove (多次)
    GH->>PA: setOffset(deltaX)
    User->>GH: touchend
    GH->>GH: 计算翻页判定
    alt 触发翻页
        GH->>Pag: nextPage() / prevPage()
        GH->>PA: animateToPage(targetPage)
        PA->>Engine: onAnimationEnd → emitStateChange()
    else 回弹
        GH->>PA: animateToPage(currentPage)
    end
```

---

## 七、ReaderSettings 扩展

| 新增字段 | 类型 | 默认值 |
|---------|------|--------|
| `pageTransition` | `'slide' \| 'fade' \| 'none'` | `'slide'` |
| `transitionDuration` | `number` | `300` |
| `swipeEnabled` | `boolean` | `true` |
| `autoPageInterval` | `number \| null` | `null` |

---

## 八、ReaderEngine 新增 API

| 方法 | 返回类型 | 说明 |
|------|---------|------|
| `savePosition()` | `ReadingPosition` | 序列化当前阅读位置 |
| `restorePosition(pos: ReadingPosition)` | `Promise<void>` | 恢复到指定阅读位置 |
| `startAutoPage(interval?: number)` | `void` | 启动自动翻页 |
| `pauseAutoPage()` | `void` | 暂停自动翻页 |
| `resumeAutoPage()` | `void` | 恢复自动翻页 |
| `stopAutoPage()` | `void` | 停止自动翻页 |
| `autoPageState` (getter) | `'stopped' \| 'running' \| 'paused'` | 自动翻页状态 |

---

## 九、React Hook 扩展

| Hook | 提供内容 |
|------|---------|
| `useReader()` | 新增 `savePosition`, `restorePosition` |
| `useAutoPage()` (新增) | `start`, `pause`, `resume`, `stop`, `state`, `interval` |

---

## 十、兼容性与降级

| 场景 | 策略 |
|------|------|
| 不支持 touch 事件的浏览器 | GestureHandler 不绑定事件，不影响键盘/鼠标翻页 |
| CSS transition 不支持 | `transitionend` 事件不触发时，使用 setTimeout 兜底(duration + 50ms) |
| `prefers-reduced-motion` | 检测用户偏好，自动将 `pageTransition` 降级为 `none` |
| 滚动模式 | GestureHandler 和 PageAnimator 仅在分页模式下激活，滚动模式使用浏览器原生滚动 |
