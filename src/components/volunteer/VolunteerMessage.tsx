import { StackScreenProps } from '@react-navigation/stack';
import React, { Fragment } from 'react';

import { RegularText } from '../Text';
import { Wrapper, WrapperWithOrientation } from '../Wrapper';

export const VolunteerMessage = ({ data, route }: { data: any } & StackScreenProps<any>) => {
  const { title, messages, multiple = false } = data;

  return (
    <WrapperWithOrientation>
      {!!messages?.length && (
        <Wrapper>
          {messages.map((entry) => {
            const isOwnMessage = !title.includes(entry.sender);

            return (
              <Fragment key={entry.id}>
                <RegularText right={isOwnMessage} placeholder={isOwnMessage} smallest>
                  {entry.date} {entry.time} {multiple && !isOwnMessage && `- ${entry.sender}`}
                </RegularText>
                <RegularText
                  right={isOwnMessage}
                  placeholder={isOwnMessage}
                  style={{ marginBottom: 10 }}
                >
                  {entry.text}
                </RegularText>
              </Fragment>
            );
          })}
        </Wrapper>
      )}
    </WrapperWithOrientation>
  );
};
