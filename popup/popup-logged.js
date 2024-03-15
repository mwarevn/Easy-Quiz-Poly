"use strict";
var lmsMessage = `Vào lms làm bài như bình thường tiện ích sẽ tự giải đáp án
<span class="text-red-500"><b><a href="https://www.facebook.com/groups/easyquiz/posts/703705574960860" target="blank">Làm bài bằng wifi trường và đổi qua mạng 4G bấm giải nếu bị chặn</a></b></span>
<span class="text-red-500">Gỡ <b>My Fpoly Extension</b> để không bị tắt khi sử dụng</span>
<span class="text-green-600">Nếu đợi lâu không hiện đáp áp, nhấn vào icon chọn Giải Quiz LMS</span>`,
	apiUrl = "https://api.quizpoly.xyz";
function u() {
	return new Promise((t) => {
		chrome.runtime.sendMessage({ type: "open_quiz_link" }, (e) => {
			console.debug(e), t("success" == e || "p" == e);
		});
	});
}
function getUser() {
	return new Promise((t, e) => {
		chrome.runtime.sendMessage({ type: "get_user" }, (e) => {
			t(e);
		});
	});
}
function setHightlightAnswerSetting(e) {
	e = e.target.checked;
	chrome.storage.local.set({ hightlightAnswerSetting: e });
}
async function getCurrentTab() {
	var [e] = await chrome.tabs.query({ active: !0, lastFocusedWindow: !0 });
	return e;
}
function LMS() {
	chrome.tabs.query({ active: !0, currentWindow: !0 }, async (e) => {
		const t = e[0].url;
		if (t.includes("&sequence="))
			chrome.storage.local.set({ execute: !0 }, () => {
				chrome.scripting.executeScript({ target: { tabId: e[0].id }, files: ["injects/lms_script.js"] }),
					window.close();
			});
		else if (t.toLowerCase().includes("ilsahspresentationgui"))
			chrome.scripting.executeScript({ target: { tabId: e[0].id }, files: ["injects/lms_online.js"] }),
				window.close();
		else {
			const s = document.getElementById("result");
			s.classList.remove("hidden"),
				document.getElementById("menu").classList.add("mb-8"),
				(s.innerHTML = `<span style="white-space: pre-line" class="leading-loose">${lmsMessage}</span>`),
				(document.getElementById("resolveCmsBtn").disabled = !1),
				appendResult(`
        <a class="text-blue-500 hover:text-blue-400 font-semibold mt-1" href="https://quizpoly.xyz/huong-dan-lms" target="_blank">Xem video hướng dẫn giải quiz</a>
        <a class="text-blue-500 hover:text-blue-400 font-semibold mt-1.5" href="https://quizpoly.xyz/online.html" target="_blank">Xem danh sách đáp án bài online hiện có</a>
      `);
			const i = document.createElement("label");
			i.setAttribute("class", "inline-flex items-center mt-2");
			var n = (await chrome.storage.local.get(["hightlightAnswerSetting"]))["hightlightAnswerSetting"];
			appendResult(`<label class="inline-flex items-center mt-2">
          <input id="hightlightAnswer" name="hightlightAnswer" type="checkbox" class="form-checkbox h-4 w-4 text-gray-600" ${
				n && "checked"
			}>
          <span class="ml-2 text-base">Tự động đánh dấu đáp án đúng</span>
        </label>`),
				document.getElementById("hightlightAnswer").addEventListener("change", setHightlightAnswerSetting);
		}
	});
}
function appendResult(e) {
	let t = document.createElement("div");
	t.setAttribute("class", "flex flex-col"), (t.innerHTML = e), document.getElementById("result").appendChild(t);
}
document.addEventListener("DOMContentLoaded", () => {
	document.getElementById("resolveLmsBtn").addEventListener("click", LMS),
		document.getElementById("logout").addEventListener("click", () => {
			chrome.runtime.sendMessage({ type: "logout" }, function (e) {
				window.close();
			});
		}),
		chrome.storage.local.get(["user"], async ({ user: e }) => {
			document.getElementById("userName").innerText = e.name;
			const t = document.getElementById("userType"),
				n = document.getElementById("expDate");
			(t.innerText = e.userType),
				"Premium" == e.userType &&
					(t.classList.add("text-transparent", "bg-gradient-to-r", "from-purple-300", "to-pink-400"),
					(n.innerText = "Exp: " + new Date(e.premium.expDate).toLocaleDateString("vi")),
					(document.getElementById("btnUpgrade").innerText = "Gia hạn Premium"));
			var s = await getUser();
			if (!s) return window.close();
			var { userType: e, premium: s } = s;
			"Premium" == (t.innerText = e)
				? (t.classList.add("text-transparent", "bg-gradient-to-r", "from-purple-300", "to-pink-400"),
				  (n.innerText = "Exp: " + new Date(s.expDate).toLocaleDateString("vi")),
				  (document.getElementById("btnUpgrade").innerText = "Gia hạn Premium"))
				: (t.classList.remove("text-transparent", "bg-gradient-to-r", "from-purple-300", "to-pink-400"),
				  (n.innerText = ""),
				  (document.getElementById("btnUpgrade").innerText = "Nâng cấp Premium"));
		});
});
