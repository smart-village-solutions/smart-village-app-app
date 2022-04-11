import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { View, StyleSheet, Modal, Dimensions } from 'react-native';
import WebView from 'react-native-webview';

import { RegularText } from '../../Text';
import { Touchable } from '../../Touchable';
import { colors, normalize, Icon, texts } from '../../../config';
import { device } from '../../../config';
import { Button } from '../../Button';

export const ConsulDocumentListItem = ({ item }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const { url } = item.item;

  return (
    <View style={styles.container}>
      <RegularText>{url}</RegularText>

      <Button title={texts.consul.showPDF} onPress={() => setModalVisible(true)} />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Touchable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Icon.Close color={colors.lightestText} size={normalize(16)} />
            </Touchable>

            <WebView
              bounces={false}
              originWhitelist={['*']}
              startInLoadingState={true}
              allowFileAccess={true}
              source={{
                uri:
                  device.platform === 'ios'
                    ? 'http://www.africau.edu/images/default/sample.pdf'
                    : `http://docs.google.com/gview?embedded=true&url=${url}`
              }}
              style={{ width: Dimensions.get('screen').width }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

ConsulDocumentListItem.propTypes = {
  item: PropTypes.object.isRequired
};

const styles = StyleSheet.create({
  container: {
    marginTop: normalize(10)
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: colors.borderRgba
  },
  modalView: {
    height: Dimensions.get('screen').height - 120,
    backgroundColor: colors.lightestText,
    paddingTop: 75,
    borderRadius: 20,
    alignItems: 'center'
  },
  button: {
    borderRadius: 20,
    padding: 5
  },
  buttonClose: {
    backgroundColor: colors.borderRgba,
    right: 25,
    top: 25,
    zIndex: 1,
    position: 'absolute'
  }
});
