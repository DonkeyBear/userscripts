// ==UserScript==
// @name         MissAV 防止自動暫停
// @namespace    https://github.com/DonkeyBear
// @version      0.1
// @description  防止 MissAV 在切換視窗視窗、標籤時自動暫停
// @author       DonkeyBear
// @match        https://missav.com/*
// @icon         https://missav.com/img/favicon.ico
// @grant        none
// ==/UserScript==

const videoPlayer = document.querySelector('video.player');
if (!videoPlayer) { return }

let windowIsBlurred = false;
window.onblur = () => { windowIsBlurred = true };
window.onfocus = () => { windowIsBlurred = false };

videoPlayer.onpause = () => {
  if (windowIsBlurred) { videoPlayer.play() }
};
