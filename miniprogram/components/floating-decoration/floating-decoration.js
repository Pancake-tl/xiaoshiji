Component({
  properties: {
    items: {
      type: Array,
      value: []
    }
  },

  data: {
    visible: false
  },

  lifetimes: {
    attached() {
      setTimeout(() => {
        this.setData({ visible: true });
      }, 300);
    }
  }
});
