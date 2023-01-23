// ==UserScript==
// @name         巴哈姆特勇者福利社++
// @namespace    https://github.com/DonkeyBear
// @version      0.2fix
// @description  改進巴哈姆特的勇者福利社，一次顯示全部商品，並加入過濾隱藏功能。
// @author       DonkeyBear
// @match        https://fuli.gamer.com.tw/shop.php*
// @icon         https://i2.bahamut.com.tw/anime/baha_s.png
// @grant        none
// ==/UserScript==

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
  if (hide) {
    styleDisplayString = "none";
  }

  for (let card of cards) {
    if (card.querySelector(".card-btn").innerText.includes(keywaord)) {
      card.style.display = styleDisplayString;
    }
  }
}

/* 更改 Header 上的名稱 */
// 在不影響到 hover-bar 的情況下很難做得好看，因此先作罷。
/* let fuliTitle = document.querySelector(".dropList a");
fuliTitle.style.position = "relative";
let newSpan = document.createElement("span");
newSpan.style.position = "absolute";
newSpan.style.right = ".15rem";
newSpan.style.top = "-.3rem";
newSpan.style.fontSize = ".8rem";
newSpan.style.letterSpacing = "-.05em";
newSpan.style.color = "rgb(234, 190, 122)";
newSpan.innerText = "++";
fuliTitle.appendChild(newSpan); */

/* 放置功能按鈕 */
setupButton("隱藏兌換類", "兌換", "hide-exchange-items");
setupButton("隱藏競標類", "競標", "hide-bid-items");
setupButton("隱藏抽獎類", "抽獎", "hide-lottery-items");

/* 動態載入全部商品 */
// 依照 URL Param 判斷是否執行
let newUrl = new URL(window.location);
if (newUrl.searchParams.get("history") != "0" && newUrl.searchParams.get("history") != null) { return }
if (newUrl.searchParams.get("page") != "1" && newUrl.searchParams.get("page") != null) { return }

document.getElementById("BH-pagebtn").style.display = "none"; // 隱藏選頁按鈕區塊
let itemListBox = document.querySelector(".item-list-box");
let maxPage = document.querySelector(".BH-pagebtnA a:last-child").innerText;
if (maxPage == "1") { return } // 若僅一頁則不需讀取
for (let page = 2; page <= maxPage; page++) {
  let xhr = new XMLHttpRequest();
  let xhrUrl = `https://fuli.gamer.com.tw/shop.php?page=${page}&history=0`;
  xhr.open("GET", xhrUrl, true);
  xhr.send();
  xhr.onreadystatechange = function () {
    if (this.readyState === 4 && (this.statusText === "OK" || this.status === 200)) {
      let parser = new DOMParser();
      let virtualDoc = parser.parseFromString(this.responseText, 'text/html');

      let items = virtualDoc.querySelectorAll(".item-list-box a.items-card");
      for (let item of items) {
        itemListBox.appendChild(item);
      }
    }
  }
}
