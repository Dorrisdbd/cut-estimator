const rows = [
  { time: "06/25 16:31:30", delta: 3, total: 2066, channel: "KMS · 商品 1", tag: "正常", type: "green", excluded: false },
  { time: "06/25 15:49:46", delta: 36, total: 2063, channel: "KMS · 商品 1", tag: "正常", type: "green", excluded: false },
  { time: "06/25 15:32:41", delta: 2, total: 2027, channel: "KMS · 商品 1", tag: "正常", type: "green", excluded: false },
  { time: "06/25 15:19:10", delta: 80, total: 2025, channel: "KMS · 商品 1", tag: "疑似大单", type: "red", excluded: false },
  { time: "06/25 15:15:10", delta: 14, total: 1945, channel: "KMS · 商品 1", tag: "正常", type: "green", excluded: false },
  { time: "06/25 14:32:27", delta: 9, total: 1931, channel: "KMS · 商品 1", tag: "正常", type: "green", excluded: false },
  { time: "06/25 14:18:40", delta: -14, total: 1922, channel: "KMS · 商品 1", tag: "退单回退", type: "orange", excluded: false },
  { time: "06/25 13:58:02", delta: 24, total: 1936, channel: "KMS · 商品 1", tag: "重复回传", type: "purple", excluded: false },
  { time: "06/25 13:57:41", delta: 24, total: 1912, channel: "KMS · 商品 1", tag: "重复回传", type: "purple", excluded: false },
];

const state = {
  view: "overview",
  sort: "time",
  hideExcluded: false,
};

const sectionMap = {
  overview: ["overview"],
  sales: ["sales"],
  factors: ["factors"],
  market: ["market"],
  model: ["model"],
};

const salesBody = document.querySelector("#salesBody");
const ownedInput = document.querySelector("#ownedInput");
const addMore = document.querySelector("#addMore");
const balancedCut = document.querySelector("#balancedCut");

function renderRows() {
  const sortedRows = [...rows]
    .filter((row) => !state.hideExcluded || !row.excluded)
    .sort((a, b) => {
      if (state.sort === "growth") return Math.abs(b.delta) - Math.abs(a.delta);
      return rows.indexOf(a) - rows.indexOf(b);
    });

  salesBody.innerHTML = sortedRows
    .map((row, index) => {
      const sign = row.delta > 0 ? "+" : "";
      return `
        <tr class="${row.excluded ? "excluded" : ""}">
          <td><input type="checkbox" data-index="${rows.indexOf(row)}" ${row.excluded ? "checked" : ""} aria-label="排除第 ${index + 1} 条记录" /></td>
          <td>${index + 1}</td>
          <td>${row.time}</td>
          <td>${sign}${row.delta}</td>
          <td>${row.total}</td>
          <td>${row.channel}</td>
          <td><span class="tag ${row.type}">${row.tag}</span></td>
        </tr>
      `;
    })
    .join("");
}

function setView(view) {
  state.view = view;
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === view);
  });

  document.querySelectorAll(".view-section").forEach((section) => {
    const isVisible = sectionMap[view].includes(section.dataset.section);
    section.classList.toggle("active", isVisible);
  });
}

function updateAdvice() {
  const owned = Number(ownedInput.value || 0);
  const target = Number(balancedCut.textContent);
  addMore.textContent = Math.max(target - owned, 0);
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

document.querySelector("#sortTime").addEventListener("click", () => {
  state.sort = "time";
  document.querySelector("#sortTime").classList.add("active");
  document.querySelector("#sortGrowth").classList.remove("active");
  renderRows();
});

document.querySelector("#sortGrowth").addEventListener("click", () => {
  state.sort = "growth";
  document.querySelector("#sortGrowth").classList.add("active");
  document.querySelector("#sortTime").classList.remove("active");
  renderRows();
});

document.querySelector("#hideExcluded").addEventListener("click", (event) => {
  state.hideExcluded = !state.hideExcluded;
  event.currentTarget.classList.toggle("active", state.hideExcluded);
  renderRows();
});

salesBody.addEventListener("change", (event) => {
  const checkbox = event.target.closest("input[type='checkbox']");
  if (!checkbox) return;
  rows[Number(checkbox.dataset.index)].excluded = checkbox.checked;
  renderRows();
});

ownedInput.addEventListener("input", updateAdvice);

renderRows();
updateAdvice();
