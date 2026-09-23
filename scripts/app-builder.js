import { getConfigValue } from '@dropins/tools/lib/aem/configs.js';

/*
 * Resolves the App Builder backend that hosts the review actions
 * (`submit-review`, `get-product-rating`).
 *
 * The base URL is NOT hardcoded: it is read per environment from `config.json`
 * (the EDS Configuration Service) under the `app-builder-endpoint` key, e.g.:
 *   "app-builder-endpoint": "https://<namespace>.adobeioruntime.net/api/v1/web/<package>"
 *
 * When the key is absent/empty, calls fall back to same-origin `/api/*`,
 * which requires a CDN/edge proxy that forwards `/api/*` to the runtime.
 */

/**
 * @returns {string} the configured App Builder base URL, or '' when unset.
 */
export function getApiBaseUrl() {
  return getConfigValue('app-builder-endpoint') || '';
}

/**
 * Builds a full URL to an App Builder action.
 * @param {string} path Action name, optionally with a query string,
 *   e.g. 'submit-review' or 'get-product-rating?sku=ABC'.
 * @returns {string} Absolute URL when configured, otherwise `/api/<path>`.
 */
export function appBuilderUrl(path) {
  const clean = path.replace(/^\//, '');
  const base = getApiBaseUrl().replace(/\/$/, '');
  return base ? `${base}/${clean}` : `/api/${clean}`;
}
