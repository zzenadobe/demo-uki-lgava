import { getProductSku } from '../../scripts/commerce.js';
import { appBuilderUrl } from '../../scripts/app-builder.js';

export default async function decorate(block) {
  // Prefer an explicitly authored SKU, otherwise resolve the current PDP's SKU
  // from the URL/metadata (same source used by the product-details block).
  const sku = block.dataset.sku || block.getAttribute('data-sku') || getProductSku() || '';
  block.innerHTML = `<div class="product-rating">Loading rating for ${sku || 'this product'}…</div>`;
  if (!sku) return;

  try {
    const res = await fetch(appBuilderUrl(`get-product-rating?sku=${encodeURIComponent(sku)}`));
    const json = await res.json();
    block.innerHTML = `
      <div class="product-rating">
        <strong>${json.average ?? 0}</strong> / 10 from ${json.count ?? 0} review(s)
      </div>
    `;
  } catch (error) {
    block.innerHTML = '<div class="product-rating product-rating--error">Unable to load rating.</div>';
  }
}
