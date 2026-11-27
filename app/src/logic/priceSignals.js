// 价格真伪计算与同款跨店比价分析逻辑

const VERDICT_BONUS = {
  low: 25,
  strong: 14,
  routine: 0,
};

/**
 * 格式化美元金额，确保带千分位与两位小数
 * @param {number} value
 * @returns {string}
 */
export function formatUsd(value) {
  return '$' + value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * 为全部商品注入精确折扣率、节省金额、综合性价比分以及跨店比价结论
 * @param {Array} deals
 * @returns {Array}
 */
export function enrichDealsWithSignals(deals) {
  const baseEnriched = deals.map((deal) => {
    const savings = Number((deal.usualPrice - deal.salePrice).toFixed(2));
    const discountPct = deal.usualPrice > 0
      ? Math.round((savings / deal.usualPrice) * 100)
      : 0;
    return { ...deal, savings, discountPct };
  });

  const groups = new Map();
  for (const deal of baseEnriched) {
    if (!groups.has(deal.productGroup)) {
      groups.set(deal.productGroup, []);
    }
    groups.get(deal.productGroup).push(deal);
  }

  return baseEnriched.map((deal) => {
    const peers = groups.get(deal.productGroup) || [deal];
    const sortedPeers = [...peers].sort((a, b) => a.salePrice - b.salePrice);
    const lowestPeer = sortedPeers[0];
    const deltaFromLowest = Number((deal.salePrice - lowestPeer.salePrice).toFixed(2));

    let compareText = '';
    let isLowestInGroup = false;

    if (peers.length > 1) {
      if (deltaFromLowest === 0) {
        const higherPeer = sortedPeers.find((p) => p.salePrice > deal.salePrice);
        isLowestInGroup = true;
        if (higherPeer) {
          const lead = Number((higherPeer.salePrice - deal.salePrice).toFixed(2));
          compareText = `Lowest across ${peers.length} stores · Beats ${higherPeer.store} by ${formatUsd(lead)}`;
        } else {
          compareText = `Tied lowest across ${peers.length} stores (${sortedPeers.map((p) => p.store).join(' & ')})`;
        }
      } else {
        compareText = `+${formatUsd(deltaFromLowest)} vs ${lowestPeer.store} (${formatUsd(lowestPeer.salePrice)})`;
      }
    }

    const penalty = deltaFromLowest > 0 ? Math.min(20, Math.round(deltaFromLowest / 5)) : 0;
    const valueScore = Math.max(0, Math.min(100, deal.discountPct + (VERDICT_BONUS[deal.verdictCode] ?? 0) - penalty));

    return {
      ...deal,
      peerCount: peers.length,
      peers: sortedPeers,
      isLowestInGroup,
      deltaFromLowest,
      compareText,
      valueScore,
    };
  });
}

/**
 * 计算顶栏 KPI 统计摘要
 * @param {Array} enrichedDeals
 */
export function summarizeMetrics(enrichedDeals) {
  const allTimeLows = enrichedDeals.filter((d) => d.verdictCode === 'low').length;
  const maxDiscount = enrichedDeals.reduce((max, d) => Math.max(max, d.discountPct), 0);
  const multiStoreGroups = new Set(
    enrichedDeals.filter((d) => d.peerCount > 1).map((d) => d.productGroup),
  ).size;

  return {
    totalDeals: enrichedDeals.length,
    allTimeLows,
    maxDiscount,
    multiStoreGroups,
  };
}
