import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import renderer from 'react-test-renderer';

jest.mock('react-native-elements', () => {
  const ReactLocal = require('react');
  const { View } = require('react-native');

  return {
    Divider: () => null,
    Header: ({ rightComponent }) => (
      <View testID="volunteer-header">
        {ReactLocal.isValidElement(rightComponent) ? rightComponent : <View testID="legacy-close-icon" />}
      </View>
    )
  };
});

jest.mock('react-query', () => ({
  useMutation: () => ({
    mutateAsync: jest.fn(async () => ({ id: 1 }))
  }),
  useQueryClient: () => ({
    invalidateQueries: jest.fn()
  })
}));

jest.mock('react-hook-form', () => ({
  Controller: ({ render }) => render({ field: { onChange: jest.fn(), value: '[]' } }),
  useForm: () => ({
    control: {},
    formState: { errors: {} },
    handleSubmit: (handler) => handler,
    reset: jest.fn()
  })
}));

jest.mock('../../src/config', () => {
  const ReactLocal = require('react');

  const MockIcon = () => ReactLocal.createElement('mock-icon');

  return {
    colors: {
      darkText: '#141414',
      transparent: 'transparent'
    },
    consts: {
      IMAGE_SELECTOR_ERROR_TYPES: {
        VOLUNTEER: 'VOLUNTEER'
      },
      IMAGE_SELECTOR_TYPES: {
        VOLUNTEER: 'VOLUNTEER'
      },
      a11yLabel: {
        button: '(Taste)'
      }
    },
    Icon: {
      Close: MockIcon
    },
    normalize: (value: number) => value,
    texts: {
      accessibilityLabels: {
        actions: {
          close: 'Schließen'
        }
      },
      volunteer: {
        abort: 'Abbrechen',
        addImage: 'Bild hinzufügen',
        commentEdit: 'Kommentar bearbeiten',
        commentLabel: 'Kommentar',
        commentNew: 'Kommentar erstellen',
        delete: 'Löschen',
        message: 'Nachricht',
        postEdit: 'Beitrag bearbeiten',
        postLabel: 'Beitrag',
        postNew: 'Beitrag erstellen',
        publish: 'Veröffentlichen',
        save: 'Speichern'
      }
    }
  };
});

jest.mock('../../src/hooks', () => ({
  VOLUNTEER_GROUP_REFRESH_EVENT: 'VOLUNTEER_GROUP_REFRESH_EVENT',
  VOLUNTEER_STREAM_REFRESH_EVENT: 'VOLUNTEER_STREAM_REFRESH_EVENT',
  useComments: () => ({
    createComment: jest.fn(async () => ({ id: 1 })),
    deleteComment: jest.fn(async () => undefined),
    updateComment: jest.fn(async () => ({ id: 1 }))
  })
}));

jest.mock('../../src/queries/volunteer', () => ({
  postDelete: jest.fn(),
  postEdit: jest.fn(),
  postNew: jest.fn(),
  uploadFile: jest.fn()
}));

jest.mock('../../src/components/Button', () => ({
  Button: ({ title }) => title
}));

jest.mock('../../src/components/form', () => ({
  Input: () => null
}));

jest.mock('../../src/components/selectors', () => ({
  MultiImageSelector: () => null
}));

jest.mock('../../src/components/Text', () => ({
  BoldText: ({ children }) => children
}));

jest.mock('../../src/components/Wrapper', () => ({
  Wrapper: ({ children }) => children,
  WrapperRow: ({ children }) => children
}));

jest.mock('../../src/types', () => ({
  VolunteerObjectModelType: {
    COMMENT: 'COMMENT'
  }
}));

import { VolunteerCommentModal } from '../../src/components/volunteer/VolunteerCommentModal';
import { VolunteerPostModal } from '../../src/components/volunteer/VolunteerPostModal';
import { VolunteerObjectModelType } from '../../src/types';

const renderWithAct = (component: React.ReactElement) => {
  let testRenderer: renderer.ReactTestRenderer;

  renderer.act(() => {
    testRenderer = renderer.create(component);
  });

  return testRenderer!;
};

describe('Volunteer modal accessibility', () => {
  it('renders the post modal close control as the shared close button variant', () => {
    const setIsCollapsed = jest.fn();

    const tree = renderWithAct(
      <VolunteerPostModal
        authToken={null}
        contentContainerId={1}
        isCollapsed={false}
        setIsCollapsed={setIsCollapsed}
      />
    );

    const closeButton = tree.root.findAllByType(TouchableOpacity).find(
      (button) => button.props.accessibilityLabel === 'Schließen (Taste)'
    );

    expect(closeButton).toBeDefined();
    expect(closeButton?.props.accessibilityRole).toBe('button');
  });

  it('renders the comment modal close control as the shared close button variant', () => {
    const setIsCollapsed = jest.fn();

    const tree = renderWithAct(
      <VolunteerCommentModal
        authToken={null}
        isCollapsed={false}
        objectId={1}
        objectModel={VolunteerObjectModelType.COMMENT}
        setIsCollapsed={setIsCollapsed}
      />
    );

    const closeButton = tree.root.findAllByType(TouchableOpacity).find(
      (button) => button.props.accessibilityLabel === 'Schließen (Taste)'
    );

    expect(closeButton).toBeDefined();
    expect(closeButton?.props.accessibilityRole).toBe('button');
  });
});
