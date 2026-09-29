/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroTeaserParser from './parsers/hero-teaser.js';
import columnsLocatorParser from './parsers/columns-locator.js';
import cardsProductParser from './parsers/cards-product.js';
import cardsCategoryParser from './parsers/cards-category.js';
import cardsPromoParser from './parsers/cards-promo.js';
import columnsRewardParser from './parsers/columns-reward.js';

// TRANSFORMER IMPORTS
import frescopaCleanupTransformer from './transformers/frescopa-cleanup.js';
import frescopaSectionsTransformer from './transformers/frescopa-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-teaser': heroTeaserParser,
  'columns-locator': columnsLocatorParser,
  'cards-product': cardsProductParser,
  'cards-category': cardsCategoryParser,
  'cards-promo': cardsPromoParser,
  'columns-reward': columnsRewardParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'home',
  description: 'Frescopa homepage: promo teaser, store locator, product/category/promo cards, rewards banner',
  urls: [
    'https://www.frescopacommerce.com/',
  ],
  blocks: [
    { name: 'hero-teaser', instances: ['.teaser-container .teaser.block'] },
    { name: 'columns-locator', instances: ['.store-locator-container .store-locator.block'] },
    { name: 'cards-product', instances: ['.section.background.cards-container .cards.block'] },
    { name: 'cards-category', instances: ['.section.card-tiles.cards-container .cards.block'] },
    { name: 'cards-promo', instances: ['.section.home.cards-container .cards.block'] },
    { name: 'columns-reward', instances: ['.reward-container .reward.block'] },
  ],
  sections: [
    {
      id: 'rc2', name: 'quiz-teaser', selector: ['.section.teaser-container'], style: null, blocks: ['hero-teaser'], defaultContent: [],
    },
    {
      id: 'rc4', name: 'store-locator', selector: ['.section.store-locator-container'], style: null, blocks: ['columns-locator'], defaultContent: [],
    },
    {
      id: 'rc5', name: 'top-sellers', selector: ['.section.background.cards-container'], style: 'background', blocks: ['cards-product'], defaultContent: ['.section.background.cards-container > .default-content-wrapper'],
    },
    {
      id: 'rc6', name: 'shop-categories', selector: ['.section.card-tiles.cards-container'], style: null, blocks: ['cards-category'], defaultContent: ['.section.card-tiles.cards-container > .default-content-wrapper'],
    },
    {
      id: 'rc7', name: 'promo-tiles', selector: ['.section.home.cards-container'], style: null, blocks: ['cards-promo'], defaultContent: [],
    },
    {
      id: 'rc8', name: 'rewards', selector: ['.section.reward-container'], style: null, blocks: ['columns-reward'], defaultContent: [],
    },
  ],
};

// TRANSFORMER REGISTRY - cleanup first, then section breaks/metadata
const transformers = [
  frescopaCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [frescopaSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. Initial cleanup + section breaks
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already replaced by an earlier parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Final cleanup + section metadata
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path - homepage root maps to /index
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
