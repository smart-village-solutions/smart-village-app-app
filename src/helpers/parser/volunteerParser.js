import React from 'react';
import { StyleSheet } from 'react-native';

import { VolunteerAvatar } from '../../components';
import { colors, consts, Icon, normalize, texts } from '../../config';
import { QUERY_TYPES } from '../../queries';
import { ScreenName } from '../../types';
import { getTitleForQuery } from '../queryHelper';
import { shareMessage } from '../shareHelper';
import { volunteerListDate, volunteerSubtitle } from '../volunteerHelper';

const { ROOT_ROUTE_NAMES } = consts;

/* eslint-disable complexity */
export const parseVolunteerData = (
  data,
  query,
  skipLastDivider,
  withDate,
  isSectioned,
  currentUserId
) => {
  return data?.map((volunteer, index) => {
    let badge, leftIcon, statustitle, statustitleIcon, teaserTitle;

    if (query === QUERY_TYPES.VOLUNTEER.USER) {
      if ((volunteer.user?.id || volunteer.id) == currentUserId) {
        badge = {
          value: texts.volunteer.myProfile,
          textStyle: {
            color: colors.lightestText
          },
          badgeStyle: {
            backgroundColor: colors.primary
          }
        };
      }

      leftIcon = <VolunteerAvatar item={volunteer.user ? volunteer : { user: volunteer }} />;
    }

    if (query === QUERY_TYPES.VOLUNTEER.GROUP && !!volunteer.role) {
      statustitle = texts.volunteer[volunteer.role];
      statustitleIcon = (
        <Icon.Member
          color={colors.placeholder}
          size={normalize(13)}
          style={styles.statustitleIcon}
        />
      );
    }

    if (query === QUERY_TYPES.VOLUNTEER.GROUP) {
      teaserTitle = volunteer.description;
    }

    if (query === QUERY_TYPES.VOLUNTEER.CALENDAR) {
      teaserTitle = volunteer.content?.topics?.map((topic) => topic.name).join(', ');
    }

    return {
      ...volunteer,
      id: volunteer.id || volunteer.user?.id,
      title:
        volunteer.title || volunteer.name || volunteer.display_name || volunteer.user?.display_name,
      subtitle: volunteer.subtitle || volunteerSubtitle(volunteer, query, withDate, isSectioned),
      badge: volunteer.badge || badge,
      statustitle: volunteer.statustitle || statustitle,
      statustitleIcon: volunteer.statustitleIcon || statustitleIcon,
      leftIcon,
      teaserTitle,
      picture: volunteer.picture,
      routeName: ScreenName.VolunteerDetail,
      onPress: volunteer.onPress,
      listDate: volunteer.listDate || volunteerListDate(volunteer),
      status: volunteer.status,
      params: {
        title: getTitleForQuery(query, volunteer),
        query,
        queryVariables: { id: volunteer.user?.id ? `${volunteer.user.id}` : `${volunteer.id}` },
        queryOptions: query === QUERY_TYPES.VOLUNTEER.CONVERSATION && {
          refetchInterval: 1000
        },
        rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER,
        shareContent: query !== QUERY_TYPES.VOLUNTEER.CONVERSATION && {
          message: shareMessage(
            {
              title: volunteer.title || volunteer.name,
              subtitle:
                volunteer.subtitle || volunteerSubtitle(volunteer, query, withDate, isSectioned)
            },
            query
          )
        },
        details: volunteer
      },
      bottomDivider: !skipLastDivider || index !== data.length - 1
    };
  });
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  statustitleIcon: {
    marginRight: normalize(7),
    marginTop: normalize(1)
  }
});
