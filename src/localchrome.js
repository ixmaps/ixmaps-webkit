// chrome extension methods for running outside chrome
window.chrome = {
  chdata : null,
  changedCB: null,
  history : {
    search: function(p, cb) {
      cb([]);
    }
  },
  storage : {
    onChanged : {
      addListener : function(cb) {
        chrome.changedCB = cb;
        if (chrome.chdata) {
          cb(chrome.chdata);
        }
      }
    },
    sync : {
      get : function(fields, cb) {
        if (chrome.chdata) {
          var ret = {};
          fields.forEach(function(f) { ret[f] = chrome.chdata[f]; });
          cb(ret);
        }
      },
      set : function(data) {
        chrome.chdata = data;
        if (chrome.changedCB) {
          chrome.changedCB(data);
        }
      }
    }
  }
};
