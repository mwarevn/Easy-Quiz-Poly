var s = document.createElement("script");
(s.src = chrome.runtime.getURL("injects/cms_get_answer.js")), (s.onload = () => s.parentNode.removeChild(s));
let doc = document.documentElement || document.head;
doc.appendChild(s);
