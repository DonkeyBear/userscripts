// ==UserScript==
// @name         巴哈姆特勇者福利社++
// @namespace    https://github.com/DonkeyBear
// @version      0.7.1
// @description  改進巴哈姆特的勇者福利社，動態載入全部商品、加入過濾隱藏功能、標示競標目前出價等。
// @author       DonkeyBear
// @match        https://fuli.gamer.com.tw/shop.php*
// @icon         https://fuli.gamer.com.tw/favicon.ico
// @grant        none
// ==/UserScript==

// 修正上排功能鈕的邊距，保持頁面樣式
document.querySelector(".tabs-btn-box").style.marginTop = "0";

// 依照 URL Param 判斷是否執行後續程式
let newUrl = new URL(window.location);
if (newUrl.searchParams.get("history") != "0" && newUrl.searchParams.get("history") != null) { return }
if (newUrl.searchParams.get("page") != "1" && newUrl.searchParams.get("page") != null) {
  window.location.replace("https://fuli.gamer.com.tw/shop.php");
}

// 持有的巴幣存款
const DEPOSIT = Number(document.querySelector(".brave-assets").innerText.replaceAll(/\D/, ""));

// .items-card .type-tag 的內文
const TYPE_TAG = {
  exchange: "直購",
  bid: "競標",
  lottery: "抽抽樂"
}

function setupButton(labelText, keywordToHide, checkboxId) {
  let newFunctionButton = document.createElement("a");
  newFunctionButton.className = "flex-center btn-distance";
  newFunctionButton.style.borderLeft = "1px solid";
  let newCheckbox = document.createElement("input");
  newCheckbox.id = checkboxId;
  newCheckbox.type = "checkbox";
  newCheckbox.style.marginRight = "0.15rem";
  newCheckbox.onchange = (e) => { toggleItemCards(keywordToHide, e.target.checked) }
  let newLabel = document.createElement("label");
  newLabel.setAttribute("for", checkboxId);
  newLabel.innerText = labelText;
  newFunctionButton.appendChild(newCheckbox);
  newFunctionButton.appendChild(newLabel);
  document.querySelector(".tabs-btn-box").appendChild(newFunctionButton);
}

function toggleItemCards(keywaord, hide) {
  let cards = document.querySelectorAll("a.items-card");
  let styleDisplayString = "";
  if (hide) { styleDisplayString = "none" }
  for (let card of cards) {
    if (card.querySelector(".type-tag").innerText.includes(keywaord)) {
      card.style.display = styleDisplayString;
    }
  }
}

function getCurrentBid(itemsCardElement) {
  if (itemsCardElement.querySelector('.type-tag').innerText != TYPE_TAG.bid) { return } // 若非競標品則結束函式
  let xhr = new XMLHttpRequest();
  let xhrUrl = itemsCardElement.href;
  xhr.open("GET", xhrUrl);
  xhr.send();
  xhr.onreadystatechange = function () {
    if (this.readyState == 4 && (this.statusText == "OK" || this.status == 200)) {
      let parser = new DOMParser();
      let virtualDoc = parser.parseFromString(this.responseText, 'text/html');

      let currentBid;
      for (let item of virtualDoc.querySelectorAll('.pbox-content')) {
        if (!item.innerText.includes("目前出價")) { continue }
        currentBid = item.querySelector(".pbox-content-r").innerText.match(/[\d|,]+/)[0];
        break;
      }
      let newTextHTML = /* html */`目前出價<p class="digital" style="margin-left:8px">${currentBid}</p>巴幣`;
      itemsCardElement.querySelector(".price").innerHTML = newTextHTML;
      colorPriceTag(itemsCardElement);
    }
  }
}

function colorPriceTag(itemsCardElement) {
  let priceElement = itemsCardElement.querySelector(".digital")
  let price = Number(priceElement.innerText.replaceAll(/\D/, ""));
  if (DEPOSIT < price) { priceElement.style.color = "#DF4747" }
}

/* 放置功能按鈕 */
setupButton("隱藏兌換類", TYPE_TAG.exchange, "hide-exchange-items");
setupButton("隱藏競標類", TYPE_TAG.bid, "hide-bid-items");
setupButton("隱藏抽獎類", TYPE_TAG.lottery, "hide-lottery-items");

/* 放置商品類型計數區塊 */
document.querySelector("#forum-lastBoard").insertAdjacentHTML("afterend", /* html */`
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
let exchangeItemCounter = document.getElementById("exchange-item-counter");
let bidItemCounter = document.getElementById("bid-item-counter");
let lotteryItemCounter = document.getElementById("lottery-item-counter");

for (let card of document.querySelectorAll("a.items-card")) {
  // 依照商品卡種類，增加計數和取得目前出價
  switch (card.querySelector(".type-tag").innerText.trim()) {
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
document.getElementById("BH-pagebtn").style.display = "none"; // 隱藏選頁按鈕區塊
let itemListBox = document.querySelector(".item-list-box");
let maxPage = document.querySelector(".BH-pagebtnA a:last-child").innerText;
if (maxPage == "1") { return } // 若僅一頁則不需讀取
const observer = new MutationObserver((record) => {
  // 建立觀測器，觀測新加入的商品卡
  for (let newNode of record.addedNodes) {
    if (!newNode.classList.contains("items-card")) { continue }
    // 依照商品卡種類，增加計數和取得目前出價
    switch (newNode.querySelector(".type-tag").innerText.trim()) {
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
});
observer.observe(document.querySelector(".item-list-box"), { childList: true });
for (let page = 2; page <= maxPage; page++) {
  let xhr = new XMLHttpRequest();
  let xhrUrl = `https://fuli.gamer.com.tw/shop.php?page=${page}`;
  xhr.open("GET", xhrUrl);
  xhr.send();
  xhr.onreadystatechange = function () {
    if (this.readyState == 4 && (this.statusText == "OK" || this.status == 200)) {
      let parser = new DOMParser();
      let virtualDoc = parser.parseFromString(this.responseText, 'text/html');

      let items = virtualDoc.querySelectorAll(".item-list-box a.items-card");
      for (let item of items) { itemListBox.appendChild(item) }
    }
  }
}
