const resizeGrip = (
  <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-sm border-2 border-blue-600 bg-white shadow-sm" />
);

export const itemResizeHandles = {
  topLeft: resizeGrip, topRight: resizeGrip, bottomLeft: resizeGrip, bottomRight: resizeGrip,
};

export const itemSelectionStyle = (selected: boolean) => ({
  outline: selected ? "2px solid #2563eb" : "none",
  outlineOffset: 2,
});
