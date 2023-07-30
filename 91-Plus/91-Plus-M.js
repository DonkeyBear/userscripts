// ==UserScript==
// @name         91 Plus M
// @namespace    https://github.com/DonkeyBear
// @version      0.97.8
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
    -webkit-backdrop-filter: blur(5px) saturate(80%);
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

  #mtitle {
    font-family: system-ui;
  }

  .setint {
    border-top: 0;
    padding: 10px;
  }

  .setint > .hr {
    margin-right: 15px;
    padding: 0 15px;
  }

  .capo-section {
    flex-grow: 1;
    margin-right: 0;
    display: flex;
    justify-content: space-between;
  }

  .capo-button.decrease {
    padding: 0 20px 0 10px;
  }

  .capo-button.increase {
    padding: 0 10px 0 20px;
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
  /* 頁首的多餘列 */
  .set .keys,
  .set .plays,
  .set .clear,
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
  /* 更改網頁標題 */
  if (!observerCheckList.modifyTitle) {
    const songTitle = document.querySelector('#mtitle');
    if (songTitle?.innerText.trim()) {
      observerCheckList.modifyTitle = true;
      document.title = `${songTitle.innerText} | 91+ M`;
    }
  }

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
      newFunctionDiv.classList.add('hr', 'select-all');
      newFunctionDiv.innerHTML = /* html */`<button class="scf">全選</button>`; // eslint-disable-line quotes
      newFunctionDiv.onclick = () => {
        if (window.getSelection) {
          const range = document.createRange();
          range.selectNode(document.querySelector('#tone_z'));
          window.getSelection().removeAllRanges();
          window.getSelection().addRange(range);
        }
      };
      document.querySelector('.setint').appendChild(newFunctionDiv);
    }
  }

  /* 刪除內建的移調鈕，建立自製的 */
  if (!observerCheckList.modifyTransposeButton) {
    if (document.querySelector('.capo .select')) {
      observerCheckList.modifyTransposeButton = true;
      const stringCapo = document.querySelector('.capo .select').innerText.split(' / ')[0]; // CAPO
      const stringKey = document.querySelector('.capo .select').innerText.split(' / ')[1]; // 調

      // 新增功能鈕
      const newFunctionDiv = document.createElement('div');
      newFunctionDiv.classList.add('hr', 'capo-section');
      newFunctionDiv.innerHTML = /* html */`
        <button class="scf capo-button decrease">◀</button>
        <button class="scf capo-button info">
          CAPO：<span class="text-capo">${stringCapo}</span>（<span class="text-key">${stringKey}</span>）
        </button>
        <button class="scf capo-button increase">▶</button>
      `;
      function transposeEvent (delta) {
        const spanCapo = newFunctionDiv.querySelector('.text-capo');
        const spanKey = newFunctionDiv.querySelector('.text-key');
        spanCapo.innerText = Number(spanCapo.innerText) + delta;
        spanKey.innerText = transpose(spanKey.innerText, -delta);

        for (const chordEl of document.querySelectorAll('#tone_z .tf')) {
          chordEl.innerHTML = transpose(chordEl.innerText, -delta).replace(/(#|b)/g, '<sup>$&</sup>');
        }
      };
      newFunctionDiv.querySelector('.capo-button.decrease').onclick = () => { transposeEvent(-1) };
      newFunctionDiv.querySelector('.capo-button.increase').onclick = () => { transposeEvent(1) };
      document.querySelector('.setint').appendChild(newFunctionDiv);
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
