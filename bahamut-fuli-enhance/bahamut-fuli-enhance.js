// ==UserScript==
// @name         巴哈姆特勇者福利社++
// @namespace    https://github.com/DonkeyBear
// @version      0.7.5
// @description  改進巴哈姆特的勇者福利社，動態載入全部商品、加入過濾隱藏功能、標示競標目前出價等。
// @author       DonkeyBear
// @match        https://fuli.gamer.com.tw/shop.php*
// @icon         https://fuli.gamer.com.tw/favicon.ico
// @grant        none
// ==/UserScript==

const stylesheet = /* css */`
  .tabs-btn-box {
    margin-top: 0;
  }
  a.btn-distance.fuli-enhance {
    border-left: 1px solid;
  }
  a.btn-distance.fuli-enhance > [type=checkbox] {
    margin-right: .15rem;
  }
  .d-none, #BH-pagebtn {
    display: none;
  }
  .digital.unaffordable {
    color: #DF4747;
  }
`;
const style = document.createElement('style');
style.textContent = stylesheet;
document.head.appendChild(style);

// 依照 URL Param 判斷是否執行後續程式
const newUrl = new URL(window.location);
if (newUrl.searchParams.get('history') !== '0' && newUrl.searchParams.get('history') != null) { return }
if (newUrl.searchParams.get('page') !== '1' && newUrl.searchParams.get('page') != null) {
  window.location.replace('https://fuli.gamer.com.tw/shop.php');
}

// 持有的巴幣存款
const DEPOSIT = Number(document.querySelector('.brave-assets').innerText.replaceAll(/\D/, ''));

// .items-card .type-tag 的內文
const TYPE_TAG = {
  exchange: '直購',
  bid: '競標',
  lottery: '抽抽樂'
};

function setupButton (labelText, keywordToHide, checkboxId) {
  const newFunctionButton = document.createElement('a');
  newFunctionButton.classList.add('flex-center', 'btn-distance', 'fuli-enhance');
  const newCheckbox = document.createElement('input');
  newCheckbox.id = checkboxId;
  newCheckbox.type = 'checkbox';
  newCheckbox.onchange = (e) => { toggleItemCards(keywordToHide, e.target.checked) };
  const newLabel = document.createElement('label');
  newLabel.setAttribute('for', checkboxId);
  newLabel.innerText = labelText;
  newFunctionButton.appendChild(newCheckbox);
  newFunctionButton.appendChild(newLabel);
  document.querySelector('.tabs-btn-box').appendChild(newFunctionButton);
}

function toggleItemCards (keywaord, hide) {
  const cards = document.querySelectorAll('a.items-card');
  for (const card of cards) {
    if (card.querySelector('.type-tag').innerText.includes(keywaord)) {
      hide ? card.classList.add('d-none') : card.classList.remove('d-none');
    }
  }
}

function getCurrentBid (itemsCardElement) {
  if (itemsCardElement.querySelector('.type-tag').innerText !== TYPE_TAG.bid) { return } // 若非競標品則結束函式
  fetch(itemsCardElement.href, { method: 'GET' })
    .then(res => res.text())
    .then(data => {
      const parser = new DOMParser();
      const virtualDoc = parser.parseFromString(data, 'text/html');

      let currentBid;
      for (const item of virtualDoc.querySelectorAll('.pbox-content')) {
        if (!item.innerText.includes('目前出價')) { continue }
        currentBid = item.querySelector('.pbox-content-r').innerText.match(/[\d|,]+/)[0];
        break;
      }
      const newTextHTML = /* html */`目前出價<p class="digital" style="margin-left:8px">${currentBid}</p>巴幣`;
      itemsCardElement.querySelector('.price').innerHTML = newTextHTML;
      colorPriceTag(itemsCardElement);
    });
}

function colorPriceTag (itemsCardElement) {
  const priceElement = itemsCardElement.querySelector('.digital');
  const price = Number(priceElement.innerText.replaceAll(/\D/, ''));
  if (DEPOSIT < price) { priceElement.classList.add('unaffordable') }
}

/* 放置功能按鈕 */
setupButton('隱藏兌換類', TYPE_TAG.exchange, 'hide-exchange-items');
setupButton('隱藏競標類', TYPE_TAG.bid, 'hide-bid-items');
setupButton('隱藏抽獎類', TYPE_TAG.lottery, 'hide-lottery-items');

/* 放置商品類型計數區塊 */
document.querySelector('#forum-lastBoard').insertAdjacentHTML('afterend', /* html */`
  <div class="m-hidden">
    <h5>現有商品數量</h5>
    <div class="BH-rbox flex-center">
      <span>兌換類：</span>
      <span id="exchange-item-counter" style="color:#11AAC1;margin-right:.75rem">0</span>
      <span>競標類：</span>
      <span id="bid-item-counter" style="color:#11AAC1;margin-right:.75rem">0</span>
      <span>抽獎類：</span>
      <span id="lottery-item-counter" style="color:#11AAC1">0</span>
    </div>
  </div>
`);
const exchangeItemCounter = document.getElementById('exchange-item-counter');
const bidItemCounter = document.getElementById('bid-item-counter');
const lotteryItemCounter = document.getElementById('lottery-item-counter');

for (const card of document.querySelectorAll('a.items-card')) {
  // 依照商品卡種類，增加計數和取得目前出價
  switch (card.querySelector('.type-tag').innerText.trim()) {
    case TYPE_TAG.exchange:
      exchangeItemCounter.innerText++;
      break;
    case TYPE_TAG.bid:
      bidItemCounter.innerText++;
      getCurrentBid(card); // 取得競標類商品的目前出價並標示於商品卡
      break;
    case TYPE_TAG.lottery:
      lotteryItemCounter.innerText++;
      break;
  }
  colorPriceTag(card); // 若價格高於存款，將價格標為紅色
}

/* 動態載入全部商品 */
const itemListBox = document.querySelector('.item-list-box');
const maxPage = document.querySelector('.BH-pagebtnA a:last-child').innerText;
if (maxPage === '1') { return } // 若僅一頁則不需讀取
const observer = new MutationObserver((records) => {
  // 建立觀測器，觀測新加入的商品卡
  for (const record of records) {
    for (const newNode of record.addedNodes) {
      if (!newNode.classList.contains('items-card')) { continue }
      // 依照商品卡種類，增加計數和取得目前出價
      switch (newNode.querySelector('.type-tag').innerText.trim()) {
        case TYPE_TAG.exchange:
          exchangeItemCounter.innerText++;
          break;
        case TYPE_TAG.bid:
          bidItemCounter.innerText++;
          getCurrentBid(newNode); // 取得競標類商品的目前出價並標示於商品卡
          break;
        case TYPE_TAG.lottery:
          lotteryItemCounter.innerText++;
          break;
      }
      colorPriceTag(newNode); // 若價格高於存款，將價格標為紅色
    }
  }
});
observer.observe(document.querySelector('.item-list-box'), { childList: true });

for (let page = 2; page <= maxPage; page++) {
  fetch(`https://fuli.gamer.com.tw/shop.php?page=${page}`, { method: 'GET' })
    .then(res => res.text())
    .then(data => {
      const parser = new DOMParser();
      const virtualDoc = parser.parseFromString(data, 'text/html');

      const items = virtualDoc.querySelectorAll('.item-list-box a.items-card');
      for (const item of items) { itemListBox.appendChild(item) }
    });
}
