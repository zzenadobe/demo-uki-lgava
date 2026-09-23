/*
 * Centralized configuration for the App Builder backend that hosts the
 * review actions (`submit-review`, `get-product-rating`).
 *
 * Set API_BASE_URL to your deployed runtime, e.g.:
 *   https://<namespace>.adobeioruntime.net/api/v1/web/<package>
 *
 * Leave it empty ('') to fall back to same-origin `/api/*` paths, which
 * requires a CDN/edge proxy that forwards `/api/*` to the runtime.
 */
export const API_BASE_URL = '';

/**
 * Builds a full URL to an App Builder action.
 * @param {string} path Action name, optionally with a query string,
 *   e.g. 'submit-review' or 'get-product-rating?sku=ABC'.
 * @returns {string} Absolute URL when API_BASE_URL is set, otherwise `/api/<path>`.
 */
export function appBuilderUrl(path) {
  const clean = path.replace(/^\//, '');
  const base = API_BASE_URL.replace(/\/$/, '');
  return base ? `${base}/${clean}` : `/api/${clean}`;
}
