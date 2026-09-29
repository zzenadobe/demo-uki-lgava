/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-promo.
 * Base block: cards. Source: https://www.frescopacommerce.com/
 * Source selector: .section.home.cards-container .cards.block
 * Source DOM (verified in block-context/cards-promo/source.html):
 *   div.cards > ul > li > div.cards-card-image > picture > img
 *                       + div.cards-card-body > h3|h4 + p (description) + p.button-container > a.button
 * Target (blocks/cards-promo/cards-promo.js):
 *   each row = [image | heading, paragraph, CTA link]
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
    const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) content.push(heading);

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

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-promo', cells });
  element.replaceWith(block);
}
