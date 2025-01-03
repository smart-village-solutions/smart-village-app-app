import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-apollo';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, consts, Icon, normalize, texts } from '../../config';
import { ConsulClient } from '../../ConsulClient';
import {
  deleteArrayItem,
  documentErrorMessageGenerator,
  formatSize,
  jsonParser
} from '../../helpers';
import { useSelectDocument } from '../../hooks';
import { DELETE_DOCUMENT } from '../../queries/consul';
import { calendarDeleteFile } from '../../queries/volunteer';
import { Button } from '../Button';
import { Input } from '../form';
import { RegularText } from '../Text';
import { WrapperRow } from '../Wrapper';

const { URL_REGEX } = consts;

type TValue = {
  cachedAttachment: string;
  id: number | string;
  title: string;
};

const deleteDocumentAlert = (onPress: () => void) =>
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

export const DocumentSelector = ({
  control,
  field,
  isVolunteer,
  item,
  maxFileSize
}: {
  control: any;
  field: any;
  isVolunteer: boolean;
  item: any;
  maxFileSize: number;
}) => {
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

  const onDeleteDocument = async (documentId: number | string, index: number) => {
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
    const {
      name: title = '',
      size = 0,
      uri = '',
      mimeType = ''
    }: { name?: string; size?: number; uri?: string; mimeType?: string } = await selectDocument();

    if (!uri) return;

    /* the server does not support files more than 10MB in size. */
    const volunteerErrorText = size > 10485760 && texts.volunteer.imageGreater10MBError;
    /* the server does not support files more than maxFileSize in size. */
    const errorText = await documentErrorMessageGenerator(uri, maxFileSize);

    setDocumentsAttributes([
      ...documentsAttributes,
      isVolunteer ? { uri, mimeType } : { title, cachedAttachment: uri, size, mimeType }
    ]);

    setInfoAndErrorText([
      ...infoAndErrorText,
      {
        errorText: isVolunteer ? volunteerErrorText : errorText,
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

        {values?.map((item: TValue, index: number) => (
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
      <RegularText smallest placeholder>
        {infoText}
      </RegularText>

      {values?.map((item: TValue, index: number) => (
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

      {/* users can upload a maximum of 3 PDF files
          if 3 PDFs are selected, the new add button will not be displayed. */}
      {!value || values.length < 3 ? (
        <Button title={buttonTitle} invert onPress={documentSelect} />
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: normalize(10)
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
