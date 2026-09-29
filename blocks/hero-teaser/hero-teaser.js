import { createOptimizedPicture } from '../../scripts/aem.js';

const OPTION_CLASSES = [];

/**
 * Hero teaser: full-bleed background image with an overlaid text stack
 * (eyebrow, heading, CTA).
 * Content contract: row 1 = picture; row 2 = eyebrow paragraph, heading, CTA link.
 * Tolerates the picture and text living in the same row/cell, or the rows being reversed.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  const background = document.createElement('div');
  background.className = 'hero-teaser-background';
  const content = document.createElement('div');
  content.className = 'hero-teaser-content';

  // Pull the first picture out as the background, wherever it was authored.
  const picture = block.querySelector('picture');
  if (picture) {
    const img = picture.querySelector('img');
    const optimized = img
      ? createOptimizedPicture(img.src, img.alt || '', true, [{ media: '(min-width: 900px)', width: '2000' }, { width: '900' }])
      : picture;
    // In the first section the background is the LCP candidate: fetch it first.
    if (block.closest('.section') === block.closest('main')?.querySelector('.section')) {
      optimized.querySelector('img')?.setAttribute('fetchpriority', 'high');
    }
    const pictureParent = picture.parentElement;
    background.append(optimized);
    picture.remove();
    // Drop an empty wrapper paragraph left behind by the moved picture.
    if (pictureParent && pictureParent.tagName === 'P' && !pictureParent.textContent.trim()) {
      pictureParent.remove();
    }
  }

  // Everything else (all cells, in order) becomes the text stack.
  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      while (cell.firstChild) content.append(cell.firstChild);
    });
  });

  // Wrap a bare <a> (CTA authored without a paragraph) so it is treated like a link paragraph.
  [...content.children].forEach((el) => {
    if (el.tagName !== 'A') return;
    const p = document.createElement('p');
    el.replaceWith(p);
    p.append(el);
  });

  // Eyebrow = a text paragraph that precedes the first heading.
  const heading = content.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    heading.classList.add('hero-teaser-title');
    let prev = heading.previousElementSibling;
    while (prev) {
      if (prev.tagName === 'P' && prev.textContent.trim() && !prev.querySelector('a')) {
        prev.classList.add('hero-teaser-eyebrow');
      }
      prev = prev.previousElementSibling;
    }
  }

  // CTA = paragraph whose only content is a link.
  content.querySelectorAll('p').forEach((p) => {
    const links = p.querySelectorAll('a');
    if (links.length && p.textContent.trim() === [...links].map((a) => a.textContent).join('').trim()) {
      p.classList.add('hero-teaser-cta');
      // CTA links always render as buttons (matches source teaser decorateButtons).
      links.forEach((a) => a.classList.add('button'));
    }
  });

  const children = [];
  if (background.childElementCount) children.push(background);
  else block.classList.add('hero-teaser-no-image');
  children.push(content);
  block.replaceChildren(...children);
}
