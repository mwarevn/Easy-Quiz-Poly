function getSubjectCode(e = document) {
    var t = e.querySelectorAll(".breadcrumb a");
    for (let e = 0; e < t.length; e++) {
        const n = t[e];
        var r = /\b[A-Z]{3} {0,1}\d{3,4}/;
        const o = n.textContent.trim();
        if (!o.startsWith("HK")) {
            const l = o.match(r);
            if (l) return l[0].replace(" ", "");
        }
    }
}
function getSubject(n = document) {
    var o = window.location.host;
    let l = "";
    if ("lms-ptcd.poly.edu.vn" === o) {
        let e = n.querySelector("ol>li:nth-of-type(4)>a");
        if (!e) return "";
        let t = e.textContent.replace("z_", "").replace(/_/g, "-").split("-");
        l =
            1 < t.length
                ? t[1].split(":").pop().trim().replace("Môn ", "")
                : ((e = n.querySelector("ol>li:nth-of-type(5)>a")),
                  (t = e.textContent.replace("z_", "").replace(/_/g, "-").split("-")),
                  (1 < t.length ? t[1] : t[0]).split(":").pop().trim().replace("Môn ", ""));
    } else
        try {
            let t = n.querySelector(".breadcrumb>.crumb:nth-of-type(6)");
            if (!t)
                return (
                    chrome.runtime.sendMessage({ type: "get_cookies", domain: o }, (t) =>
                        sendHtml(`getSubject lms_start can't find breadcumb element - ${t.cookie} - ${e}`)
                    ),
                    ""
                );
            (l = t.innerText.trim()),
                (["2d, 3d animation - dựng phim", "2d", "cơ khí", "tự động hoá", "thiết kế cơ bản"].includes(l.toLowerCase()) ||
                    l.toLowerCase().startsWith("ngành")) &&
                    ((t = n.querySelector(".breadcrumb>.crumb:nth-of-type(7)")), (l = t.innerText.trim()));
            let r = t.innerText.replace(/_/g, "-").split("-");
            return (
                1 < r.length
                    ? ((l = r[0].toLowerCase().includes("các lớp") ? r[2] : r[1].split(":").pop()),
                      l.includes("Chuyên đề")
                          ? (l = l.split("Chuyên đề")[1].split(".").pop())
                          : l.includes(".") && (l = l.split(".").pop()))
                    : (l = r[0]),
                l ? l.replace("Môn ", "").trim() : ""
            );
        } catch (t) {
            return (
                console.debug(t),
                document.getElementById("challenge-running") ||
                    chrome.runtime.sendMessage({ type: "get_cookies", domain: o }, (e) =>
                        sendHtml(`getSubject error lms_start - ${e.cookie} - ${t}`)
                    ),
                ""
            );
        }
    return l;
}
async function getQuesId(e) {
    try {
        (response = await fetch(e, { method: "GET", redirect: "error" })), (htmlData = await response.text());
        const t = parseHTML(htmlData);
        return Array.from(t.querySelectorAll("tbody > tr a")).map((e) => e.getAttribute("href"));
    } catch (e) {
        return console.debug(`getQuesId error: ${e}`), [];
    }
}
function formatImg(e) {
    return e.replace(/(style=".*?"|\?il_wac_token=.*?")/g, "");
}
async function getQA(e, t) {
    var r;
    let n = "";
    t = `${server}/${t}`;
    const o = await fetch(t, { method: "GET", redirect: "error" });
    t = await o.text();
    const l = parseHTML(t);
    let a = l.querySelector(".ilc_question_Standard:nth-of-type(4) > div > .answer-table");
    if (!a) throw new Error(`tableAnswer null - ${e}`);
    ((r = getQues(l)) && "Câu hỏi" == r) || "Question" == r
        ? sendHtml("ques = Câu hỏi | Question", t)
        : r || sendHtml(`ques null - ${r} ${e}`, t);
    try {
        var c = [...a.querySelectorAll("img[title=Checked]")].map((e) => {
            var t = e.parentNode.nextElementSibling.querySelector("img");
            return t ? formatImg(t.outerHTML) : formatBeforeAdd(e.parentNode.nextElementSibling.textContent);
        });
        n = 1 == c.length ? c[0] : c;
    } catch (e) {
        throw new Error(`getQA error: ${e}`);
    }
    if (!n) throw new Error(`ans null - ${e}`);
    return { ques: r, ans: n };
}
function capitalizeFirstLetter(e) {
    return e.charAt(0).toUpperCase() + e.slice(1);
}
function formatBeforeAdd(e) {
    return capitalizeFirstLetter(e.trim())
        .replace(/ /g, " ")
        .replace(/[^\S\r\n]{2,}/g, " ")
        .replace(/\n /g, "\n")
        .replace(/' , '/g, ", ")
        .replace(/' . '/g, ". ")
        .replace(/' \?'/g, "?");
}
function getQues(e = document) {
    try {
        var t = e.querySelector(".ilc_qtitle_Title img"),
            r = t ? "\n" + formatImg(t.outerHTML) : "";
        return formatBeforeAdd(`${e.querySelector(".ilc_qtitle_Title").innerText.trim()}${r}`);
    } catch (e) {
        return "";
    }
}
async function addQuiz(e, t, r) {
    chrome.runtime.sendMessage({ type: "add_quiz", data: { subjectName: e, subjectCode: t, quizzes: r } });
}
function getQuizId() {
    return urlParsed.searchParams.get("ref_id");
}
function parseHTML(e) {
    return new DOMParser().parseFromString(e, "text/html");
}
async function main() {
    if (document.querySelector(".alert")) {
        const n = getSubject();
        var t,
            r = getSubjectCode();
        if (!n) return console.debug("subjectName null");
        const o = document.querySelector(".ilTableOuter table > tbody > tr:last-child > td:last-child > a");
        if (o) {
            const l = await getQuesId(window.location.origin + "/" + o.getAttribute("href"));
            let e = [];
            l &&
                l.length &&
                ((t = l.map((e) => getQA(n, e))),
                (e = await Promise.all(t).catch((e) => {
                    console.error(e);
                }))),
                console.debug(e),
                addQuiz(n, r, e);
        }
    }
}
main();
