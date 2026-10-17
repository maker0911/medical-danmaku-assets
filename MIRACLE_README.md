# 奇迹款文字弹幕

这套样式把“矩形 6.png”作为所有用户文字弹幕的浅蓝底框。“奇迹素材05.png”固定在每张底框左下角，“奇迹素材05 拷贝.png”固定在右上角。普通用户、房管、舰长、提督、总督使用同一款式。礼物、醒目留言和上舰通知仍沿用现有样式。

## 使用文件

- `miracle-danmaku.css`：新款完整文字弹幕 CSS，可粘贴到 BLiveChat、小fa朵的自定义 CSS 区域。
- `index.html`：彗星号要求的模板入口文件名。此文件包含新文字弹幕样式及现有上舰、礼物、醒目留言通知，直接上传为插件页面。`miracle-huixinghao.html` 保留为同内容的旧链接兼容文件。
- `miracle-blivechat.html`：使用 BLiveChat 自定义 HTML 模板时可替换成此版本；它沿用原来的消息读取逻辑。
- `miracle-preview.html`：本地静态预览，包含短消息、长昵称、多行正文和表情。

原图的白色留白已转换为透明，裁出的九块底框素材位于 `assets/miracle/`。顶部与底部圆角各保持 38px，左右圆角宽 40px；中段随着文字行数增高。CSS 使用公开仓库固定提交的图片链接。预览页使用同一套 CSS 的本地素材版本，方便离线检查。

新款当前是静态样式。两个装饰使用 `#content::before` 和 `#content::after`，跟随消息底框角落移动，`pointer-events: none`，不占正文空间。正文和表情正常换行。所有用户文字弹幕共用 `assets/miracle/avatar_frame.png` 方形头像框；真实头像显示在框内。礼物、醒目留言的独立圆形头像布局以及上舰通知保持原样。

弹幕列表和聊天页的滚动条外观已隐藏，滚动功能保留，避免小fa朵与 BLiveChat 测试画布右侧出现白色轨道。

## 调整位置

在 `miracle-danmaku.css` 的 `#content` 规则里修改这些参数：

- `--miracle-left-size`、`--miracle-left-height`、`--miracle-left-x`、`--miracle-left-y`：左下装饰宽高及水平、竖直偏移。
- `--miracle-right-size`、`--miracle-right-height`、`--miracle-right-x`、`--miracle-right-y`：右上装饰宽高及水平、竖直偏移。
- `--miracle-left-tilt`、`--miracle-right-tilt`：两组装饰的旋转角度，当前分别为 `-2deg` 和 `16deg`。
- `--miracle-avatar-frame-size`、`--miracle-avatar-frame-x`、`--miracle-avatar-frame-y`：方形头像框的尺寸和位置；`--miracle-avatar-size`、`--miracle-avatar-x`、`--miracle-avatar-y`：框内头像的尺寸和位置。

负的水平或竖直偏移会让装饰伸出底框。窄画布还有 `@media` 和 `@container` 两组同值规则，调整移动端时应同时修改。

执行 `node build-miracle-templates.js` 可以从当前完整模板和新 CSS 重新生成彗星号入口 `index.html`、兼容文件 `miracle-huixinghao.html`、BLiveChat 模板及本地预览 CSS。
