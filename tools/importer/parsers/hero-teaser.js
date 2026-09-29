/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-teaser.
 * Base block: hero. Source: https://www.frescopacommerce.com/
 * Source selector: .teaser-container .teaser.block
 * Source DOM (verified in block-context/hero-teaser/source.html):
 *   div.teaser > div.background > picture > img
 *   div.teaser > div.foreground > div.text > div.eyebrow | div.title > h3 | div.long-description | div.cta > a
 * Target (blocks/hero-teaser/hero-teaser.js):
 *   row 1 = background picture; row 2 = eyebrow paragraph, heading, CTA link paragraph.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Row 1: background image
  const bgImg = element.querySelector('.background img, .background picture img, :scope > picture img');
  if (bgImg) {
    const picture = bgImg.closest('picture') || bgImg;
    cells.push([picture]);
  }

  // Row 2: text stack
  const textRoot = element.querySelector('.foreground .text, .foreground, .text') || element;
  const content = [];

  const eyebrowEl = textRoot.querySelector('.eyebrow');
  if (eyebrowEl && eyebrowEl.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = eyebrowEl.textContent.trim();
    content.push(p);
  }

  const srcHeading = textRoot.querySelector('.title h1, .title h2, .title h3, .title h4, h1, h2, h3, h4');
  if (srcHeading && srcHeading.textContent.trim()) {
    // The teaser opens the page, so its heading is the page's h1.
    const h1 = document.createElement('h1');
    h1.innerHTML = srcHeading.innerHTML;
    content.push(h1);
  }

  const desc = textRoot.querySelector('.long-description');
  if (desc && desc.textContent.trim()) {
    const descParas = desc.querySelectorAll('p');
    if (descParas.length) {
      descParas.forEach((p) => content.push(p));
    } else {
      const p = document.createElement('p');
      p.innerHTML = desc.innerHTML;
      content.push(p);
    }
  }

  const ctas = textRoot.querySelectorAll('.cta a[href]');
  ctas.forEach((a) => {
    const p = document.createElement('p');
    p.append(a);
    content.push(p);
  });

  if (content.length) cells.push([content]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-teaser', cells });
  element.replaceWith(block);
}
