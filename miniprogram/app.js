App({
  globalData: {
    categories: [
      {id:"daily",name:"日常",emoji:"☕",color:"#FFB3BA"},
      {id:"food",name:"美食",emoji:"🍜",color:"#FFDFBA"},
      {id:"travel",name:"出行",emoji:"🚌",color:"#BAFFC9"},
      {id:"work",name:"工作",emoji:"💼",color:"#BAE1FF"},
      {id:"mood",name:"心情",emoji:"💖",color:"#E8BAFF"},
      {id:"hobby",name:"爱好",emoji:"🎨",color:"#FFD4BA"},
      {id:"other",name:"其他",emoji:"📌",color:"#D4D4D4"}
    ],
    cloudReady: false
  },
  onLaunch() {
    try { if (wx.cloud) { wx.cloud.init({traceUser:true}); this.globalData.cloudReady = true; } } catch(e) {}
    if (!wx.getStorageSync("decorationConfig")) {
      wx.setStorageSync("decorationConfig", {floatingEnabled:true,floatingDensity:"medium",cardStyle:"journal",activeDecorations:[]});
    }
  }
});
