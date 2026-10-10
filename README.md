# 医疗风弹幕：BLiveChat、小fa朵、彗星号

## 上舰装饰

`bilibili.css` 现包含独立的“欢迎上舰”装饰，只匹配 `yt-live-chat-membership-item-renderer` 上舰通知，不改文字弹幕、礼物或 SC。13 张 `welcome_layers_13.zip` 素材已解压到 `assets/welcome_layers_13/`；它们都是 2048×682 的同坐标透明画布，按原位叠合并等比缩放。背景和小装饰先出现，标题随后轻弹入场，左侧输液袋、右侧听诊器从两边渐显，右下创可贴最后落位。用户名和原有上舰说明保留在图案下方，舰长、提督、总督购买通知共用此款。

打开 `welcome-ship-preview.html` 可看宽版、窄弹幕栏效果并重播动画。`welcome-ship.css` 是这部分的独立 CSS，已同步附加到完整的 `bilibili.css`；粘贴完整 CSS 时不用再次粘贴独立文件。图片使用公开仓库的绝对 URL，预览页则改用本地图片路径。上舰通知的 BLiveChat 标签和内部 `#card`、`#header` 来自其官方 CSS 参考；小fa朵与彗星号若复用同结构便会匹配，实际预览仍需在各平台检查。

三处共用完整样式 `bilibili.css`。其中原有的文字卡片规则只应用于用户发送的文字弹幕。彗星号的旧版 BLiveChat 结构在 `#content` 外有 `#card`，等级属性是 `privilegetype`；新版本使用 `blc-guard-level`。文字卡片 CSS 同时兼容两种属性，无需额外脚本。

彗星号预览曾漏绘 `border-image` 的部分图片区域。现在消息底框裁成九块 PNG 拼接，昵称框裁成左、中、右三块 PNG 拼接；中段随文字伸缩，端部和边框厚度固定。两者都使用 CSS 背景，不再依赖 `border-image`。底框和昵称的入场揭示使用 `clip-path`；原来的 600ms / 1500ms 时长和移动方向保留。窄窗口除了容器查询还有视口宽度回退规则，供较旧网页内核使用。

## 提督和总督装饰

文字弹幕使用实际等级属性 `blc-guard-level` 或 `privilegetype`：`0` 为普通用户、`3` 为舰长、`2` 为提督、`1` 为总督。只有提督和总督显示听诊器＋纱布和心电线；普通用户与舰长不显示这两张图。房管和主播也只有在同时具有 1/2 级属性时才显示。等级不从昵称推断。

原素材保留 2048×682 画布；实际使用的 PNG 已按图案范围裁成 360×247 的听诊器＋纱布和 352×54 的心电线。听诊器显示为 79×54px，心电线放大到 116×18px；两者用正文包装层的伪元素定位在消息底框右上、右下，不参与文字排版。调节 `bilibili.css` 中的 `--medical-scope-width`、`--medical-scope-height`、`--medical-scope-right`、`--medical-scope-top`、`--medical-ecg-width`、`--medical-ecg-height`、`--medical-ecg-right`、`--medical-ecg-bottom` 即可微调。窄窗口另有 `--medical-scope-right` 覆盖值。

## 仅总督显示的小花和徽章

`governor_flower.png` 和 `governor_badge.png` 保留原始 2048×682 透明画布，放在 `assets/medical_ui_assets/slices/governor/`。小花通过右上听诊器伪元素的第二层背景局部取图，贴在听诊器外侧并跟随它入场；花在上次位置基础上再单独下移 14px，听诊器位置不变。徽章通过底框前景的第二层背景固定在下沿正中，不依赖昵称长度；它与同层的右下创可贴在总督款只做透明度渐显，不再转动。两者只匹配 `blc-guard-level="1"` 或 `privilegetype="1"`，不会出现在提督、舰长或普通用户消息上，也不需要额外 HTML 或 JS。位置可调参数集中在总督的 `#content` 规则里。`governor_diagram_overlay.png` 保留在素材目录中，但当前 CSS 不加载，奶白正文底板不显示医疗底纹。

只需在三个平台的自定义 CSS 输入框粘贴完整 `bilibili.css`。旧版 `bilibili-guard-decorations.js` 不再需要；如果已有页面仍加载它，CSS 会隐藏它插入的旧装饰节点，避免重复。

本地 `bilibili-universal-preview.html` 左列的提督、总督消息模拟 BLiveChat 实际的 `#content > #message` 结构，右列总督示例保留小fa朵使用的包装层；`huixinghao-compat-preview.html` 模拟带 `#card`、`privilegetype` 的旧结构。两者都是不执行装饰脚本的静态预览，不接收直播弹幕。BLiveChat 自定义 HTML 模板还需要按官方模板接口接收并渲染消息。裁好的等级素材位于 `assets/medical_ui_assets/slices/guard2/`，底框九块 PNG 位于 `assets/medical_ui_assets/slices/card9/`，昵称三块 PNG 位于 `assets/medical_ui_assets/slices/name3/`；CSS 中使用公开仓库的 PNG 地址。

普通用户不显示输液袋和软管；舰长、提督、总督和房管保留。主播也保留现有装饰。消息底框、昵称框、创可贴和文字布局对所有用户相同。

底框挂在文字弹幕的 `#content` 上；不论外面有没有 `#card`、里面有没有 `#image-and-message` 包装层，都能显示底框和软管。

打开本地 bilibili-universal-preview.html，点击右下角“重播入场动画”可反复观看效果。预览不连接直播间；实时弹幕由 BLiveChat 提供。入场动画仅在新消息出现时播放一次，已经显示的旧消息不会重播。首次加载远程图片可能慢于入场动画，建议在图片出现后看下一条新消息。

## 动画

- 整条消息：900ms 内从下方弹起，轻微放大回弹，只播放一次。
- 消息底图：直接挂在文字弹幕的 `#content` 上，保持预先算好的尺寸，在 600ms 内从下向上裁切渐显。
- 昵称框和昵称：一起从左向右渐显，1500ms，稍晚开始。
- 正文：底图显露后从左向右出现，正常换行。提督、总督的直连 `#message` 用无裁切渐显，避免框外贴图被正文动画裁掉。
- 输液袋：绕顶部吊孔额外摆动 ±7°，3 秒往复循环。
- 软管：独立图层，底端固定，中段位移约 ±6px，较输液袋滞后约 0.2 秒。
- 创可贴：最后从上方落下，旋转贴合，640ms，只播放一次。
- 心电线：提督和总督消息入场后稍晚开始，从左向右渐显，1100ms，只播放一次。
- 听诊器＋纱布：仅提督和总督消息整张图片从右上方 20px 沿对角线移动到原位，整体透明度从 0 渐变到 1，1050ms，只播放一次；不裁切图案。
- 表情图片预留固定尺寸，动图继续播放。

底图和昵称框在新消息入场前按内容确定尺寸。BLiveChat 的纯 CSS 方案无法可靠地给同一条消息后续的自动宽高变化添加 180/160ms 过渡；若需要精确控制内容更新时的尺寸动画，需要改为支持 JavaScript 的自定义 HTML 模板。
