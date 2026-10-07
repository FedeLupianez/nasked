/**
 * Masonry tipo Pinterest: posicionamiento absoluto en pixeles.
 *
 * Cada card se coloca en la columna mas corta (la de menor acumulado), a la
 * altura exacta de esa columna. No hay grilla de filas de por medio, asi que las
 * separaciones son siempre exactamente `colGap` / `rowGap`, sin cuantizar.
 *
 * Las columnas se reparten en round-robin por orden de lectura: la card N va a
 * la columna N % cols, de modo que el orden horizontal se mantiene de izquierda a
 * derecha como en Pinterest, sin huecos y sin saltos verticales.
 */

export interface MasonryOptions {
  /** ancho minimo de una columna */
  minColWidth?: number;
  /** separacion horizontal entre columnas */
  colGap?: number;
  /** separacion vertical entre cards */
  rowGap?: number;
}

const DEFAULTS: Required<MasonryOptions> = {
  minColWidth: 300,
  colGap: 14,
  rowGap: 14
};

/**
 * El nodo ya fue colocado por la acción (tiene posición calculada).
 * Hasta entonces sigue en top:0 y su rect no sirve para scrollear.
 */
export function isPositioned(el: HTMLElement): boolean {
  return el.style.transform !== '';
}

export function masonry(node: HTMLElement, options: MasonryOptions = {}) {
  const o: MasonryOptions = { ...DEFAULTS, ...options };
  let frame = 0;
  let width = 0;
  let cols = 0;

  const resizeObserver = new ResizeObserver(schedule);
  const mutationObserver = new MutationObserver(() => {
    observeChildren();
    schedule();
  });

  function items(): HTMLElement[] {
    const els = Array.from(node.children) as HTMLElement[];
    // Svelte puede recrear los hijos al cambiar el listado: hay que re-marcarlos
    for (const el of els) if (!el.classList.contains('masonry-item')) el.classList.add('masonry-item');
    return els;
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
    const next = width = node.clientWidth;
    if (!next) return;
    cols = Math.max(1, Math.floor((next + o.colGap) / (o.minColWidth + o.colGap)));
    const colWidth = (next - o.colGap * (cols - 1)) / cols;
    const heights = new Array<number>(cols).fill(0);

    for (const el of items()) {
      el.style.width = `${colWidth}px`;
      el.style.removeProperty('grid-row-end');
      // se mide el ancho antes de fijar la altura para no realimentar el layout
      const h = el.getBoundingClientRect().height;
      const col = heights.indexOf(Math.min(...heights));
      const x = col * (colWidth + o.colGap);
      const y = heights[col];
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      heights[col] = y + h + o.rowGap;
    }
    node.style.height = `${Math.max(...heights) - o.rowGap}px`;
  }

  node.classList.add('masonry');
  for (const el of items()) el.classList.add('masonry-item');
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
      for (const el of items()) {
        el.classList.remove('masonry-item');
        el.style.removeProperty('transform');
        el.style.removeProperty('width');
      }
      node.classList.remove('masonry');
      node.style.removeProperty('height');
    }
  };
}