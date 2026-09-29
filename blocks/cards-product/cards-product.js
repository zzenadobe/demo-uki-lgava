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
 * Product cards: each row = [image | heading, price paragraph, CTA link].
 * Also accepts a single cell holding the image followed by the text.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-product-card';
    const cells = [...row.children];
    const rowCells = cells.length === 1 ? splitMixedCell(cells[0]) : cells;
    rowCells.forEach((cell) => {
      if (!cell.textContent.trim() && !cell.querySelector('picture, img')) return;
      if (cell.querySelector('picture') && !cell.textContent.trim()) {
        cell.className = 'cards-product-card-image';
      } else {
        cell.className = 'cards-product-card-body';
        cell.querySelectorAll('p').forEach((p) => {
          if (isLinkOnly(p)) p.classList.add('cards-product-card-cta');
          else if (/\d/.test(p.textContent) && /[$£€¥]|\d[.,]\d{2}/.test(p.textContent)) {
            p.classList.add('cards-product-card-price');
          }
        });
      }
      li.append(cell);
    });
    if (li.childElementCount) ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt || '', false, [{ width: '750' }]),
    );
  });
  block.replaceChildren(ul);
}
