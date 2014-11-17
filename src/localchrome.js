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
        console.log('!!data', chrome.chdata, cb);
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
        console.log('!!changedCB', chrome.changedCB);
        if (chrome.changedCB) {
          chrome.changedCB(data);
        }
      }
    }
  }
};
