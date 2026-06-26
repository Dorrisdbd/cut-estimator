const rows = [
  { time: "06/25 16:31:30", platform: "KMS", product: "商品 1", delta: 3, total: 2066, inventory: 0, channel: "渠道 1 · BOYNEXTDOOR", tag: "正常", type: "green", excluded: false },
  { time: "06/25 15:49:46", platform: "KMS", product: "商品 1", delta: 36, total: 2063, inventory: 0, channel: "渠道 1 · BOYNEXTDOOR", tag: "正常", type: "green", excluded: false },
  { time: "06/25 15:32:41", platform: "KMS", product: "商品 2", delta: 2, total: 2027, inventory: 0, channel: "渠道 2 · 特典 A", tag: "正常", type: "green", excluded: false },
  { time: "06/25 15:19:10", platform: "KMS", product: "商品 1", delta: 80, total: 2025, inventory: 0, channel: "渠道 1 · BOYNEXTDOOR", tag: "疑似大单", type: "red", excluded: false },
  { time: "06/25 15:15:10", platform: "KMS", product: "商品 2", delta: 14, total: 1945, inventory: 0, channel: "渠道 2 · 特典 A", tag: "正常", type: "green", excluded: false },
  { time: "06/25 14:32:27", platform: "KMS", product: "商品 1", delta: 9, total: 1931, inventory: 0, channel: "渠道 1 · BOYNEXTDOOR", tag: "正常", type: "green", excluded: false },
  { time: "06/25 14:18:40", platform: "KMS", product: "商品 2", delta: -14, total: 1922, inventory: 0, channel: "渠道 2 · 特典 A", tag: "退单回退", type: "orange", excluded: false },
  { time: "06/25 13:58:02", platform: "KMS", product: "商品 1", delta: 24, total: 1936, inventory: 0, channel: "渠道 1 · BOYNEXTDOOR", tag: "重复回传", type: "purple", excluded: false },
  { time: "06/25 13:57:41", platform: "KMS", product: "商品 1", delta: 24, total: 1912, inventory: 0, channel: "渠道 1 · BOYNEXTDOOR", tag: "重复回传", type: "purple", excluded: false },
  { time: "06/25 13:20:11", platform: "KTown4", product: "商品 1", delta: 52, total: 1416, inventory: 120, channel: "KTown4 · CN", tag: "正常", type: "green", excluded: false },
  { time: "06/25 12:44:10", platform: "KTown4", product: "商品 2", delta: -52, total: 1364, inventory: 172, channel: "KTown4 · CN", tag: "退单回退", type: "orange", excluded: false },
  { time: "06/25 12:18:22", platform: "Kmonster", product: "商品 1", delta: 111, total: 988, inventory: 0, channel: "Kmonster · JP", tag: "疑似卡单", type: "red", excluded: false },
  { time: "06/25 11:42:03", platform: "IminiTv", product: "商品 3", delta: 18, total: 762, inventory: 0, channel: "IminiTv · CN", tag: "正常", type: "green", excluded: false },
];

const state = {
  view: "overview",
  sort: "time",
  hideExcluded: false,
  deleteInvalid: false,
  platform: "KMS",
  products: new Set(["商品 1", "商品 2"]),
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

function formatNumber(value) {
  return new Intl.NumberFormat("zh-CN").format(value);
}

function visibleRows() {
  return rows
    .filter((row) => row.platform === state.platform)
    .filter((row) => state.products.has(row.product))
    .filter((row) => !state.hideExcluded || !row.excluded)
    .filter((row) => !state.deleteInvalid || row.type !== "orange")
    .sort((a, b) => {
      if (state.sort === "growth") return Math.abs(b.delta) - Math.abs(a.delta);
      return rows.indexOf(a) - rows.indexOf(b);
    });
}

function updateSalesSummary(displayRows) {
  const latest = displayRows[0];
  const total = latest?.total || 0;
  const inflated = rows
    .filter((row) => row.platform === state.platform)
    .filter((row) => row.type === "red" || row.type === "purple")
    .reduce((sum, row) => sum + Math.max(row.delta, 0), 0);
  const valid = Math.max(total - inflated, 0);
  const drawCount = 30;

  document.querySelector("#totalSales").textContent = formatNumber(total);
  document.querySelector("#inflatedSales").textContent = formatNumber(inflated);
  document.querySelector("#validSales").textContent = formatNumber(valid);
  document.querySelector("#computedCut").textContent = total ? (valid / drawCount).toFixed(1) : "0.0";
  document.querySelector("#drawCount").textContent = drawCount;
  document.querySelector("#lastUpdated").textContent = latest?.time || "--";
}

function renderRows() {
  const displayRows = visibleRows();

  salesBody.innerHTML = displayRows
    .map((row, index) => {
      const sign = row.delta > 0 ? "+" : "";
      return `
        <tr class="${row.excluded ? "excluded" : ""}">
          <td><input type="checkbox" data-index="${rows.indexOf(row)}" ${row.excluded ? "checked" : ""} aria-label="排除第 ${index + 1} 条记录" /></td>
          <td>${index + 1}</td>
          <td>${row.time}</td>
          <td>${row.platform}</td>
          <td>${row.product}</td>
          <td>${sign}${row.delta}</td>
          <td>${formatNumber(row.total)}</td>
          <td>${row.inventory}</td>
          <td>${row.channel}</td>
          <td><span class="tag ${row.type}">${row.tag}</span></td>
        </tr>
      `;
    })
    .join("");

  if (!displayRows.length) {
    salesBody.innerHTML = `<tr><td colspan="10" class="empty-cell">当前平台/商品暂无记录</td></tr>`;
  }

  updateSalesSummary(displayRows);
}

function setView(view) {
  state.view = view;
  document.querySelector(".dashboard-summary")?.classList.toggle("hidden", !["overview", "sales"].includes(view));
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

document.querySelectorAll(".pill-tab").forEach((button) => {
  button.addEventListener("click", () => {
    state.platform = button.dataset.platform;
    document.querySelectorAll(".pill-tab").forEach((tab) => tab.classList.toggle("active", tab === button));
    renderRows();
  });
});

document.querySelectorAll(".pill-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const product = button.dataset.product;
    if (state.products.has(product) && state.products.size > 1) {
      state.products.delete(product);
    } else {
      state.products.add(product);
    }
    button.classList.toggle("active", state.products.has(product));
    renderRows();
  });
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

document.querySelector("#deleteInvalid").addEventListener("click", (event) => {
  state.deleteInvalid = !state.deleteInvalid;
  event.currentTarget.classList.toggle("active", state.deleteInvalid);
  renderRows();
});

document.querySelector("#autoRefresh").addEventListener("click", (event) => {
  event.currentTarget.classList.toggle("active");
});

document.querySelector("#exportExcel").addEventListener("click", (event) => {
  event.currentTarget.textContent = "已生成";
  setTimeout(() => {
    event.currentTarget.textContent = "导出 Excel";
  }, 1200);
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
setView("overview");
