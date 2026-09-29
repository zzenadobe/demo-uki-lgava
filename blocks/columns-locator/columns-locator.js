const OPTION_CLASSES = [];
const DEFAULT_QUERY = 'Frescopa coffee';

function mapSrc(query) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=12&output=embed`;
}

/**
 * Store locator: 1 row x 2 columns.
 * Left cell = heading, label paragraph, search button text (last short paragraph).
 * Right cell = optional default map query / map link (map is rendered at runtime).
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  // Accept the canonical 1x2 row as well as the two cells split across rows.
  const cells = [...block.children].flatMap((row) => [...row.children]);
  const panelCell = cells.find((c) => c.textContent.trim() && !c.querySelector('iframe'))
    || cells[0] || document.createElement('div');
  const mapCell = cells.find((c) => c !== panelCell) || document.createElement('div');

  // --- text panel ---
  const panel = document.createElement('div');
  panel.className = 'columns-locator-panel';
  // Wrap stray text nodes so they survive as paragraphs.
  [...panelCell.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      if (!node.textContent.trim()) return;
      const p = document.createElement('p');
      p.textContent = node.textContent.trim();
      panel.append(p);
    } else panel.append(node);
  });

  const paragraphs = [...panel.querySelectorAll(':scope > p')]
    .filter((p) => p.textContent.trim());
  const heading = panel.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) heading.classList.add('columns-locator-title');

  // Button label = last short paragraph after the label paragraph (e.g. "Search Me").
  // With a single paragraph and no heading, that paragraph stays the label.
  let buttonText = 'Search';
  let buttonHref = null;
  const last = paragraphs[paragraphs.length - 1];
  if (paragraphs.length > 1 || (last && last.querySelector('a') && heading)) {
    buttonText = last.textContent.trim() || buttonText;
    const link = last.querySelector('a');
    if (link) buttonHref = link.getAttribute('href');
    last.remove();
    paragraphs.pop();
  }
  const label = paragraphs[paragraphs.length - 1];
  if (label) label.classList.add('columns-locator-label');

  const form = document.createElement('form');
  form.className = 'columns-locator-search';
  form.setAttribute('role', 'search');
  const inputId = `columns-locator-input-${Math.random().toString(36).slice(2, 8)}`;
  const input = document.createElement('input');
  input.type = 'text';
  input.id = inputId;
  input.name = 'postcode';
  input.placeholder = 'Post Code';
  input.autocomplete = 'postal-code';
  if (label) {
    label.id = `${inputId}-label`;
    input.setAttribute('aria-labelledby', label.id);
  } else {
    input.setAttribute('aria-label', 'Post Code');
  }
  const button = document.createElement('button');
  button.type = 'submit';
  button.textContent = buttonText;
  form.append(input, button);
  panel.append(form);

  // --- map panel ---
  const mapPanel = document.createElement('div');
  mapPanel.className = 'columns-locator-map';
  const mapLink = mapCell.querySelector('a');
  const defaultQuery = (mapCell.textContent.trim() && !mapLink)
    ? mapCell.textContent.trim()
    : DEFAULT_QUERY;
  const iframe = document.createElement('iframe');
  iframe.title = 'Store locations map';
  iframe.loading = 'lazy';
  iframe.referrerPolicy = 'no-referrer-when-downgrade';
  iframe.src = mapLink && /google\.[^/]+\/maps/.test(mapLink.href) && mapLink.href.includes('output=embed')
    ? mapLink.href
    : mapSrc(defaultQuery);
  mapPanel.append(iframe);

  // A search label authored as a link targets a locator page; otherwise search in-place.
  const submitsToPage = buttonHref && !buttonHref.startsWith('#');
  if (submitsToPage) {
    form.action = buttonHref;
    form.method = 'get';
  }

  form.addEventListener('submit', (e) => {
    if (submitsToPage) return;
    e.preventDefault();
    const value = input.value.trim();
    iframe.src = mapSrc(value ? `${DEFAULT_QUERY} near ${value}` : defaultQuery);
  });

  block.replaceChildren(panel, mapPanel);
}
