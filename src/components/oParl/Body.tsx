/* eslint-disable complexity */
import React from 'react';

import { BoldText, RegularText } from '../Text';
import { WrapperHorizontal, WrapperRow } from '../Wrapper';

// FIXME: types
export const Body = ({ data }: any) => {
  const nameString = data.shortName ? `${data.shortName} (${data.name})` : data.name;
  return (
    <WrapperHorizontal>
      <WrapperRow>
        <BoldText>Name: </BoldText>
        <RegularText>{nameString}</RegularText>
      </WrapperRow>
      {/* <OParlLocation /> */}
      {data.website && (
        <WrapperRow>
          <BoldText>Website: </BoldText>
          {
            // TODO: This is a url. Add it as a proper link.
          }
          <RegularText>{data.website}</RegularText>
        </WrapperRow>
      )}
      {/*
        <ContactSection email name />
        <PersonSection />
        <MeetingSection />
        <PaperSection />
        <LegislativeTermSection />
      */}
      {data.classification && (
        <WrapperRow>
          <BoldText>Lizenz: </BoldText>
          <RegularText>{data.classification}</RegularText>
        </WrapperRow>
      )}
      {data.license && (
        <WrapperRow>
          <BoldText>Lizenz: </BoldText>
          {
            // TODO: This is a url. Add it as a proper link.
          }
          <RegularText>{data.license}</RegularText>
        </WrapperRow>
      )}
      {data.license && data.licenseValidSince && (
        <WrapperRow>
          <BoldText>Lizenz gültig seit: </BoldText>
          {
            // TODO: DateTime -> proper formatting
          }
          <RegularText>{data.licenseValidSince}</RegularText>
        </WrapperRow>
      )}
      {data.ags && (
        <WrapperRow>
          <BoldText>Amtlicher Gemeindeschlüssel: </BoldText>
          <RegularText>{data.ags}</RegularText>
        </WrapperRow>
      )}
      {data.rgs && (
        <WrapperRow>
          <BoldText>Regionalschlüssel: </BoldText>
          <RegularText>{data.rgs}</RegularText>
        </WrapperRow>
      )}
      {data.keyword && (
        <WrapperRow>
          <BoldText>Schlüsselworte: </BoldText>
          {
            // TODO: Array of string -> propper formatting
          }
          <RegularText>{JSON.stringify(data.keyword)}</RegularText>
        </WrapperRow>
      )}
      {data.oparlSince && (
        <WrapperRow>
          <BoldText>Nutzt OParl seit: </BoldText>
          {
            // TODO: DateTime -> proper formatting
          }
          <RegularText>{data.oparlSince}</RegularText>
        </WrapperRow>
      )}
      {data.created && (
        <WrapperRow>
          <BoldText>Eintrag erstellt am: </BoldText>
          {
            // TODO: DateTime -> proper formatting
          }
          <RegularText>{data.created}</RegularText>
        </WrapperRow>
      )}
      {data.modified && (
        <WrapperRow>
          <BoldText>Zuletzt bearbeitet am: </BoldText>
          {
            // TODO: DateTime -> proper formatting
          }
          <RegularText>{data.modified}</RegularText>
        </WrapperRow>
      )}
      {data.deleted && (
        <BoldText>
          Dieses Dokument wurde als gelöscht markiert und enthält somit möglicherweise nicht mehr
          alle oder keine Daten.
        </BoldText>
      )}
      {data.equivalent && (
        <WrapperRow>
          <BoldText>Siehe auch: </BoldText>
          {
            // TODO: array of url -> proper display
          }
          <RegularText>{JSON.stringify(data.equivalent)}</RegularText>
        </WrapperRow>
      )}
      {data.web && (
        <WrapperRow>
          <BoldText>Weblink zu diesem Dokument: </BoldText>
          {
            // TODO: url -> proper display
          }
          <RegularText>{data.web}</RegularText>
        </WrapperRow>
      )}
    </WrapperHorizontal>
  );
};
