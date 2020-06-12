import PropTypes from 'prop-types';
import Carousel from 'react-native-snap-carousel';
import React from 'react';
import { TouchableOpacity } from 'react-native';

import { device } from '../config';
import { Image } from './Image';

export class ImagesCarousel extends React.Component {
  renderItem = ({ item }) => {
    const { navigation } = this.props;
    const { routeName, params } = item.picture;

    if (!!routeName && !!params) {
      return (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate({
              routeName,
              params
            })
          }
          activeOpacity={0.8}
        >
          <Image source={item.picture} />
        </TouchableOpacity>
      );
    } else {
      return <Image source={item.picture} />;
    }
  };

  render() {
    const { data } = this.props;

    return (
      <Carousel
        data={data}
        renderItem={this.renderItem}
        sliderWidth={device.width}
        itemWidth={device.width}
        inactiveSlideScale={1}
        autoplay
        loop
        autoplayDelay={0}
        autoplayInterval={4000}
      />
    );
  }
}

ImagesCarousel.propTypes = {
  data: PropTypes.array.isRequired,
  navigation: PropTypes.object
};
