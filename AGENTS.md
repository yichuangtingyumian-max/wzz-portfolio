# WZZ Portfolio Project Rules

## 1. Project identity

这是王增增（Wang Zengzeng）的个人设计作品集网站。

项目目标不是制作普通企业官网，而是制作一个具有个人设计语言、交互感和作品集叙事感的 Portfolio Website。

当前项目已经有既定的设计方向、素材、内容和页面结构。
不要在没有明确要求的情况下重新定义网站定位、重写主要内容或推翻已经确认的设计。

---

## 2. Design system first

整个网站必须优先遵循已有的 WZZ Portfolio Visual System / Design Tokens。

涉及以下内容时：

- Typography
- Font Size
- Font Weight
- Line Height
- Spacing
- Grid
- Page Width
- Color
- Radius
- Shadow
- Divider
- Motion
- Easing

优先复用已有 Design Tokens。

不要因为某个局部“看起来不够突出”就随意新增：
- 随机字号
- 随机 margin
- 随机 padding
- 随机灰色
- 随机圆角
- 随机阴影
- 随机 transition duration

修改视觉问题时，应先判断该元素属于哪一个既有视觉层级和 Token。

---

## 3. Global alignment

Hero、About、Core Capabilities、Experience、Projects、Beyond Design、Contact 等主要模块必须建立在同一套页面骨架中。

全站 Outer Container、页面左右安全边距、主要左基准线应保持一致。

允许不同 Section 使用不同 Internal Layout，
但不要为了单独优化某个 Section 而破坏全站对齐关系。

例如：

Hero 可以内部更紧凑，
但 Hero 左侧文字仍应与 About、Projects 等主要内容共享整体页面基准线。

---

## 4. Figma usage

Figma 主要用于理解：

- 用户自己的内容
- 素材
- Badge
- 图标风格
- 照片
- 视觉意图
- 大致布局方向

Figma 中元素的位置通常只是构图参考，不代表必须 1:1 复制坐标。

不要把 Figma 中明显属于“风格参考”的整张截图直接作为网页 UI。

例如：
左侧导航图只是 Icon Style 参考，
真实网站必须重新实现为可交互 HTML / SVG / Component。

---

## 5. Reference website usage

参考网站主要用于学习：

- Typography hierarchy
- Information density
- Spacing
- Visual rhythm
- Divider
- Badge / Sticker feeling
- Motion
- Hover
- Navigation interaction
- Object-like composition

不要复制参考网站的：
- 文案
- 品牌
- Logo
- 项目内容
- 图片资产

目标是学习设计方法，而不是复制网站。

---

## 6. Preserve confirmed work

已经被用户确认或明确要求保留的内容，不要自行推翻。

如果一个模块已经完成并进入精修阶段：

优先局部修正，
不要因为处理一个小问题而重新设计整个模块。

除非用户明确要求 redesign。

---

## 7. Worktree scope rule

当当前聊天运行在 Git Worktree 中时：

必须严格遵守当前聊天明确指定的任务范围。

不要因为发现其他模块可以优化，就顺便修改其他模块。

例如：

如果当前 Worktree 任务是 About，
不要自行修改：
- Hero
- Side Navigation
- Computer Interaction
- Projects
- Contact

除非任务明确允许。

不同 Worktree 应尽量负责互相独立的开发范围。

---

## 8. Shared files

修改以下类型的公共文件时需要特别谨慎：

- 全局 CSS
- Design Tokens
- index.html 公共结构
- 公共 JavaScript
- 导航
- 全局组件
- 公共变量

如果任务可以通过模块局部文件完成，
优先避免不必要地改动公共文件。

这样可以减少多个 Worktree 合并时的冲突。

---

## 9. Git safety

不要未经用户确认：

- 自动合并到 main
- 覆盖其他 Worktree 的成果
- 删除其他分支
- reset / clean 掉用户修改
- force push
- 大规模重写 Git 历史

每个 Worktree 完成任务后：

先检查修改，
运行必要的预览 / 构建 / 基础测试，
然后汇报修改内容。

等待用户确认之后再进行合并。

---

## 10. Existing user changes

始终把仓库里已有但不是当前任务产生的修改视为用户的重要工作。

不要随意：
- 删除
- 覆盖
- 恢复
- 清理

不确定来源的修改时，先保留。

---

## 11. Implementation quality

修改完成后至少检查：

- HTML / CSS / JavaScript 是否存在明显语法问题
- 页面是否可以正常打开
- 当前任务涉及的交互是否正常
- Desktop 主要布局是否正常
- 没有明显破坏其他模块
- 没有引入不必要的重复代码

如果项目已有构建 / 测试方式，优先运行现有检查。

---

## 12. Responsive behavior

不要通过简单 transform: scale() 解决响应式问题。

Desktop、Tablet、Mobile 应根据布局关系合理调整：

- column → stack
- gap
- padding
- typography
- card radius
- navigation

保持内容层级，而不是简单缩小整个网页。

---

## 13. Motion

动画应该：

- 克制
- 平滑
- 有目的
- 遵循统一 Motion Tokens

不要为了“更有设计感”增加无意义的：

- 漂浮
- 大幅旋转
- 过度 3D
- 高频闪动
- 大面积 Parallax

电脑、Badge、Card 等不同对象可以拥有不同交互，
但需要符合统一 Motion System。

---

## 14. Work completion

完成每一次开发任务后，请汇报：

1. 修改了哪些文件
2. 解决了什么问题
3. 是否修改公共 Design Tokens
4. 是否存在与其他模块潜在冲突
5. 执行了哪些检查
6. 还有哪些需要用户确认

不要在完成指定任务后自行继续开发下一模块。
