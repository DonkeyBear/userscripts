// ==UserScript==
// @name         91 Plus
// @namespace    https://github.com/DonkeyBear
// @version      0.9
// @description  待定。
// @author       DonkeyBear
// @match        https://www.91pu.com.tw/song/*
// @icon         https://www.91pu.com.tw/favicon.ico
// @grant        none
// ==/UserScript==

/* eslint-disable camelcase, quote-props, object-property-newline */

// 檢查頁面是否為吉他譜內頁
if (!document.title.includes('[吉他譜]')) { return }

// 新增樣式
const stylesheet = /* css */`
  .minus-button, .plus-button {
    width: 3em;
    text-align: center;
  }

  .capo-area {
    width: 10em;
    text-align: center;
  }

  .tfunc > :nth-child(1), /* 功能列的星星 */
  .tfunc > :nth-child(4), /* 功能列的樂譜類型按鈕 */
  .tfunc > :nth-child(5) /* 功能列的其他 VIP 功能按鈕 */ {
    display: none;
  }
`;
const style = document.createElement('style');
style.textContent = stylesheet;
document.head.appendChild(style);

// 記錄初始調性
let initialCapoValue, initialCapoText;

// 新增監聽器
const toneset = document.querySelector('.toneset');
const observer = new MutationObserver(() => {
  const selectedCapo = toneset.querySelector('.capo > .select');
  const spanCapo = document.querySelector('.capo-area > span');
  if (!selectedCapo || !spanCapo) { return }
  initialCapoText = selectedCapo.innerText;
  initialCapoValue = Number(initialCapoText.match(/-?\d+/)[0]);
  spanCapo.innerText = selectedCapo.innerText;
  observer.disconnect();
});
observer.observe(toneset, { childList: true, subtree: true });

// 在頁面插入新功能列
const divNewTfunc2 = document.createElement('div');
divNewTfunc2.classList.add('tfunc2', 'new-tfunc2');
document.querySelector('.putone').insertBefore(divNewTfunc2, document.querySelector('.tfunc'));

// 減號按鈕
const divMinusButton = document.createElement('div');
divMinusButton.classList.add('r', 'minus-button');
divMinusButton.innerHTML = /* html */`<span class="cset">－</span>`; // eslint-disable-line quotes
divMinusButton.onclick = () => {
  divCapo.querySelector('span').innerText = divCapo.innerText.replace(/-?\d+/, match => {
    return Number(match) - 1;
  });
  divCapo.querySelector('span').innerText = divCapo.innerText.replace(/\(.+\)/, match => {
    return `(${transpose(match.slice(1, -1), 1)})`;
  });
  for (const i of document.querySelectorAll('#tone_z .tf')) {
    i.innerHTML = transpose(i.innerText, 1).replace(/(#|b)/g, '<sup>$&</sup>');
  }
};
document.querySelector('.new-tfunc2').appendChild(divMinusButton);

// 當前調號
const divCapo = document.createElement('div');
divCapo.classList.add('r', 'capo-area');
divCapo.innerHTML = /* html */`<span class="cset"></span>`; // eslint-disable-line quotes
divCapo.onclick = () => {
  const currentCapoValue = Number(divCapo.innerText.match(/-?\d+/)[0]);
  const differenceCapoValue = currentCapoValue - initialCapoValue;
  divCapo.querySelector('span').innerText = initialCapoText;
  for (const i of document.querySelectorAll('#tone_z .tf')) {
    i.innerHTML = transpose(i.innerText, differenceCapoValue).replace(/(#|b)/g, '<sup>$&</sup>');
  }
};
document.querySelector('.new-tfunc2').appendChild(divCapo);

// 加號按鈕
const divPlusButton = document.createElement('div');
divPlusButton.classList.add('r', 'plus-button');
divPlusButton.innerHTML = /* html */`<span class="cset">＋</span>`; // eslint-disable-line quotes
divPlusButton.onclick = () => {
  divCapo.querySelector('span').innerText = divCapo.innerText.replace(/-?\d+/, match => {
    return Number(match) + 1;
  });
  divCapo.querySelector('span').innerText = divCapo.innerText.replace(/\(.+\)/, match => {
    return `(${transpose(match.slice(1, -1), -1)})`;
  });
  for (const i of document.querySelectorAll('#tone_z .tf')) {
    i.innerHTML = transpose(i.innerText, -1).replace(/(#|b)/g, '<sup>$&</sup>');
  }
};
document.querySelector('.new-tfunc2').appendChild(divPlusButton);

// 在新功能列插入「複製樂譜」按鈕
const divCopyButton = document.createElement('div');
divCopyButton.classList.add('r');
divCopyButton.innerHTML = /* html */`<span class="cset">複製樂譜</span>`; // eslint-disable-line quotes
divCopyButton.onclick = () => {
  const sheet = document.getElementById('tone_z').innerText.trim().replaceAll(/\s*\n/g, '\n');
  navigator.clipboard.writeText(sheet).then(() => {
    alert('複製樂譜成功！');
  }, (err) => {
    alert('複製樂譜失敗！');
    console.error('複製樂譜失敗：', err);
  });
};
document.querySelector('.tfunc2').appendChild(divCopyButton);

// 在新功能列插入「以移調器開啟樂譜」按鈕
const divOpenButton = document.createElement('div');
divOpenButton.classList.add('r');
divOpenButton.innerHTML = /* html */`<span class="cset">以移調器開啟樂譜</span>`; // eslint-disable-line quotes
divOpenButton.onclick = () => {
  // 將空白（%C2%A0）改以 "{數量}" 表示，其中數量之值轉換為 36 進制
  const uri = encodeURI(document.getElementById('tone_z').innerText.replaceAll('#', '[s]').trim());
  const compressedUri = uri.replace(/((%C2%A0)\2*)/g, match => {
    return `{${(match.length / 6).toString(36)}}`;
  });
  window.open(
    `https://donkeybear.github.io/webapp/chordsheet-transposer/?sheet=${compressedUri}`,
    '_blank'
  ).focus();
};
document.querySelector('.tfunc2').appendChild(divOpenButton);

function transpose (chord, transposeValue) {
  const keys = {
    'C': '[I]', 'C#': '[I#]',
    'D': '[II]', 'D#': '[II#]',
    'E': '[III]',
    'F': '[IV]', 'F#': '[IV#]',
    'G': '[V]', 'G#': '[V#]',
    'A': '[VI]', 'A#': '[VI#]',
    'B': '[VII]'
  };

  const pitchNameFix = {
    '#b': '', 'b#': '',
    'E#': 'F', 'Fb': 'E',
    'B#': 'C', 'Cb': 'B',
    'C##': 'D', 'D##': 'E',
    'F##': 'G', 'G##': 'A',
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
