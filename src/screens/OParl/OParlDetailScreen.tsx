import gql from 'graphql-tag';
import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import { NavigationScreenProp } from 'react-navigation';

import {
  HeaderLeft,
  RegularText,
  SafeAreaViewFlex,
  WrapperWithOrientation
} from '../../components';
import { OParlComponent } from '../../components/oParl';
import { DummyData } from '../../OParlDummyData';
import { executeOParlQuery } from '../../OParlProvider';
import { OParlObjectData, OParlObjectType } from '../../types';

type Props = {
  navigation: NavigationScreenProp<never>;
};

const meetingQuery = [
  gql`
    query meeting($id: String!) {
      oParlMeetings(externalIds: [$id]) {
        id: externalId
        type
        agendaItem {
          id: externalId
          type
          name
          number
          order
          start
        }
        auxiliaryFile {
          id: externalId
          type
          accessUrl
          deleted
          fileName
          name
          mimeType
          size
        }
        cancelled
        created
        deleted
        end
        invitation {
          id: externalId
          type
          accessUrl
          deleted
          fileName
          name
          mimeType
          size
        }
        keyword
        license
        location {
          id: externalId
          type
          deleted
          locality
          postalCode
          room
          streetAddress
          subLocality
        }
        meetingState
        modified
        name
        organization {
          id: externalId
          type
          classification
          deleted
          name
          shortName
        }
        participant {
          id: externalId
          type
          affix
          deleted
          familyName
          formOfAddress
          givenName
          membership {
            id: externalId
            type
            deleted

            organization {
              name
              shortName
            }

            endDate
            startDate
          }
          name
          title
        }
        resultsProtocol {
          id: externalId
          type
          accessUrl
          deleted
          fileName
          name
          mimeType
          size
        }
        start
        verbatimProtocol {
          id: externalId
          type
          accessUrl
          deleted
          fileName
          name
          mimeType
          size
        }
        web
      }
    }
  `,
  'oParlMeetings'
] as const;

export const OParlDetailScreen = ({ navigation }: Props) => {
  const oParlType = navigation.getParam('type');
  const id = navigation.getParam('id');

  const [meeting, setMeeting] = useState<OParlObjectData[]>();

  useEffect(() => {
    oParlType === OParlObjectType.Meeting ||
      (oParlType === OParlObjectType.Meeting1 &&
        executeOParlQuery(meetingQuery, setMeeting, { id }));
  }, [id, oParlType, setMeeting]);

  // const { data } = useQuery(getoparlquerywithparamsandstuff)

  const data = meeting?.[0] ?? DummyData.find((item) => item.id === (id ?? 'S1'));

  console.log({ id, oParlType });

  // TODO: proper fallback
  if (!data) return <RegularText>{(oParlType ?? '') + ' ' + (id ?? '')}</RegularText>;

  return (
    <SafeAreaViewFlex>
      <ScrollView>
        <WrapperWithOrientation>
          <OParlComponent data={data} navigation={navigation} />
        </WrapperWithOrientation>
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

OParlDetailScreen.navigationOptions = ({ navigation }: Props) => {
  return {
    headerLeft: <HeaderLeft navigation={navigation} />
  };
};
