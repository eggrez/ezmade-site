export function centeredContentOffset(
  contentTop: number,
  contentHeight: number,
  viewportHeight: number,
  navbarHeight: number,
) {
  const safeTop = navbarHeight + 24;
  const availableHeight = Math.max(0, viewportHeight - safeTop - 24);
  return Math.max(0, contentTop - safeTop - Math.max(0, (availableHeight - contentHeight) / 2));
}

// Layout coordinates ignore temporary reveal transforms on the scene layers.
export function layoutOffsetWithin(element: HTMLElement, ancestor: HTMLElement) {
  let top = 0;
  let current: HTMLElement | null = element;
  while (current && current !== ancestor) {
    top += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }
  return top;
}
