/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/hero-teaser.js
  function parse(element, { document }) {
    const cells = [];
    const bgImg = element.querySelector(".background img, .background picture img, :scope > picture img");
    if (bgImg) {
      const picture = bgImg.closest("picture") || bgImg;
      cells.push([picture]);
    }
    const textRoot = element.querySelector(".foreground .text, .foreground, .text") || element;
    const content = [];
    const eyebrowEl = textRoot.querySelector(".eyebrow");
    if (eyebrowEl && eyebrowEl.textContent.trim()) {
      const p = document.createElement("p");
      p.textContent = eyebrowEl.textContent.trim();
      content.push(p);
    }
    const srcHeading = textRoot.querySelector(".title h1, .title h2, .title h3, .title h4, h1, h2, h3, h4");
    if (srcHeading && srcHeading.textContent.trim()) {
      const h1 = document.createElement("h1");
      h1.innerHTML = srcHeading.innerHTML;
      content.push(h1);
    }
    const desc = textRoot.querySelector(".long-description");
    if (desc && desc.textContent.trim()) {
      const descParas = desc.querySelectorAll("p");
      if (descParas.length) {
        descParas.forEach((p) => content.push(p));
      } else {
        const p = document.createElement("p");
        p.innerHTML = desc.innerHTML;
        content.push(p);
      }
    }
    const ctas = textRoot.querySelectorAll(".cta a[href]");
    ctas.forEach((a) => {
      const p = document.createElement("p");
      p.append(a);
      content.push(p);
    });
    if (content.length) cells.push([content]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-teaser", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-locator.js
  function parse2(element, { document }) {
    const panel = element.querySelector(".sidepanel") || element;
    const left = [];
    const srcHeading = panel.querySelector(".sidepanel__title, h1, h2, h3, h4");
    if (srcHeading && srcHeading.textContent.trim()) {
      const h = document.createElement("h2");
      h.textContent = srcHeading.textContent.trim();
      left.push(h);
    }
    const label = panel.querySelector(".search__title, .search p");
    if (label && label.textContent.trim()) {
      const p = document.createElement("p");
      p.textContent = label.textContent.trim();
      left.push(p);
    }
    const button = panel.querySelector('.search__button, .search button, button[type="submit"]');
    const buttonText = button ? button.textContent.trim() : "";
    if (buttonText) {
      const p = document.createElement("p");
      p.textContent = buttonText;
      left.push(p);
    }
    const cells = [[left, ""]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-locator", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-product.js
  function parse3(element, { document }) {
    const cells = [];
    let bodies = [...element.querySelectorAll(".cards-card-body")];
    if (!bodies.length) bodies = [...element.querySelectorAll(":scope > ul > li, :scope > div")];
    bodies.forEach((body) => {
      const item = body.closest("li") || body.parentElement;
      const img = item && item.querySelector(".cards-card-image img, picture img, img") || null;
      const imageCell = img ? img.closest("picture") || img : "";
      const content = [];
      const heading = body.querySelector("h1, h2, h3, h4, h5, h6");
      if (heading) {
        const h3 = document.createElement("h3");
        h3.innerHTML = heading.innerHTML;
        content.push(h3);
      }
      body.querySelectorAll(":scope > p").forEach((p) => {
        if (!p.textContent.trim()) return;
        const link = p.querySelector("a[href]");
        if (link && p.textContent.trim() === link.textContent.trim()) {
          const cta = document.createElement("p");
          cta.append(link);
          content.push(cta);
        } else {
          content.push(p);
        }
      });
      if (imageCell || content.length) cells.push([imageCell, content]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-product", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-category.js
  function parse4(element, { document }) {
    const cells = [];
    let bodies = [...element.querySelectorAll(".cards-card-body")];
    if (!bodies.length) bodies = [...element.querySelectorAll(":scope > ul > li, :scope > div")];
    bodies.forEach((body) => {
      const item = body.closest("li") || body.parentElement;
      const img = item ? item.querySelector(".cards-card-image img, picture img, img") : null;
      const imageCell = img ? img.closest("picture") || img : "";
      const content = [];
      const heading = body.querySelector("h1, h2, h3, h4, h5, h6");
      if (heading) {
        const h3 = document.createElement("h3");
        h3.innerHTML = heading.innerHTML;
        content.push(h3);
      } else {
        const link = body.querySelector("a[href]");
        if (link) {
          const p = document.createElement("p");
          p.append(link);
          content.push(p);
        }
      }
      if (imageCell || content.length) cells.push([imageCell, content]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-category", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-promo.js
  function parse5(element, { document }) {
    const cells = [];
    let bodies = [...element.querySelectorAll(".cards-card-body")];
    if (!bodies.length) bodies = [...element.querySelectorAll(":scope > ul > li, :scope > div")];
    bodies.forEach((body) => {
      const item = body.closest("li") || body.parentElement;
      const img = item ? item.querySelector(".cards-card-image img, picture img, img") : null;
      const imageCell = img ? img.closest("picture") || img : "";
      const content = [];
      const heading = body.querySelector("h1, h2, h3, h4, h5, h6");
      if (heading) content.push(heading);
      body.querySelectorAll(":scope > p").forEach((p) => {
        if (!p.textContent.trim()) return;
        const link = p.querySelector("a[href]");
        if (link && p.textContent.trim() === link.textContent.trim()) {
          const cta = document.createElement("p");
          cta.append(link);
          content.push(cta);
        } else {
          content.push(p);
        }
      });
      if (imageCell || content.length) cells.push([imageCell, content]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-reward.js
  function parse6(element, { document }) {
    const leftSrc = element.querySelector(".reward-left") || element;
    const rightSrc = element.querySelector(".reward-right");
    const left = [];
    leftSrc.querySelectorAll(":scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6, :scope > p").forEach((el) => {
      if (!el.textContent.trim()) return;
      if (rightSrc && rightSrc.contains(el)) return;
      if (/^H[1-6]$/.test(el.tagName)) {
        const h2 = document.createElement("h2");
        h2.innerHTML = el.innerHTML;
        left.push(h2);
        return;
      }
      left.push(el);
    });
    const right = [];
    const links = rightSrc ? rightSrc.querySelectorAll("a[href]") : element.querySelectorAll(".reward-right a[href], a.button[href]");
    links.forEach((a) => {
      const p = document.createElement("p");
      p.append(a);
      right.push(p);
    });
    const cells = [[left, right.length ? right : ""]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-reward", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/frescopa-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header.header-wrapper",
        "nav#nav",
        ".commerce-mini-cart-container"
      ]);
      element.querySelectorAll("div.section").forEach((section) => {
        if (section.classList.length !== 1) return;
        if (section.textContent.trim() !== "") return;
        if (section.querySelector("img, picture, video, iframe, a")) return;
        section.remove();
      });
      WebImporter.DOMUtils.remove(element, [
        ".section.background.cards-container > img"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "footer.footer-wrapper",
        "header.header-wrapper",
        "nav#nav",
        "iframe",
        "link",
        "noscript",
        "source"
      ]);
      element.querySelectorAll('[style*="background-image"]').forEach((el) => {
        if (/\/styles\/backgrounds\//.test(el.style.backgroundImage)) {
          el.style.removeProperty("background-image");
        }
      });
      element.querySelectorAll('img[src*="/styles/backgrounds/"]').forEach((img) => {
        (img.closest("picture") || img).remove();
      });
    }
  }

  // tools/importer/transformers/frescopa-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      if (!sel) continue;
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    if (hookName === TransformHook2.beforeTransform) {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = element.ownerDocument.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === TransformHook2.afterTransform) {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(element.ownerDocument, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-home.js
  var parsers = {
    "hero-teaser": parse,
    "columns-locator": parse2,
    "cards-product": parse3,
    "cards-category": parse4,
    "cards-promo": parse5,
    "columns-reward": parse6
  };
  var PAGE_TEMPLATE = {
    name: "home",
    description: "Frescopa homepage: promo teaser, store locator, product/category/promo cards, rewards banner",
    urls: [
      "https://www.frescopacommerce.com/"
    ],
    blocks: [
      { name: "hero-teaser", instances: [".teaser-container .teaser.block"] },
      { name: "columns-locator", instances: [".store-locator-container .store-locator.block"] },
      { name: "cards-product", instances: [".section.background.cards-container .cards.block"] },
      { name: "cards-category", instances: [".section.card-tiles.cards-container .cards.block"] },
      { name: "cards-promo", instances: [".section.home.cards-container .cards.block"] },
      { name: "columns-reward", instances: [".reward-container .reward.block"] }
    ],
    sections: [
      {
        id: "rc2",
        name: "quiz-teaser",
        selector: [".section.teaser-container"],
        style: null,
        blocks: ["hero-teaser"],
        defaultContent: []
      },
      {
        id: "rc4",
        name: "store-locator",
        selector: [".section.store-locator-container"],
        style: null,
        blocks: ["columns-locator"],
        defaultContent: []
      },
      {
        id: "rc5",
        name: "top-sellers",
        selector: [".section.background.cards-container"],
        style: "background",
        blocks: ["cards-product"],
        defaultContent: [".section.background.cards-container > .default-content-wrapper"]
      },
      {
        id: "rc6",
        name: "shop-categories",
        selector: [".section.card-tiles.cards-container"],
        style: null,
        blocks: ["cards-category"],
        defaultContent: [".section.card-tiles.cards-container > .default-content-wrapper"]
      },
      {
        id: "rc7",
        name: "promo-tiles",
        selector: [".section.home.cards-container"],
        style: null,
        blocks: ["cards-promo"],
        defaultContent: []
      },
      {
        id: "rc8",
        name: "rewards",
        selector: [".section.reward-container"],
        style: null,
        blocks: ["columns-reward"],
        defaultContent: []
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_home_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_home_exports);
})();
