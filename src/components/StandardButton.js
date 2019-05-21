import React, { Component } from 'react';

import { Button } from 'react-native-elements';
import { colors, texts } from '../config';

export class StandardButton extends Component {
  render() {
    return (
      <Button
        title={texts}
        type="outline"
        style={{
          alignSelf: 'center',
          marginTop: 10,
          marginBottom: 10
        }}
      />
    );
  }
}
