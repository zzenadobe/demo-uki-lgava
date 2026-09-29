/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-category.
 * Base block: cards. Source: https://www.frescopacommerce.com/
 * Source selector: .section.card-tiles.cards-container .cards.block
 * Source DOM (verified in block-context/cards-category/source.html):
 *   div.cards > ul > li > div.cards-card-image > picture > img
 *                       + div.cards-card-body > h5 > a
 * Target (blocks/cards-category/cards-category.js):
 *   each row = [icon image | linked heading]
 * Iteration keyed on the stable inner wrapper div.cards-card-body (paired with its sibling image).
 */
export default function parse(element, { document }) {
  const cells = [];

  let bodies = [...element.querySelectorAll('.cards-card-body')];
  if (!bodies.length) bodies = [...element.querySelectorAll(':scope > ul > li, :scope > div')];

  bodies.forEach((body) => {
    const item = body.closest('li') || body.parentElement;
    const img = item ? item.querySelector('.cards-card-image img, picture img, img') : null;
    const imageCell = img ? (img.closest('picture') || img) : '';

    const content = [];
    // Tile titles sit under the section's h2: normalize to h3 (source uses h5).
    const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) {
      const h3 = document.createElement('h3');
      h3.innerHTML = heading.innerHTML;
      content.push(h3);
    } else {
      // Fallback: link without heading wrapper
      const link = body.querySelector('a[href]');
      if (link) {
        const p = document.createElement('p');
        p.append(link);
        content.push(p);
      }
    }

    if (imageCell || content.length) cells.push([imageCell, content]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-category', cells });
  element.replaceWith(block);
}
