# WZZ Portfolio Visual System v1.0

日期：2026-10-01；页面底色更新：2026-10-02。适用对象：WZZ 中文设计师作品集。规范状态：完整系统目标已定义；实际接入包括 Hero、固定导航与全站页面底色。

本文统一文字层级、灰阶、间距、布局、圆角、阴影和动效。目标是让信息关系与交互反馈可复用，同时保留电脑、金属 W 勋章、品牌贴纸等已有视觉表达。规范中的全站目标不等于所有模块已经迁移。

## 1. 范围与设计原则

1. 先建立统一系统，再按模块接入。当前内容、模块顺序、项目素材与业务交互继续作为基线。
2. 文字层级按内容角色组织：姓名、章节标题、卡片标题、说明、正文与辅助信息。HTML 标签承担语义，具名视觉变体承担展示用途。
3. 页面采用中低密度：正文容易阅读，相关信息靠近，章节与独立卡片保留充足空白。避免依靠大字号、过重阴影或满屏高度建立所有层级。
4. 中文与拉丁字母共用一致的文字角色；英文字体不能替代中文系统字体，也不通过任意负字距压缩中文长正文。
5. 电脑屏幕裁切、品牌 Logo、金属材质、贴纸切角与图标源图坐标属于组件或素材参数，不强制凑入基础网格。
6. 本轮仅实现 Hero / navigation。About、核心能力、经历、作品、生活、联系和三个二级阅读页均保持当前基线；本轮不发布网站。

## 2. Token 架构与兼容方式

基础值集中在 design-tokens.css。新增 v1.0 使用 --wzz-* 命名空间；原文件中的 --ds-* 保留既有语义。2026-10-02 按用户要求统一全站页面底色：公共 --wzz-page-bg 在所有页面加载的 home.css 的 :root 中定义，旧 --ds-color-canvas 引用该变量。其他角色仍按模块迁移，避免意外影响已确认的设计。

| 层次 | 示例 | 职责 |
| --- | --- | --- |
| 基础值 | --wzz-space-4、--wzz-radius-sm、--wzz-weight-semibold | 有限尺寸、字重与材质档位 |
| 语义角色 | --wzz-font-h1、--wzz-text-secondary、--wzz-motion-nav | 表达信息层级与反馈用途 |
| 组件使用 | Hero 姓名、身份行、分隔线、整体导航展开 | 引用角色并保留必要构图参数 |

除公共页面底色 --wzz-page-bg 外，变量仍定义在 .refreshed-home 下；Hero / 导航由 hero-intro.css 消费对应 --wzz-*。首页与三个二级阅读页的画布共同引用 --wzz-page-bg，卡片、图片与其他组件表面保留原有底色。全站最大宽度和后续卡片角色仍是系统目标，不据此改动未迁移区域的布局或通用 h1/h2/h3。

加载顺序保持：design-tokens.css → home.css → portfolio.css → home-refresh.css → hero-intro.css。最后一份负责限定区域内的迁移。旧 --ds-* 仍服务已存在的首页样式，后续按模块验收后再清理失效声明。

## 3. Typography / Type Scale

--wzz-font-sans 使用本地 WZZ Inter 字体族，优先呈现拉丁字符；缺少中文字形时依次回退 PingFang SC、Noto Sans SC、Microsoft YaHei、system-ui、sans-serif。复用现有 Inter-Variable.ttf，不下载新字体；字重范围声明为 100–900。

字号使用 rem，行高使用无单位数值。下表的像素值按浏览器默认 16px 换算。常规文字只使用 400 / 500 / 600 三档字重；品牌图形和素材内的文字可以保留自身表达。

| 角色 | 字号 | 基准字重 | 行高 | 字号 Token / 行高 Token |
| --- | --- | --- | --- | --- |
| Display | 36px | 600 | 1.2 | --wzz-font-display / --wzz-leading-heading |
| H1 / 姓名与主标题 | 30–32px | 600 | 1.2 | --wzz-font-h1 / --wzz-leading-heading |
| H2 / 章节标题 | 28px | 600 | 1.25 | --wzz-font-h2 / --wzz-leading-section |
| H3 / 卡片标题 | 22–24px | 600 | 1.4 | --wzz-font-h3 / --wzz-leading-title |
| H4 / 子标题 | 16–18px | 600 | 1.45 | --wzz-font-h4 / --wzz-leading-subtitle |
| Lead / 身份与引导语 | 18px | 400 | 1.6 | --wzz-font-lead / --wzz-leading-lead |
| Body / 正文 | 15px | 400 | 1.8 | --wzz-font-body / --wzz-leading-body |
| Meta / 日期、标签与副信息 | 13px | 400 | 1.6 | --wzz-font-meta / --wzz-leading-meta |
| Eyebrow / 栏目编号、短英文标签 | 11px | 500 | 1.4 | --wzz-font-eyebrow / --wzz-leading-eyebrow |

H1 与 H3 使用带 rem 下限、上限和 rem + vw 中间项的 clamp，避免只随视口缩小。clamp 的边界机制参考 [MDN clamp](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/clamp)；字号区间由本作品集确定。

标题字距使用 --wzz-tracking-heading（-.025em）；Eyebrow 使用 --wzz-tracking-eyebrow（.1em）。中文正文保持自然字距。正文按实际可读性采用 1.8 行高，不为满足 8pt 网格强迫文字基线等距。

### Responsive Typography

v1.0 的手机断点为 767px。用户给定的手机 Section Title 区间为 24–26px，本系统采用 24px；手机 Body 使用 14px。H1 收到 30px，H3 收到 22px，H4 收到 16px；Lead、Meta 与 Eyebrow 分别使用 18 / 13 / 11px。桌面 H2 / Body 仍为 28 / 15px。窄屏身份行与贴纸共同出现时，先检查实际可用宽度；紧凑身份行必须记录为组件变体，不能让普通正文无限缩小。

旧 --ds-type-name 的 30/28/27px、生活展示字的 30–50px、经历公司名称的 20/16px 与手机经历背文的 12px 都属于迁移前合同。Hero 姓名按最新标注与灰色信息共用 Hero 专属字号（见第 12 节），不改变通用 H1 Token；生活 Display 与手机经历背文仍留在旧合同。

## 4. Vertical Rhythm / Spacing / 8pt Grid

主要节奏采用 8px 单位，细节允许 4px 半步；20px 用于明确的手机边距与紧凑留白。固定基准档位如下。

| Token | 值 | 常见用途 |
| --- | --- | --- |
| --wzz-space-1 | 4px | 微调、紧密文本关系 |
| --wzz-space-2 | 8px | 小控件和标签内部关系 |
| --wzz-space-3 | 12px | 紧凑信息组 |
| --wzz-space-4 | 16px | 标题与正文、小组间距 |
| --wzz-space-5 | 20px | 手机页面边距 |
| --wzz-space-6 | 24px | 卡片间距、手机卡片内距 |
| --wzz-space-8 | 32px | 桌面卡片内距、标题组间距 |
| --wzz-space-12 | 48px | 桌面左右边距 |
| --wzz-space-16 | 64px | 手机章节留白 |
| --wzz-space-20 | 80px | 桌面章节留白 |

| 关系 | 桌面目标 | 手机目标 | 语义 Token |
| --- | --- | --- | --- |
| Section 上下内距 | 80px | 64px | --wzz-section-space |
| 标题组 → 内容 | 32px | 24px | --wzz-heading-gap |
| 卡片内距 | 32px | 24px | --wzz-card-padding |
| 卡片之间 | 24px | 24px | --wzz-card-gap |
| 栅格列间距 | 24px | 24px | --wzz-grid-gap |
| 图文主列间距 | 32px | 按单列关系使用 | --wzz-column-gap |

行高、段落间距和标题前后距离共同形成 Vertical Rhythm。信息内距小于组间距，组间距小于章节间距；连续 section 的 padding 会共同形成空白，不再机械叠加同等 margin。

本表是后续模块的统一目标。本轮 Hero 的行高与组间距按新角色接入；其他 section 不改动。分档思路参考 [USWDS spacing units](https://designsystem.digital.gov/design-tokens/spacing-units/)，具体档位与用途由本项目确定。

## 5. Layout Grid / White Space / UI Density

| 角色 | 桌面 | 手机 | Token |
| --- | --- | --- | --- |
| 当前全站 Outer Container | 1160px 上限 | 不超过可用宽度 | --ds-content-max |
| 当前页面单侧边距 | 44px；≤780px 为 24px | ≤640px 为 16px | --ds-page-gutter |
| 栅格组织参考 | 12 列 | 后续组合可按 4 列思考 | --wzz-grid-columns |
| 既有模块列间距 | 24px | 16px | --ds-grid-gap |

Outer Container 在扣除固定导航占位后的画布内居中，由现有 .wrap、--ds-content-max 和 --ds-page-gutter 统一控制。Hero、About 与后续主要内容共用同一外层边界；不再给 Hero 单独覆盖最大宽度或页面边距。按用户最新标注，Hero 内部紧凑组合在该外层中居中，这是本轮明确指定的内部构图，不修改其他模块基准线。--wzz-content-max / --wzz-page-gutter 的旧系统目标保留，导航的既有页面占位保持基线。

图文块、章节标题与正文优先共用容器边缘。中文说明保持左对齐与自然换行，长正文行长以约 40em 为参考。大图片或全宽卡片不意味着正文必须横跨整个卡片。

Hero 保持紧凑的个人名片密度，不使用 min-height:100vh 撑高；手机将桌面图文双栏改为上下排列。12 列是后续对齐思路，本轮不把 About 图文比例、作品卡片或生活堆叠强行转换为新网格。

## 6. Color / Gray Scale / Contrast

| 角色 | 值 | Token | 用途 |
| --- | --- | --- | --- |
| Primary | #242827 | --wzz-text-primary | 姓名、标题、主要信息 |
| Secondary | #626965 | --wzz-text-secondary | 正文、身份信息、导航标签、重要副信息 |
| Muted | #909792 | --wzz-text-muted | 非必要的辅助装饰 |
| Subtle | #ADB3AF | --wzz-text-subtle | 装饰细节与弱背景图形 |
| Page | #F8FAFC | --wzz-page-bg | 首页与三个二级阅读页共用的页面画布底色 |
| Surface | #FFFFFF | --wzz-surface | 导航、卡片、贴纸表面 |
| Hover surface | #F0F2F0 | --wzz-surface-hover | 轻量 Hover 背景 |
| Divider | #E2E6E3 | --wzz-divider-color | 信息分隔线 |
| Idle icon | #A9AEAB | --wzz-icon-idle | 空闲导航图标的视觉目标 |
| Focus | #626965 | --wzz-focus-color | 键盘焦点提示 |

普通信息文字按至少 4.5:1 的对比度目标检查；大字条件下的最低值为 3:1，依据 [WCAG 2.2 Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)。Secondary 对 Page 约为 5.38:1；Muted 约为 2.86:1，Subtle 约为 2.04:1，因此后二者不能承担姓名、身份、说明、导航标签或必须读懂的元信息。

真实 Logo 与品牌贴纸保留原色。导航图标颜色是状态表达，当前项与 Hover / Focus 应更清晰；实质性的导航名称用 Secondary，不通过透明度继续弱化。页面画布底色已统一为 #F8FAFC；这不代表其他视觉角色已迁移，也不据此宣称全站 WCAG 验收完成。

## 7. Border Radius / Material / Shadow / Divider

| 角色 | 值 | Token |
| --- | --- | --- |
| Small control | 12px | --wzz-radius-sm |
| Media / interior | 16px | --wzz-radius-md |
| Card | 20px | --wzz-radius-card |
| Large panel | 28px | --wzz-radius-lg |
| Navigation rail | 32px | --wzz-radius-nav |
| Pill | 999px | --wzz-radius-pill |

手机 Large panel 收到 Card 的 20px。矩形卡片、图片与胶囊分别使用自己的角色；不要给所有物件都套同一种圆角。Hero 的屏幕遮罩与切角是专项形状，允许保留精确参数。

| 阴影角色 | 数值 | Token | 用途 |
| --- | --- | --- | --- |
| Sticker | 0 3px 6px rgb(30 35 32 / .10) | --wzz-shadow-sticker | 贴纸的轻分离 |
| Sticker strong | 0 4px 8px rgb(30 35 32 / .14) | --wzz-shadow-sticker-strong | Hover 或强调贴纸 |
| Metal | 0 4px 6px rgb(50 44 35 / .12) | --wzz-shadow-metal | W 勋章的金属厚度 |
| Card | 0 12px 32px rgb(30 40 34 / .07) | --wzz-shadow-card | 后续常规卡片表面 |
| Floating | 0 10px 28px rgb(25 35 30 / .10) | --wzz-shadow-floating | 固定导航等浮动表面 |

阴影按材质与层级复用；Hover 提升必须有明确交互含义，不因模块不同任意增重。层级与表面分离思路参考 [Atlassian elevation](https://atlassian.design/foundations/elevation/)，本表数值由本作品集确定。

通用分隔线角色保留 --wzz-divider-height（1px）、--wzz-divider-opacity（.65）和 --wzz-divider-fade（85%）。Hero 信息行单独使用 --wzz-divider-hero-color：前 80% 保持完整浅灰色，最后 20% 渐隐至透明，不额外叠加低透明度。它承担行组关系，不同时用粗边框与重阴影重复强调。贴纸切角 3–4px 是已确认的材质细节，留在组件形状规则中。

## 8. Motion / Interaction States

统一缓动为 --wzz-ease-standard：cubic-bezier(.22, .8, .25, 1)。持续时间有限集合如下。

| 角色 | 时长 | Token | 使用建议 |
| --- | --- | --- | --- |
| Tiny | 180ms | --wzz-motion-tiny | 小范围透明度、即时状态 |
| Fast | 220ms | --wzz-motion-fast | 标签与图标反馈 |
| Navigation | 260ms | --wzz-motion-nav | 导航整体宽度展开与收回 |
| Base | 360ms | --wzz-motion-base | 常规贴纸旋转与位移 |
| Slow | 460ms | --wzz-motion-slow | 金属物件、人物进入等较完整动作 |
| Flip | 420ms | --wzz-motion-flip | 翻转角色的系统目标，本轮不更改经历翻转 |

每个交互组件说明 Idle、Hover、Focus、Active、Leaving 的视觉反馈。优先过渡 transform、opacity 等可控属性；导航宽度过渡为本组件的明确需要。不要使用 transition:all 引入未计划的属性动画。

导航使用统一容器展开：桌面默认宽度 60px、展开宽度 192px、高度 356px（7×44px 行高 + 6×4px 间距 + 24px 上下内距）。进入整个导航区域或内部链接获得键盘 focus-visible 时展开；同一白色外壳包住图标与标签，离开区域后收回。鼠标点击的残留焦点不让导航保持展开。触屏首次点击展开，第二次选择栏目，点外部或 Esc 收回。

参考稿已重新核对：默认约 72×392px，Hover 后约 181×352px；181px 指展开宽度。参考坐标约 x40/y184 是参考画布读数，不是跨视口 CSS 定位。本轮默认 / 展开宽度采用 60→192px，高度按行组与内距计算为 356px。

≤640px 的轨道收敛为 48→176px，保持 44px 点击高度与 22px SVG。收起时位于原页面预留的左侧空间内；展开是临时导航面板，选择栏目或点外部收回，不重新挤动其他模块。

prefers-reduced-motion 时停用非必要扫光、光标闪烁、贴纸位移与动画过渡，并提供静态人物图。该偏好由 [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion) 说明。持续自动运动另按 [WCAG Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html) 检查；不能把定义了 reduced-motion 分支等同于完成所有动态内容验收。

## 9. Hero Material / Video Contract

### 素材复用

本轮复用 Figma 来源的真实 Logo、复古电脑外壳与金属 W 勋章。徽章保留图像材质，补充轻边缘与 3–4px 切角。电脑外壳与屏幕区域保持对齐；所有人物图与视频运动都限制在实际显示区域内。

电脑开孔百分比与贴纸角度不是基础 Token，必须按素材实测。导航按本轮明确要求重新绘制为独立、实心、圆润的 SVG：房屋、人物、记事本、公文包、四格、爱心和信封，不再裁切截图。品牌图片继续复用自己的素材，通用信息文字接入新灰阶。

### 视频与 Poster

按本轮已确认的素材处理记录：使用原视频约 2.85–5.75 秒的挥手段，裁成约 2.87 秒、无声、1280×720 的短片，文件约 185KB。Poster 来自原视频约第 4 秒的画面。源时间点用于追溯素材选择，不是浏览器每次播放时执行的实时截段。

原素材为 16:9，显示屏较接近 4:3：使用 object-fit:cover 保持人物比例，object-position:35% 50% 稍向左保留挥手掌，不拉伸；视频与 Poster 使用同一裁切。screen-content 的位置和圆角按静态外壳开孔测量，overflow:hidden 阻止任何人物画面越出屏幕。

| 状态 | 可见内容 | 行为 |
| --- | --- | --- |
| Idle | Welcome / 静态屏幕 | 不在页面载入时循环播放 |
| Entering | Welcome 渐隐，等待视频首帧 | Hover 或等价键盘 / 触屏触发，短暂柔和过渡 |
| Active | 屏幕内真实挥手短片 | muted、playsinline；只播放一次，结束保持自然微笑末帧 |
| Leaving | 人物与 Bubble 淡出，Welcome 淡入 | 离开或关闭交互后恢复默认屏幕，隐藏后再复位时间 |
| Reduced motion / failure | 静态 Poster | 视频不可用或用户偏好减弱动画时仍有完整视觉 |

video 使用 poster 作为加载前画面，muted 与 playsinline 保持无声的页面内播放；浏览器接口依据 [MDN video](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video)。不设置 loop。播放请求被拒绝或媒体加载失败时保留静态替代，不让空白视频遮住屏幕。

播放状态采用单一可取消计时器、请求版本号与单个待完成 play Promise。快速移出中断播放；淡出途中再进入则从暂停帧继续，不突然倒回首帧。完整回到 Idle 后下一次交互重新播放。媒体停止或失败不会积压多个播放请求。独立 DOM Bubble 使用 pointermove 与 requestAnimationFrame 按约 180ms 时间常数插值，目标坐标限制在 screen-content 内；减弱动画时保持固定气泡和静态人物帧。

Hover 的关键内容需要键盘或触屏等价入口；屏幕控制保持可聚焦、有明确名称的控件。视频细节与扫光可以是装饰，身份、经历入口和导航必须独立于视频可读、可操作。

## 10. 本轮审计 / 迁移记录

### 迁移前发现

- Hero H1 在 home.css、portfolio.css、home-refresh.css、hero-intro.css 多次定义，最终由最后一层显示 30/28/27px、500、1.4。
- 历史 H2 有 28–40px，生活 H3 展示字最高 50px，标准项目标题却依赖继承的 1.8 行高；这些数值表明需要角色规范，但本轮不同时改造所有模块。
- 共享正文为 12/14/16px，多组临近间距、圆角和阴影已由旧 --ds-* 承接。直接修改旧变量会波及多个区域。
- 导航原实现让单个 tab 独立伸出；重新观察参考后，本轮使用整体容器展开。
- Hero 原身份与说明使用零散灰阶，物件的 transition 时长和 easing 各自定义，视频交互需要明确的一次播放与末帧保持合同。

### 本轮执行范围

1. 建立完整 --wzz-* v1.0 字体、灰阶、间距、布局、圆角、阴影、分隔线与动效 Token；保留原 --ds-* 文本作为完整前缀，保持旧区域语义。
2. 只在 Hero 与导航接入新角色，调整姓名、身份与说明、行组分隔、贴纸材质及 Hover 反馈。
3. 导航整体按 60→192px 展开，高度 356px；图标与标签共享同一容器，保留当前项与键盘焦点。
4. 使用已裁剪的短片与第 4 秒 Poster；Hover 播放一次、结束保持末帧，离开后恢复 Idle。
5. 保留 About、能力、经历、作品、生活、联系、二级项目内容与业务结构。本轮不更改全局画布和其他 section，也不发布。

本记录说明授权与实现边界；浏览器验收结果由本轮实际测试记录确认，不用规范文件替代测试证据。未来迁移 H2、卡片或全站背景时，先按模块形成可审查结果，再接入对应 Token。

## 11. 验收与后续维护

本轮验收以 Hero / 导航为范围：桌面与手机无新增水平溢出；姓名与实质信息文字使用正确角色和颜色；导航整个容器展开、标签可读、键盘焦点可见；短片播放一次并保持末帧、触屏入口可用、失败与 reduced-motion 有静态替代；电脑屏幕不漏出人物图；末帧保持与再次触发没有闪跳。

同时确认原 --ds-* 前缀保持不变，其他区域的规则与交互不因新增 --wzz-* 受到影响；build 应包含新 Token、视频与 Poster，公开包不夹带调试标注。未发布状态保持到本轮完成后由用户决定下一步。

新增组件先复用现有角色。确有新文字或材质用途时，先在本文定义，再新增 Token；不要为容纳一个偶然数值拆出多套相同用途的“正文”或“普通卡片”。后续迁移完成后再按模块清理旧 --ds-* 与失效覆盖，避免同时改变规范和所有业务区域。

## 12. Hero Compact Revision / Personal Information

本次只精修 Hero 的内部布局、字体和分隔线，复用现有内容、素材与互动。以本节替代此前 Hero 单独使用 1040px 外层的实现描述。全站容器、其他模块、导航和电脑交互保持现状。

### Outer Container 与 Inner Layout

Hero 外层继续使用同一个 .wrap。按照 2026-10-01 的最新 UI 标注，hero-inner 使用 margin-inline:auto，在外层中居中；该要求替代上一轮内部组合靠左的规则。文字、电脑仍组成紧凑两列，不使用 space-between 或宽松的 1fr / 1fr。外层宽度、安全边距及其他 Section 不变。

| Hero 内部角色 | Token | 尺寸 / 行为 |
| --- | --- | --- |
| 文字列 | --wzz-hero-copy-width / --wzz-hero-copy-min | 448px 上限，双栏最小 432px，容纳统一字号和 Hello |
| 列间距 | --wzz-hero-column-gap | 64px，复用 8pt 间距档位 |
| 电脑素材画布 | --wzz-hero-computer-width / --wzz-hero-computer-min | 392px 上限，双栏最小 352px |
| 上方留白 | --wzz-hero-padding-top | 64px；≤767px 为 48px，复用既有间距档位 |
| 下方留白 | --wzz-hero-padding-y | 保持 24px |

电脑 PNG 的可见主体约占画布宽度的 82.6%。352–392px 的素材画布对应约 291–324px 的实际硬件主体；不能把整张含空白边缘的图片缩成 320px，导致可见电脑反而变小。电脑外壳、屏幕遮罩、人物视频继续使用同一几何比例，裁切与交互不变。

≤1088px 将两列改为上下排列，内部组最多 448px 并继续居中，电脑在文字下方居中。不通过 transform:scale 缩小页面。手机能力行与 Hello 必要时允许自然换行，姓名和灰色信息始终使用相同字号。

### Hero Typography 与 Vertical Rhythm

| 角色 | Token | 字号 / 字重 / 行高 |
| --- | --- | --- |
| 姓名 | --wzz-font-hero-info / --wzz-weight-semibold | 22px / 600 / 1.45；手机 18px |
| 能力与 Prev. 信息 | --wzz-font-hero-info / --wzz-weight-hero-info / --wzz-line-hero-info | 22px / 500 / 1.45；手机 18px |
| 代码说明 | --wzz-font-hero-note / --wzz-weight-hero-info / --wzz-line-hero-note | 与 Hero info 同字号 / 500 / 1.45 |
| 核心信息灰阶 | --wzz-text-hero-info | Secondary 88% 与背景 12% 的浅灰，姓名保留 Primary；手机使用 Secondary |
| 普通信息行 | --wzz-hero-row-height / --wzz-hero-row-padding | 最小 48px / 上下各 4px |
| 姓名行 | --wzz-hero-name-row-height | 48px，文字底对齐，下内距 4px |

普通信息属于 Personal Information，不继承通用 Body 或 Caption。姓名保持深色，能力、Prev. 和代码说明用更浅的统一灰阶，建立清晰主次；手机保留更高的文字对比度。所有信息行围绕同一行高、Badge 与 Divider 排列，窄屏换行时允许自然增高。按最新标注，首线对比更明显，其余更淡：Secondary 与背景的混合权重依次为 55%、22%、18%、16%、14%，分别使用 strong、color、soft、note、last 五个 Hero Divider Token。--wzz-divider-hero-fade-start 仍为 80%，每条线前 80% 保持稳定，末端渐隐。厚度保持首条 2px、后续 1.5px；全站通用 Divider 仍为 1px。

W 勋章画布保持 88px，按参考图的相对构图独立定位，不再撑高姓名行。桌面勋章中心距姓名起点约 214px，定位参考姓名三字宽度与 104px 呼吸间距；手机间距收回 48px，≤350px 为 32px。底部以首条横线为锚点，通过 --wzz-hero-seal-baseline-inset 与既有 8px 位移做光学校准，让底缘轻压线条。默认倾斜 -30°，Hover 放大时仍保留 -20° 倾角和相同位移，避免跳位。姓名底对齐后，文字行框距横线约 2–4px，修复勋章把姓名与横线间距撑大的问题。Hello 继续为 104×40px、文字 18px，距能力文字 24px；手机宽度 80px、文字 16px、间距 12px。原素材、灰阶、阴影及动效节奏保持不变。

新增与调整的 Token 只在 .refreshed-home .hero-intro 内定义；全局 --ds-* 与 --wzz-* 值保持不变，其他模块不能意外继承这些 Hero 专用角色。
