const OPTION_CLASSES = [];

/**
 * True when a node is a CTA: a bare <a>, or an element whose only text is its links.
 * @param {Node} node
 */
function isLinkOnly(node) {
  if (node.nodeType !== Node.ELEMENT_NODE) return false;
  if (node.tagName === 'A') return true;
  const links = [...node.querySelectorAll('a')];
  return links.length > 0
    && node.textContent.trim() === links.map((a) => a.textContent).join('').trim();
}

/**
 * Meaningful child nodes of a cell (elements + non-whitespace text nodes).
 * @param {Element} cell
 */
function meaningfulNodes(cell) {
  return [...cell.childNodes].filter((n) => n.nodeType === Node.ELEMENT_NODE
    || (n.nodeType === Node.TEXT_NODE && n.textContent.trim()));
}

/**
 * Reward banner: 1 row x 2 columns = [heading, paragraph | CTA link].
 * The CTA may be authored as a bare <a> (not wrapped in <p>) or as a link paragraph.
 * An optional picture-only cell (or a picture authored in the text cell) is
 * treated as the decorative ribbon.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // eslint-disable-next-line no-unused-vars
  const active = [...block.classList].filter((c) => OPTION_CLASSES.includes(c));

  const cells = [...block.children].flatMap((row) => [...row.children]);

  const decoration = document.createElement('div');
  decoration.className = 'columns-reward-decoration';
  decoration.setAttribute('aria-hidden', 'true');

  const content = document.createElement('div');
  content.className = 'columns-reward-content';
  const action = document.createElement('div');
  action.className = 'columns-reward-action';

  const textCells = [];
  cells.forEach((cell) => {
    const pics = [...cell.querySelectorAll('picture')];
    if (pics.length && !cell.textContent.trim()) {
      pics.forEach((pic) => decoration.append(pic));
      return;
    }
    // Picture mixed into a text cell: pull it out as decoration.
    pics.forEach((pic) => {
      const parent = pic.parentElement;
      decoration.append(pic);
      if (parent && parent.tagName === 'P' && !parent.textContent.trim()) parent.remove();
    });
    if (cell.textContent.trim()) textCells.push(cell);
  });

  if (textCells.length === 1) {
    // Single cell authored: split link-only nodes (bare <a> or link paragraphs) into the action.
    const [cell] = textCells;
    meaningfulNodes(cell).forEach((node) => {
      (isLinkOnly(node) ? action : content).append(node);
    });
  } else {
    // Multiple cells: the cell made only of links is the action; fall back to the last cell.
    const ctaCells = textCells.filter((cell) => meaningfulNodes(cell).every(isLinkOnly));
    const actionCells = ctaCells.length && ctaCells.length < textCells.length
      ? ctaCells
      : [textCells[textCells.length - 1]];
    textCells.forEach((cell) => {
      const target = actionCells.includes(cell) ? action : content;
      meaningfulNodes(cell).forEach((node) => target.append(node));
    });
  }

  action.querySelectorAll('a').forEach((a) => a.classList.add('columns-reward-cta'));

  const children = [];
  if (decoration.childElementCount) children.push(decoration);
  children.push(content);
  if (action.childElementCount) children.push(action);
  block.replaceChildren(...children);
}
