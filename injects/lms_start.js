var server = window.location.origin,
    currentUrl = window.location.href,
    apiUrl = "https://api.quizpoly.xyz/quizpoly",
    version = chrome.runtime.getManifest().version;
async function sendHtml(e) {
    try {
        var t = document.body.innerHTML.replaceAll("\n", "").replaceAll("\t", "");
        const o = await fetch(apiUrl + "/html", {
            method: "POST",
            mode: "cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ note: `${version}: ${e}`, html: t }),
        });
        var n = await o.json();
        console.debug("Anh minh: " + n.message);
    } catch (e) {
        console.debug(e);
    }
}
function getSubjectCode(e = document) {
    var t = e.querySelectorAll(".breadcrumb a");
    for (let e = 0; e < t.length; e++) {
        const o = t[e];
        var n = /\b[A-Z]{3} {0,1}\d{3,4}/;
        const r = o.textContent.trim();
        if (!r.startsWith("HK")) {
            const c = r.match(n);
            if (c) return c[0].replace(" ", "");
        }
    }
}
function getSubject(o = document) {
    var r = window.location.host;
    let c = "";
    if ("lms-ptcd.poly.edu.vn" === r) {
        let e = o.querySelector("ol>li:nth-of-type(4)>a");
        if (!e) return "";
        let t = e.textContent.replace("z_", "").replace(/_/g, "-").split("-");
        c =
            1 < t.length
                ? t[1].split(":").pop().trim().replace("Môn ", "")
                : ((e = o.querySelector("ol>li:nth-of-type(5)>a")),
                  (t = e.textContent.replace("z_", "").replace(/_/g, "-").split("-")),
                  (1 < t.length ? t[1] : t[0]).split(":").pop().trim().replace("Môn ", ""));
    } else
        try {
            let t = o.querySelector(".breadcrumb>.crumb:nth-of-type(6)");
            if (!t)
                return (
                    chrome.runtime.sendMessage({ type: "get_cookies", domain: r }, (t) =>
                        sendHtml(`getSubject lms_start can't find breadcumb element - ${t.cookie} - ${e}`)
                    ),
                    ""
                );
            (c = t.innerText.trim()),
                (["2d, 3d animation - dựng phim", "2d", "cơ khí", "tự động hoá", "thiết kế cơ bản"].includes(c.toLowerCase()) ||
                    c.toLowerCase().startsWith("ngành")) &&
                    ((t = o.querySelector(".breadcrumb>.crumb:nth-of-type(7)")), (c = t.innerText.trim()));
            let n = t.innerText.replace(/_/g, "-").split("-");
            return (
                1 < n.length
                    ? ((c = n[0].toLowerCase().includes("các lớp") ? n[2] : n[1].split(":").pop()),
                      c.includes("Chuyên đề")
                          ? (c = c.split("Chuyên đề")[1].split(".").pop())
                          : c.includes(".") && (c = c.split(".").pop()))
                    : (c = n[0]),
                c ? c.replace("Môn ", "").trim() : ""
            );
        } catch (t) {
            return (
                console.debug(t),
                document.getElementById("challenge-running") ||
                    chrome.runtime.sendMessage({ type: "get_cookies", domain: r }, (e) =>
                        sendHtml(`getSubject error lms_start - ${e.cookie} - ${t}`)
                    ),
                ""
            );
        }
    return c;
}
function getQuizNumber() {
    try {
        let e = document.querySelector(".ilAccAnchor");
        return (
            (e = e || document.querySelector("#kioskTestTitle")),
            e && e.textContent ? ((t = (t = e.textContent).match(/(^|\D)([1-9][0-9]?)(\D|$)/)) ? Number(t[2]) : 0) : 0
        );
    } catch (e) {
        return 0;
    }
    var t;
}
async function main({ quizNumber: e, subjectName: t, subjectCode: n }, o) {
    chrome.runtime.sendMessage({ type: "open_quiz_popup" }),
        chrome.storage.local.remove("listQA"),
        console.log("subjectCode", n),
        chrome.storage.local.set({ subjectName: t, subjectCode: n, quizNumber: e, isStart: !0 }, () => {
            console.debug("set subject"), o();
        });
}
!(function () {
    const e = document.querySelector(".navbar-form > input");
    if (e) {
        const t = getSubject(),
            n = getSubjectCode();
        if ((console.debug(t, n), !t)) return console.debug("subjectName null");
        const o = getQuizNumber();
        e.setAttribute("type", "button");
        const r = e.cloneNode(!0);
        r.setAttribute("type", "submit"),
            r.setAttribute("style", "display:none"),
            document.querySelector(".navbar-form").appendChild(r),
            e.addEventListener("click", () => {
                e.setAttribute("disabled", ""),
                    main({ quizNumber: o, subjectName: t, subjectCode: n }, () => {
                        console.debug("click"), r.setAttribute("type", "submit"), r.dispatchEvent(new MouseEvent("click"));
                    });
            });
    }
})();
