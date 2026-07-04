Component({
  properties: {
    tags: {
      type: Array,
      value: []
    },
    selected: {
      type: String,
      value: ''
    }
  },

  methods: {
    onTap(e) {
      this.triggerEvent('select', { id: e.currentTarget.dataset.id });
    }
  }
});
