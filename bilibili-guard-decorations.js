/* 在支持自定义 HTML/JS 的 BLiveChat 页面中加载；只为 1/2/3 级文字弹幕添加两个静态节点。 */
(() => {
  'use strict';

  const MESSAGE = 'yt-live-chat-text-message-renderer';
  const GUARD_LEVELS = new Set(['1', '2', '3']);
  const DECORATIONS = [
    'medical-guard-stethoscope',
    'medical-guard-ecg',
  ];

  function findDecoration(content, className) {
    return Array.from(content.children).find(child => child.classList.contains(className));
  }

  function syncMessage(host) {
    const content = host.querySelector('#content');
    if (!content) return;

    const isGuard = GUARD_LEVELS.has(host.getAttribute('blc-guard-level'));
    for (const className of DECORATIONS) {
      const existing = findDecoration(content, className);
      if (!isGuard) {
        existing?.remove();
      } else if (!existing) {
        const decoration = document.createElement('span');
        decoration.className = `medical-guard-decoration ${className}`;
        decoration.setAttribute('aria-hidden', 'true');
        content.append(decoration);
      }
    }
  }

  function start() {
    document.querySelectorAll(MESSAGE).forEach(syncMessage);

    const observer = new MutationObserver(records => {
      const messages = new Set();
      for (const record of records) {
        const parentMessage = record.target.closest?.(MESSAGE);
        if (parentMessage) messages.add(parentMessage);

        if (record.type === 'attributes') {
          if (record.target.matches(MESSAGE)) messages.add(record.target);
          continue;
        }
        for (const node of record.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          if (node.matches(MESSAGE)) messages.add(node);
          node.querySelectorAll(MESSAGE).forEach(message => messages.add(message));
        }
      }
      messages.forEach(syncMessage);
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['blc-guard-level'],
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
