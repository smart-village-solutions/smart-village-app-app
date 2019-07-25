import Carousel from 'react-native-snap-carousel';
import React from 'react';

import { device } from '../../../config';
import { Image } from '../../Image';

const BBImages = [
  { picture: require('../../../../assets/images/home.jpg') },
  { picture: require('../../../../assets/images/_MG_0013-1.jpg') },
  { picture: require('../../../../assets/images/_MG_0017_1.jpg') },
  { picture: require('../../../../assets/images/_MG_0043-1.jpg') },
  { picture: require('../../../../assets/images/_MG_0061_1.jpg') }
];

export class ImagesCarousel extends React.Component {
  renderItem({ item }) {
    return <Image source={item.picture} />;
  }

  render() {
    return (
      <Carousel
        data={BBImages}
        renderItem={this.renderItem}
        sliderWidth={device.width}
        itemWidth={device.width}
        slideStyle={{ width: device.width }}
        inactiveSlideOpacity={1}
        inactiveSlideScale={1}
      />
    );
  }
}

// import Carousel, { Pagination } from 'react-native-snap-carousel';
//
// export default class MyCarousel extends Component {

//     _renderItem ({item, index}) {
//         return <MySlideComponent data={item} />
//     }

//     get pagination () {
//         const { entries, activeSlide } = this.state;
//         return (
//             <Pagination
//               dotsLength={entries.length}
//               activeDotIndex={activeSlide}
//               containerStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
//               dotStyle={{
//                   width: 10,
//                   height: 10,
//                   borderRadius: 5,
//                   marginHorizontal: 8,
//                   backgroundColor: 'rgba(255, 255, 255, 0.92)'
//               }}
//               inactiveDotStyle={{
//                   // Define styles for inactive dots here
//               }}
//               inactiveDotOpacity={0.4}
//               inactiveDotScale={0.6}
//             />
//         );
//     }

//     render () {
//         return (
//             <View>
//                 <Carousel
//                   data={this.state.entries}
//                   renderItem={this._renderItem}
//                   onSnapToItem={(index) => this.setState({ activeSlide: index }) }
//                 />
//                 { this.pagination }
//             </View>
//         );
//     }
