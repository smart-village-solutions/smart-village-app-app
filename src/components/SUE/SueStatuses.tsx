import React, { Fragment, useContext } from 'react';
import { StyleSheet } from 'react-native';

import { ConfigurationsContext } from '../../ConfigurationsProvider';
import { normalize, texts } from '../../config';
import { BoldText, RegularText } from '../Text';
import { Wrapper, WrapperRow } from '../Wrapper';

import { SueStatus } from './SueStatus';

export const SueStatuses = ({ status }: { status: string }) => {
  const { appDesignSystem = {} } = useContext(ConfigurationsContext);
  const { sueStatus = {} } = appDesignSystem;
  const { statuses, statusViewColors = {} } = sueStatus;

  if (!statuses?.length) return null;

  const activeStatusIndex = statuses.findIndex(
    (item: { status: string; matchingStatuses: string[]; iconName: string }) =>
      item.matchingStatuses.includes(status)
  );

  return (
    <Wrapper>
      <BoldText>{texts.sue.currentStatus}</BoldText>
      <WrapperRow style={styles.container}>
        {statuses?.map(
          (
            item: { status: string; matchingStatuses: string[]; iconName: string },
            index: number
          ) => (
            <Fragment key={index}>
              <SueStatus
                disabled={!item.matchingStatuses.includes(status)}
                iconName={
                  activeStatusIndex > index
                    ? 'check'
                    : activeStatusIndex == index
                    ? item.iconName
                    : undefined
                }
                small
                status={item.status}
              />
              {index < statuses.length - 1 && (
                <RegularText style={{ color: statusViewColors.disabled }}>–</RegularText>
              )}
            </Fragment>
          )
        )}
      </WrapperRow>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: normalize(10)
  }
});
