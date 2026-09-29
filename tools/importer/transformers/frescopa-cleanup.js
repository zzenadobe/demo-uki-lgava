/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Frescopa (frescopacommerce.com) site-wide cleanup.
 * Source is an EDS site: main > div.section children, blocks already decorated.
 * All selectors verified in migration-work/cleaned.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Global header chrome that may be present if element is not scoped to <main>:
    // <header class="header-wrapper"> containing div.overlay, nav#nav, nav-* sections,
    // and the commerce mini-cart (div.section.commerce-mini-cart-container).
    WebImporter.DOMUtils.remove(element, [
      'header.header-wrapper',
      'nav#nav',
      '.commerce-mini-cart-container',
    ]);

    // Empty spacer section: <div class="section"></div> directly inside main
    // (page-structure excluded: body > main > div.section:nth-of-type(2)).
    // Match only bare, content-less div.section so authored sections are untouched.
    element.querySelectorAll('div.section').forEach((section) => {
      if (section.classList.length !== 1) return;
      if (section.textContent.trim() !== '') return;
      if (section.querySelector('img, picture, video, iframe, a')) return;
      section.remove();
    });

    // Decorative CSS background image (styles/backgrounds/big.svg) rendered as a direct
    // child <img> of the top-sellers section: <div class="section background cards-container"><img ...>
    WebImporter.DOMUtils.remove(element, [
      '.section.background.cards-container > img',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Global footer: <footer class="footer-wrapper"> (contains div.footer.block).
    WebImporter.DOMUtils.remove(element, [
      'footer.footer-wrapper',
      'header.header-wrapper',
      'nav#nav',
      'iframe',
      'link',
      'noscript',
      'source',
    ]);

    // Decorative theme backgrounds (styles/backgrounds/*.svg, e.g. big.svg) are
    // CSS concerns. Strip them from inline styles so WebImporter.rules
    // .transformBackgroundImages doesn't turn them into authored <img> content.
    element.querySelectorAll('[style*="background-image"]').forEach((el) => {
      if (/\/styles\/backgrounds\//.test(el.style.backgroundImage)) {
        el.style.removeProperty('background-image');
      }
    });
    element.querySelectorAll('img[src*="/styles/backgrounds/"]').forEach((img) => {
      (img.closest('picture') || img).remove();
    });
  }
}
