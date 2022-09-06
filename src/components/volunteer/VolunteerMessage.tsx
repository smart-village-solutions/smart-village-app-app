import 'moment/locale/de';
import React, { useEffect, useState } from 'react';
import { useMutation, useQuery } from 'react-query';

import { Chat } from '../Chat';
import { consts } from '../../config';
import {
  conversationNewEntry,
  conversationRecipients,
  conversationUpload
} from '../../queries/volunteer';
import { VolunteerConversation } from '../../types';
import { volunteerMessageMedia, volunteerProfileImage, volunteerUserData } from '../../helpers';

const { GUID_REGEX, IMAGE_TYPE_REGEX, PDF_TYPE_REGEX, VIDEO_TYPE_REGEX } = consts;

export const VolunteerMessage = ({
  data,
  conversationId
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
      text?: string | undefined;
      createdAt: string;
      updatedAt: string;
      _id: number;
      image: { type: string | undefined; uri: string | undefined }[] | undefined;
      pdf: { type: string | undefined; uri: string | undefined }[] | undefined;
      video: { type: string | undefined; uri: string | undefined }[] | undefined;
      user: { _id: number; name: string; avatar: string } | undefined;
    }[] = [];

    if (currentUserId && !!data?.results?.length && !!dataRecipients) {
      data?.results?.forEach((message) => {
        const {
          id: _id,
          user_id,
          content,
          created_at: createdAt,
          created_by: createdBy,
          updated_at: updatedAt
        } = message || {};

        const { title, uri } = userInfo(dataRecipients, createdBy) || undefined;
        const { image, pdf, video } = mediaParser(content) || undefined;
        const text = textParser(content);

        messageArray.push({
          text,
          createdAt,
          updatedAt,
          _id,
          image,
          pdf,
          video,
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
      placeholder=""
      onSendButton={(message) =>
        onSend({
          id: [conversationId],
          medias: message.medias,
          message: message.text,
          title: ''
        })
      }
      userId={currentUserId}
    />
  );
};

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

// if there is text in the content with the image, the text is only after `)`
//   so we need to separate it to get the text
// to access the text message, we need to extract the ones that do not have GUID
//   information in the array
const textParser = (content: string) =>
  content
    ?.split(')')
    ?.map((text) => !text?.match(GUID_REGEX) && text)
    ?.filter((text) => text)
    ?.toString();

// function used to generate user information
const userInfo = (dataRecipients: any[], createdBy: number) => {
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

  return { title, uri };
};
