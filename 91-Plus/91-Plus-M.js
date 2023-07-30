// ==UserScript==
// @name         91 Plus M
// @namespace    https://github.com/DonkeyBear
// @version      0.97.4
// @description  打造行動裝置看91譜的最好體驗。
// @author       DonkeyBear
// @match        https://www.91pu.com.tw/m/*
// @match        https://www.91pu.com.tw/song/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

const currentUrl = window.location.href;
if (currentUrl.match(/\/song\//)) {
  const sheetId = currentUrl.match(/\/\d*\./)[0].slice(1, -1);
  const newUrl = `https://www.91pu.com.tw/m/tone.shtml?id=${sheetId}`;
  window.location.replace(newUrl);
}

const stylesheet = /* css */`
  html {
    background: #fafafa url(/templets/pu/images/tone-bg.gif); 
  }

  header {
    background-color: rgba(25, 20, 90, 0.5);
    backdrop-filter: blur(5px) saturate(80%);
    display: flex;
    justify-content: center;
    font-family: system-ui;
  }

  header > .set {
    width: 768px;
  }

  .tfunc2 {
    margin: 10px;
  }

  .setint {
    border-top: 1px solid rgba(255, 255, 255, 0.2);
  }

  .setint,
  .plays .capo {
    display: flex;
    justify-content: space-between;
  }

  /* 需要倒數才能關閉的蓋版廣告 */
  #viptoneWindow.window,
  /* 在頁面最底部的廣告 */
  #bottomad,
  /* 最上方提醒升級VIP的廣告 */
  .update_vip_bar,
  /* 譜上的LOGO和浮水印 */
  .wmask,
  /* 彈出式頁尾 */
  footer,
  /* 自動滾動頁面捲軸 */
  .autoscroll,
  /* 頁首的返回列 */
  .backplace,
  /* 頁首的Key選項 */
  .set .keys,
  /* 其餘的Google廣告 */
  .adsbygoogle {
    display: none !important;
  }
`;
const style = document.createElement('style');
style.innerText = stylesheet;
document.head.appendChild(style);

const observerCheckList = {
  modifyTitle: false,
  modifyHeaderFunction: false,
  modifyTransposeButton: false
};

const observer = new MutationObserver(() => {
  /* 修改頁首功能鈕（下排） */
  if (!observerCheckList.modifyHeaderFunction) {
    if (document.querySelectorAll('.setint .hr').length === 6) {
      // 隱藏頁首部分功能鈕
      observerCheckList.modifyHeaderFunction = true;
      for (let i = 3; i < 6; i++) {
        if (document.querySelectorAll('.setint .hr')[i]) {
          document.querySelectorAll('.setint .hr')[i].style.display = 'none';
        }
      }
      // 新增功能鈕
      const newFunctionDiv = document.createElement('div');
      const newFunctionButton = document.createElement('button');
      newFunctionDiv.className = 'hr';
      newFunctionButton.className = 'scf';
      newFunctionButton.innerText = '全選';
      newFunctionButton.onclick = () => { selectText('#tone_z') };
      newFunctionDiv.appendChild(newFunctionButton);
      document.querySelector('.setint').appendChild(newFunctionDiv);
    }
  }

  /* 更改網頁標題 */
  if (!observerCheckList.modifyTitle) {
    const songTitle = document.querySelector('#mtitle');
    if (songTitle?.innerText.trim()) {
      observerCheckList.modifyTitle = true;
      document.title = `${songTitle.innerText} | 91+ M`;
    }
  }

  /* 刪除內建的移調鈕，建立自製的 */
  if (!observerCheckList.modifyTransposeButton) {
    if (document.querySelector('.capo .select')) {
      const stringCapo = document.querySelector('.capo .select').innerText.split(' / ')[0]; // CAPO
      const stringKey = document.querySelector('.capo .select').innerText.split(' / ')[1]; // 調
      for (const i of document.querySelectorAll('.capo span[play]')) {
        i.style.display = 'none';
      }
      // 建立降調鈕
      const spanMinus = document.createElement('span');
      spanMinus.innerText = '◀';
      spanMinus.className = 'select';
      spanMinus.onclick = () => {
        spanCapo.innerText = spanCapo.innerText.replace(/-?\d+/, match => {
          return Number(match) - 1;
        });
        spanCapo.innerText = spanCapo.innerText.replace(/\(.+\)/, match => {
          return `(${transpose(match.slice(1, -1), 1)})`;
        });
        for (const i of document.querySelectorAll('#tone_z .tf')) {
          i.innerHTML = transpose(i.innerText, 1).replace(/(#|b)/g, '<sup>$&</sup>');
        }
      };
      // 當前調
      const spanCapo = document.createElement('span');
      spanCapo.innerText = `Capo: ${stringCapo} (${stringKey})`;
      // 建立降調鈕
      const spanPlus = document.createElement('span');
      spanPlus.innerText = '▶';
      spanPlus.className = 'select';
      spanPlus.onclick = () => {
        spanCapo.innerText = spanCapo.innerText.replace(/-?\d+/, match => {
          return Number(match) + 1;
        });
        spanCapo.innerText = spanCapo.innerText.replace(/\(.+\)/, match => {
          return `(${transpose(match.slice(1, -1), -1)})`;
        });
        for (const i of document.querySelectorAll('#tone_z .tf')) {
          i.innerHTML = transpose(i.innerText, -1).replace(/(#|b)/g, '<sup>$&</sup>');
        }
      };
      // 放入功能列
      for (const i of [spanMinus, spanCapo, spanPlus]) {
        document.querySelector('.plays .capo').appendChild(i);
      }
      observerCheckList.modifyTransposeButton = true;
    }
  }
});
observer.observe(document.body, { childList: true, subtree: true });

function transpose (chord, transposeValue) {
  const keys = {
    C: '[I]',
    'C#': '[I#]',
    D: '[II]',
    'D#': '[II#]',
    E: '[III]',
    F: '[IV]',
    'F#': '[IV#]',
    G: '[V]',
    'G#': '[V#]',
    A: '[VI]',
    'A#': '[VI#]',
    B: '[VII]'
  };

  const pitchNameFix = {
    '#b': '',
    'b#': '',
    'E#': 'F',
    Fb: 'E',
    'B#': 'C',
    Cb: 'B',
    'C##': 'D',
    'D##': 'E',
    'F##': 'G',
    'G##': 'A',
    'A##': 'B'
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

function selectText (containerSelector) {
  if (window.getSelection) {
    const range = document.createRange();
    range.selectNode(document.querySelector(containerSelector));
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
  }
}
