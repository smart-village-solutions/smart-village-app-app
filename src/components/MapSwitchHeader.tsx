import React, { useCallback } from 'react';

import { ListSwitchItem, ListSwitchItemBorder, ListSwitchWrapper } from './ListSwitchItem';
import { BoldText } from './Text';
import { Touchable } from './Touchable';
import { WrapperHorizontal } from './Wrapper';

type Props = {
  setShowMap: (newValue: boolean) => void;
  showMap: boolean;
};

export const MapSwitchHeader = ({ setShowMap, showMap }: Props) => {
  const onPressShowMap = useCallback(() => setShowMap(true), [setShowMap]);
  const onPressShowList = useCallback(() => setShowMap(false), [setShowMap]);

  return (
    <ListSwitchWrapper>
      <Touchable onPress={onPressShowList}>
        <WrapperHorizontal big>
          <ListSwitchItem>
            <BoldText small>Listenansicht</BoldText>
            {!showMap && <ListSwitchItemBorder />}
          </ListSwitchItem>
        </WrapperHorizontal>
      </Touchable>
      <Touchable onPress={onPressShowMap}>
        <WrapperHorizontal big>
          <ListSwitchItem>
            <BoldText small>Kartenansicht</BoldText>
            {showMap && <ListSwitchItemBorder />}
          </ListSwitchItem>
        </WrapperHorizontal>
      </Touchable>
    </ListSwitchWrapper>
  );
};
