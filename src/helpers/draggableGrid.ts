const getSafeColumns = (columns: number) => Math.max(1, columns);

export const getGridContentHeight = (itemCount: number, columns: number, tileSize: number) =>
  Math.ceil(itemCount / getSafeColumns(columns)) * tileSize;

export const getPositionFromOrder = (order: number, columns: number, tileSize: number) => ({
  x: (order % getSafeColumns(columns)) * tileSize,
  y: Math.floor(order / getSafeColumns(columns)) * tileSize
});

export const getOrderFromCoordinates = (
  tx: number,
  ty: number,
  maxOrder: number,
  columns: number,
  tileSize: number
) => {
  const x = Math.round(tx / tileSize) * tileSize;
  const y = Math.round(ty / tileSize) * tileSize;
  const row = Math.max(y, 0) / tileSize;
  const col = Math.max(x, 0) / tileSize;

  return Math.min(row * getSafeColumns(columns) + col, maxOrder);
};
