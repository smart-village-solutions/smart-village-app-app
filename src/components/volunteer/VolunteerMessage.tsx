import 'moment/locale/de';
import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'react-query';

import { Chat } from '../Chat';
import { volunteerProfileImage, volunteerUserData } from '../../helpers';
import { conversationNewEntry, conversationRecipients } from '../../queries/volunteer';
import { VolunteerConversation } from '../../types';

export const VolunteerMessage = ({
  data,
  conversationId,
  refetch
}: {
  data: {
    results: [
      {
        id: number;
        user_id: number;
        content: string;
        created_at: string;
        created_by: number;
        updated_at: string;
        updated_by: number;
      }
    ];
  };
  conversationId: number;
  refetch: () => void;
}) => {
  const [messageData, setMessageData] = useState<any>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const { data: dataRecipients, isLoading } = useQuery(
    ['conversationRecipients', conversationId],
    () => conversationRecipients(conversationId)
  );

  useEffect(() => {
    volunteerUserData().then((volunteerUser) => {
      setCurrentUserId(volunteerUser.currentUserId);
    });
  }, []);

  useEffect(() => {
    const messageArray: {
      text: string;
      createdAt: string;
      updatedAt: string;
      _id: number;
      user: { _id: number; name: any; avatar: string };
    }[] = [];

    if (currentUserId && !!data?.results?.length && !!dataRecipients) {
      data?.results?.forEach((message) => {
        const {
          id,
          user_id,
          content,
          created_at,
          created_by: createdBy,
          updated_at
        } = message || {};

        const user = dataRecipients.find(
          (recipient: { id: string }) => recipient.id == createdBy.toString()
        );
        const { display_name: displayName, guid } = user || {};
        // get initials from the display name
        const title = displayName
          ?.split(' ')
          .map((part: string) => part[0])
          .join('');
        const uri = volunteerProfileImage(guid);

        messageArray.push({
          text: content,
          createdAt: created_at,
          updatedAt: updated_at,
          _id: id,
          user: {
            _id: user_id,
            name: title,
            avatar: uri
          }
        });
      });
      setMessageData(messageArray.reverse());
    }
  }, [currentUserId, data, dataRecipients]);

  const { mutateAsync } = useMutation(conversationNewEntry);
  const onSend = async (conversationNewEntryData: VolunteerConversation) => {
    mutateAsync(conversationNewEntryData);
  };

  if (isLoading || !dataRecipients || !currentUserId) return null;

  return (
    <Chat
      data={messageData}
      placeholder=""
      onSendButton={(message) =>
        onSend({
          id: [conversationId],
          message,
          title: ''
        }).then(() => refetch())
      }
      userId={currentUserId}
    />
  );
};
