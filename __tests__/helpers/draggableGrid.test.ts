import {
  getGridContentHeight,
  getOrderFromCoordinates,
  getPositionFromOrder
} from '../../src/helpers/draggableGrid';

describe('draggableGrid helpers', () => {
  it('computes content height by row count', () => {
    expect(getGridContentHeight(0, 3, 100)).toBe(0);
    expect(getGridContentHeight(1, 3, 100)).toBe(100);
    expect(getGridContentHeight(4, 3, 100)).toBe(200);
    expect(getGridContentHeight(9, 4, 80)).toBe(240);
  });

  it('maps item order to grid position', () => {
    expect(getPositionFromOrder(0, 3, 100)).toEqual({ x: 0, y: 0 });
    expect(getPositionFromOrder(1, 3, 100)).toEqual({ x: 100, y: 0 });
    expect(getPositionFromOrder(3, 3, 100)).toEqual({ x: 0, y: 100 });
    expect(getPositionFromOrder(5, 2, 50)).toEqual({ x: 50, y: 100 });
  });

  it('maps coordinates to clamped order', () => {
    expect(getOrderFromCoordinates(0, 0, 8, 3, 100)).toBe(0);
    expect(getOrderFromCoordinates(210, 10, 8, 3, 100)).toBe(2);
    expect(getOrderFromCoordinates(20, 230, 8, 3, 100)).toBe(6);
    expect(getOrderFromCoordinates(999, 999, 8, 3, 100)).toBe(8);
    expect(getOrderFromCoordinates(-50, -50, 8, 3, 100)).toBe(0);
  });

  it('guards against invalid column count', () => {
    expect(getGridContentHeight(3, 0, 100)).toBe(300);
    expect(getPositionFromOrder(2, 0, 100)).toEqual({ x: 0, y: 200 });
    expect(getOrderFromCoordinates(210, 10, 8, 0, 100)).toBe(2);
  });
});
