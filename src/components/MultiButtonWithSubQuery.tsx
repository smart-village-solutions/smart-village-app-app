import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';

import { SubQuery } from '../types';

import { Button } from './Button';

// action to open source urls or navigate to sub screens
export const navigateWithSubQuery = ({
  navigation,
  title,
  params,
  rootRouteName,
  subQuery
}: {
  navigation: StackNavigationProp<any, string>;
  title?: string;
  params?:
    | {
        isExternal?: boolean;
        routeName: string;
        webUrl: string;
        paramsForButton?: {
          query: string;
          queryVariables: { name: string };
          rootRouteName: string;
          routeName: string;
          subQuery: SubQuery;
          title: string;
          webUrl?: string;
        };
      }
    | string;
  rootRouteName?: string;
  subQuery: SubQuery;
}) => {
  // if the `params` is a string, it is directly the web url to call
  if (!!params && typeof params === 'string') {
    return navigation.push('Web', {
      rootRouteName,
      title,
      webUrl: params
    });
  }

  if (!!params && typeof params === 'object') {
    // if `params` is an object and contains the `paramsForButton` object,
    // the values here are added to the navigation
    if (params.paramsForButton) {
      return navigation.push(params.routeName, {
        ...params.paramsForButton,
        rootRouteName
      });
    }

    // if `params` is an object and does not contain the `paramsForButton` object,
    // it contains a `routeName` and a `webUrl`
    return navigation.push(params.routeName, {
      isExternal: params.isExternal,
      rootRouteName,
      title,
      webUrl: params.webUrl
    });
  }

  const subParams = { ...(subQuery.params ?? {}) };

  // if there is no `params`, use the main `subQuery` values for `routeName` and a `webUrl` or
  // `params` if the params contain a webUrl as well, the webUrl property of the subQuery
  // will be ignored
  return navigation.push(subQuery.routeName, {
    ...subParams,
    isExternal: subQuery.isExternal,
    rootRouteName,
    title,
    webUrl: subQuery.webUrl
  });
};

export const MultiButtonWithSubQuery = ({
  navigation,
  rootRouteName,
  subQuery,
  title
}: {
  navigation: StackNavigationProp<any>;
  rootRouteName?: string;
  subQuery: SubQuery;
  title: string;
}) => {
  return (
    <>
      {!!subQuery && !!subQuery.routeName && (!!subQuery.webUrl || subQuery.params) && (
        <Button
          title={subQuery.buttonTitle || `${title} öffnen`}
          onPress={() => navigateWithSubQuery({ navigation, subQuery, rootRouteName, title })}
        />
      )}

      {subQuery?.buttons?.map((button, index) => (
        <Button
          key={`${index}-${button.webUrl}`}
          title={button.buttonTitle || `${title} öffnen`}
          onPress={() =>
            navigateWithSubQuery({
              navigation,
              params: button,
              rootRouteName,
              subQuery,
              title
            })
          }
        />
      ))}
    </>
  );
};
