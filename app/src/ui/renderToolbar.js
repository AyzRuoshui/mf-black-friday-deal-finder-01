// 顶栏 KPI 摘要、搜索框、快捷品类标签与筛选工具栏渲染

function escapeAttr(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

/**
 * 渲染头部 KPI 统计胶囊
 * @param {HTMLElement} container
 * @param {object} metrics
 */
export function renderKpiStrip(container, metrics) {
  container.innerHTML = `
    <span class="pl-kpi-pill"><strong>${metrics.totalDeals}</strong> Verified Deals</span>
    <span class="pl-kpi-pill"><strong>${metrics.allTimeLows}</strong> All-Time Lows</span>
    <span class="pl-kpi-pill">Up to <strong>${metrics.maxDiscount}%</strong> Off</span>
    <span class="pl-kpi-pill"><strong>${metrics.multiStoreGroups}</strong> Cross-Store Matches</span>
  `;
}

/**
 * 初始化工具栏 DOM 结构并绑定事件（仅挂载一次，避免输入失焦）
 * @param {HTMLElement} container
 * @param {{categories: string[], stores: string[]}} options
 * @param {object} initialFilters
 * @param {(patch: object) => void} onChange
 */
export function mountToolbar(container, options, initialFilters, onChange) {
  const storeOptions = options.stores
    .map((s) => `<option value="${escapeAttr(s)}">${s === 'All' ? 'All Stores' : escapeAttr(s)}</option>`)
    .join('');

  const catButtons = options.categories
    .map((c) => `<button type="button" class="pl-cat-btn" data-category="${escapeAttr(c)}">${escapeAttr(c)}</button>`)
    .join('');

  container.innerHTML = `
    <div class="pl-controls-row">
      <div class="pl-search-wrap">
        <svg class="pl-search-icon" viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="9" cy="9" r="6"/>
          <path d="M13.5 13.5L17 17" stroke-linecap="round"/>
        </svg>
        <input id="pl-search-input" class="pl-input" type="search" placeholder="Search product, brand, store, or spec..." value="${escapeAttr(initialFilters.query)}" aria-label="Search deals">
      </div>
      <select id="pl-store-select" class="pl-select" aria-label="Filter by store">${storeOptions}</select>
      <select id="pl-discount-select" class="pl-select" aria-label="Filter by minimum discount">
        <option value="0">Any Discount</option>
        <option value="15">15%+ Off</option>
        <option value="30">30%+ Off</option>
        <option value="45">45%+ Off</option>
      </select>
      <select id="pl-verdict-select" class="pl-select" aria-label="Filter by deal verdict">
        <option value="all">All Verdicts</option>
        <option value="low">All-Time Low Only</option>
        <option value="strong">Strong Deal Only</option>
        <option value="routine">Routine / Compare First</option>
      </select>
      <select id="pl-sort-select" class="pl-select" aria-label="Sort deals">
        <option value="value">Sort: Best Value Score</option>
        <option value="discount">Sort: Highest % Off</option>
        <option value="savings">Sort: Biggest $ Saved</option>
        <option value="price_asc">Sort: Lowest Price</option>
      </select>
    </div>
    <div class="pl-cat-row" role="group" aria-label="Category filter">${catButtons}</div>
  `;

  const searchInput = container.querySelector('#pl-search-input');
  const storeSelect = container.querySelector('#pl-store-select');
  const discountSelect = container.querySelector('#pl-discount-select');
  const verdictSelect = container.querySelector('#pl-verdict-select');
  const sortSelect = container.querySelector('#pl-sort-select');

  searchInput.addEventListener('input', (e) => onChange({ query: e.target.value }));
  storeSelect.addEventListener('change', (e) => onChange({ store: e.target.value }));
  discountSelect.addEventListener('change', (e) => onChange({ minDiscount: Number(e.target.value) }));
  verdictSelect.addEventListener('change', (e) => onChange({ verdict: e.target.value }));
  sortSelect.addEventListener('change', (e) => onChange({ sort: e.target.value }));

  container.querySelectorAll('.pl-cat-btn').forEach((btn) => {
    btn.addEventListener('click', () => onChange({ category: btn.dataset.category }));
  });
}

/**
 * 同步工具栏控件状态与筛选结果摘要栏
 * @param {HTMLElement} toolbarEl
 * @param {HTMLElement} metaEl
 * @param {object} filters
 * @param {number} matchCount
 * @param {number} totalCount
 * @param {boolean} isFiltered
 * @param {() => void} onReset
 */
export function syncToolbarState(toolbarEl, metaEl, filters, matchCount, totalCount, isFiltered, onReset) {
  const searchInput = toolbarEl.querySelector('#pl-search-input');
  if (searchInput && searchInput.value !== filters.query) {
    searchInput.value = filters.query;
  }
  toolbarEl.querySelector('#pl-store-select').value = filters.store;
  toolbarEl.querySelector('#pl-discount-select').value = String(filters.minDiscount);
  toolbarEl.querySelector('#pl-verdict-select').value = filters.verdict;
  toolbarEl.querySelector('#pl-sort-select').value = filters.sort;

  toolbarEl.querySelectorAll('.pl-cat-btn').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.category === filters.category);
  });

  const activeParts = [];
  if (filters.category !== 'All') activeParts.push(`Category: ${filters.category}`);
  if (filters.store !== 'All') activeParts.push(`Store: ${filters.store}`);
  if (filters.minDiscount > 0) activeParts.push(`${filters.minDiscount}%+ Off`);
  if (filters.verdict !== 'all') activeParts.push(`Verdict: ${filters.verdict}`);
  if (filters.query.trim()) activeParts.push(`Query: "${filters.query.trim()}"`);

  const summary = activeParts.length
    ? `Showing <strong>${matchCount}</strong> of ${totalCount} checked deals (${activeParts.map(escapeAttr).join(' · ')})`
    : `Showing all <strong>${matchCount}</strong> verified Black Friday 2026 deals · Checked 2026-11-27 UTC`;

  metaEl.innerHTML = `
    <div>${summary}</div>
    ${isFiltered ? '<button type="button" id="pl-reset-btn" class="pl-reset-btn">Reset all filters</button>' : ''}
  `;

  const resetBtn = metaEl.querySelector('#pl-reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', onReset);
  }
}
