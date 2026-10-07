/**
 * Masonry tipo Pinterest sobre CSS Grid.
 *
 * Cada card mide su altura real y ocupa `span N` filas de una grilla oculta de
 * `rowHeight` px. El autoplacement de CSS avanza de columna en columna y solo
 * baja de fila cuando da la vuelta, asi que el orden de lectura queda de
 * izquierda a derecha (como en Pinterest) y las columnas se empaquetan sin huecos.
 *
 * `align-items: start` en el CSS es obligatorio: sin el, el grid estira la card
 * hasta el final de las filas reservadas y la medicion realimenta el calculo.
 */

export interface MasonryOptions {
  /** ancho minimo de una columna */
  minColWidth?: number;
  /** separacion horizontal entre columnas */
  colGap?: number;
  /** separacion vertical entre filas de la grilla oculta */
  rowGap?: number;
  /** altura de cada fila de la grilla oculta */
  rowHeight?: number;
}

const DEFAULTS: Required<MasonryOptions> = {
  minColWidth: 300,
  colGap: 14,
  rowGap: 8,
  rowHeight: 8
};

export function masonry(node: HTMLElement, options: MasonryOptions = {}) {
  const o = { ...DEFAULTS, ...options };
  let frame = 0;
  let width = 0;

  const resizeObserver = new ResizeObserver(schedule);
  const mutationObserver = new MutationObserver(() => {
    observeChildren();
    schedule();
  });

  function items(): HTMLElement[] {
    return Array.from(node.children) as HTMLElement[];
  }

  function observeChildren() {
    resizeObserver.disconnect();
    for (const el of items()) resizeObserver.observe(el);
  }

  function schedule() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(relayout);
  }

  function relayout() {
    const next = node.clientWidth;
    if (!next) return;
    const cols = Math.max(1, Math.floor((next + o.colGap) / (o.minColWidth + o.colGap)));
    if (next !== width) {
      width = next;
      node.style.setProperty('--masonry-cols', String(cols));
    }
    const unit = o.rowHeight + o.rowGap;
    for (const el of items()) {
      const span = Math.max(1, Math.ceil((el.getBoundingClientRect().height + o.rowGap) / unit));
      const next_ = `span ${span}`;
      if (el.style.gridRowEnd !== next_) el.style.gridRowEnd = next_;
    }
  }

  node.classList.add('masonry');
  observeChildren();
  mutationObserver.observe(node, { childList: true });
  resizeObserver.observe(node);
  schedule();

  return {
    update(next: MasonryOptions) {
      Object.assign(o, next);
      schedule();
    },
    destroy() {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      node.classList.remove('masonry');
      node.style.removeProperty('--masonry-cols');
    }
  };
}