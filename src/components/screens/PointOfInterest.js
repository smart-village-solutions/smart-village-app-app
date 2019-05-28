import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { HtmlView, Image, Link, ListSubtitle, ListTitle, Logo, Wrapper } from '../../components';

export const PointOfInterest = ({ data }) => {
  const [page, setPage] = useState({});

  useEffect(() => {
    const { name, description, category, mediaContents, dataProvider } = data;

    setPage({
      title: name,
      body: description,
      category,
      image: mediaContents[0].sourceUrl.url,
      logo: dataProvider.logo.url
    });
  }, []);

  const { subtitle, title, body, image, link, logo } = page;

  return (
    <View>
      {!!image && <Image source={{ uri: image }} />}
      <Wrapper>
        {!!logo && <Logo /* TODO: source={{ uri: logo}} */ />}
        {!!subtitle && <ListSubtitle>{subtitle}</ListSubtitle>}
        {/*TODO: map multiple contentBlocks */}
        {!!title && <ListTitle noSubtitle>{title}</ListTitle>}
        {!!body && <HtmlView html={body} />}
        {!!link && <Link url={link} title={'Weiterlesen'} />}
      </Wrapper>
    </View>
  );
};

PointOfInterest.propTypes = {
  data: PropTypes.object.isRequired
};
