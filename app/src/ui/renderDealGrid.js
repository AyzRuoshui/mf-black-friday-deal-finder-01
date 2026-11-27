// 高信息密度商品网格与共享视觉徽章、内联 SVG 图标工具
import { formatUsd } from '../logic/priceSignals.js';

const STORE_BADGE_CLASS = {
  'Amazon': 'pl-store-amazon',
  'Walmart': 'pl-store-walmart',
  'Best Buy': 'pl-store-bestbuy',
  'Target': 'pl-store-target',
  'B&H Photo': 'pl-store-bh',
  'PlayStation Direct': 'pl-store-ps',
};

const VERDICT_CLASS = {
  low: 'pl-verdict-low',
  strong: 'pl-verdict-strong',
  routine: 'pl-verdict-routine',
};

const CATEGORY_PATHS = {
  'Audio': '<path d="M4 13a8 8 0 0 1 16 0v3a2 2 0 0 1-2 2h-1.5v-5H19M4 13v3a2 2 0 0 0 2 2h1.5v-5H5"/>',
  'Laptops & PC': '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 19h20"/>',
  'TVs & Displays': '<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 20h8M12 17v3"/>',
  'Gaming': '<rect x="3" y="7" width="18" height="10" rx="4"/><path d="M7 12h4M9 10v4M15.5 11h.01M17.5 13h.01"/>',
  'Smart Home': '<path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  'Toys & LEGO': '<rect x="4" y="8" width="16" height="11" rx="2"/><path d="M7 8V5h3v3M14 8V5h3v3"/>',
};

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function getStoreBadgeClass(store) {
  return STORE_BADGE_CLASS[store] || '';
}

export function getVerdictBadgeClass(verdictCode) {
  return VERDICT_CLASS[verdictCode] || 'pl-verdict-routine';
}

export function getCategoryIconSvg(category) {
  const path = CATEGORY_PATHS[category] || '<circle cx="12" cy="12" r="8"/>';
  return `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}

/**
 * 渲染商品卡片网格或空状态引导
 * @param {HTMLElement} container
 * @param {Array} deals
 * @param {(dealId: string) => void} onOpenDetail
 * @param {() => void} onReset
 */
export function renderDealGrid(container, deals, onOpenDetail, onReset) {
  if (!deals.length) {
    container.innerHTML = `
      <div class="pl-empty">
        <h3>No deals match your current filters</h3>
        <p>Try clearing your search term or widening the store and discount thresholds.</p>
        <button type="button" id="pl-empty-reset" class="pl-reset-btn">Reset filters</button>
      </div>
    `;
    const btn = container.querySelector('#pl-empty-reset');
    if (btn) btn.addEventListener('click', onReset);
    return;
  }

  container.innerHTML = deals
    .map((deal) => {
      const storeClass = getStoreBadgeClass(deal.store);
      const verdictClass = getVerdictBadgeClass(deal.verdictCode);
      const compareRow = deal.compareText
        ? `<div class="pl-compare-chip ${deal.isLowestInGroup ? 'is-winner' : ''}">${escapeHtml(deal.compareText)}</div>`
        : '';

      return `
        <article class="pl-card" data-deal-id="${escapeHtml(deal.id)}">
          <div class="pl-card-top">
            <span class="pl-cat-tag">${getCategoryIconSvg(deal.category)} ${escapeHtml(deal.category)}</span>
            <span class="pl-store-badge ${storeClass}">${escapeHtml(deal.store)}</span>
          </div>

          <div>
            <h2 class="pl-card-title">${escapeHtml(deal.title)}</h2>
            <div class="pl-card-spec">${escapeHtml(deal.specs)}</div>
          </div>

          <div class="pl-price-row">
            <span class="pl-price-sale">${formatUsd(deal.salePrice)}</span>
            <span class="pl-price-usual">${formatUsd(deal.usualPrice)}</span>
            <span class="pl-discount-pill">${deal.discountPct}% OFF · Save ${formatUsd(deal.savings)}</span>
          </div>

          <div class="pl-verdict-row">
            <span class="pl-verdict-badge ${verdictClass}">${escapeHtml(deal.verdictLabel)}</span>
            <div class="pl-verdict-note">${escapeHtml(deal.verdictReason)}</div>
          </div>

          ${compareRow}

          <div class="pl-provenance">
            <span>Checked ${escapeHtml(deal.checkedAt)}</span>
            <span>Source: ${escapeHtml(deal.sourceName)}</span>
          </div>

          <div class="pl-card-actions">
            <a class="pl-btn" href="#/deal/${escapeHtml(deal.id)}" data-detail-id="${escapeHtml(deal.id)}">Evidence &amp; Compare</a>
            <a class="pl-btn pl-btn-primary" href="${escapeHtml(deal.storeUrl)}" target="_blank" rel="noopener noreferrer">Go to Store &#8599;</a>
          </div>
        </article>
      `;
    })
    .join('');

  container.querySelectorAll('[data-detail-id]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      onOpenDetail(link.dataset.detailId);
    });
  });
}
