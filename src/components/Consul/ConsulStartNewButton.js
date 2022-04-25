import PropTypes from 'prop-types';
import React from 'react';

import { Button } from '../Button';
import { Wrapper } from '../Wrapper';
import { ScreenName } from '../../types';

export const ConsulStartNewButton = ({ title, buttonTitle, query, navigation, data }) => {
  return (
    <Wrapper>
      <Button
        onPress={() =>
          navigation.navigate(ScreenName.ConsulStartNewScreen, {
            title,
            query,
            data
          })
        }
        title={buttonTitle}
      />
    </Wrapper>
  );
};

ConsulStartNewButton.propTypes = {
  title: PropTypes.string.isRequired,
  buttonTitle: PropTypes.string.isRequired,
  query: PropTypes.string.isRequired,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired
  }).isRequired,
  data: PropTypes.object
};
