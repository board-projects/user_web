export function canvasPixelRatio(canvas: HTMLCanvasElement) {
  const width = Number.parseFloat(canvas.style.width);
  return width > 0 && canvas.width > 0 ? canvas.width / width : window.devicePixelRatio || 1;
}
