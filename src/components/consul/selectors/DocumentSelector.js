import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-apollo';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, consts, Icon, normalize, texts } from '../../../config';
import { ConsulClient } from '../../../ConsulClient';
import {
  deleteArrayItem,
  documentErrorMessageGenerator,
  formatSize,
  jsonParser
} from '../../../helpers';
import { useSelectDocument } from '../../../hooks';
import { DELETE_DOCUMENT } from '../../../queries/consul';
import { calendarDeleteFile } from '../../../queries/volunteer';
import { Button } from '../../Button';
import { Input } from '../../form';
import { RegularText } from '../../Text';
import { WrapperRow } from '../../Wrapper';

const { URL_REGEX } = consts;

const deleteDocumentAlert = (onPress) =>
  Alert.alert(
    texts.consul.startNew.deleteAttributesAlertTitle,
    texts.consul.startNew.documentDeleteAlertBody,
    [
      {
        text: texts.consul.abort,
        style: 'cancel'
      },
      {
        text: texts.consul.startNew.deleteAttributesButtonText,
        onPress,
        style: 'destructive'
      }
    ]
  );

export const DocumentSelector = ({ configuration, control, field, isVolunteer, item }) => {
  const { buttonTitle, infoText } = item;
  const { name, onChange, value } = field;
  const { maxCount, maxFileSize } = configuration?.limitation;

  const [infoAndErrorText, setInfoAndErrorText] = useState(JSON.parse(value));
  const [documentsAttributes, setDocumentsAttributes] = useState(JSON.parse(value));

  const { selectDocument } = useSelectDocument();

  const [deleteDocument] = useMutation(DELETE_DOCUMENT, {
    client: ConsulClient
  });

  useEffect(() => {
    onChange(JSON.stringify(documentsAttributes));
  }, [documentsAttributes]);

  const onDeleteDocument = async (documentId, index) => {
    if (isVolunteer) {
      const isURL = URL_REGEX.test(documentsAttributes[index].uri);

      if (isURL) {
        try {
          await calendarDeleteFile(
            documentsAttributes[index].fileId,
            documentsAttributes[index].entryId
          );
        } catch (error) {
          console.error(error);
        }
      }
    }

    if (documentId) {
      try {
        await deleteDocument({ variables: { id: documentId } });
      } catch (err) {
        console.error(err);
      }
    }

    setDocumentsAttributes(deleteArrayItem(documentsAttributes, index));
    setInfoAndErrorText(deleteArrayItem(infoAndErrorText, index));
  };

  const documentSelect = async () => {
    const { name: title, size, uri, mimeType } = await selectDocument();

    if (!uri) return;

    /* the server does not support files more than maxFileSize in size. */
    const errorText = await documentErrorMessageGenerator(uri, maxFileSize);

    setDocumentsAttributes([
      ...documentsAttributes,
      isVolunteer ? { uri, mimeType } : { title, cachedAttachment: uri, size, mimeType }
    ]);

    setInfoAndErrorText([
      ...infoAndErrorText,
      {
        errorText,
        infoText: isVolunteer ? `${title}` : `(${mimeType}, ${formatSize(size)})`
      }
    ]);
  };

  const values = jsonParser(value);

  if (isVolunteer) {
    return (
      <>
        <Input {...item} control={control} hidden name={name} value={JSON.stringify(value)} />
        <RegularText smallest placeholder>
          {infoText}
        </RegularText>

        <Button title={buttonTitle} invert onPress={documentSelect} />

        {values?.map((item, index) => (
          <View key={`document-${index}`} style={styles.volunteerContainer}>
            <View style={styles.volunteerUploadPreview}>
              {!!infoAndErrorText[index]?.infoText && (
                <RegularText style={styles.volunteerInfoText} numberOfLines={1} small>
                  {infoAndErrorText[index].infoText}
                </RegularText>
              )}

              <TouchableOpacity
                onPress={() => deleteDocumentAlert(() => onDeleteDocument(item.id, index))}
              >
                <Icon.Trash color={colors.darkText} size={normalize(16)} />
              </TouchableOpacity>
            </View>
            {!!infoAndErrorText[index]?.errorText && (
              <RegularText smallest error>
                {infoAndErrorText[index].errorText}
              </RegularText>
            )}
          </View>
        ))}
      </>
    );
  }

  return (
    <>
      <Input {...item} control={control} hidden name={name} value={JSON.stringify(value)} />

      {values?.map((item, index) => (
        <View key={index} style={styles.container}>
          <WrapperRow center spaceBetween>
            <RegularText>{item.title}</RegularText>

            <TouchableOpacity
              onPress={() => deleteDocumentAlert(() => onDeleteDocument(item.id, index))}
            >
              <Icon.Trash color={colors.error} size={normalize(16)} />
            </TouchableOpacity>
          </WrapperRow>

          {!!infoAndErrorText[index]?.infoText && (
            <RegularText smallest>{infoAndErrorText[index].infoText}</RegularText>
          )}
          {!!infoAndErrorText[index]?.errorText && (
            <RegularText smallest error>
              {infoAndErrorText[index].errorText}
            </RegularText>
          )}
        </View>
      ))}

      <Button
        icon={<Icon.Document size={normalize(16)} strokeWidth={normalize(2)} />}
        disabled={maxCount && values?.length >= parseInt(maxCount)}
        iconPosition="left"
        invert
        onPress={documentSelect}
        title={buttonTitle}
      />

      {!!infoText && (
        <RegularText small style={styles.infoText}>
          {infoText}
        </RegularText>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: normalize(10)
  },
  infoText: {
    marginTop: normalize(-7),
    marginBottom: normalize(5)
  },
  volunteerContainer: {
    marginBottom: normalize(8)
  },
  volunteerInfoText: {
    width: '90%'
  },
  volunteerUploadPreview: {
    alignItems: 'center',
    backgroundColor: colors.gray20,
    borderRadius: normalize(4),
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(14)
  }
});

DocumentSelector.propTypes = {
  configuration: PropTypes.object,
  control: PropTypes.object,
  field: PropTypes.object,
  isVolunteer: PropTypes.bool,
  item: PropTypes.object,
  maxFileSize: PropTypes.number
};
