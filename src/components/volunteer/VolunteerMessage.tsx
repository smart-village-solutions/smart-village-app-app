import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'react-query';

import { consts } from '../../config';
import { volunteerMessageMedia, volunteerUserData } from '../../helpers';
import {
  conversationNewEntry,
  conversationRecipients,
  conversationUpload
} from '../../queries/volunteer';
import { VolunteerConversation } from '../../types';
import { Chat } from '../Chat';

const { GUID_REGEX, IMAGE_TYPE_REGEX, PDF_TYPE_REGEX, VIDEO_TYPE_REGEX } = consts;

// a function to sort different media types and then create a link to the required media file
const mediaParser = (content: string) => {
  const dataType = content
    ?.split('](file-guid:')
    ?.map(
      (type) =>
        (type?.match(VIDEO_TYPE_REGEX) ||
          type?.match(IMAGE_TYPE_REGEX) ||
          type?.match(PDF_TYPE_REGEX))?.[0]
    )
    ?.filter((type) => type);

  const urisWithDataType = content?.match(GUID_REGEX)?.map((dataGUID, index) => ({
    type: dataType?.[index],
    uri: volunteerMessageMedia(dataGUID)
  }));

  return {
    image: urisWithDataType?.filter(({ type }) => type?.match(IMAGE_TYPE_REGEX)),
    pdf: urisWithDataType?.filter(({ type }) => type?.match(PDF_TYPE_REGEX)),
    video: urisWithDataType?.filter(({ type }) => type?.match(VIDEO_TYPE_REGEX))
  };
};

// if there is text in the content with the image, the text is only after `)` so we need to
// separate it to get the text to access the text message, we need to extract the ones that
// do not have GUID information in the array
const textParser = (content: string) =>
  content
    ?.split(')')
    ?.map((text) => !text?.match(GUID_REGEX) && text)
    ?.filter((text) => text)
    ?.toString();

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
      _id: number;
      text?: string;
      createdAt: string;
      updatedAt: string;
      image?: { type?: string; uri?: string }[];
      pdf?: { type?: string; uri?: string }[];
      video?: { type?: string; uri?: string }[];
      user?: { _id: number; guid: string; display_name: string };
    }[] = [];

    if (currentUserId && data?.results?.length && !!dataRecipients) {
      data.results.forEach((message) => {
        const {
          id: _id,
          user_id,
          content,
          created_at: createdAt,
          created_by: createdBy,
          updated_at: updatedAt
        } = message || {};
        const { image, pdf, video } = mediaParser(content);

        messageArray.push({
          _id,
          text: textParser(content),
          createdAt,
          updatedAt,
          image,
          pdf,
          video,
          user: {
            _id: user_id,
            ...dataRecipients?.find((recipient: { id: number }) => recipient.id == createdBy)
          }
        });
      });

      setMessageData(messageArray.reverse());
    }
  }, [currentUserId, data, dataRecipients]);

  const { mutateAsync } = useMutation(conversationNewEntry);
  const onSend = async (conversationNewEntryData: VolunteerConversation) => {
    if (conversationNewEntryData.medias.length) {
      conversationNewEntryData?.medias?.forEach(async ({ uri, mimeType }) => {
        try {
          await conversationUpload(uri, conversationId, mimeType);
        } catch (error) {
          console.error(error);
        }
      });
    }
    mutateAsync(conversationNewEntryData);
  };

  if (isLoading || !dataRecipients || !currentUserId) return null;

  return (
    <Chat
      data={messageData}
      onSendButton={(message) =>
        onSend({
          id: [conversationId],
          medias: message.medias,
          message: message.text,
          title: ''
        }).then(refetch)
      }
      showActionButton
      userId={currentUserId}
    />
  );
};
