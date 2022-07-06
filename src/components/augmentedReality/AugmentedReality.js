import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { consts, device, Icon, normalize, texts } from '../../config';
import { ScreenName } from '../../types';
import { Button } from '../Button';
import { RegularText } from '../Text';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { Touchable } from '../Touchable';
import { Wrapper, WrapperRow, WrapperWithOrientation } from '../Wrapper';

import { ARModal } from './ARModal';
import { ARObjectList } from './ARObjectList';

export const AugmentedReality = ({ navigation }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const a11yText = consts.a11yLabel;
  return (
    <>
      <WrapperWithOrientation>
        <Wrapper>
          <Touchable onPress={() => navigation.navigate(ScreenName.ARInfo)}>
            <WrapperRow spaceBetween>
              <RegularText>{texts.augmentedReality.whatIsAugmentedReality}</RegularText>
              <Icon.ArrowRight size={normalize(20)} />
            </WrapperRow>
          </Touchable>
        </Wrapper>

        <Wrapper>
          <Button
            onPress={() => setIsModalVisible(!isModalVisible)}
            invert
            title={texts.augmentedReality.loadingArtworks}
          />
        </Wrapper>

        <TitleContainer>
          <Title accessibilityLabel={`(${texts.augmentedReality.worksOfArt}) ${a11yText.heading}`}>
            {texts.augmentedReality.worksOfArt}
          </Title>
        </TitleContainer>
        {device.platform === 'ios' && <TitleShadow />}

        <ARObjectList showOnDetailPage navigation={navigation} />
      </WrapperWithOrientation>

      <ARModal
        showTitle
        isListView
        item={{}}
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
      />
    </>
  );
};

AugmentedReality.propTypes = {
  navigation: PropTypes.object
};
