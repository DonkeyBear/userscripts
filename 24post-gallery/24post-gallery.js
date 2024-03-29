// ==UserScript==
// @name         24Post Gallery
// @namespace    https://github.com/DonkeyBear
// @version      0.3
// @description  Gallery for 24Post
// @author       DonkeyBear
// @match        https://24post.co.kr/*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=24post.co.kr
// @grant        none
// ==/UserScript==

/**
 * TODO:
 *   Download button,
 *   Image Size (using elm.naturalHeight and elm.naturalWidth),
 *   Original size image,
 *   100% for smaller image,
 *   Fix auto open gallery when drop URL params
 */

let autoOpenGallery = getUrlParams("gallery"); // should be true or undefined.
let imageElmAll = document.querySelectorAll("article img");
let videoElmAll = document.querySelectorAll("article video");
let mediaElmAll = [...imageElmAll, ...videoElmAll];
if (!mediaElmAll.length) { return } // return when no image and video in current post.
let currentGalleryIndex = 0;

document.body.style.position = "unset"; // fix the weird gap around gallery.
document.getElementById("new_notice_content_wrap").style.zIndex = "4999";

let galleryLauncher = document.createElement("button");
insertIconElm(galleryLauncher, "fa fa-picture-o");
galleryLauncher.style.fontSize = "2rem";
galleryLauncher.style.color = "#333";
galleryLauncher.style.height = "3rem";
galleryLauncher.style.width = "3rem";
galleryLauncher.style.position = "fixed";
galleryLauncher.style.bottom = "2rem";
galleryLauncher.style.right = "2rem";
galleryLauncher.style.zIndex = "4900";
galleryLauncher.style.textAlign = "center";
galleryLauncher.onclick = () => {
  galleryContainer.style.display = "block";
  document.addEventListener('keydown', galleryKeydownFunction);
}

let galleryContainer = document.createElement("div");
galleryContainer.style.height = "100vh";
galleryContainer.style.width = "100vw";
galleryContainer.style.backgroundColor = "rgba(0,0,0,.85)";
galleryContainer.style.backdropFilter = "blur(3px)";
galleryContainer.style.position = "fixed";
galleryContainer.style.top = "0";
galleryContainer.style.left = "0";
galleryContainer.style.zIndex = "5000";
galleryContainer.style.textAlign = "center";
if (!autoOpenGallery) {
  galleryContainer.style.display = "none";
} else {
  document.addEventListener('keydown', galleryKeydownFunction);
}

let galleryCounter = document.createElement("span");
galleryCounter.style.position = "absolute";
galleryCounter.style.fontSize = "1.5rem";
galleryCounter.style.fontWeight = "bold";
galleryCounter.style.top = "1rem";
galleryCounter.style.left = "2rem";
galleryCounter.style.color = "whitesmoke";

let galleryMediaContainer = document.createElement("div");
galleryMediaContainer.style.height = "100%";
galleryMediaContainer.style.width = "100%";
galleryMediaContainer.style.display = "flex";
galleryMediaContainer.style.alignItems = "center";
galleryMediaContainer.style.justifyContent = "center";
showMedia(currentGalleryIndex);

let galleryButtonPrevious = document.createElement("span");
insertIconElm(galleryButtonPrevious, "fa fa-angle-left");
galleryButtonPrevious.style.position = "absolute";
galleryButtonPrevious.style.fontSize = "4rem";
galleryButtonPrevious.style.top = "calc(50% - 5rem)";
galleryButtonPrevious.style.left = "0";
galleryButtonPrevious.style.padding = "3rem";
galleryButtonPrevious.style.color = "whitesmoke";
galleryButtonPrevious.onclick = () => { showMedia(currentGalleryIndex - 1) }

let galleryButtonNext = document.createElement("span");
insertIconElm(galleryButtonNext, "fa fa-angle-right");
galleryButtonNext.style.position = "absolute";
galleryButtonNext.style.fontSize = "4rem";
galleryButtonNext.style.top = "calc(50% - 5rem)";
galleryButtonNext.style.right = "0";
galleryButtonNext.style.padding = "3rem";
galleryButtonNext.style.color = "whitesmoke";
galleryButtonNext.onclick = () => { showMedia(currentGalleryIndex + 1) }

let galleryButtonClose = document.createElement("span");
insertIconElm(galleryButtonClose, "fa fa-times");
galleryButtonClose.style.position = "absolute";
galleryButtonClose.style.fontSize = "2rem";
galleryButtonClose.style.top = ".75rem";
galleryButtonClose.style.right = "2rem";
galleryButtonClose.style.color = "whitesmoke";
galleryButtonClose.onclick = () => {
  galleryContainer.style.display = "none";
  document.removeEventListener('keydown', galleryKeydownFunction);
}

let galleryButtonPreviousPost = document.createElement("a");
if (document.querySelector(".bd_rd_prev")) {
  let previousPost = document.querySelector(".bd_rd_prev");
  insertIconElm(galleryButtonPreviousPost, "fa fa-arrow-circle-left");
  let postTitle = insertSpanElm(galleryButtonPreviousPost, previousPost.innerText.replace("Prev", "").trim());
  postTitle.style.fontSize = "1rem";
  postTitle.style.marginLeft = ".5rem";
  postTitle.style.alignSelf = "center";
  postTitle.style.userSelect = "none";
  galleryButtonPreviousPost.style.display = "flex";
  galleryButtonPreviousPost.style.position = "absolute";
  galleryButtonPreviousPost.style.fontSize = "1.5rem";
  galleryButtonPreviousPost.style.bottom = "2rem";
  galleryButtonPreviousPost.style.left = "2rem";
  galleryButtonPreviousPost.style.textDecoration = "none";
  galleryButtonPreviousPost.style.color = "whitesmoke";
  galleryButtonPreviousPost.href = addUrlParam(previousPost.href, "gallery", "true");
}

let galleryButtonNextPost = document.createElement("a");
if (document.querySelector(".bd_rd_next")) {
  let nextPost = document.querySelector(".bd_rd_next");
  let postTitle = insertSpanElm(galleryButtonNextPost, nextPost.innerText.replace("Next", "").trim());
  insertIconElm(galleryButtonNextPost, "fa fa-arrow-circle-right");
  postTitle.style.fontSize = "1rem";
  postTitle.style.marginRight = ".5rem";
  postTitle.style.alignSelf = "center";
  postTitle.style.userSelect = "none";
  galleryButtonNextPost.style.display = "flex";
  galleryButtonNextPost.style.position = "absolute";
  galleryButtonNextPost.style.fontSize = "1.5rem";
  galleryButtonNextPost.style.bottom = "2rem";
  galleryButtonNextPost.style.right = "2rem";
  galleryButtonNextPost.style.textDecoration = "none";
  galleryButtonNextPost.style.color = "whitesmoke";
  galleryButtonNextPost.href = addUrlParam(nextPost.href, "gallery", "true");
}

let galleryContents = [
  galleryCounter,
  galleryMediaContainer,
  galleryButtonPrevious,
  galleryButtonNext,
  galleryButtonClose,
  galleryButtonPreviousPost,
  galleryButtonNextPost
];

for (let item of galleryContents) {
  galleryContainer.appendChild(item);
}

document.addEventListener('keydown', (event) => {
  if (event.code == "KeyG") {
    let containerDisplay = galleryContainer.style.display;
    if (containerDisplay == "none") {
      galleryLauncher.click();
    } else {
      galleryButtonClose.click();
    }
  }
});
document.body.appendChild(galleryLauncher);
document.body.appendChild(galleryContainer);

function getUrlParams(key) {
  let newUrl = new URL(window.location);
  return newUrl.searchParams.get(key);
}

function addUrlParam(url, key, value) {
  let newUrl = new URL(url);
  newUrl.searchParams.set(key, value);
  return newUrl;
}

function insertIconElm(parentElm, iconClass) {
  let newIcon = document.createElement("i");
  newIcon.className = iconClass; // e.g. "fa fa-paperclip"
  parentElm.appendChild(newIcon);
  return newIcon;
}

function insertSpanElm(parentElm, spanContent) {
  let newSpan = document.createElement("span");
  newSpan.innerText = spanContent;
  parentElm.appendChild(newSpan);
  return newSpan;
}

function galleryKeydownFunction(event) {
  switch (event.code) {
    case "KeyK":
      galleryButtonPreviousPost.click();
      break;
    case "KeyL":
      galleryButtonNextPost.click();
      break;
    case "Comma":
      galleryButtonPrevious.click();
      break;
    case "Period":
      galleryButtonNext.click();
      break;
  }
}

function showMedia(index) {
  if ((index < 0) || (index > mediaElmAll.length - 1)) {
    return;
  }
  currentGalleryIndex = index;
  galleryCounter.innerText = `${currentGalleryIndex + 1} / ${mediaElmAll.length}`;
  let newMediaElm = mediaElmAll[index].cloneNode();
  newMediaElm.style.maxHeight = "100%";
  newMediaElm.style.maxWidth = "100%";
  galleryMediaContainer.innerHTML = "";
  galleryMediaContainer.appendChild(newMediaElm);
}