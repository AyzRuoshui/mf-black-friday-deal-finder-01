// 核价证据详情面板（按需动态 import() 加载，支持 #/deal/<id> 路由）
import { formatUsd } from '../logic/priceSignals.js';
import {
  escapeHtml,
  getCategoryIconSvg,
  getStoreBadgeClass,
  getVerdictBadgeClass,
} from './renderDealGrid.js';

/**
 * 打开商品核价证据与跨店比价详情弹窗
 * @param {HTMLElement} modalRoot
 * @param {object} deal
 * @param {() => void} onClose
 * @param {(id: string) => void} onSelectPeer
 */
export function renderDealModal(modalRoot, deal, onClose, onSelectPeer) {
  if (!deal) {
    modalRoot.hidden = true;
    modalRoot.innerHTML = '';
    return;
  }

  const peerRows = deal.peers.length > 1
    ? `
      <div class="pl-peer-box">
        <h3>Cross-Store Price Comparison (${deal.peers.length} Retailers Checked)</h3>
        <table class="pl-peer-table">
          <thead>
            <tr>
              <th>Store</th>
              <th>Sale Price</th>
              <th>Discount</th>
              <th>Verdict</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${deal.peers
              .map((peer) => {
                const isCurrent = peer.id === deal.id;
                const badgeCls = getStoreBadgeClass(peer.store);
                return `
                  <tr>
                    <td><span class="pl-store-badge ${badgeCls}">${escapeHtml(peer.store)}</span>${isCurrent ? ' (Viewing)' : ''}</td>
                    <td><strong>${formatUsd(peer.salePrice)}</strong></td>
                    <td>${peer.discountPct}% OFF</td>
                    <td>${escapeHtml(peer.verdictLabel)}</td>
                    <td>
                      ${isCurrent
                        ? `<a href="${escapeHtml(peer.storeUrl)}" target="_blank" rel="noopener noreferrer">Open Store &#8599;</a>`
                        : `<a href="#/deal/${escapeHtml(peer.id)}" data-peer-id="${escapeHtml(peer.id)}">Inspect</a>`}
                    </td>
                  </tr>
                `;
              })
              .join('')}
          </tbody>
        </table>
      </div>
    `
    : '';

  modalRoot.hidden = false;
  modalRoot.innerHTML = `
    <div class="pl-modal" role="dialog" aria-modal="true" aria-labelledby="pl-modal-title">
      <div class="pl-modal-head">
        <div>
          <div class="pl-card-top" style="justify-content:flex-start;margin-bottom:6px;">
            <span class="pl-cat-tag">${getCategoryIconSvg(deal.category)} ${escapeHtml(deal.category)}</span>
            <span class="pl-store-badge ${getStoreBadgeClass(deal.store)}">${escapeHtml(deal.store)}</span>
            <span class="pl-verdict-badge ${getVerdictBadgeClass(deal.verdictCode)}">${escapeHtml(deal.verdictLabel)}</span>
          </div>
          <h2 id="pl-modal-title" style="margin:0;font-size:1.2rem;">${escapeHtml(deal.title)}</h2>
          <div class="pl-card-spec" style="margin-top:4px;">${escapeHtml(deal.specs)}</div>
        </div>
        <button type="button" class="pl-modal-close" aria-label="Close detail dialog">&times;</button>
      </div>

      <div class="pl-modal-grid">
        <div>
          <div class="pl-stat-label">Sale Price</div>
          <div class="pl-stat-val">${formatUsd(deal.salePrice)}</div>
        </div>
        <div>
          <div class="pl-stat-label">Usual Reference</div>
          <div class="pl-stat-val" style="text-decoration:line-through;color:var(--ink-soft);">${formatUsd(deal.usualPrice)}</div>
        </div>
        <div>
          <div class="pl-stat-label">Net Savings</div>
          <div class="pl-stat-val" style="color:var(--accent);">${formatUsd(deal.savings)} (${deal.discountPct}%)</div>
        </div>
        <div>
          <div class="pl-stat-label">PriceLens Score</div>
          <div class="pl-stat-val">${deal.valueScore} / 100</div>
        </div>
      </div>

      <div class="pl-evidence-box">
        <h3>Price Verification &amp; Buyer Signal</h3>
        <p style="margin:0 0 8px;"><strong>Analysis:</strong> ${escapeHtml(deal.verdictReason)}</p>
        <p style="margin:0 0 8px;"><strong>Conditions / Fine Print:</strong> ${escapeHtml(deal.condition)}</p>
        <p style="margin:0;"><strong>Verification Audit:</strong> Checked at <code>${escapeHtml(deal.checkedAt)}</code> · Source: <a href="${escapeHtml(deal.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(deal.sourceName)} &#8599;</a></p>
      </div>

      ${peerRows}

      <div class="pl-modal-actions">
        <button type="button" class="pl-btn" style="padding:0 14px;" id="pl-modal-back">Back to All Deals</button>
        <a class="pl-btn pl-btn-primary" style="padding:0 16px;" href="${escapeHtml(deal.storeUrl)}" target="_blank" rel="noopener noreferrer">Buy at ${escapeHtml(deal.store)} &#8599;</a>
      </div>
    </div>
  `;

  modalRoot.querySelector('.pl-modal-close').addEventListener('click', onClose);
  modalRoot.querySelector('#pl-modal-back').addEventListener('click', onClose);
  modalRoot.addEventListener('click', (e) => {
    if (e.target === modalRoot) onClose();
  }, { once: true });

  modalRoot.querySelectorAll('[data-peer-id]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      onSelectPeer(el.dataset.peerId);
    });
  });
}
