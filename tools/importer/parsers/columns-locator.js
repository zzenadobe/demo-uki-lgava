/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-locator.
 * Base block: columns. Source: https://www.frescopacommerce.com/
 * Source selector: .store-locator-container .store-locator.block
 * Source DOM (verified in block-context/columns-locator/source.html):
 *   div.store-locator > div.shopfinder > div.sidepanel > h3.sidepanel__title
 *     + div.search > p.search__title + div.search__box > input.search__input + button.search__button
 *   div.shopfinder > div.map#locator-map (runtime Google Map - not authorable)
 * Target (blocks/columns-locator/columns-locator.js):
 *   1 row x 2 columns: [heading, label paragraph, button text paragraph | empty (map rendered at runtime)]
 */
export default function parse(element, { document }) {
  const panel = element.querySelector('.sidepanel') || element;
  const left = [];

  const srcHeading = panel.querySelector('.sidepanel__title, h1, h2, h3, h4');
  if (srcHeading && srcHeading.textContent.trim()) {
    // Section-level heading directly under the page h1: normalize to h2 (source uses h3).
    const h = document.createElement('h2');
    h.textContent = srcHeading.textContent.trim();
    left.push(h);
  }

  const label = panel.querySelector('.search__title, .search p');
  if (label && label.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = label.textContent.trim();
    left.push(p);
  }

  const button = panel.querySelector('.search__button, .search button, button[type="submit"]');
  const buttonText = button ? button.textContent.trim() : '';
  if (buttonText) {
    const p = document.createElement('p');
    p.textContent = buttonText;
    left.push(p);
  }

  // Right cell intentionally empty: the block renders the map at runtime.
  const cells = [[left, '']];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-locator', cells });
  element.replaceWith(block);
}
