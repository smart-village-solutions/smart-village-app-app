import { useRoute } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React from 'react';
import { View } from 'react-native';
import { ListItem } from 'react-native-elements';
import { UseMutateAsyncFunction } from 'react-query';

import { texts } from '../../config';
import { Button, ButtonVariants } from '../Button';
import { ItemData, TextListItem } from '../TextListItem';

type RouteParams = {
  queryVariables: number;
  mutateAsyncJoin: UseMutateAsyncFunction<any, unknown, { id: number; userId: string }, unknown>;
  mutateAsyncLeave: UseMutateAsyncFunction<any, unknown, { id: number; userId: string }, unknown>;
};

export const VolunteerApplicantListItem = ({
  item,
  refetch,
  navigation
}: { item: ItemData; refetch: () => void } & StackScreenProps<any>) => {
  const routeParams = useRoute().params as RouteParams;
  const groupId = routeParams?.queryVariables;
  const mutateAsyncJoin = routeParams?.mutateAsyncJoin;
  const mutateAsyncLeave = routeParams?.mutateAsyncLeave;

  return (
    <View>
      <TextListItem item={{ ...item, bottomDivider: false }} navigation={navigation} />
      <ListItem bottomDivider>
        <ListItem.Content>
          <Button
            onPress={() => {
              mutateAsyncJoin({ id: groupId, userId: item.id }).then(() => {
                refetch?.();
              });
            }}
            title={texts.volunteer.accept}
            variant={ButtonVariants.ACCEPT}
          />
        </ListItem.Content>

        <Button
          onPress={() => {
            mutateAsyncLeave({ id: groupId, userId: item.id }).then(() => {
              refetch?.();
            });
          }}
          title={texts.volunteer.reject}
          variant={ButtonVariants.REJECT}
        />
      </ListItem>
    </View>
  );
};
