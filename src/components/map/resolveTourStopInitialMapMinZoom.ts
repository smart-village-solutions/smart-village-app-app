export const DEFAULT_TOUR_STOP_INITIAL_MAP_MIN_ZOOM = 14;

export const resolveTourStopInitialMapMinZoom = (settings: unknown): number => {
  const value = (
    settings as { locationService?: { tours?: { initialMapMinZoom?: unknown } } } | undefined
  )?.locationService?.tours?.initialMapMinZoom;

  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 18) {
    return DEFAULT_TOUR_STOP_INITIAL_MAP_MIN_ZOOM;
  }

  return value;
};
