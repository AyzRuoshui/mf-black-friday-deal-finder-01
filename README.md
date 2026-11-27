# PriceLens · Black Friday 2026 Deal Verifier

[![Bounty](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![Rank](https://make.fun/badge/black-friday-deal-finder-01/AyzRuoshui/mf-black-friday-deal-finder-01/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![Reward](https://make.fun/badge/black-friday-deal-finder-01/AyzRuoshui/mf-black-friday-deal-finder-01/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01)

Bounty page: https://make.fun/bounty/black-friday-deal-finder-01

## Overview

**PriceLens** is a zero-dependency static Black Friday & Cyber Monday 2026 deal finder and price-verification tool under `app/`. Every listing was verified on **2026-11-27 UTC** against live merchant pages and independent price trackers across **Amazon**, **Best Buy**, **Walmart**, **Target**, **B&H Photo**, and **PlayStation Direct**.

### Key Features

- **Verified Real Deals (18 Listings)**: Cross-category coverage spanning Audio & Headphones, Laptops & Desktops, TVs & Displays, Gaming & Consoles, Smart Home & Gear, and Toys & LEGO.
- **Honest Deal Signals**: Distinguishes `ALL-TIME LOW` and `STRONG DEAL` offers from `ROUTINE SALE — Compare First` entries (flagging inflated list prices, small 7%–9% markdowns, and better competing store prices).
- **Cross-Store Comparison**: Groups matching SKUs (such as Apple AirPods Pro 3, LG 65" C6 OLED, and Apple Mac mini M6) so shoppers can immediately see the lowest verified retailer.
- **Zero External Runtime Assets**: Plain HTML, CSS, and native ES modules with inline SVG icons—no external fonts, stylesheets, CDN scripts, or runtime network fetches.

## Local Preview

Serve `app/` from any static HTTP server on port 8080 and open `http://localhost:8080`.

## Build Dossier

```bash
MAKEFUN_OUTPUT_DIR=out node main.ts
```
