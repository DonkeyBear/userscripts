// ==UserScript==
// @name         24Post Gallery
// @namespace    https://github.com/DonkeyBear
// @version      0.1
// @description  Gallery for 24Post
// @author       DonkeyBear
// @match        https://24post.co.kr/*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=24post.co.kr
// @grant        none
// ==/UserScript==

let autoOpenGallery = getUrlParams("gallery"); // should be true or undefined.
let imageElmAll = document.querySelectorAll("article img");
if (!imageElmAll.length) { return }

let imageSrcAll = new Array;
let currentGalleryIndex = 0;

for (let elm of imageElmAll) { imageSrcAll.push(elm.src) }

document.body.style.position = "unset";
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
galleryLauncher.onclick = () => { galleryContainer.style.display = "block" }

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
}

let galleryImage = document.createElement("img");
galleryImage.src = imageSrcAll[currentGalleryIndex];
galleryImage.style.maxHeight = "100%";
galleryImage.style.maxWidth = "100%";

let galleryButtonPrevious = document.createElement("span");
insertIconElm(galleryButtonPrevious, "fa fa-angle-left");
galleryButtonPrevious.style.position = "absolute";
galleryButtonPrevious.style.fontSize = "4rem";
galleryButtonPrevious.style.top = "calc(50% - 5rem)";
galleryButtonPrevious.style.left = "0";
galleryButtonPrevious.style.padding = "3rem";
galleryButtonPrevious.style.color = "whitesmoke";
galleryButtonPrevious.onclick = () => { changeImage(currentGalleryIndex - 1) }

let galleryButtonNext = document.createElement("span");
insertIconElm(galleryButtonNext, "fa fa-angle-right");
galleryButtonNext.style.position = "absolute";
galleryButtonNext.style.fontSize = "4rem";
galleryButtonNext.style.top = "calc(50% - 5rem)";
galleryButtonNext.style.right = "0";
galleryButtonNext.style.padding = "3rem";
galleryButtonNext.style.color = "whitesmoke";
galleryButtonNext.onclick = () => { changeImage(currentGalleryIndex + 1) }

let galleryButtonClose = document.createElement("span");
insertIconElm(galleryButtonClose, "fa fa-times");
galleryButtonClose.style.position = "absolute";
galleryButtonClose.style.fontSize = "2rem";
galleryButtonClose.style.top = ".75rem";
galleryButtonClose.style.right = "2rem";
galleryButtonClose.style.color = "whitesmoke";
galleryButtonClose.onclick = () => { galleryContainer.style.display = "none" }

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

let galleryCounter = document.createElement("span");
galleryCounter.innerText = `${currentGalleryIndex + 1} / ${imageSrcAll.length}`;
galleryCounter.style.position = "absolute";
galleryCounter.style.fontSize = "1.5rem";
galleryCounter.style.fontWeight = "bold";
galleryCounter.style.top = "1rem";
galleryCounter.style.left = "2rem";
galleryCounter.style.color = "whitesmoke";

let galleryContents = [
  galleryImage,
  galleryButtonPrevious,
  galleryButtonNext,
  galleryButtonClose,
  galleryButtonPreviousPost,
  galleryButtonNextPost,
  galleryCounter
];

for (let item of galleryContents) {
  galleryContainer.appendChild(item);
}

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

function changeImage(targetIndex) {
  if ((targetIndex < 0) || (targetIndex > imageSrcAll.length - 1)) {
    return;
  }
  currentGalleryIndex = targetIndex;
  galleryCounter.innerText = `${currentGalleryIndex + 1} / ${imageSrcAll.length}`;
  galleryImage.src = imageSrcAll[targetIndex];
}

/**
 * TODO:
 *   Download button,
 *   Gallery toggle,
 *   Image Size (using elm.naturalHeight and elm.naturalWidth),
 *   Original size image,
 *   Video support,
 *   Hint for no-image,
 *   Image verticle center,
 *   100% for smaller image,
 *   Fix second "gallery=true" in URL,
 *   Fix auto open gallery when drop URL params,
 *   Add keyboard support
 */