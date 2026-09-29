import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

function isLinkOnly(p) {
  const links = [...p.querySelectorAll('a')];
  return links.length > 0
    && p.textContent.trim() === links.map((a) => a.textContent).join('').trim();
}

/**
 * Splits a leading picture out of a mixed image+text cell (single-cell rows).
 * @param {Element} cell
 * @returns {Element[]} the cells to render, in order
 */
function splitMixedCell(cell) {
  const picture = cell.querySelector('picture');
  if (!picture || !cell.textContent.trim()) return [cell];
  const imageCell = document.createElement('div');
  const parent = picture.parentElement;
  imageCell.append(picture);
  if (parent !== cell && parent.tagName === 'P' && !parent.textContent.trim()) parent.remove();
  return [imageCell, cell];
}

/**
 * Promo cards: each row = [image | heading, paragraph, CTA link].
 * Heading level varies per card (h3/h4 in authored content) and is left untouched.
 * Also accepts a single cell holding the image followed by the text.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-promo-card';
    const cells = [...row.children];
    const rowCells = cells.length === 1 ? splitMixedCell(cells[0]) : cells;
    rowCells.forEach((cell) => {
      if (!cell.textContent.trim() && !cell.querySelector('picture, img')) return;
      if (cell.querySelector('picture') && !cell.textContent.trim()) {
        cell.className = 'cards-promo-card-image';
      } else {
        cell.className = 'cards-promo-card-body';
        cell.querySelectorAll('p').forEach((p) => {
          if (!isLinkOnly(p)) return;
          p.classList.add('cards-promo-card-cta');
          // source renders promo CTAs as primary pill buttons
          p.querySelectorAll('a').forEach((a) => a.classList.add('button'));
        });
      }
      li.append(cell);
    });
    if (li.childElementCount) ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt || '', false, [{ media: '(min-width: 600px)', width: '900' }, { width: '750' }]),
    );
  });
  block.replaceChildren(ul);
}
