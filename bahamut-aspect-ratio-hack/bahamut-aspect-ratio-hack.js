// ==UserScript==
// @name         動畫瘋長寬比調整
// @namespace    https://github.com/DonkeyBear
// @version      0.2
// @description  增加「將錯誤的 16:9 畫面壓縮回 4:3」的功能，在看烏龍派出所特別篇的時候很有用。
// @author       DonkeyBear
// @match        https://ani.gamer.com.tw/animeVideo.php?sn=*
// @icon         https://i2.bahamut.com.tw/anime/logo.svg
// @grant        none
// ==/UserScript==

(() => {
  const newStyle = document.createElement('style')
  const newCheckbox = document.createElement('input')
  const newText = document.createElement('span')
  const containerLabel = document.createElement('label')
  newCheckbox.type = 'checkbox'
  newCheckbox.style.marginLeft = '12px'
  newCheckbox.style.marginRight = '4px'
  newText.textContent = '將畫面壓縮至 4:3'
  containerLabel.className = 'newanime-count'

  const videoContainer = document.querySelector('.video')
  const videoEl = document.querySelector('#video-container video')

  function maxFourThreeRect(W, H) {
    const h = (3 / 4) * W
    if (h <= H) {
      return { width: W, height: h, unchangedAxis: 'x' }
    } else {
      const w = (4 / 3) * H;
      return { width: w, height: H, unchangedAxis: 'y' }
    }
  }

  function calcAndChangeAspecRatio() {
    const isChecked = newCheckbox.checked
    if (isChecked) {
      const containerWidth = videoContainer.clientWidth
      const containerHeight = videoContainer.clientHeight
      const { width, height, unchangedAxis } = maxFourThreeRect(containerWidth, containerHeight)
      newStyle.textContent = /* css */`
        #video-container video {
          object-fit: fill;
          padding: ${unchangedAxis === 'x' ? `${(containerHeight - height) / 2}px 0` : `0 ${(containerWidth - width) / 2}px`};
        }
      `
    } else {
      newStyle.textContent = ''
    }
  }

  new ResizeObserver(calcAndChangeAspecRatio).observe(videoContainer)
  newCheckbox.onchange = calcAndChangeAspecRatio

  const animeInfoDetail = document.querySelector('.anime_info_detail')
  containerLabel.appendChild(newCheckbox)
  containerLabel.appendChild(newText)
  animeInfoDetail.appendChild(containerLabel)
  document.head.appendChild(newStyle)
})()
