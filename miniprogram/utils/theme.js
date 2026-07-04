var K = "decorationConfig";
var d = { cardStyle: "journal", floatingEnabled: true, floatingDensity: "medium", activeDecorations: [], customDecorationIds: [] };

function g() {
  try {
    var s = wx.getStorageSync(K);
    if (s) {
      var r = {};
      for (var k in d) r[k] = d[k];
      for (var k in s) r[k] = s[k];
      return r;
    }
    return d;
  } catch(e) { return d; }
}

function s(c) {
  var n = g();
  for (var k in c) n[k] = c[k];
  wx.setStorageSync(K, n);
  return n;
}

function cc(s) {
  var m = { cute: "card-cute", fresh: "card-fresh", journal: "card-journal", heal: "card-heal" };
  return m[s] || "card-journal";
}

function gfd(n, a) {
  var count = { low: 4, medium: 8, high: 14 }[n] || 8;
  var emojiMap = { petal: "🌸", star: "⭐", heart: "❤️", bubble: "💧", flower: "🌼" };
  if (!a || a.length === 0) return [];

  var allEmojis = [];
  var cfg = g();
  var customDecos = cfg.customDecorationIds || [];

  for (var i = 0; i < a.length; i++) {
    var id = a[i];
    if (emojiMap[id]) {
      allEmojis.push({ emoji: emojiMap[id], type: "emoji" });
    } else if (id.indexOf("custom_") === 0) {
      var customId = id.replace("custom_", "");
      for (var j = 0; j < customDecos.length; j++) {
        if (customDecos[j].id === customId || customDecos[j].id === customId) {
          allEmojis.push({ emoji: customDecos[j].fileID, type: "image" });
          break;
        }
      }
      // Also check if the custom material exists directly in the array
      if (allEmojis.length === 0 || allEmojis[allEmojis.length - 1].type !== "image") {
        // Try to find by _id
      }
    }
  }

  if (allEmojis.length === 0) return [];

  var result = [];
  for (var i = 0; i < count; i++) {
    var pick = allEmojis[Math.floor(Math.random() * allEmojis.length)];
    result.push({
      id: "f" + i,
      emoji: pick.emoji,
      type: pick.type,
      left: Math.random() * 90 + 5,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 10,
      size: pick.type === "image" ? 60 : (28 + Math.random() * 32),
      opacity: 0.3 + Math.random() * 0.4
    });
  }
  return result;
}

module.exports = { getConfig: g, saveConfig: s, getCardClass: cc, getFloatingDecorations: gfd };
