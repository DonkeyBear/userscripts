// ==UserScript==
// @name         Master Duel Meta - Screenshot for Deck Builder
// @namespace    https://github.com/DonkeyBear
// @version      0.1
// @description  Take a nice shot of your deck!
// @author       DonkeyBear
// @match        https://www.masterduelmeta.com/deck-tester
// @icon         https://s3.duellinksmeta.com/img/icons/favicon-32x32.png
// @require      https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js
// @grant        none
// ==/UserScript==

const stylesheet = /* css */`
  .d-none {
    display: none !important;
  }
  .screenshot {
    object-fit: contain;
    max-width: 100vw;
    max-height: 100vh;
  }
  .overlay {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, .5);
    backdrop-filter: blur(3px);
    z-index: 999;
    text-align: center;
  }
  .info-container {
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", "Liberation Sans", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    font-size: .75em;
    font-weight: 500;
  }
  .slot-info, .card-count {
    flex-basis: auto !important;
  }
  .tag {
    color: white;
    padding: .1rem .4rem;
    border-radius: .25rem;
    margin-right: .25rem;
  }
  .tag.rarity-ur {
    background: linear-gradient(90deg, #c92ae7 0%, #7844fd 49%, #43bcd5 100%);
  }
  .tag.rarity-sr {
    background: linear-gradient(90deg, #e85504 0%, #f19d00 100%);
  }
  .tag.rarity-r {
    background: linear-gradient(90deg, #1831cc 0%, #017cfb 100%);
  }
  .tag.rarity-n {
    background: linear-gradient(90deg, #4f494b 0%, #969696 100%);
  }
`;
const style = document.createElement("style");
style.innerHTML = stylesheet;
document.head.appendChild(style);

// Append screenshot button
const tabButtonContainer = document.querySelector("ul.svelte-umfxo");
const newTabButton = document.createElement("li");
newTabButton.classList.add("svelte-umfxo", "screenshot-button");
newTabButton.innerText = "Screenshot";
newTabButton.onclick = () => { takeshot() }
tabButtonContainer.appendChild(newTabButton);

const observer = {};

// Append screenshot button again if it's removed
observer.tabButtonContainer = new MutationObserver(() => {
  if (!tabButtonContainer.querySelector(".screenshot-button")) {
    tabButtonContainer.appendChild(newTabButton);
  }
})
observer.tabButtonContainer.observe(tabButtonContainer, { childList: true });

// Count cards and print
observer.mainDeck = new MutationObserver(() => { countCards() });
observer.extraDeck = new MutationObserver(() => { countCards() });
observer.deckContainer = new MutationObserver(() => {
  const mainDeck = document.querySelector(".deck-container > .box-container");
  const extraDeck = document.querySelector(".extra-side-deck");
  if (mainDeck) { observer.mainDeck.observe(mainDeck, { childList: true, subtree: true, attributes: true }) }
  if (extraDeck) { observer.extraDeck.observe(extraDeck, { childList: true, subtree: true, attributes: true }) }
  if (mainDeck && mainDeck) { observer.deckContainer.disconnect() }
});
observer.deckContainer.observe(document.querySelector(".deck-container"), { childList: true });

function toggleElements() {
  for (let element of document.querySelectorAll(".deck-container .adjust-buttons-container")) {
    element.classList.toggle("d-none");
  }
}

function takeshot() {
  const deckContainer = document.querySelector(".deck-container");

  toggleElements();

  const overlay = document.createElement("div");
  overlay.classList.add("overlay");
  overlay.onclick = () => { overlay.remove() }
  document.body.appendChild(overlay);

  const options = {
    allowTaint: false,
    useCORS: true,
    backgroundColor: "#001b35", // Background color of <body>
    logging: false
  }
  html2canvas(deckContainer.parentElement, options).then((canvas) => {
    canvas.classList.add("screenshot");
    overlay.appendChild(canvas);
  });

  toggleElements();
}

function countCards() {
  let counter = {
    main: 0,
    extra: 0,
    ur: 0,
    sr: 0,
    r: 0,
    n: 0
  }

  const mainDeckCards = document.querySelectorAll(".deck-container > .box-container .card:not(.background)");
  const extraDeckCards = document.querySelectorAll(".extra-side-deck .card:not(.background)");

  for (let cards of [mainDeckCards, extraDeckCards]) {
    for (let card of cards) {
      let copies = 1;
      if (card.querySelector("[alt='2 copies']")) { copies = 2 }
      else if (card.querySelector("[alt='3 copies']")) { copies = 3 }

      if (cards == mainDeckCards) { counter.main += copies }
      else if (cards == extraDeckCards) { counter.extra += copies }

      if (card.querySelector("[alt='UR Rarity']")) { counter.ur += copies }
      else if (card.querySelector("[alt='SR Rarity']")) { counter.sr += copies }
      else if (card.querySelector("[alt='R Rarity']")) { counter.r += copies }
      else if (card.querySelector("[alt='N Rarity']")) { counter.n += copies }
    }
  }

  const infoLeft = document.querySelector(".info-container .slot-info");
  const infoRight = document.querySelector(".info-container .card-count");
  infoLeft.style.cssText = "color: white";
  infoLeft.innerHTML = /* html */`
    <span class="tag rarity-ur">${counter.ur} UR</span>
    <span class="tag rarity-sr">${counter.sr} SR</span>
    <span class="tag rarity-r">${counter.r} R</span>
    <span class="tag rarity-n">${counter.n} N</span>
  `;
  infoRight.innerText = `Main: ${counter.main} Extra: ${counter.extra}`;
}