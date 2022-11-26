// ==UserScript==
// @name         91 Plus M
// @namespace    https://github.com/DonkeyBear
// @version      0.9
// @description  打造行動裝置看91譜的最好體驗。
// @author       DonkeyBear
// @match        https://www.91pu.com.tw/m/*
// @match        https://www.91pu.com.tw/song/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

let currentUrl = window.location.href;
if (currentUrl.match(/\/song\//)) {
  let sheetId = currentUrl.match(/\/\d*\./)[0].slice(1, -1);
  let newUrl = `https://www.91pu.com.tw/m/tone.shtml?id=${sheetId}`;
  window.location.replace(newUrl);
}

const observer = new MutationObserver(() => {
  /* 隱藏網頁元素 */
  let elementShouldBlock = {
    // 需要倒數才能關閉的蓋版廣告
    modalAd: document.querySelector("#viptoneWindow.window"),
    // 在頁面最底部的廣告
    bottomAd: document.querySelector("#bottomad"),
    // 最上方提醒升級VIP的廣告
    updateVipBar: document.querySelector(".update_vip_bar"),
    // 譜上的LOGO和浮水印
    overlayLogo: document.querySelector(".wmask"),
    // 彈出式頁尾
    footer: document.querySelector("footer"),
    // 自動滾動頁面捲軸
    autoScroll: document.querySelector(".autoscroll"),
    // 頁首的返回列
    headerBackplace: document.querySelector(".backplace"),
    // 頁首的Key選項
    keys: document.querySelector(".set .keys"),
    // 其餘的Google廣告
    adsByGoogle: document.querySelectorAll(".adsbygoogle")
  }
  for (let selected in elementShouldBlock) {
    // 將上述元素隱藏
    if (elementShouldBlock[selected]) {
      if (elementShouldBlock[selected].length === undefined) {
        // Node
        elementShouldBlock[selected].style.display = "none";
      } else {
        // NodeList
        for (let elem of elementShouldBlock[selected]) {
          elem.style.display = "none";
        }
      }
    }
  }
  if (document.querySelectorAll(".setint .hr")) {
    // 隱藏頁首部分功能鈕
    for (let i = 3; i < 6; i++) {
      document.querySelectorAll(".setint .hr")[i].style.display = "none";
    }
  }

  /* 更換網頁標題 */
  if (document.querySelector("#mtitle")) {
    document.title = document.querySelector("#mtitle").innerText;
  }
});
observer.observe(document.body, { childList: true, subtree: true });