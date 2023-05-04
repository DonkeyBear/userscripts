// ==UserScript==
// @name         91 Plus
// @namespace    https://github.com/DonkeyBear
// @version      0.9
// @description  待定。
// @author       DonkeyBear
// @match        https://www.91pu.com.tw/song/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
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
`;
const style = document.createElement('style');
style.textContent = stylesheet;
document.head.appendChild(style);

// 新增監聽器
const toneset = document.querySelector('.toneset');
const observer = new MutationObserver(() => {
  const selectedCapo = toneset.querySelector('.capo > .select');
  if (!selectedCapo) { return }
  span_capo.innerText = selectedCapo.innerText;
  observer.disconnect();
});
observer.observe(toneset, { childList: true, subtree: true });

// 在頁面插入新功能列
const new_tfunc2 = document.createElement('div');
new_tfunc2.className = 'tfunc2 new_tfunc2';
document.querySelector('.putone').insertBefore(new_tfunc2, document.querySelector('.tfunc'));

// 減號按鈕
const div_minus = document.createElement('div');
div_minus.classList.add('r', 'minus-button');
div_minus.innerHTML = /* html */`<span class="cset">－</span>`; // eslint-disable-line quotes
div_minus.onclick = () => {
  span_capo.innerText = span_capo.innerText.replace(/-?\d+/, match => {
    return Number(match) - 1;
  });
  span_capo.innerText = span_capo.innerText.replace(/\(.+\)/, match => {
    return `(${transpose(match.slice(1, -1), 1)})`;
  });
  for (const i of document.querySelectorAll('#tone_z .tf')) {
    i.innerHTML = transpose(i.innerText, 1).replace(/(#|b)/g, '<sup>$&</sup>');
  }
};
document.querySelector('.new_tfunc2').appendChild(div_minus);

// 當前調號
const div_capo = document.createElement('div');
const span_capo = document.createElement('span');
div_capo.classList.add('r', 'capo-area');
span_capo.className = 'cset';
div_capo.appendChild(span_capo);
document.querySelector('.new_tfunc2').appendChild(div_capo);

// 加號按鈕
const div_plus = document.createElement('div');
div_plus.classList.add('r', 'plus-button');
div_plus.innerHTML = /* html */`<span class="cset">＋</span>`; // eslint-disable-line quotes
div_plus.onclick = () => {
  span_capo.innerText = span_capo.innerText.replace(/-?\d+/, match => {
    return Number(match) + 1;
  });
  span_capo.innerText = span_capo.innerText.replace(/\(.+\)/, match => {
    return `(${transpose(match.slice(1, -1), -1)})`;
  });
  for (const i of document.querySelectorAll('#tone_z .tf')) {
    i.innerHTML = transpose(i.innerText, -1).replace(/(#|b)/g, '<sup>$&</sup>');
  }
};
document.querySelector('.new_tfunc2').appendChild(div_plus);

// 在新功能列插入「複製樂譜」按鈕
const newDiv = document.createElement('div');
newDiv.classList.add('r');
newDiv.innerHTML = /* html */`<span class="cset">複製樂譜</span>`; // eslint-disable-line quotes
newDiv.onclick = () => {
  navigator.clipboard.writeText(document.getElementById('tone_z').innerText.trim()).then(() => {
    alert('複製樂譜成功！');
  }, (err) => {
    alert('複製樂譜失敗！');
    console.error('複製樂譜失敗：', err);
  });
};
document.querySelector('.tfunc2').appendChild(newDiv);

// 在新功能列插入「以移調器開啟樂譜」按鈕
const newDiv2 = document.createElement('div');
newDiv2.classList.add('r');
newDiv2.innerHTML = /* html */`<span class="cset">以移調器開啟樂譜</span>`; // eslint-disable-line quotes
newDiv2.onclick = () => {
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
document.querySelector('.tfunc2').appendChild(newDiv2);

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
