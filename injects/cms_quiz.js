function addAnswered([e, t]) {
	var r = t.querySelector("div.incorrect"),
		t = t.querySelector("div.correct");
	r && getValue(e, r, "incorrect"), t && getValue(e, t, "correct");
}
function getValue(e, t, r) {
	t = t.querySelector("input").getAttribute("value");
	const n = document.createElement("div");
	n.setAttribute("class", "indicator-container"),
		(n.innerHTML = `<span class='status ${r}' data-tooltip="This answer is ${r}.">
    <span class="sr">${r}</span><span class="status-icon" aria-hidden="true">${t} </span>
  </span>`),
		e.firstElementChild.appendChild(n);
}
(() => {
	const e = Array.from(document.querySelectorAll("div.poly")),
		r = Array.from(document.querySelectorAll("div.wrapper-problem-response"));
	if (e.length !== r.length) throw new Error("quesel and ansel not compare");
	let t = e.map((e, t) => {
		return [e, r[t]];
	});
	t.forEach(addAnswered);
	const n = document.querySelector("button.submit");
	setInterval(() => {
		n && n.removeAttribute("disabled");
	}, 2e3);
})();
