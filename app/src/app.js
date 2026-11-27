// 应用启动入口：状态管理、过滤器联动与 Hash 路由调度
import { VERIFIED_DEALS } from './data/verifiedDeals.js';
import { enrichDealsWithSignals, summarizeMetrics } from './logic/priceSignals.js';
import {
  DEFAULT_FILTERS,
  extractFilterOptions,
  filterAndSortDeals,
  hasActiveFilters,
} from './logic/dealFiltering.js';
import { mountToolbar, renderKpiStrip, syncToolbarState } from './ui/renderToolbar.js';
import { renderDealGrid } from './ui/renderDealGrid.js';

const deals = enrichDealsWithSignals(VERIFIED_DEALS);
const metrics = summarizeMetrics(deals);
const filterOptions = extractFilterOptions(deals);
const dealById = new Map(deals.map((d) => [d.id, d]));

const kpiEl = document.getElementById('pl-kpi-strip');
const toolbarEl = document.getElementById('pl-toolbar');
const metaEl = document.getElementById('pl-results-meta');
const gridEl = document.getElementById('pl-deal-grid');
const modalRoot = document.getElementById('pl-modal-root');

let filters = { ...DEFAULT_FILTERS };
let modalLoader = null;

function loadModalRenderer() {
  if (!modalLoader) {
    modalLoader = import('./ui/renderDealModal.js');
  }
  return modalLoader;
}

function parseHashState() {
  const hash = window.location.hash || '#/';
  if (hash.startsWith('#/deal/')) {
    return { dealId: decodeURIComponent(hash.slice('#/deal/'.length)) };
  }
  const qIndex = hash.indexOf('?');
  if (qIndex !== -1) {
    const params = new URLSearchParams(hash.slice(qIndex + 1));
    const next = { ...DEFAULT_FILTERS };
    if (params.get('category') && filterOptions.categories.includes(params.get('category'))) {
      next.category = params.get('category');
    }
    if (params.get('store') && filterOptions.stores.includes(params.get('store'))) {
      next.store = params.get('store');
    }
    if (params.get('verdict')) next.verdict = params.get('verdict');
    if (params.get('q')) next.query = params.get('q');
    return { filtersFromUrl: next, dealId: null };
  }
  return { dealId: null };
}

function updateGridAndToolbar() {
  const visible = filterAndSortDeals(deals, filters);
  syncToolbarState(
    toolbarEl,
    metaEl,
    filters,
    visible.length,
    deals.length,
    hasActiveFilters(filters),
    resetAllFilters,
  );
  renderDealGrid(gridEl, visible, openDealById, resetAllFilters);
}

function resetAllFilters() {
  filters = { ...DEFAULT_FILTERS };
  if (window.location.hash.startsWith('#/?')) {
    history.replaceState(null, '', '#/');
  }
  updateGridAndToolbar();
}

function openDealById(dealId) {
  const target = dealById.get(dealId);
  if (!target) return;
  if (window.location.hash !== `#/deal/${dealId}`) {
    window.location.hash = `#/deal/${dealId}`;
  }
  loadModalRenderer().then(({ renderDealModal }) => {
    renderDealModal(modalRoot, target, closeModal, openDealById);
  });
}

function closeModal() {
  if (modalLoader) {
    modalLoader.then(({ renderDealModal }) => renderDealModal(modalRoot, null, closeModal, openDealById));
  } else {
    modalRoot.hidden = true;
    modalRoot.innerHTML = '';
  }
  if (window.location.hash.startsWith('#/deal/')) {
    history.replaceState(null, '', '#/');
  }
}

function handleHashChange() {
  const parsed = parseHashState();
  if (parsed.filtersFromUrl) {
    filters = parsed.filtersFromUrl;
    updateGridAndToolbar();
  }
  if (parsed.dealId && dealById.has(parsed.dealId)) {
    openDealById(parsed.dealId);
  } else if (!modalRoot.hidden) {
    closeModal();
  }
}

function bootstrap() {
  const initial = parseHashState();
  if (initial.filtersFromUrl) {
    filters = initial.filtersFromUrl;
  }

  renderKpiStrip(kpiEl, metrics);
  mountToolbar(toolbarEl, filterOptions, filters, (patch) => {
    filters = { ...filters, ...patch };
    updateGridAndToolbar();
  });
  updateGridAndToolbar();

  if (initial.dealId && dealById.has(initial.dealId)) {
    openDealById(initial.dealId);
  }

  window.addEventListener('hashchange', handleHashChange);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modalRoot.hidden) {
      closeModal();
    }
  });
}

bootstrap();
