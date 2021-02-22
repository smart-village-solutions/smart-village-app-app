import PropTypes from 'prop-types';
import React from 'react';

import { containsHtml, trimNewLines } from '../helpers';
import { Button } from './Button';
import { HtmlView } from './HtmlView';
import { ImageSection } from './ImageSection';
import { MediaSection } from './MediaSection';
import { BoldText } from './Text';
import { Wrapper, WrapperHorizontal } from './Wrapper';

// eslint-disable-next-line complexity
export const StorySection = ({ contentBlock, index, openWebScreen, settings }) => {
  return (
    <>
      {
        // skip the title for the first content block because it is used as the main title
        index > 0 && !!contentBlock.title && (
          <Wrapper>
            <BoldText>{trimNewLines(contentBlock.title)}</BoldText>
          </Wrapper>
        )
      }
      {!!contentBlock.intro && (
        <WrapperHorizontal>
          <HtmlView
            html={trimNewLines(
              `<div>${
                containsHtml(contentBlock.intro)
                  ? contentBlock.intro
                  : `<p>${contentBlock.intro}</p>`
              }</div>`
            )}
            tagsStyles={{ div: { fontFamily: 'titillium-web-bold' } }}
            openWebScreen={openWebScreen}
          />
        </WrapperHorizontal>
      )}
      {
        // skip images for the first content block because they are rendered as main images
        index > 0 && !!contentBlock.mediaContents && (
          <ImageSection mediaContents={contentBlock.mediaContents} />
        )
      }
      {(!settings?.displayOnlySummary || settings.displayOnlySummary === 'false') &&
        !!contentBlock.body && (
          <WrapperHorizontal>
            <HtmlView html={trimNewLines(contentBlock.body)} openWebScreen={openWebScreen} />
          </WrapperHorizontal>
        )}
      <MediaSection mediaContents={contentBlock.mediaContents} />
      {!!settings?.displayOnlySummary &&
        settings.displayOnlySummary === 'true' &&
        !!settings?.onlySummaryLinkText && (
          <WrapperHorizontal>
            <Button title={settings.onlySummaryLinkText} onPress={openWebScreen} />
          </WrapperHorizontal>
        )}
    </>
  );
};

StorySection.propTypes = {
  contentBlock: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  openWebScreen: PropTypes.func.isRequired,
  settings: PropTypes.object
};
