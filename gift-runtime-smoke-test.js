const fs = require('fs');
const vm = require('vm');

class Node {
  constructor(tag) {
    this.tagName = tag;
    this.children = [];
    this.dataset = {};
    this.attrs = {};
    this.classList = { add: name => { this.className = `${this.className || ''} ${name}`; } };
    this.isConnected = true;
  }
  append(...children) {
    for (const child of children) {
      this.children.push(child);
      if (child instanceof Node) child.parent = this;
    }
  }
  replaceChildren(...children) { this.children = []; this.append(...children); }
  setAttribute(key, value) { this.attrs[key] = value; }
  get firstElementChild() { return this.children.find(child => child instanceof Node); }
  remove() {
    if (this.parent) this.parent.children = this.parent.children.filter(child => child !== this);
    this.isConnected = false;
  }
  querySelector(selector) {
    const match = node => selector.startsWith('#') ? node.id === selector.slice(1) :
      (node.className || '').split(' ').includes(selector.slice(1));
    const search = node => {
      if (!(node instanceof Node)) return null;
      if (match(node)) return node;
      for (const child of node.children) {
        const found = search(child);
        if (found) return found;
      }
      return null;
    };
    return search(this);
  }
  querySelectorAll(selector) {
    const found = [];
    const walk = node => {
      if (!(node instanceof Node)) return;
      if (selector === '[data-message-id]' && node.dataset.messageId !== undefined) found.push(node);
      node.children.forEach(walk);
    };
    walk(this);
    return found;
  }
}

for (const file of ['huixinghao-all.html', 'blivechat-all.html']) {
  const html = fs.readFileSync(file, 'utf8');
  const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  if (!script) throw Error(`${file}: missing inline script`);
  const items = new Node('main');
  const listeners = {};
  const posts = [];
  const parent = { postMessage: message => posts.push(message) };
  const window = { parent, addEventListener: (event, handler) => { listeners[event] = handler; }, setTimeout: () => 0 };
  const document = {
    getElementById: () => items,
    createElement: tag => new Node(tag),
    createTextNode: value => String(value)
  };
  vm.runInNewContext(script, { window, document, location: { search: '' }, URL, URLSearchParams, Number, String, Array, Set, Math }, { filename: file });

  if (file === 'huixinghao-all.html') {
    const subscription = posts.find(message => message.fun === 'subscribe');
    if (!subscription?.args.includes('LIVE_OPEN_PLATFORM_SEND_GIFT')) throw Error('Huixinghao gift not subscribed');
    if (!subscription?.args.includes('LIVE_OPEN_PLATFORM_SUPER_CHAT')) throw Error('Huixinghao SC not subscribed');
    listeners.message({ source: parent, data: {
      category: 'event', type: 'LIVE_OPEN_PLATFORM_SEND_GIFT',
      args: [{ platform: 'bili', uname: '测试昵称', face: 'https://example.com/face.png', giftName: '小花花', giftIcon: 'https://example.com/icon.png', giftNum: 3 }]
    } });
    listeners.message({ source: parent, data: {
      category: 'event', type: 'LIVE_OPEN_PLATFORM_SUPER_CHAT',
      args: [{ platform: 'bili', uname: '醒目留言昵称', face: 'https://example.com/face.png', message: '第一行\n第二行醒目留言' }]
    } });
  } else {
    if (!posts.some(message => message.type === 'blcTemplateConnect')) throw Error('BLiveChat not connected');
    listeners.message({ source: parent, data: {
      type: 'blcAddMsg', data: { id: 'gift-1', type: 1, authorName: '测试昵称', avatarUrl: 'https://example.com/face.png', giftName: '小花花', giftIconUrl: 'https://example.com/icon.png', num: 3 }
    } });
    listeners.message({ source: parent, data: {
      type: 'blcUpdateMsg', data: { id: 'gift-1', newValuesObj: { num: 5 } }
    } });
    listeners.message({ source: parent, data: {
      type: 'blcAddMsg', data: { id: 'sc-1', type: 3, authorName: '醒目留言昵称', avatarUrl: 'https://example.com/face.png', content: '旧内容' }
    } });
    listeners.message({ source: parent, data: {
      type: 'blcUpdateMsg', data: { id: 'sc-1', newValuesObj: { content: '第一行\n第二行醒目留言' } }
    } });
  }

  const card = items.children[0];
  const icon = card?.querySelector('.medical-gift-icon');
  const count = card?.querySelector('.medical-gift-count');
  const expected = file === 'blivechat-all.html' ? '×5' : '×3';
  if (items.children.length !== 2 || card.tagName !== 'medical-gift-renderer' ||
      icon?.src !== 'https://example.com/icon.png' || count?.textContent !== expected) {
    throw Error(`${file}: gift data mismatch`);
  }
  const sc = items.children[1];
  if (sc.tagName !== 'medical-gift-renderer' ||
      !(sc.className || '').includes('medical-super-chat') ||
      sc.querySelector('.medical-sc-heading')?.textContent !== '赠送的醒目留言' ||
      sc.querySelector('.medical-sc-message')?.textContent !== '第一行\n第二行醒目留言' ||
      sc.querySelector('.medical-gift-name')?.textContent !== '醒目留言昵称') {
    throw Error(`${file}: SC content mismatch`);
  }
  console.log(`${file}: gift, icon and count OK (${expected})`);
  console.log(`${file}: SC heading, nickname and line breaks OK`);
}
