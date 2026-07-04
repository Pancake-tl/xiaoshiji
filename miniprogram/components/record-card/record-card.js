var util = require('../../utils/util.js');
var theme = require('../../utils/theme.js');

Component({
  properties: {
    record: {
      type: Object,
      value: {}
    }
  },

  data: {
    category: null,
    timeLabel: '',
    cardClass: ''
  },

  observers: {
    record() {
      var r = this.properties.record;
      if (!r) return;
      this.setData({
        category: util.getCategory(r.categoryId),
        timeLabel: util.getRelativeTime(r.createTime),
        cardClass: 'card ' + theme.getCardClass(theme.getConfig().cardStyle)
      });
    }
  }
});
