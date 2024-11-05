// إضافة أزرار التحكم السريع
const addQuickControls = () => {
  const controls = document.createElement('div');
  controls.className = 'memory-ai-controls';
  controls.innerHTML = `
    <button id="memory-ai-capture" title="التقاط سريع (Ctrl+Shift+S)">
      📸
    </button>
    <button id="memory-ai-search" title="بحث سريع (Ctrl+Shift+F)">
      🔍
    </button>
  `;
  document.body.appendChild(controls);

  // إضافة الأنماط
  const style = document.createElement('style');
  style.textContent = `
    .memory-ai-controls {
      position: fixed;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .memory-ai-controls button {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: #ffffff;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      cursor: pointer;
      transition: transform 0.2s;
      font-size: 20px;
    }
    .memory-ai-controls button:hover {
      transform: scale(1.1);
    }
  `;
  document.head.appendChild(style);
};

// معالجة النقر على الأزرار
document.addEventListener('click', (e) => {
  if (e.target.id === 'memory-ai-capture') {
    chrome.runtime.sendMessage({
      action: 'openSidePanel',
      data: {
        title: document.title,
        url: window.location.href,
        favicon: getFavicon()
      }
    });
  } else if (e.target.id === 'memory-ai-search') {
    chrome.runtime.sendMessage({ action: 'openSidePanel' });
  }
});

// الاستماع لرسائل من background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'saveSelection':
      saveSelection(request.text);
      break;
    case 'saveLink':
      saveLink(request.url, request.text);
      break;
    case 'saveImage':
      saveImage(request.src);
      break;
  }
});

// وظائف مساعدة
const getFavicon = () => {
  const favicon = document.querySelector('link[rel="icon"]') ||
                 document.querySelector('link[rel="shortcut icon"]');
  return favicon ? favicon.href : '/favicon.ico';
};

const saveSelection = (text) => {
  chrome.runtime.sendMessage({
    action: 'openSidePanel',
    data: {
      type: 'selection',
      content: text,
      source: {
        title: document.title,
        url: window.location.href
      }
    }
  });
};

const saveLink = (url, text) => {
  chrome.runtime.sendMessage({
    action: 'openSidePanel',
    data: {
      type: 'link',
      url,
      text,
      source: {
        title: document.title,
        url: window.location.href
      }
    }
  });
};

const saveImage = (src) => {
  chrome.runtime.sendMessage({
    action: 'openSidePanel',
    data: {
      type: 'image',
      src,
      source: {
        title: document.title,
        url: window.location.href
      }
    }
  });
};

// تهيئة الإضافة
addQuickControls(); 