/* 从彗星号单文件模板复用画面与卡片，生成 BLiveChat 自定义 HTML 模板。 */
const fs = require('fs');

const source = fs.readFileSync('huixinghao-all.html', 'utf8');
const head = source.slice(0, source.indexOf('  <script>'))
  .replace('彗星号 · 医疗弹幕、上舰、礼物与醒目留言', 'BLiveChat · 医疗弹幕、上舰、礼物与醒目留言');
const commonStart = source.indexOf('      function text(value');
const commonEnd = source.indexOf("      window.addEventListener('message'", commonStart);
if (commonStart < 0 || commonEnd < 0) throw new Error('Cannot locate shared renderers');
const renderers = source.slice(commonStart, commonEnd);
const runtime = `  <script>
    (() => {
      const items = document.getElementById('items');
      const guardLabels = { 1: '总督', 2: '提督', 3: '舰长' };
      const params = new URLSearchParams(location.search);
      let showingDemo = false;
      const messages = new Map();

${renderers}
      function addMessage(msg) {
        if (!msg || typeof msg !== 'object') return;
        let item = null;
        if (msg.type === 0) {
          const hasImage = Array.isArray(msg.contentParts) &&
            msg.contentParts.some(part => part && part.type === 1);
          item = createTextMessage({
            platform: 'bili', uname: msg.authorName,
            message: msg.content || (hasImage ? '[表情]' : ''),
            guardLevel: msg.privilegeType,
            isAnchor: msg.authorType === 3,
            isModerator: msg.authorType === 2
          });
          if (item && Array.isArray(msg.contentParts) && msg.contentParts.length) {
            const message = item.querySelector('#message');
            message.replaceChildren();
            for (const part of msg.contentParts) {
              if (!part) continue;
              if (part.type === 1) {
                const url = safeImageUrl(part.url);
                if (url) {
                  const image = document.createElement('img');
                  image.className = 'emoji';
                  image.src = url;
                  image.alt = text(part.text, '[表情]');
                  image.referrerPolicy = 'no-referrer';
                  message.append(image);
                } else message.append(document.createTextNode(text(part.text)));
              } else if (part.type === 0) {
                message.append(document.createTextNode(text(part.text)));
              }
            }
          }
        } else if (msg.type === 1) {
          item = createGiftNotification({
            platform: 'bili', uname: msg.authorName, face: msg.avatarUrl,
            giftName: msg.giftName, giftIcon: msg.giftIconUrl, giftNum: msg.num
          });
        } else if (msg.type === 2) {
          item = createGuardNotification({
            platform: 'bili', uname: msg.authorName,
            guardLevel: msg.privilegeType, action: '开通'
          });
        } else if (msg.type === 3) {
          item = createSuperChatNotification({
            platform: 'bili', uname: msg.authorName, face: msg.avatarUrl,
            message: msg.content
          });
        }
        if (item && msg.id != null) item.dataset.messageId = String(msg.id);
        if (item && msg.id != null) messages.set(String(msg.id), { ...msg });
        if (messages.size > 128) messages.delete(messages.keys().next().value);
        if (item && showingDemo) { items.replaceChildren(); showingDemo = false; }
        appendItem(item, msg.type === 1 || msg.type === 2 || msg.type === 3 ? 8000 : 0);
      }

      window.addEventListener('message', event => {
        if (event.source !== window.parent || !event.data) return;
        const { type, data } = event.data;
        if (type === 'blcAddMsg') addMessage(data);
        if (type === 'blcUpdateMsg' && data && data.id != null) {
          const id = String(data.id);
          const previous = messages.get(id);
          if (previous && data.newValuesObj && typeof data.newValuesObj === 'object') {
            Object.assign(previous, data.newValuesObj);
            const item = Array.from(items.children).find(node => node.dataset.messageId === id);
            if (item && previous.type === 1) {
              const count = item.querySelector('.medical-gift-count');
              const giftName = item.querySelector('.medical-gift-gift-name');
              if (count) count.textContent = '×' + Math.max(1, Math.floor(Number(previous.num) || 1));
              if (giftName) giftName.textContent = text(previous.giftName, '礼物').slice(0, 80);
            }
            if (item && previous.type === 3) {
              const message = item.querySelector('.medical-sc-message');
              if (message) message.textContent = text(previous.content).slice(0, 2000);
            }
          }
        }
        if (type === 'blcDelMsgs' && data && Array.isArray(data.ids)) {
          const ids = new Set(data.ids.map(String));
          ids.forEach(id => messages.delete(id));
          items.querySelectorAll('[data-message-id]').forEach(node => {
            if (ids.has(node.dataset.messageId)) node.remove();
          });
        }
      });
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'blcTemplateConnect', data: null }, '*');
      }

      if (params.has('demo')) {
        showingDemo = true;
        addMessage({ type: 0, authorName: '普通观众', content: '今天也要开心呀！', privilegeType: 0 });
        addMessage({ type: 0, authorName: '提督', content: '提督消息示例', privilegeType: 2 });
        addMessage({ type: 2, authorName: '奶酪cheese', privilegeType: 3 });
        addMessage({ type: 1, authorName: '送礼物的小伙伴', giftName: '小花花', num: 1 });
        addMessage({ type: 3, authorName: '醒目留言的小伙伴', content: '今天也要好好休息呀！这是一条会自动换行的醒目留言，文字增多时奶白底板也会跟着变高。' });
      }
    })();
  </script>
</body>
</html>
`;
const result = head.replace('  <meta name="viewport"', '  <meta name="referrer" content="no-referrer">\n  <meta name="viewport"') + runtime;
fs.writeFileSync('blivechat-all.html', result);
