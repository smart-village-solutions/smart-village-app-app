import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { View } from 'react-native';

import { OptionToggle, RegularText } from '..';
import { consts, device, texts } from '../../config';
import { useOpenWebScreen } from '../../hooks';
import { HtmlView } from '../HtmlView';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { Wrapper, WrapperWithOrientation } from '../Wrapper';

export const VolunteerTask = ({ data, route }) => {
  const { description, title, checklist, assigned_users } = data;

  const [checklistOptions, setChecklistOptions] = useState(checklist);

  // action to open source urls
  const openWebScreen = useOpenWebScreen('Aufgabe', undefined, route.params?.rootRouteName);

  const a11yText = consts.a11yLabel;
  return (
    <View>
      <WrapperWithOrientation>
        {!!title && (
          <View>
            <TitleContainer>
              <Title accessibilityLabel={`(${title}) ${a11yText.heading}`}>{title}</Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
          </View>
        )}

        {!!assigned_users?.length && !!assigned_users?.[0]?.display_name && (
          <Wrapper>
            <RegularText>Zugewiesen: {assigned_users?.[0]?.display_name}</RegularText>
          </Wrapper>
        )}

        {!!description && (
          <View>
            <TitleContainer>
              <Title
                accessibilityLabel={`(${texts.pointOfInterest.description}) ${a11yText.heading}`}
              >
                {texts.pointOfInterest.description}
              </Title>
            </TitleContainer>
            {device.platform === 'ios' && <TitleShadow />}
            <Wrapper>
              <HtmlView html={description} openWebScreen={openWebScreen} />
            </Wrapper>
          </View>
        )}

        {!!checklistOptions?.length && (
          <Wrapper>
            {checklistOptions.map((entry) => {
              return (
                <OptionToggle
                  key={entry.id}
                  label={entry.title}
                  onToggle={() =>
                    setChecklistOptions((checklistOptions) =>
                      checklistOptions.map((option) => {
                        if (option.id === entry.id) {
                          option.completed = !option.completed;
                        }

                        return option;
                      })
                    )
                  }
                  value={entry.completed}
                />
              );
            })}
          </Wrapper>
        )}
      </WrapperWithOrientation>
    </View>
  );
};

VolunteerTask.propTypes = {
  data: PropTypes.object.isRequired,
  navigation: PropTypes.object,
  route: PropTypes.object.isRequired
};
