import { events } from '@dropins/tools/event-bus.js';
import { appBuilderUrl } from '../../scripts/app-builder.js';

// Ensure the order dropin fetches the current order and emits `order/data`,
// even if this is the only order-aware block on the page.
import '../../scripts/initializers/order.js';

/**
 * Resolves the SKU for an order line item, tolerating payload variations.
 * @param {object} item
 * @returns {string}
 */
function itemSku(item) {
  return item?.product?.sku || item?.sku || '';
}

/**
 * Resolves a human-readable name for an order line item.
 * @param {object} item
 * @returns {string}
 */
function itemName(item) {
  return item?.product?.name || item?.name || itemSku(item);
}

/**
 * Builds a review row (item label + score selector) for one order line item.
 * @param {object} item
 * @returns {Element}
 */
function buildRow(item) {
  const sku = itemSku(item);
  const name = itemName(item);

  const row = document.createElement('div');
  row.className = 'order-review__row';
  row.dataset.sku = sku;

  const label = document.createElement('span');
  label.className = 'order-review__item-name';
  label.textContent = name;

  const select = document.createElement('select');
  select.className = 'order-review__score';
  select.name = `score-${sku}`;
  select.setAttribute('aria-label', `Score for ${name}`);
  select.append(new Option('Score…', ''));
  for (let i = 1; i <= 10; i += 1) {
    select.append(new Option(String(i), String(i)));
  }

  row.append(label, select);
  return row;
}

/**
 * Submits a single line-item review to the App Builder backend.
 * @param {object} payload { orderId, customerId, sku, score }
 * @returns {Promise<Response>}
 */
function submitReview(payload) {
  return fetch(appBuilderUrl('submit-review'), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

/**
 * Renders the review form from an order payload.
 * @param {Element} block
 * @param {object} order the `order/data` payload
 */
function render(block, order) {
  block.textContent = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'order-review';

  const heading = document.createElement('h2');
  heading.textContent = 'Rate your order lines';
  const intro = document.createElement('p');
  intro.textContent = 'Select a score from 1 to 10 for each eligible item.';
  wrapper.append(heading, intro);

  const items = Array.isArray(order?.items)
    ? order.items.filter((item) => itemSku(item))
    : [];

  if (!items.length) {
    const empty = document.createElement('p');
    empty.className = 'order-review__empty';
    empty.textContent = 'No items available to review.';
    wrapper.append(empty);
    block.append(wrapper);
    return;
  }

  const form = document.createElement('form');
  form.className = 'order-review__form';
  items.forEach((item) => form.append(buildRow(item)));

  const button = document.createElement('button');
  button.type = 'submit';
  button.textContent = 'Submit review';
  form.append(button);

  const message = document.createElement('pre');
  message.className = 'order-review__message';
  message.setAttribute('aria-live', 'polite');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const orderId = order.number ?? order.id ?? '';
    const customerId = order.email ?? '';

    const reviews = [...form.querySelectorAll('.order-review__row')]
      .map((row) => ({
        sku: row.dataset.sku,
        score: Number(row.querySelector('.order-review__score').value),
      }))
      .filter((review) => review.sku && review.score >= 1 && review.score <= 10);

    if (!reviews.length) {
      message.textContent = 'Please select a score for at least one item.';
      return;
    }

    button.disabled = true;
    message.textContent = 'Submitting…';

    try {
      const results = await Promise.all(reviews.map(async (review) => {
        const res = await submitReview({ orderId, customerId, ...review });
        return `${review.sku}: ${res.ok ? 'OK' : `error (${res.status})`}`;
      }));
      message.textContent = results.join('\n');
    } catch (error) {
      message.textContent = 'Unable to submit review.';
    } finally {
      button.disabled = false;
    }
  });

  wrapper.append(form, message);
  block.append(wrapper);
}

export default async function decorate(block) {
  block.textContent = '';
  const loading = document.createElement('p');
  loading.className = 'order-review__loading';
  loading.textContent = 'Loading your order…';
  block.append(loading);

  // `eager: true` replays the last emitted order, so this works whether the
  // order was fetched before or after this block mounted.
  events.on('order/data', (order) => render(block, order), { eager: true });
}
