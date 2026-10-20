/**
 * Scroll-parallax for decorative images flagged with `data-anim="parallax"`.
 *
 * Ported from the old block-1 "barco" behavior: the image eases vertically
 * inside its parent column with an ease-out curve driven by the scroll
 * position, only while the parent is inside the viewport.
 */

/** Update one image's vertical offset from the current scroll. */
function updateParallax(image: HTMLImageElement): void {
  const parent = image.parentElement;
  if (!parent) return;

  const containerRect = parent.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const containerHeight = parent.offsetHeight;
  const imageHeight = image.offsetHeight;

  // Only calculate when the container is inside the viewport
  if (containerRect.bottom < 0 || containerRect.top > viewportHeight) return;

  // Movement range of the image inside its container
  const maxOffset = containerHeight - imageHeight;

  const startScrollTop = viewportHeight - imageHeight * 0.8;
  const endScrollTop = viewportHeight - containerHeight;

  const scrollRange = Math.max(1, startScrollTop - endScrollTop);
  const currentScroll = startScrollTop - containerRect.top;

  const linearRatio = currentScroll / scrollRange;

  // Ease-out curve: starts faster and settles at the end
  const compensatedProgress = linearRatio * (1.6 - 0.6 * linearRatio);
  const progress = Math.max(0, Math.min(1, compensatedProgress));
  const offset = progress * maxOffset;

  image.style.transform = `translateY(${offset}px)`;
}

/** Bind the scroll/resize behavior to a single image (idempotent). */
function setup(image: HTMLImageElement): void {
  if (image.hasAttribute('data-parallax-ready')) return;
  image.setAttribute('data-parallax-ready', 'true');

  let isTicking = false;

  const onScroll = () => {
    if (isTicking) return;
    isTicking = true;
    window.requestAnimationFrame(() => {
      updateParallax(image);
      isTicking = false;
    });
  };

  const onResize = () => {
    updateParallax(image);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });

  updateParallax(image);
}

/** Initialize every parallax image under `root` (default: the whole document). */
export function initParallax(root: ParentNode = document): void {
  root.querySelectorAll<HTMLImageElement>('[data-anim="parallax"]').forEach(setup);
}
