/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-product.
 * Base block: cards. Source: https://www.frescopacommerce.com/
 * Source selector: .section.background.cards-container .cards.block
 * Source DOM (verified in block-context/cards-product/source.html):
 *   div.cards > ul > li > div.cards-card-image > picture > img
 *                       + div.cards-card-body > h5 + p (price) + p.button-container > a.button
 * Target (blocks/cards-product/cards-product.js):
 *   each row = [image | heading, price paragraph, CTA link]
 * Iteration keyed on the stable inner wrapper div.cards-card-body (paired with its sibling image).
 */
export default function parse(element, { document }) {
  const cells = [];

  let bodies = [...element.querySelectorAll('.cards-card-body')];
  if (!bodies.length) bodies = [...element.querySelectorAll(':scope > ul > li, :scope > div')];

  bodies.forEach((body) => {
    const item = body.closest('li') || body.parentElement;
    const img = (item && item.querySelector('.cards-card-image img, picture img, img'))
      || null;
    const imageCell = img ? (img.closest('picture') || img) : '';

    const content = [];
    // Card titles sit under the section's h2: normalize to h3 (source uses h5).
    const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) {
      const h3 = document.createElement('h3');
      h3.innerHTML = heading.innerHTML;
      content.push(h3);
    }

    body.querySelectorAll(':scope > p').forEach((p) => {
      if (!p.textContent.trim()) return;
      const link = p.querySelector('a[href]');
      if (link && p.textContent.trim() === link.textContent.trim()) {
        const cta = document.createElement('p');
        cta.append(link);
        content.push(cta);
      } else {
        content.push(p);
      }
    });

    if (imageCell || content.length) cells.push([imageCell, content]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-product', cells });
  element.replaceWith(block);
}
