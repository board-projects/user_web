export function isBoardInteractiveTarget(target: EventTarget | null) {
  return target instanceof Element && !!target.closest('[data-interactive="true"], [data-ui="true"]');
}
