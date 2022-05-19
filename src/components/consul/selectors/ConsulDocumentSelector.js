import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { TouchableOpacity } from 'react-native';

import { colors, Icon, normalize, texts } from '../../../config';
import { formatSize } from '../../../helpers';
import { DOCUMENT_TYPE_PDF, useSelectDocument } from '../../../hooks';
import { Button } from '../../Button';
import { Input } from '../../form';
import { RegularText } from '../../Text';
import { WrapperRow } from '../../Wrapper';

export const DocumentSelector = ({ control, field, item, documentsAttributes }) => {
  const [errorMessage, setErrorMessage] = useState([]);
  const [pdfInfoText, setPDFInfoText] = useState([]);

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
            <>
              <WrapperRow key={index} center spaceBetween>
                <RegularText>{item.title}</RegularText>

                <TouchableOpacity
                  onPress={() => {
                    documentsAttributes.splice(index, 1);
                    errorMessage.splice(index, 1);
                    pdfInfoText.splice(index, 1);
                    onChange(JSON.stringify(documentsAttributes));
                    setErrorMessage(errorMessage);
                    setPDFInfoText(pdfInfoText);
                  }}
                >
                  <Icon.Trash color={colors.error} size={normalize(16)} />
                </TouchableOpacity>
              </WrapperRow>

              {!!pdfInfoText && <RegularText smallest>{pdfInfoText[index]}</RegularText>}
              {!!errorMessage && (
                <RegularText smallest error>
                  {errorMessage[index]}
                </RegularText>
              )}
            </>
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

            documentsAttributes.push({ title, cachedAttachment });

            const errorMessages = documentErrorMessageGenerator({
              size,
              mimeType
            });

            setErrorMessage([...errorMessage, texts.consul.startNew[errorMessages]]);
            setPDFInfoText([...pdfInfoText, `(${mimeType}, ${formatSize(size)})`]);
            onChange(JSON.stringify(documentsAttributes));
          }}
        />
      ) : null}
    </>
  );
};

const documentErrorMessageGenerator = ({ size, mimeType }) => {
  const isPDF = mimeType === DOCUMENT_TYPE_PDF;
  const isGreater3MB = size > 3145728;

  const errorMessage =
    !isPDF && isGreater3MB
      ? 'choose-document-content-type-application/msword-does-not-match-any-of-accepted-content-types-pdf,-choose-document-must-be-in-between-0-bytes-and-3-mb'
      : !isPDF
      ? 'choose-document-content-type-application/msword-does-not-match-any-of-accepted-content-types-pdf'
      : isGreater3MB
      ? 'choose-document-must-be-in-between-0-bytes-and-3-mb'
      : '';

  return errorMessage;
};

DocumentSelector.propTypes = {
  control: PropTypes.object,
  documentsAttributes: PropTypes.array,
  field: PropTypes.object,
  item: PropTypes.object,
  selectImage: PropTypes.func
};
