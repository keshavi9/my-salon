/**
 * Shared in-memory cache instance (node-cache).
 *
 * Why node-cache instead of Redis?
 *   - Zero infrastructure: no separate server/container required for local dev or
 *     single-instance deployments.
 *   - Drop-in replacement path: swap the `get`/`set`/`del` calls here for an
 *     ioredis client later when you need distributed / multi-instance caching.
 *
 * TTL constants are centralised here so every controller agrees on the same values.
 *
 * Key naming convention:
 *   dashboard:<range>           — e.g. dashboard:today
 *   services:list:<queryString> — e.g. services:list:isActive=true&page=1
 *   services:one:<id>           — e.g. services:one:550e8400-e29b-41d4-...
 *   reports:revenue:<start>:<end>
 *   reports:staff:<start>:<end>
 */

const NodeCache = require('node-cache')

// stdTTL = default TTL in seconds when none is supplied explicitly.
// checkperiod = how often (seconds) node-cache scans for expired keys.
const cache = new NodeCache({ stdTTL: 60, checkperiod: 30, useClones: false })

// ── TTL constants ──────────────────────────────────────────────────────────────
const TTL = {
  DASHBOARD: 90,      // 90 s  — live KPI data; short enough for operational accuracy
  SERVICES_LIST: 300, // 5 min — catalog rarely changes
  SERVICES_ONE: 300,  // 5 min — single service detail
  REPORTS: 300,       // 5 min — historical aggregates do not change mid-query
}

module.exports = { cache, TTL }
