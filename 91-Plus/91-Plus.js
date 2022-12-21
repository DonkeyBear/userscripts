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

// 檢查頁面是否為吉他譜內頁
if (!document.title.includes("[吉他譜]")) { return }

// 新增監聽器
document.querySelector(".toneset").addEventListener("DOMNodeInserted", function getPlayTone(event) {
  if (document.querySelector(".plays")) {
    if (event.target.classList.contains("select")) {
      if (event.target.innerText.includes("Capo")) {
        span_capo.innerText = event.target.innerText;
        document.querySelector(".toneset").removeEventListener("DOMNodeInserted", getPlayTone);
      }
    }
  }
});

// 在頁面插入新功能列
let new_tfunc2 = document.createElement("div");
new_tfunc2.className = "tfunc2 new_tfunc2"
document.querySelector(".putone").insertBefore(new_tfunc2, document.querySelector(".tfunc"));

// 減號按鈕
let div_minus = document.createElement("div");
let span_minus = document.createElement("span");
div_minus.className = "r";
div_minus.style.width = "3em";
div_minus.style.textAlign = "center";
span_minus.innerText = "－";
span_minus.className = "cset";
span_minus.onclick = () => {
  span_capo.innerText = span_capo.innerText.replace(/-?\d+/, match => {
    return Number(match) - 1;
  });
  span_capo.innerText = span_capo.innerText.replace(/\(.+\)/, match => {
    return `(${transpose(match.slice(1, -1), 1)})`;
  });
  for (let i of document.querySelectorAll("#tone_z .tf")) {
    i.innerHTML = transpose(i.innerText, 1).replace(/(#|b)/g, "<sup>$&</sup>");
  }
}
div_minus.appendChild(span_minus);
document.querySelector(".new_tfunc2").appendChild(div_minus);

// 當前調號
let div_capo = document.createElement("div");
let span_capo = document.createElement("span");
div_capo.className = "r";
div_capo.style.minWidth = "10em";
div_capo.style.textAlign = "center";
span_capo.className = "cset";
div_capo.appendChild(span_capo);
document.querySelector(".new_tfunc2").appendChild(div_capo);

// 加號按鈕
let div_plus = document.createElement("div");
let span_plus = document.createElement("span");
div_plus.className = "r";
div_plus.style.width = "3em";
div_plus.style.textAlign = "center";
span_plus.innerText = "＋";
span_plus.className = "cset";
span_plus.onclick = () => {
  span_capo.innerText = span_capo.innerText.replace(/-?\d+/, match => {
    return Number(match) + 1;
  });
  span_capo.innerText = span_capo.innerText.replace(/\(.+\)/, match => {
    return `(${transpose(match.slice(1, -1), -1)})`;
  });
  for (let i of document.querySelectorAll("#tone_z .tf")) {
    i.innerHTML = transpose(i.innerText, -1).replace(/(#|b)/g, "<sup>$&</sup>");
  }
}
div_plus.appendChild(span_plus);
document.querySelector(".new_tfunc2").appendChild(div_plus);

// 在新功能列插入「複製樂譜」按鈕
let newDiv = document.createElement("div");
let newSpan = document.createElement("span");
newDiv.className = "r";
newSpan.innerText = "複製樂譜";
newSpan.className = "cset";
newSpan.onclick = () => {
  navigator.clipboard.writeText(document.getElementById("tone_z").innerText.trim()).then(() => {
    alert("複製樂譜成功！");
  }, (err) => {
    alert("複製樂譜失敗！");
    console.error('複製樂譜失敗：', err);
  })
};
newDiv.appendChild(newSpan);
document.querySelector(".tfunc2").appendChild(newDiv);

// 在新功能列插入「以移調器開啟樂譜」按鈕
let newDiv2 = document.createElement("div");
let newSpan2 = document.createElement("span");
newDiv2.className = "r";
newSpan2.innerText = "以移調器開啟樂譜";
newSpan2.className = "cset";
newSpan2.onclick = () => {
  // 將空白（%C2%A0）的改以 "{數量}" 表示，其中數量之值轉換為 36 進制
  let uri = encodeURI(document.getElementById("tone_z").innerText.replaceAll("#", "[s]").trim());
  let compressedUri = uri.replace(/((%C2%A0)\2*)/g, match => {
    return `{${(match.length / 6).toString(36)}}`;
  });
  window.open(
    `https://donkeybear.github.io/webapp/chordsheet-transposer/?sheet=${compressedUri}`,
    "_blank"
  ).focus();
};
newDiv2.appendChild(newSpan2);
document.querySelector(".tfunc2").appendChild(newDiv2);

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