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
  /* ═══════════════════════════════════════════════
   *  emojiMap - decoration ID -> emoji 映射
   *  新增 ID 时在对应分类末尾追加一行即可
   *  新增分类：在下方新增一个区块
   * ═══════════════════════════════════════════════ */
  var emojiMap = {
      // ----- 美食类 -----
      food_1: "🍓",
      food_2: "🍑",
      food_3: "🍒",
      food_4: "🫐",
      food_5: "🍋",
      food_6: "🍊",
      food_7: "🍰",
      food_8: "🧁",
      food_9: "🍦",
      food_10: "🍩",
      food_11: "🍪",
      food_12: "🍫",
      food_13: "🍬",
      food_14: "🍭",
      food_15: "🍮",
      food_16: "🍯",
      food_17: "🧋",
      // ----- 表情类 -----
      happy_1: "😊",
      happy_2: "🥰",
      happy_3: "😍",
      happy_4: "🤩",
      happy_5: "😘",
      happy_6: "😗",
      happy_7: "😋",
      happy_8: "😇",
      happy_9: "🤗",
      happy_10: "😺",
      happy_11: "😸",
      happy_12: "😻",
      happy_13: "😽",
      happy_14: "💋",
      // ----- 爱心类 -----
      heart_1: "❤️",
      heart_2: "🧡",
      heart_3: "💛",
      heart_4: "💚",
      heart_5: "💙",
      heart_6: "💜",
      heart_7: "🖤",
      heart_8: "🤍",
      heart_9: "🤎",
      heart_10: "💞",
      heart_11: "💕",
      heart_12: "💖",
      heart_13: "💗",
      heart_14: "💘",
      heart_15: "💝",
      heart_16: "💓",
      heart_17: "❣️",
      // ----- 宇宙类 -----
      space_1: "🌟",
      space_2: "⭐",
      space_3: "🌙",
      space_4: "🌛",
      space_5: "🌚",
      space_6: "🌝",
      space_7: "🌞",
      space_8: "🌈",
      space_9: "💫",
      space_10: "🌠",
      space_11: "🔥",
      space_12: "🌤️",
    };
  if (!a || a.length === 0) return [];

  var allEmojis = [];
  var cfg = g();
  var customDecos = cfg.customDecorationIds || [];

  for (var i = 0; i < a.length; i++) {
    var id = a[i];
    if (!id) continue;
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
