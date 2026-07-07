var util = require("../../utils/util.js");
var theme = require("../../utils/theme.js");

Component({
  properties: {
    record: {
      type: Object,
      value: {}
    }
  },

  data: {
    category: null,
    avatarEmoji: "⭐"
  },

  observers: {
    record() {
      var r = this.properties.record;
      if (!r) return;
      var cat = util.getCategory(r.categoryId);
      this.setData({
        category: cat,
        avatarEmoji: cat && cat.emoji ? cat.emoji : "⭐"
      });
    }
  }
});
