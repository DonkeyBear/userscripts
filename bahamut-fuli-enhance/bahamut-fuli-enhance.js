// ==UserScript==
// @name         巴哈姆特勇者福利社++
// @namespace    https://github.com/DonkeyBear
// @version      0.5.0
// @description  改進巴哈姆特的勇者福利社，一次顯示全部商品，並加入過濾隱藏功能。
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

function countItemCards(keywaord) {
  let counter = 0;
  let cards = document.querySelectorAll("a.items-card");
  for (let card of cards) {
    if (card.querySelector(".type-tag").innerText.includes(keywaord)) {
      counter++;
    }
  }
  return counter;
}

/* 放置功能按鈕 */
setupButton("隱藏兌換類", "直購", "hide-exchange-items");
setupButton("隱藏競標類", "競標", "hide-bid-items");
setupButton("隱藏抽獎類", "抽抽樂", "hide-lottery-items");

/* 放置商品類型計數區塊 */
document.querySelector("#forum-lastBoard").insertAdjacentHTML("afterend", /* html */`
  <div class="m-hidden">
    <h5>現有商品數量</h5>
    <div class="BH-rbox flex-center">
      <span>兌換類：</span>
      <span id="exchange-item-counter" style="color:#11AAC1;margin-right:.75rem"></span>
      <span>競標類：</span>
      <span id="bid-item-counter" style="color:#11AAC1;margin-right:.75rem"></span>
      <span>抽獎類：</span>
      <span id="lottery-item-counter" style="color:#11AAC1"></span>
    </div>
  </div>
`);
let exchangeItemCounter = document.getElementById("exchange-item-counter");
let bidItemCounter = document.getElementById("bid-item-counter");
let lotteryItemCounter = document.getElementById("lottery-item-counter");
exchangeItemCounter.innerText = countItemCards("直購");
bidItemCounter.innerText = countItemCards("競標");
lotteryItemCounter.innerText = countItemCards("抽抽樂");

/* 動態載入全部商品 */
document.getElementById("BH-pagebtn").style.display = "none"; // 隱藏選頁按鈕區塊
let itemListBox = document.querySelector(".item-list-box");
let maxPage = document.querySelector(".BH-pagebtnA a:last-child").innerText;
if (maxPage == "1") { return } // 若僅一頁則不需讀取
for (let page = 2; page <= maxPage; page++) {
  let xhr = new XMLHttpRequest();
  let xhrUrl = `https://fuli.gamer.com.tw/shop.php?page=${page}`;
  xhr.open("GET", xhrUrl, true);
  xhr.send();
  xhr.onreadystatechange = function () {
    if (this.readyState === 4 && (this.statusText === "OK" || this.status === 200)) {
      let parser = new DOMParser();
      let virtualDoc = parser.parseFromString(this.responseText, 'text/html');

      let items = virtualDoc.querySelectorAll(".item-list-box a.items-card");
      for (let item of items) { itemListBox.appendChild(item); }

      // 更新計數器
      exchangeItemCounter.innerText = countItemCards("直購");
      bidItemCounter.innerText = countItemCards("競標");
      lotteryItemCounter.innerText = countItemCards("抽抽樂");
    }
  }
}
