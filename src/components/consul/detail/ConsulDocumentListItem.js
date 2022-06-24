import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { View, StyleSheet, Modal, Dimensions, TouchableOpacity } from 'react-native';
import WebView from 'react-native-webview';

import { colors, device, Icon, normalize, texts } from '../../../config';
import { Button } from '../../Button';
import { RegularText } from '../../Text';

export const ConsulDocumentListItem = ({ documentItem }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { url, title } = documentItem;

  return (
    <>
      <View style={styles.container}>
        <View>
          <RegularText>{title}</RegularText>
          <RegularText smallest>PDF</RegularText>
        </View>

        <Button title={texts.consul.showPDF} onPress={() => setIsModalVisible(true)} />
      </View>

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => setIsModalVisible(!isModalVisible)}
            >
              <Icon.Close color={colors.lightestText} size={normalize(16)} />
            </TouchableOpacity>

            <WebView
              bounces={false}
              originWhitelist={['*']}
              startInLoadingState={true}
              allowFileAccess={true}
              source={{
                uri:
                  device.platform === 'ios'
                    ? url
                    : `http://docs.google.com/gview?embedded=true&url=${url}`
              }}
              style={{ width: Dimensions.get('screen').width }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 20,
    padding: 5
  },
  buttonClose: {
    backgroundColor: colors.borderRgba,
    position: 'absolute',
    right: 25,
    top: 25,
    zIndex: 1
  },
  centeredView: {
    alignItems: 'center',
    backgroundColor: colors.borderRgba,
    flex: 1,
    justifyContent: 'flex-end'
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: normalize(21)
  },
  modalView: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    height: Dimensions.get('screen').height - 120,
    paddingTop: 75
  }
});

ConsulDocumentListItem.propTypes = {
  documentItem: PropTypes.object.isRequired
};
