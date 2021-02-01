import _isObjectLike from 'lodash/isObjectLike';
import _isArray from 'lodash/isArray';
import { isNumberArray } from './basicTypeValidation';

enum GeoJsonType {
  Feature = 'Feature',
  FeatureCollection = 'FeatureCollection',
  GeometryCollection = 'GeometryCollection',
  LineString = 'LineString',
  MulitPolygon = 'MultiPolygon',
  MultiLineString = 'MultiLineString',
  MultiPoint = 'MultiPoint',
  Point = 'Point',
  Polygon = 'Polygon'
}

type GeoJsonPoint = {
  type: GeoJsonType.Point;
  coordinates: number[];
};

type GeoJsonMultiPoint = {
  type: GeoJsonType.MultiPoint;
  coordinates: number[][];
};

type GeoJsonFeature = {
  type: GeoJsonType.Feature;
  geometry: unknown;
};

type GeoJsonFeatureCollection = {
  type: GeoJsonType.FeatureCollection;
  features: GeoJsonFeature[];
};

export const isPoint = (json: unknown): json is GeoJsonPoint => {
  return (
    _isObjectLike(json) &&
    (json as { type: GeoJsonType }).type === GeoJsonType.Point &&
    isNumberArray((json as { coordinates: unknown }).coordinates)
  );
};

export const isMultiPoint = (json: unknown): json is GeoJsonMultiPoint => {
  if (_isObjectLike(json) && (json as { type: unknown }).type === GeoJsonType.MultiPoint) {
    const { coordinates } = json as { coordinates: unknown };
    return (
      _isArray(coordinates) &&
      coordinates.reduce((accumulated, current) => accumulated && isNumberArray(current), true)
    );
  }

  return false;
};

export const isFeature = (json: unknown): json is GeoJsonFeature =>
  _isObjectLike(json) && (json as { type: unknown }).type === GeoJsonType.Feature;

export const isFeatureCollection = (json: unknown): json is GeoJsonFeatureCollection => {
  if (_isObjectLike(json) && (json as { type: unknown }).type === GeoJsonType.FeatureCollection) {
    const { features } = json as { features: unknown };

    return (
      _isArray(features) &&
      features.reduce((accumulated, current) => accumulated && isFeature(current), true)
    );
  }

  return false;
};
