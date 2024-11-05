// تعريف مساحة الأسماء chrome
const chrome = {
    tabs: {
      query: function(queryInfo) {
        return new Promise((resolve) => {
          // تنفيذ المنطق الخاص بالاستعلام عن علامات التبويب هنا
          resolve([]); // إرجاع مصفوفة فارغة كمثال
        });
      }
    },
  
    runtime: {
      sendMessage: function(message) {
        // تنفيذ المنطق الخاص بإرسال الرسالة هنا
      },
      onMessage: {
        addListener: function(callback) {
          // تنفيذ المنطق الخاص بإضافة المستمع هنا
        },
        removeListener: function(callback) {
          // تنفيذ المنطق الخاص بإزالة المستمع هنا
        }
      }
    }
  };
  
  // تعريف واجهة Tab
  class Tab {
    constructor(id, title, url, favIconUrl) {
      this.id = id;
      this.title = title;
      this.url = url;
      this.favIconUrl = favIconUrl;
    }
  }