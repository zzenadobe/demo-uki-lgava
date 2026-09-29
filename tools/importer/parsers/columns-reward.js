/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-reward.
 * Base block: columns. Source: https://www.frescopacommerce.com/
 * Source selector: .reward-container .reward.block
 * Source DOM (verified in block-context/columns-reward/source.html):
 *   div.reward > div.reward-content > img (decorative ribbon - provided by block CSS, skipped)
 *     + div.reward-left > h4.headline (empty) + h6 + p.detail (empty) + p + p (empty)
 *     + div.reward-right > a.button
 * Target (blocks/columns-reward/columns-reward.js):
 *   1 row x 2 columns: [heading, paragraph | CTA link]
 */
export default function parse(element, { document }) {
  const leftSrc = element.querySelector('.reward-left') || element;
  const rightSrc = element.querySelector('.reward-right');

  // Left cell: non-empty headings and paragraphs, in source order.
  const left = [];
  leftSrc.querySelectorAll(':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6, :scope > p')
    .forEach((el) => {
      if (!el.textContent.trim()) return;
      if (rightSrc && rightSrc.contains(el)) return;
      // Banner heading is a top-level page heading: normalize to h2 (source uses h6).
      if (/^H[1-6]$/.test(el.tagName)) {
        const h2 = document.createElement('h2');
        h2.innerHTML = el.innerHTML;
        left.push(h2);
        return;
      }
      left.push(el);
    });

  // Right cell: CTA link(s).
  const right = [];
  const links = rightSrc
    ? rightSrc.querySelectorAll('a[href]')
    : element.querySelectorAll('.reward-right a[href], a.button[href]');
  links.forEach((a) => {
    const p = document.createElement('p');
    p.append(a);
    right.push(p);
  });

  const cells = [[left, right.length ? right : '']];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-reward', cells });
  element.replaceWith(block);
}
