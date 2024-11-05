// إدارة الشريط الجانبي
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-sidepanel') {
    chrome.sidePanel.toggle();
  }
});

// إنشاء قائمة السياق
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'save-selection',
    title: 'حفظ النص المحدد',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'save-link',
    title: 'حفظ الرابط',
    contexts: ['link']
  });

  chrome.contextMenus.create({
    id: 'save-image',
    title: 'حفظ الصورة',
    contexts: ['image']
  });
});

// معالجة النقر على قائمة السياق
chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case 'save-selection':
      chrome.tabs.sendMessage(tab.id, {
        action: 'saveSelection',
        text: info.selectionText
      });
      break;
    case 'save-link':
      chrome.tabs.sendMessage(tab.id, {
        action: 'saveLink',
        url: info.linkUrl,
        text: info.linkText
      });
      break;
    case 'save-image':
      chrome.tabs.sendMessage(tab.id, {
        action: 'saveImage',
        src: info.srcUrl
      });
      break;
  }
});

// الاستماع لرسائل من contentScript
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openSidePanel') {
    chrome.sidePanel.open();
  }
}); 