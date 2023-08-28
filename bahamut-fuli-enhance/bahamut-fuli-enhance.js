// ==UserScript==
// @name         巴哈姆特勇者福利社++
// @namespace    https://github.com/DonkeyBear
// @version      0.8.0
// @description  改進巴哈姆特的勇者福利社，動態載入全部商品、加入過濾隱藏功能、標示競標目前出價等。
// @author       DonkeyBear
// @match        https://fuli.gamer.com.tw/shop.php*
// @icon         https://fuli.gamer.com.tw/favicon.ico
// @grant        none
// ==/UserScript==

const darkMode = document.documentElement.getAttribute('data-theme') === 'dark';

const stylesheet = /* css */`
  #BH-wrapper {
    padding-top: 0;
  }

  #tabs-btn-group {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .tabs-btn-box {
    margin-top: 0;
  }
  a.btn-distance.fuli-enhance {
    width: auto;
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
  a.btn-distance.fuli-enhance:not(:first-child) {
    border-left: 1px solid;
    ${darkMode ? 'border-color: #444444;' : ''};
  }
  a.btn-distance.fuli-enhance > [type=checkbox] {
    margin-right: .15rem;
  }
  .filter-by-title,
  .filter-by-type,
  .filter-by-state,
  #BH-pagebtn {
    display: none;
  }
  .digital.unaffordable {
    color: #DF4747;
  }

  .fuli-enhance.btn-search {
    padding: 0 .6rem !important;
  }

  .search-bar {
    display: flex;
    align-items: center;
    border: 1px solid;
    border-radius: 4px;
    background-color: white;
    padding: .2rem .3rem;
  }

  .search-bar > [type=text] {
    width: 8rem;
    border: 0;
  }

  .search-bar > [type=text]:focus-visible {
    outline: 0;
  }

  .icon {
    width: 1rem;
    height: 1rem;
  }

  .icon-search {
    border-left: 1px solid;
    padding-left: .3rem;
    margin-left: .2rem;
  }

  .icon-close {
    transform: translate(2px, 2px);
  }

  #exchange-item-counter,
  #bid-item-counter,
  #lottery-item-counter {
    color: #11AAC1;
  }

  #exchange-item-counter,
  #bid-item-counter {
    margin-right: .75rem;
  }

  .digital.current-bid {
    margin-left: 8px;
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

class ItemCard {
  constructor (itemCard) {
    this.itemCard = itemCard;
    this.type = itemCard.querySelector('.type-tag').innerText.trim();
  }

  fetchCurrentBid () {
    if (this.itemCard.querySelector('.type-tag').innerText !== TYPE_TAG.bid) { return this } // 若非競標品則結束函式
    const priceElement = this.itemCard.querySelector('.price');
    priceElement.innerText = '正在讀取目前出價';
    fetch(this.itemCard.href, { method: 'GET' })
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
        const newTextHTML = /* html */`目前出價<p class="digital current-bid">${currentBid}</p>巴幣`;
        priceElement.innerHTML = newTextHTML;
        this.colorPriceTag();
      })
      .catch(() => {
        priceElement.innerText = '讀取出價失敗！';
      });
  }

  colorPriceTag () {
    const priceNumberElement = this.itemCard.querySelector('.digital');
    const price = Number(priceNumberElement.innerText.replaceAll(/\D/, ''));
    if (DEPOSIT < price) { priceNumberElement.classList.add('unaffordable') }
  }

  registerCard () {
    // 依照商品卡種類，增加計數和取得目前出價
    switch (this.type) {
      case TYPE_TAG.exchange:
        exchangeItemCounter.innerText++;
        break;
      case TYPE_TAG.bid:
        bidItemCounter.innerText++;
        this.fetchCurrentBid(); // 取得競標類商品的目前出價並標示於商品卡
        break;
      case TYPE_TAG.lottery:
        lotteryItemCounter.innerText++;
        break;
    }
  }
}

class ItemCardList {
  constructor (itemCardList = document.querySelectorAll('.item-list-box a.items-card')) {
    this.itemCardList = itemCardList;
  }

  filterByTitle (filterTitle) {
    this.itemCardList.forEach((itemCard) => {
      const title = itemCard.querySelector('.items-title').innerText;
      const filterClassName = 'filter-by-title';
      title.includes(filterTitle) ? itemCard.classList.remove(filterClassName) : itemCard.classList.add(filterClassName);
    });
  }

  filterByType (filterType) {
    this.itemCardList.forEach((itemCard) => {
      const type = itemCard.querySelector('.type-tag').innerText;
      if (!type.includes(filterType)) { return }
      const filterClassName = 'filter-by-type';
      itemCard.classList.toggle(filterClassName);
    });
  }
}

/* 放置功能按鈕 */
const tabsBtnGroup = document.createElement('div');
const firstTabsBtn = document.querySelector('.tabs-btn-box');
tabsBtnGroup.id = 'tabs-btn-group';
document.querySelector('#BH-master').insertBefore(tabsBtnGroup, firstTabsBtn);
tabsBtnGroup.appendChild(firstTabsBtn);
const newTabsBtn = document.createElement('div');
newTabsBtn.classList.add('tabs-btn-box');
newTabsBtn.innerHTML = /* html */`
  <a class="flex-center btn-distance fuli-enhance">
    <input id="hide-exchange-items" type="checkbox" data-keyword="${TYPE_TAG.exchange}">
    <label for="hide-exchange-items">隱藏直購</label>
  </a>
  <a class="flex-center btn-distance fuli-enhance">
    <input id="hide-bid-items" type="checkbox" data-keyword="${TYPE_TAG.bid}">
    <label for="hide-bid-items">隱藏競標</label>
  </a>
  <a class="flex-center btn-distance fuli-enhance">
    <input id="hide-lottery-items" type="checkbox" data-keyword="${TYPE_TAG.lottery}">
    <label for="hide-lottery-items">隱藏抽抽樂</label>
  </a>
  <a class="flex-center btn-distance fuli-enhance btn-search">
    <div class="search-bar">
      <input type="text">
      <svg class="icon icon-close" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
      </svg>
      <svg class="icon icon-search" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.9" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"></path>
      </svg>
    </div>
  </a>
`;
newTabsBtn.querySelectorAll('[type=checkbox]').forEach((el) => {
  el.onchange = () => {
    const typeTag = el.getAttribute('data-keyword');
    const itemCardList = new ItemCardList();
    itemCardList.filterByType(typeTag);
  };
});
const searchBar = newTabsBtn.querySelector('.search-bar > [type=text]');
const iconClose = newTabsBtn.querySelector('.icon-close');
iconClose.onclick = () => {
  searchBar.value = '';
  const itemCardList = new ItemCardList();
  itemCardList.filterByTitle('');
};
searchBar.oninput = (event) => {
  const searchText = event.target.value;
  const itemCardList = new ItemCardList();
  itemCardList.filterByTitle(searchText);
};
tabsBtnGroup.appendChild(newTabsBtn);

/* 放置商品類型計數區塊 */
document.querySelector('#forum-lastBoard').insertAdjacentHTML('afterend', /* html */`
  <div class="m-hidden">
    <h5>現有商品數量</h5>
    <div class="BH-rbox flex-center">
      <span>直購：</span>
      <span id="exchange-item-counter">0</span>
      <span>競標：</span>
      <span id="bid-item-counter">0</span>
      <span>抽抽樂：</span>
      <span id="lottery-item-counter">0</span>
    </div>
  </div>
`);
const exchangeItemCounter = document.getElementById('exchange-item-counter');
const bidItemCounter = document.getElementById('bid-item-counter');
const lotteryItemCounter = document.getElementById('lottery-item-counter');

for (const card of document.querySelectorAll('a.items-card')) {
  // 依照商品卡種類，增加計數和取得目前出價
  const itemCard = new ItemCard(card);
  itemCard.registerCard();
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
      const itemCard = new ItemCard(newNode);
      itemCard.registerCard();
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
