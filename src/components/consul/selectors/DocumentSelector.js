import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

import { colors, Icon, normalize, texts } from '../../../config';
import { deleteArrayItem, formatSize } from '../../../helpers';
import { documentErrorMessageHepler } from '../../../helpers/consul/documentErrorMessageHepler';
import { useSelectDocument } from '../../../hooks';
import { Button } from '../../Button';
import { Input } from '../../form';
import { RegularText } from '../../Text';
import { WrapperRow } from '../../Wrapper';

export const DocumentSelector = ({ control, field, item, documentsAttributes }) => {
  const [infoAndErrorText, setInfoAndErrorText] = useState([]);

  const { buttonTitle, infoText } = item;
  const { name, onChange, value } = field;

  const { selectDocument } = useSelectDocument();

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
                  onPress={() => {
                    onChange(JSON.stringify(deleteArrayItem(documentsAttributes, index)));
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

            const errorMessages = await documentErrorMessageHepler(cachedAttachment);

            documentsAttributes.push({ title, cachedAttachment });

            setInfoAndErrorText([
              ...infoAndErrorText,
              {
                errorText: texts.consul.startNew[errorMessages],
                infoText: `(${mimeType}, ${formatSize(size)})`
              }
            ]);
            onChange(JSON.stringify(documentsAttributes));
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
