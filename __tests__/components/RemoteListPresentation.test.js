import { render, renderHook, screen } from '@testing-library/react-native';
import PropTypes from 'prop-types';
import React from 'react';
import { Text } from 'react-native';

import { SettingsContext } from '../../src/SettingsProvider';
import { ListComponent } from '../../src/components/ListComponent';
import { GroupedListItem } from '../../src/components/GroupedListItem';
import { TextListItem } from '../../src/components/TextListItem';
import { SearchResultSectionList } from '../../src/components/search/SearchResultSectionList';
import { WasteCollectionListItem } from '../../src/components/waste/WasteCollectionListItem';
import { useRenderItem } from '../../src/hooks/listHooks';
import { QUERY_TYPES } from '../../src/queries/types';

jest.mock('@shopify/flash-list', () => {
  const React = jest.requireActual('react');
  return { FlashList: (props) => React.createElement('FlashList', props) };
});
jest.mock('../../src/hooks', () => ({
  useRenderItem: jest.requireActual('../../src/hooks/listHooks').useRenderItem
}));
jest.mock('../../src/queries', () => jest.requireActual('../../src/queries/types'));
jest.mock('../../src/helpers', () => ({ momentFormat: (value) => value }));
jest.mock('../../src/components/CardListItem', () => ({ CardListItem: 'CardListItem' }));
jest.mock('../../src/components/TextListItem', () => ({ TextListItem: 'TextListItem' }));
jest.mock('../../src/components/GroupedListItem', () => ({ GroupedListItem: 'GroupedListItem' }));
jest.mock('../../src/components/GroupedSectionHeader', () => ({
  GroupedSectionHeader: 'GroupedSectionHeader'
}));
jest.mock('../../src/components/SectionHeader', () => ({ SectionHeader: 'SectionHeader' }));
jest.mock('../../src/components/profile/ConversationListItem', () => ({
  ConversationListItem: 'ConversationListItem'
}));
jest.mock('../../src/components/search/SearchResultSectionList', () => ({
  SearchResultSectionList: 'SearchResultSectionList'
}));
jest.mock('../../src/components/volunteer/VolunteerApplicantListItem', () => ({
  VolunteerApplicantListItem: 'VolunteerApplicantListItem'
}));
jest.mock('../../src/components/volunteer/VolunteerConversationListItem', () => ({
  VolunteerConversationListItem: 'VolunteerConversationListItem'
}));
jest.mock('../../src/components/volunteer/VolunteerPostListItem', () => ({
  VolunteerPostListItem: 'VolunteerPostListItem'
}));
jest.mock('../../src/components/vouchers/VoucherListItem', () => ({
  VoucherListItem: 'VoucherListItem'
}));
jest.mock('../../src/components/waste/WasteCollectionListItem', () => ({
  WasteCollectionListItem: 'WasteCollectionListItem'
}));
jest.mock('../../src/components/CategoryList', () => ({ CategoryList: () => null }));
jest.mock('../../src/components/GroupedList', () => ({ GroupedList: () => null }));
jest.mock('../../src/components/HorizontalList', () => ({ HorizontalList: () => null }));
jest.mock('../../src/components/VerticalList', () => ({ VerticalList: () => null }));
jest.mock('../../src/components/vouchers', () => ({ VoucherList: () => null }));
jest.mock('../../src/components/LoadingSpinner', () => ({ LoadingSpinner: () => null }));

const Wrapper = ({ children, listTypes }) => (
  <SettingsContext.Provider
    value={{ globalSettings: { sections: { listTypes } }, listTypesSettings: {} }}
  >
    {children}
  </SettingsContext.Provider>
);
Wrapper.propTypes = { children: PropTypes.node, listTypes: PropTypes.object };

const withListTypes = (listTypes) => {
  const ContextWrapper = ({ children }) => <Wrapper listTypes={listTypes}>{children}</Wrapper>;
  ContextWrapper.propTypes = { children: PropTypes.node };
  return ContextWrapper;
};

it.each(['textList', 'imageTextList', 'cardList', 'cardTextList', 'groupedList'])(
  'preserves noticeboard category controls under %s',
  (listType) => {
    const control = <Text>Category navigation</Text>;
    const { result } = renderHook(() => useRenderItem(QUERY_TYPES.GENERIC_ITEMS), {
      wrapper: withListTypes({ genericItems: listType })
    });

    expect(result.current({ item: { component: control }, index: 0 })).toBe(control);
  }
);

it.each([QUERY_TYPES.VOLUNTEER.CALENDAR_ALL, QUERY_TYPES.VOLUNTEER.CALENDAR_ALL_MY])(
  'retains the resolved %s presentation inside the sectioned calendar',
  (query) => {
    render(
      <Wrapper listTypes={{ eventRecords: 'imageTextList', [query]: 'textList' }}>
        <ListComponent query={query} sectionByDate data={[]} />
      </Wrapper>
    );

    const row = screen.UNSAFE_getByType('FlashList').props.renderItem({
      item: { id: 'event' },
      index: 1
    });
    expect(row.type).toBe(TextListItem);
    expect(row.props.leftImage).toBeUndefined();
  }
);

it('still applies the event-record presentation to an ordinary sectioned event list', () => {
  render(
    <Wrapper listTypes={{ eventRecords: 'imageTextList', calendarAll: 'textList' }}>
      <ListComponent query={QUERY_TYPES.EVENT_RECORDS} sectionByDate data={[]} />
    </Wrapper>
  );

  const row = screen.UNSAFE_getByType('FlashList').props.renderItem({
    item: { id: 'event' },
    index: 1
  });
  expect(row.type).toBe(TextListItem);
  expect(row.props.leftImage).toBe(true);
});

it.each([QUERY_TYPES.VOLUNTEER.CALENDAR_ALL, QUERY_TYPES.VOLUNTEER.CALENDAR_ALL_MY])(
  'keeps the unconfigured %s text default when eventRecords is configured',
  (query) => {
    render(
      <Wrapper listTypes={{ eventRecords: 'imageTextList' }}>
        <ListComponent query={query} sectionByDate data={[]} />
      </Wrapper>
    );
    const row = screen.UNSAFE_getByType('FlashList').props.renderItem({
      item: { id: 'event' },
      index: 1
    });
    expect(row.type).toBe(TextListItem);
    expect(row.props.leftImage).toBeUndefined();
  }
);

it.each([
  [QUERY_TYPES.SEARCH, SearchResultSectionList],
  [QUERY_TYPES.WASTE_STREET, WasteCollectionListItem]
])('keeps the content-specific %s renderer under a flat remote setting', (query, component) => {
  const { result } = renderHook(() => useRenderItem(query), {
    wrapper: withListTypes({ [query]: 'imageTextList' })
  });
  const row = result.current({ item: [{ id: 'record' }], index: 1 });
  expect(row.type).toBe(component);
});

it('renders flat noticeboard data safely when the remote presentation is grouped', () => {
  const { result } = renderHook(() => useRenderItem(QUERY_TYPES.GENERIC_ITEMS), {
    wrapper: withListTypes({ genericItems: 'groupedList' })
  });
  const item = { id: 'post', title: 'Noticeboard post' };

  const row = result.current({ item, index: 1 });
  expect(row.type).toBe(TextListItem);
  expect(row.props.item).toBe(item);
});

it('keeps the grouped renderer for grouped data with a grouping key', () => {
  const { result } = renderHook(
    () =>
      useRenderItem(QUERY_TYPES.GENERIC_ITEMS, undefined, { queryVariables: { groupKey: 'date' } }),
    { wrapper: withListTypes({ genericItems: 'groupedList' }) }
  );
  const item = [{ id: 'post', date: '2026-11-16' }];

  const row = result.current({ item, index: 1 });
  expect(row.type).toBe(GroupedListItem);
  expect(row.props.item).toBe(item);
});
