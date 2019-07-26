import PropTypes from 'prop-types';
import Carousel from 'react-native-snap-carousel';
import React from 'react';

import { device } from '../../../config';
import { Image } from '../../Image';

export class ImagesCarousel extends React.Component {
  renderItem({ item }) {
    return <Image source={item.picture} />;
  }

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
  data: PropTypes.array.isRequired
};
