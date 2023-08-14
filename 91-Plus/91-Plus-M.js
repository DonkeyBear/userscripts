// ==UserScript==
// @name         91 Plus M
// @namespace    https://github.com/DonkeyBear
// @version      0.100.5
// @description  打造行動裝置看91譜的最好體驗。
// @author       DonkeyBear
// @match        https://www.91pu.com.tw/m/*
// @match        https://www.91pu.com.tw/song/*
// @icon         https://www.91pu.com.tw/icons/favicon-32x32.png
// @grant        none
// ==/UserScript==

/* 若樂譜頁面為電腦版，切換為行動版 */
const currentUrl = window.location.href;
if (currentUrl.match(/\/song\//)) {
  const sheetId = currentUrl.match(/(?<=\/)\d+(?=\.)/)[0];
  const newUrl = `https://www.91pu.com.tw/m/tone.shtml?id=${sheetId}`;
  window.location.replace(newUrl);
}

/* 引入 Google Analytics */
const googleAnalyticsScript = document.createElement('script');
googleAnalyticsScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-JF4S3HZY31';
googleAnalyticsScript.async = true;
document.head.appendChild(googleAnalyticsScript);
googleAnalyticsScript.onload = () => {
  window.dataLayer = window.dataLayer || [];
  function gtag () { window.dataLayer.push(arguments) }
  gtag('js', new Date());
  gtag('config', 'G-JF4S3HZY31');
};

/* 修改頁面樣式 */
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
    margin-right: 0 !important;
    display: flex !important;
    justify-content: space-between !important;
  }

  .capo-button.decrease {
    padding-right: 20px;
  }

  .capo-button.increase {
    padding-left: 20px;
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
  /* 功能列上多餘的按鈕 */
  .setint .hr:nth-child(4),
  .setint .hr:nth-child(5),
  .setint .hr:nth-child(6),
  /* 其餘的Google廣告 */
  .adsbygoogle {
    display: none !important;
  }
`;
const style = document.createElement('style');
style.innerText = stylesheet;
document.head.appendChild(style);

/* 增加 Chord Class，用於操作和弦字串 */
class Chord {
  static sharps = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  static flats = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

  constructor (chordString) {
    this.chordString = chordString;
    return this;
  }

  transpose (delta = 0) {
    this.chordString = this.chordString.replaceAll(/[A-G][#b]?/g, (note) => {
      const isSharp = Chord.sharps.includes(note);
      const scale = isSharp ? Chord.sharps : Chord.flats;
      const noteIndex = scale.indexOf(note);
      const transposedIndex = (noteIndex + delta + 12) % 12;
      const transposedNote = scale[transposedIndex];
      return transposedNote;
    });
    return this;
  }

  text () {
    return this.chordString;
  }
}

const observerCheckList = {
  modifyTitle: false,
  // modifyHeaderFunction: false,
  modifyTransposeButton: false,
  archiveChordSheet: false
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
  /* if (!observerCheckList.modifyHeaderFunction) {
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
      newFunctionDiv.innerHTML = html`<button class="scf">全選</button>`; // eslint-disable-line quotes
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
  } */

  /* 刪除內建的移調鈕，建立自製的 */
  if (!observerCheckList.modifyTransposeButton) {
    const capoSelect = document.querySelector('.capo .select');
    if (capoSelect?.innerText.trim()) {
      observerCheckList.modifyTransposeButton = true;
      const stringCapo = capoSelect.innerText.split(' / ')[0]; // CAPO
      const stringKey = capoSelect.innerText.split(' / ')[1]; // 調

      // 新增功能鈕
      const newFunctionDiv = document.createElement('div');
      newFunctionDiv.classList.add('hr', 'capo-section');
      newFunctionDiv.innerHTML = /* html */`
        <button class="scf capo-button decrease">◀</button>
        <button class="scf capo-button info">
          CAPO：<span class="text-capo">${stringCapo}</span>（<span class="text-key">${stringKey.replaceAll(/(#|b)/g, '<sup>$&</sup>')}</span>）
        </button>
        <button class="scf capo-button increase">▶</button>
      `;
      const spanCapo = newFunctionDiv.querySelector('.text-capo');
      const spanKey = newFunctionDiv.querySelector('.text-key');
      const orginalCapo = Number(spanCapo.innerText);
      function transposeSheet (delta) {
        spanCapo.innerText = (Number(spanCapo.innerText) + delta) % 12;
        const keyName = new Chord(spanKey.innerText);
        spanKey.innerHTML = keyName.transpose(-delta).text().replaceAll(/(#|b)/g, '<sup>$&</sup>');
        for (const chordEl of document.querySelectorAll('#tone_z .tf')) {
          const chord = new Chord(chordEl.innerText);
          chordEl.innerHTML = chord.transpose(-delta).text().replaceAll(/(#|b)/g, '<sup>$&</sup>');
        }
      };
      newFunctionDiv.querySelector('.capo-button.decrease').onclick = () => { transposeSheet(-1) };
      newFunctionDiv.querySelector('.capo-button.increase').onclick = () => { transposeSheet(1) };
      newFunctionDiv.querySelector('.capo-button.info').onclick = () => {
        transposeSheet(orginalCapo - Number(spanCapo.innerText));
      };
      document.querySelector('.setint').appendChild(newFunctionDiv);
    }
  }

  /* 發送請求至 API，雲端備份樂譜 */
  if (!observerCheckList.archiveChordSheet) {
    const sheet = document.getElementById('tone_z');
    if (sheet?.innerText.trim()) {
      observerCheckList.archiveChordSheet = true;
      const urlParams = new URLSearchParams(window.location.search);
      try {
        const underlineEl = sheet.querySelectorAll('u');
        for (const u of underlineEl) { u.innerText = `{_${u.innerText}_}` }
        const selectors = {
          mtitle: document.getElementById('mtitle'),
          tkinfo: document.querySelector('.tkinfo'),
          capoSelect: document.querySelector('.capo .select'),
          tinfo: document.querySelector('.tinfo')
        };
        const formBody = {
          id: Number(urlParams.get('id')),
          title: selectors.mtitle.innerText.trim(),
          key: selectors.tkinfo.innerText.match(/(?<=原調：)\w*/)[0],
          play: selectors.capoSelect.innerText.split(' / ')[1],
          capo: Number(selectors.capoSelect.innerText.split(' / ')[0]),
          singer:
          selectors.tinfo.innerText.match(/(?<=演唱：).*(?=(\n|$))/) ? selectors.tinfo.innerText.match(/(?<=演唱：).*(?=(\n|$))/)[0].trim() : '',
          composer:
          selectors.tinfo.innerText.match(/(?<=曲：).*?(?=(詞：|$))/) ? selectors.tinfo.innerText.match(/(?<=曲：).*?(?=(詞：|$))/)[0].trim() : '',
          lyricist:
          selectors.tinfo.innerText.match(/(?<=詞：).*?(?=(曲：|$))/) ? selectors.tinfo.innerText.match(/(?<=詞：).*?(?=(曲：|$))/)[0].trim() : '',
          bpm:
          selectors.tkinfo?.innerText.match(/\d+/) ? Number(selectors.tkinfo.innerText.match(/\d+/)[0]) : 0,
          sheet_text:
          sheet.innerText
            .replaceAll(/\s+?\n/g, '\n')
            .replaceAll('\n\n', '\n')
            .trim()
            .replaceAll(/\s+/g, (match) => { return `{%${match.length}%}` })
        };
        for (const u of underlineEl) {
          u.innerHTML = u.innerText
            .replaceAll(/{_|_}/g, '')
            .replaceAll(/[a-zA-Z0-9]+/g, '<span class="tf">$&</span>');
        }
        fetch('https://91-plus-plus-api.fly.dev/archive', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formBody)
        })
          .then(response => { console.log(response) })
          .catch(error => { console.error(error) });
      } catch {
        fetch(`https://91-plus-plus-api.fly.dev/report?id=${urlParams.get('id')}`);
      }
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });
