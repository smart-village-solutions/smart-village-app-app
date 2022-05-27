import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-apollo';
import { TouchableOpacity, View } from 'react-native';

import { colors, Icon, normalize, texts } from '../../../config';
import { ConsulClient } from '../../../ConsulClient';
import { deleteArrayItem, documentErrorMessageGenerator, formatSize } from '../../../helpers';
import { useSelectDocument } from '../../../hooks';
import { DELETE_DOCUMENT } from '../../../queries/consul';
import { Button } from '../../Button';
import { Input } from '../../form';
import { RegularText } from '../../Text';
import { WrapperRow } from '../../Wrapper';

export const DocumentSelector = ({ control, field, item }) => {
  const { buttonTitle, infoText } = item;
  const { name, onChange, value } = field;

  const [infoAndErrorText, setInfoAndErrorText] = useState([]);
  const [documentsAttributes, setDocumentsAttributes] = useState(JSON.parse(value));

  const { selectDocument } = useSelectDocument();

  const [deleteDocument] = useMutation(DELETE_DOCUMENT, {
    client: ConsulClient
  });

  useEffect(() => {
    onChange(JSON.stringify(documentsAttributes));
  }, [documentsAttributes]);

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
                  onPress={async () => {
                    if (item.id) {
                      try {
                        await deleteDocument({ variables: { id: item.id } });
                      } catch (err) {
                        console.error(err);
                      }
                    }
                    setDocumentsAttributes(deleteArrayItem(documentsAttributes, index));
                    setInfoAndErrorText(deleteArrayItem(infoAndErrorText, index));
                  }}
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
  documentsAttributes: PropTypes.array,
  field: PropTypes.object,
  item: PropTypes.object,
  selectImage: PropTypes.func
};
