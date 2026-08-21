import { NavigationProp } from '@react-navigation/native';

import { QUERY_TYPES } from '../../queries';
import { ScreenName } from '../../types';

import {
  FloorPlanConfig,
  FloorPlanFloorConfig,
  FloorPlanInitialViewMode,
  FloorPlanPin,
  FloorPlanPinType,
  FloorPlanViewBox,
  LinkedContentType
} from './types';

const floorPlanPinTypes = ['info', 'room', 'service', 'warning'] as const;
const floorPlanViewModes = ['list', 'svg'] as const;
const linkedContentTypes = ['poi', 'event', 'news', 'page', 'contact'] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const getStringValue = (value: unknown) => (typeof value === 'string' ? value : undefined);

const getParamsValue = (value: unknown) => (isRecord(value) ? value : undefined);

const getNumberValue = (value: unknown) => {
  const numberValue = typeof value === 'number' ? value : Number(value);

  return Number.isFinite(numberValue) ? numberValue : undefined;
};

const parseViewBox = (value: unknown): FloorPlanViewBox | undefined => {
  if (!isRecord(value)) return undefined;

  const x = getNumberValue(value.x) ?? 0;
  const y = getNumberValue(value.y) ?? 0;
  const width = getNumberValue(value.width);
  const height = getNumberValue(value.height);

  if (!width || !height) return undefined;

  return { x, y, width, height };
};

const parseFloorPlanPin = (value: unknown): FloorPlanPin | undefined => {
  if (!isRecord(value)) return undefined;

  const id = getStringValue(value.id);
  const title = getStringValue(value.title);
  const x = getNumberValue(value.x);
  const y = getNumberValue(value.y);

  if (!id || !title || x === undefined || y === undefined) return undefined;

  const type = getStringValue(value.type);
  const linkedContentType = getStringValue(value.linkedContentType);
  const linkedContentId = getStringValue(value.linkedContentId);
  const routeName = getStringValue(value.routeName);
  const params = getParamsValue(value.params);

  return {
    id,
    title,
    x,
    y,
    accessibilityLabel: getStringValue(value.accessibilityLabel),
    buttonTitle: getStringValue(value.buttonTitle),
    description: getStringValue(value.description),
    icon: getStringValue(value.icon),
    linkedContentId,
    linkedContentType: linkedContentTypes.includes(linkedContentType as LinkedContentType)
      ? (linkedContentType as LinkedContentType)
      : undefined,
    params,
    routeName,
    type: floorPlanPinTypes.includes(type as FloorPlanPinType)
      ? (type as FloorPlanPinType)
      : undefined
  };
};

const parseFloorPlanFloorConfig = (json: unknown): FloorPlanFloorConfig | undefined => {
  if (!isRecord(json)) return undefined;

  const id = getStringValue(json.id);
  const viewBox = parseViewBox(json.viewBox);
  const pins = Array.isArray(json.pins)
    ? json.pins.map(parseFloorPlanPin).filter((pin): pin is FloorPlanPin => !!pin)
    : [];
  const svgXml = getStringValue(json.svgXml) || getStringValue(json.svg);
  const svgUrl = getStringValue(json.svgUrl);

  if (!id || !viewBox) return undefined;

  return {
    id,
    title: getStringValue(json.title) || '',
    pins,
    svgUrl,
    svgXml,
    viewBox
  };
};

const getInitialViewMode = (value: unknown) => {
  const initialViewMode = getStringValue(value);

  return floorPlanViewModes.includes(initialViewMode as FloorPlanInitialViewMode)
    ? (initialViewMode as FloorPlanInitialViewMode)
    : undefined;
};

const getFloorPlanFloors = (json: unknown) => {
  if (Array.isArray(json)) {
    return json
      .map(parseFloorPlanFloorConfig)
      .filter((floor): floor is FloorPlanFloorConfig => !!floor);
  }

  if (!isRecord(json)) return [];

  const floorEntries = Array.isArray(json.floors) ? json.floors : [json];

  return floorEntries
    .map(parseFloorPlanFloorConfig)
    .filter((floor): floor is FloorPlanFloorConfig => !!floor);
};

export const parseFloorPlanConfig = (json: unknown): FloorPlanConfig | undefined => {
  const floors = getFloorPlanFloors(json);

  if (!floors.length) return undefined;

  const jsonRecord = isRecord(json) ? json : {};
  const firstFloor = floors[0];

  return {
    id: getStringValue(jsonRecord.id) || firstFloor.id,
    title: getStringValue(jsonRecord.title) || firstFloor.title,
    floors,
    initialFloorId: getStringValue(jsonRecord.initialFloorId),
    initialViewMode: getInitialViewMode(jsonRecord.initialViewMode)
  };
};

export const isPinInsideViewBox = (pin: FloorPlanPin, viewBox: FloorPlanViewBox) =>
  pin.x >= viewBox.x &&
  pin.x <= viewBox.x + viewBox.width &&
  pin.y >= viewBox.y &&
  pin.y <= viewBox.y + viewBox.height;

export const getValidFloorPlanPins = (pins: FloorPlanPin[], viewBox: FloorPlanViewBox) =>
  pins.filter((pin) => !!pin.id && !!pin.title && isPinInsideViewBox(pin, viewBox));

const linkedContentRoutes: Partial<Record<LinkedContentType, ScreenName>> = {
  contact: ScreenName.Detail,
  event: ScreenName.Detail,
  news: ScreenName.Detail,
  page: ScreenName.Html,
  poi: ScreenName.Detail
};

export const getLinkedContentRoute = (contentType?: LinkedContentType) =>
  contentType ? linkedContentRoutes[contentType] : undefined;

export const canNavigateToLinkedContent = (pin: FloorPlanPin) =>
  !!pin.routeName ||
  (!!pin.linkedContentType &&
    !!pin.linkedContentId &&
    !!getLinkedContentRoute(pin.linkedContentType));

export const navigateToLinkedContent = ({
  navigation,
  pin
}: {
  navigation?: NavigationProp<Record<string, object | undefined>>;
  pin: FloorPlanPin;
}) => {
  if (!navigation || !canNavigateToLinkedContent(pin)) return false;

  if (pin.routeName) {
    navigation.navigate(pin.routeName, pin.params);

    return true;
  }

  const routeName = getLinkedContentRoute(pin.linkedContentType);
  if (!routeName) return false;

  if (routeName === ScreenName.Html) {
    navigation.navigate(routeName, {
      query: QUERY_TYPES.PUBLIC_HTML_FILE,
      queryVariables: { name: pin.linkedContentId },
      title: pin.title
    });

    return true;
  }

  navigation.navigate(routeName, {
    id: pin.linkedContentId,
    title: pin.title
  });

  return true;
};
