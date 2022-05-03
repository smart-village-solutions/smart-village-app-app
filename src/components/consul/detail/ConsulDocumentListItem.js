import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { View, StyleSheet, Modal, Dimensions, TouchableOpacity } from 'react-native';
import WebView from 'react-native-webview';

import { RegularText } from '../../Text';
import { colors, normalize, Icon, texts } from '../../../config';
import { device } from '../../../config';
import { Button } from '../../Button';

export const ConsulDocumentListItem = ({ documentItem }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const { url, title } = documentItem;

  return (
    <>
      <View style={styles.container}>
        <View>
          <RegularText>{title}</RegularText>
          <RegularText smallest>PDF</RegularText>
        </View>

        <Button title={texts.consul.showPDF} onPress={() => setModalVisible(true)} />
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}
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

ConsulDocumentListItem.propTypes = {
  documentItem: PropTypes.object.isRequired
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: normalize(21)
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
