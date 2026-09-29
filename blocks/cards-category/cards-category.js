import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

/**
 * Splits a leading picture/icon out of a mixed image+text cell (single-cell rows).
 * @param {Element} cell
 * @returns {Element[]} the cells to render, in order
 */
function splitMixedCell(cell) {
  const media = cell.querySelector('picture, .icon');
  if (!media || !cell.textContent.trim()) return [cell];
  const imageCell = document.createElement('div');
  const parent = media.parentElement;
  imageCell.append(media);
  if (parent !== cell && parent.tagName === 'P' && !parent.textContent.trim()) parent.remove();
  return [imageCell, cell];
}

/**
 * Category cards: each row = [icon image | linked heading].
 * The heading link (or, failing that, any link in the card) is stretched so the
 * whole tile is clickable. Also accepts a single cell holding the icon then the text.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-category-card';
    const cells = [...row.children];
    const rowCells = cells.length === 1 ? splitMixedCell(cells[0]) : cells;
    rowCells.forEach((cell) => {
      const hasMedia = cell.querySelector('picture, img, .icon');
      if (!cell.textContent.trim() && !hasMedia) return;
      cell.className = hasMedia && !cell.textContent.trim()
        ? 'cards-category-card-icon'
        : 'cards-category-card-body';
      li.append(cell);
    });
    const link = li.querySelector('.cards-category-card-body a') || li.querySelector('a');
    if (link) {
      link.classList.add('cards-category-card-link');
      // Links inside headings should not be rendered as buttons.
      link.classList.remove('button');
      const container = link.closest('.button-container');
      if (container) container.classList.remove('button-container');
    }
    if (li.childElementCount) ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    if (/\.svg(\?|$)/i.test(img.src)) return;
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt || '', false, [{ width: '300' }]),
    );
  });
  block.replaceChildren(ul);
}
