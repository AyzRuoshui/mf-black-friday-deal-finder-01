// 多维过滤、关键词检索与排序引擎

export const DEFAULT_FILTERS = {
  query: '',
  category: 'All',
  store: 'All',
  minDiscount: 0,
  verdict: 'all',
  sort: 'value',
};

/**
 * 提取去重后的有序分类与商店选项
 * @param {Array} deals
 */
export function extractFilterOptions(deals) {
  const categories = ['All', ...new Set(deals.map((d) => d.category))];
  const stores = ['All', ...new Set(deals.map((d) => d.store))];
  return { categories, stores };
}

/**
 * 判断当前是否激活了任何非默认过滤条件
 * @param {object} filters
 * @returns {boolean}
 */
export function hasActiveFilters(filters) {
  return Boolean(
    filters.query.trim() ||
    filters.category !== 'All' ||
    filters.store !== 'All' ||
    filters.minDiscount > 0 ||
    filters.verdict !== 'all' ||
    filters.sort !== 'value',
  );
}

/**
 * 执行过滤与排序，返回匹配商品数组
 * @param {Array} deals
 * @param {object} filters
 * @returns {Array}
 */
export function filterAndSortDeals(deals, filters) {
  const needle = filters.query.trim().toLowerCase();

  const filtered = deals.filter((deal) => {
    if (filters.category !== 'All' && deal.category !== filters.category) return false;
    if (filters.store !== 'All' && deal.store !== filters.store) return false;
    if (deal.discountPct < filters.minDiscount) return false;
    if (filters.verdict !== 'all' && deal.verdictCode !== filters.verdict) return false;

    if (needle) {
      const haystack = `${deal.title} ${deal.brand} ${deal.category} ${deal.store} ${deal.specs} ${deal.verdictLabel} ${deal.sourceName}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    return true;
  });

  const sorted = [...filtered];
  sorted.sort((a, b) => {
    if (filters.sort === 'discount') return b.discountPct - a.discountPct || b.savings - a.savings;
    if (filters.sort === 'price_asc') return a.salePrice - b.salePrice;
    if (filters.sort === 'savings') return b.savings - a.savings;
    return b.valueScore - a.valueScore || b.discountPct - a.discountPct;
  });

  return sorted;
}
