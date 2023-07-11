// ==UserScript==
// @name         HBO GO Enhance
// @namespace    https://github.com/DonkeyBear
// @version      0.1
// @description
// @author       DonkeyBear
// @match        https://www.hbogoasia.tw*
// @icon         https://www.hbogoasia.tw/static/icons/favicon-32x32.png
// @grant        none
// ==/UserScript==

function addHideCursor () {
  const video = document.querySelector('video');

  video.addEventListener('mousemove', () => {
    const timer = video.getAttribute('timer');

    if (timer) { clearTimeout(timer) }

    const t = setTimeout(() => {
      video.setAttribute('timer', '');
      video.style.cursor = 'none';
    }, 1000);

    video.setAttribute('timer', t);
    video.style.cursor = 'default';
  });
}

function addVolumeBoost (inputElement) {
  // create an audio context and hook up the video element as the source
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const source = audioCtx.createMediaElementSource(document.querySelector('video'));

  // create a gain node
  const gainNode = audioCtx.createGain();
  source.connect(gainNode);

  // connect the gain node to an output destination
  gainNode.connect(audioCtx.destination);
  // ref: https://stackoverflow.com/questions/43794356/html5-volume-increase-past-100

  gainNode.gain.value = inputElement.value;
  inputElement.oninput = () => { gainNode.gain.value = inputElement.value };
}

const checkList = {
  addCursor: false,
  addVolumeBoost: false
};

const observer = new MutationObserver(() => {
  if (!checkList.addCursor) {
    if (document.querySelector('video')) {
      addHideCursor();
      checkList.addCursor = true;
    }
  }

  if (!checkList.addVolumeBoost) {
    if (document.querySelector('video') && document.querySelector('.movie-details')) {
      const newDivText = document.createElement('div');
      const newInput = document.createElement('input');
      newDivText.innerText = '音量增強';
      newDivText.style.marginBottom = '0.75rem';
      newInput.type = 'range';
      newInput.min = '1';
      newInput.max = '20';
      newInput.value = '1';
      newInput.step = '0.1';
      document.querySelector('.movie-details').appendChild(newDivText);
      document.querySelector('.movie-details').appendChild(newInput);
      document.querySelector('video').addEventListener('play', function addVolumeBoostOnPlay () {
        addVolumeBoost(newInput);
        document.querySelector('video').removeEventListener('play', addVolumeBoostOnPlay);
      });
      checkList.addVolumeBoost = true;
    }
  }

  // If everything on check-list are done, disconnect the observer.
  let isAllChecked = true;
  for (const i of Object.values(checkList)) {
    isAllChecked = isAllChecked && i;
  }
  if (isAllChecked) {
    observer.disconnect();
  }
});

if (window.location.toString().match(/hbogoasia\.tw\/.+\/.+/)) {
  observer.observe(document.body, { childList: true, subtree: true });
}

(() => {
  // ref: https://stackoverflow.com/questions/6390341/how-to-detect-if-url-has-changed-after-hash-in-javascript
  const oldPushState = history.pushState;
  history.pushState = function pushState () {
    const ret = oldPushState.apply(this, arguments);
    window.dispatchEvent(new Event('pushstate'));
    window.dispatchEvent(new Event('locationchange'));
    return ret;
  };

  const oldReplaceState = history.replaceState;
  history.replaceState = function replaceState () {
    const ret = oldReplaceState.apply(this, arguments);
    window.dispatchEvent(new Event('replacestate'));
    window.dispatchEvent(new Event('locationchange'));
    return ret;
  };

  window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event('locationchange'));
  });
})();

window.addEventListener('locationchange', () => {
  if (!window.location.toString().match(/hbogoasia\.tw\/.+\/.+/)) { return }
  checkList.addCursor = false;
  checkList.addVolumeBoost = false;
  observer.observe(document.body, { childList: true, subtree: true });
});
