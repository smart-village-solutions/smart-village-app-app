import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-apollo';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, Icon, normalize, texts } from '../../../config';
import { ConsulClient } from '../../../ConsulClient';
import { deleteArrayItem, documentErrorMessageGenerator, formatSize } from '../../../helpers';
import { useSelectDocument } from '../../../hooks';
import { DELETE_DOCUMENT } from '../../../queries/consul';
import { Button } from '../../Button';
import { Input } from '../../form';
import { RegularText } from '../../Text';
import { WrapperRow } from '../../Wrapper';

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

export const DocumentSelector = ({ control, field, isVolunteer, item }) => {
  const { buttonTitle, infoText } = item;
  const { name, onChange, value } = field;

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

  if (isVolunteer) {
    return (
      <>
        <Input {...item} control={control} hidden name={name} value={JSON.stringify(value)} />
        <RegularText smallest placeholder>
          {infoText}
        </RegularText>

        <Button
          title={buttonTitle}
          invert
          onPress={async () => {
            const { name: title, size, uri, mimeType } = await selectDocument();

            if (!uri) return;

            /* the server does not support files more than 10MB in size. */
            const errorText = size > 10485760 && texts.volunteer.imageGreater10MBError;

            setDocumentsAttributes([...documentsAttributes, { uri, mimeType }]);

            setInfoAndErrorText([
              ...infoAndErrorText,
              {
                errorText,
                infoText: `${title}`
              }
            ]);
          }}
        />

        {value
          ? JSON.parse(value).map((item, index) => (
              <View key={index}>
                {!!infoAndErrorText[index]?.errorText && (
                  <RegularText smallest error>
                    {infoAndErrorText[index].errorText}
                  </RegularText>
                )}

                <View style={styles.volunteerImageView}>
                  {!!infoAndErrorText[index]?.infoText && (
                    <RegularText style={{ width: '90%' }} numberOfLines={1} small>
                      {infoAndErrorText[index].infoText}
                    </RegularText>
                  )}

                  <TouchableOpacity
                    onPress={() => deleteDocumentAlert(() => onDeleteDocument(item.id, index))}
                  >
                    <Icon.Trash color={colors.darkText} size={normalize(16)} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          : null}
      </>
    );
  }

  return (
    <>
      <Input {...item} control={control} hidden name={name} value={JSON.stringify(value)} />
      <RegularText smallest placeholder>
        {infoText}
      </RegularText>

      {value
        ? JSON.parse(value).map((item, index) => (
            <View key={index} style={{ marginVertical: normalize(10) }}>
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
          ))
        : null}

      {/* users can upload a maximum of 3 PDF files
          if 3 PDFs are selected, the new add button will not be displayed. */}
      {!value || JSON.parse(value).length < 3 ? (
        <Button
          title={buttonTitle}
          invert
          onPress={async () => {
            const { mimeType, name: title, size, uri: cachedAttachment } = await selectDocument();

            if (!cachedAttachment) return;

            const errorMessages = await documentErrorMessageGenerator(cachedAttachment);

            setDocumentsAttributes([...documentsAttributes, { title, cachedAttachment }]);

            setInfoAndErrorText([
              ...infoAndErrorText,
              {
                errorText: texts.consul.startNew[errorMessages],
                infoText: `(${mimeType}, ${formatSize(size)})`
              }
            ]);
          }}
        />
      ) : null}
    </>
  );
};

DocumentSelector.propTypes = {
  control: PropTypes.object,
  field: PropTypes.object,
  isVolunteer: PropTypes.bool,
  item: PropTypes.object
};

const styles = StyleSheet.create({
  volunteerImageView: {
    alignItems: 'center',
    backgroundColor: colors.gray20,
    borderRadius: normalize(4),
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: normalize(8),
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(14)
  }
});
