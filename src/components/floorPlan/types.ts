import { ComponentType } from 'react';
import { SvgProps } from 'react-native-svg';

export type FloorPlanPinType = 'info' | 'room' | 'service' | 'warning';

export type LinkedContentType = 'poi' | 'event' | 'news' | 'page' | 'contact';

export type FloorPlanInitialViewMode = 'list' | 'svg';

export interface FloorPlanPin {
  id: string;
  title: string;
  accessibilityLabel?: string;
  buttonTitle?: string;
  description?: string;
  floorId?: string;
  floorTitle?: string;
  x: number;
  y: number;
  icon?: string;
  listId?: string;
  type?: FloorPlanPinType;
  params?: Record<string, unknown>;
  routeName?: string;
  linkedContentType?: LinkedContentType;
  linkedContentId?: string;
}

export type FloorPlanViewBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export interface FloorPlanFloorConfig {
  id: string;
  title: string;
  svgXml?: string;
  svgUrl?: string;
  svgAsset?: ComponentType<SvgProps>;
  viewBox: FloorPlanViewBox;
  pins: FloorPlanPin[];
}

export interface FloorPlanConfig {
  id: string;
  title: string;
  floors: FloorPlanFloorConfig[];
  initialFloorId?: string;
  initialViewMode?: FloorPlanInitialViewMode;
}

export type FloorPlanRouteParams = {
  title?: string;
  floorPlanConfig?: FloorPlanConfig;
  initialFloorId?: string;
  initialViewMode?: FloorPlanInitialViewMode;
  staticJsonName?: string;
};
