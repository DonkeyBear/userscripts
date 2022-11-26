// ==UserScript==
// @name         91 Plus M
// @namespace    https://github.com/DonkeyBear
// @version      0.96
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

let observerCheckList = {
  modifyTitle: false,
  modifyHeaderBackground: false,
  modifyHeaderFlex: false,
  modifyTransposeButton: false
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
      if (document.querySelectorAll(".setint .hr")[i]) {
        document.querySelectorAll(".setint .hr")[i].style.display = "none";
      }
    }
  }

  /* 更改網頁標題 */
  if (!observerCheckList.modifyTitle) {
    if (document.querySelector("#mtitle")) {
      document.title = `${document.querySelector("#mtitle").innerText} | 91+ M`;
      observerCheckList.modify = true;
    }
  }

  /* 更改頁首背景樣式 */
  if (!observerCheckList.modifyHeaderBackground) {
    if (document.querySelector("header")) {
      document.querySelector("header").style.backdropFilter = "blur(5px) saturate(80%)";
      document.querySelector("header").style['-webkit-backdrop-filter'] = "blur(5px) saturate(80%)";
      document.querySelector("header").style.backgroundColor = "rgba(25, 20, 90, 0.5)";
      observerCheckList.modifyHeaderBackground = true;
    }
  }

  /* 更改頁首內容物排列方式 */
  if (!observerCheckList.modifyHeaderFlex) {
    for (let elem of [
      document.querySelector(".setint"),
      document.querySelector(".plays .capo")
    ]) {
      if (elem) {
        elem.style.display = "flex";
        elem.style.justifyContent = "space-between";
        if (elem.classList.contains("setint")) {
          elem.style.borderTop = "1px solid rgba(255, 255, 255, 0.2)";
        }
        observerCheckList.modifyHeaderFlex = true;
      }
    }
  }

  /* 刪除內建的移調鈕，建立自製的 */
  if (!observerCheckList.modifyTransposeButton) {
    if (document.querySelector(".capo .select")) {
      let stringCapo = document.querySelector(".capo .select").innerText.split(" / ")[0]; // CAPO
      let stringKey = document.querySelector(".capo .select").innerText.split(" / ")[1]; // 調
      for (let i of document.querySelectorAll(".capo span[play]")) {
        i.style.display = "none";
      }
      // 建立降調鈕
      let spanMinus = document.createElement("span");
      spanMinus.innerText = "－";
      spanMinus.className = "select";
      spanMinus.onclick = () => {
        spanCapo.innerText = spanCapo.innerText.replace(/-?\d+/, match => {
          return Number(match) - 1;
        });
        spanCapo.innerText = spanCapo.innerText.replace(/\(.+\)/, match => {
          return `(${transpose(match.slice(1, -1), 1)})`;
        });
        for (let i of document.querySelectorAll("#tone_z .tf")) {
          i.innerHTML = transpose(i.innerText, 1).replace(/(#|b)/g, "<sup>$&</sup>");
        }
      }
      // 當前調
      let spanCapo = document.createElement("span");
      spanCapo.innerText = `Capo: ${stringCapo} (${stringKey})`;
      // 建立降調鈕
      let spanPlus = document.createElement("span");
      spanPlus.innerText = "＋";
      spanPlus.className = "select";
      spanPlus.onclick = () => {
        spanCapo.innerText = spanCapo.innerText.replace(/-?\d+/, match => {
          return Number(match) + 1;
        });
        spanCapo.innerText = spanCapo.innerText.replace(/\(.+\)/, match => {
          return `(${transpose(match.slice(1, -1), -1)})`;
        });
        for (let i of document.querySelectorAll("#tone_z .tf")) {
          i.innerHTML = transpose(i.innerText, -1).replace(/(#|b)/g, "<sup>$&</sup>");
        }
      }
      // 放入功能列
      for (let i of [spanMinus, spanCapo, spanPlus]) {
        document.querySelector(".plays .capo").appendChild(i);
      }
      observerCheckList.modifyTransposeButton = true;
    }
  }
});
observer.observe(document.body, { childList: true, subtree: true });

function transpose(chord, transposeValue) {

  const keys = {
    "C": "[I]", "C#": "[I#]",
    "D": "[II]", "D#": "[II#]",
    "E": "[III]",
    "F": "[IV]", "F#": "[IV#]",
    "G": "[V]", "G#": "[V#]",
    "A": "[VI]", "A#": "[VI#]",
    "B": "[VII]"
  };

  const pitchNameFix = {
    "#b": "", "b#": "",
    "E#": "F", "Fb": "E",
    "B#": "C", "Cb": "B",
    "C##": "D", "D##": "E",
    "F##": "G", "G##": "A",
    "A##": "B"
  };

  let resultChord = chord;

  for (let i = 0; i < 12; i++) {
    // first, transpose to Roman number.
    resultChord = resultChord.replaceAll(
      Object.keys(keys)[i],
      Object.values(keys)[i]
    );
  }

  for (let i = 0; i < 12; i++) {
    // transpose offset
    let fixedTransposeValue = (i + transposeValue) % 12;
    if (fixedTransposeValue < 0) { fixedTransposeValue += 12 }
    // second, transpose to pitch names.
    resultChord = resultChord.replaceAll(
      Object.values(keys)[i],
      Object.keys(keys)[fixedTransposeValue]
    );
  }

  for (let i = 0; i < 11; i++) {
    // fix illegal pitch names.
    resultChord = resultChord.replaceAll(
      Object.keys(pitchNameFix)[i],
      Object.values(pitchNameFix)[i]
    );
  }

  return resultChord;
}