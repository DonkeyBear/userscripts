// ==UserScript==
// @name         MissAV 迷你加強包
// @namespace    https://github.com/DonkeyBear
// @version      0.3.0
// @description  防止 MissAV 自動暫停、禁用彈出廣告，並將 missav.com 重新導向到 missav.ws
// @author       DonkeyBear
// @match        https://missav.com/*
// @match        https://missav.ws/*
// @icon         https://missav.ws/img/favicon.ico
// @grant        none
// ==/UserScript==

window.open = () => { };

// 將 missav.com 重新導向到 missav.ws
const url = window.location.href;
if (/^https:\/\/missav\.com/.test(url)) {
  window.location.href = url.replace('missav.com', 'missav.ws');
}

// 防止自動暫停
const videoPlayer = document.querySelector('video.player');
if (!videoPlayer) { return }

let windowIsBlurred = false;
window.onblur = () => { windowIsBlurred = true };
window.onfocus = () => { windowIsBlurred = false };

videoPlayer.onpause = () => {
  if (windowIsBlurred) { videoPlayer.play() }
};
