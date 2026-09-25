/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import renderer from 'react-test-renderer';

const mockReadFromStore = jest.fn();
const mockUseStaticContent = jest.fn();
const mockGoToSlide = jest.fn();

jest.mock('react-native-app-intro-slider', () => {
  const ReactLocal = require('react');

  return ReactLocal.forwardRef((props, ref) => {
    ReactLocal.useImperativeHandle(ref, () => ({ goToSlide: mockGoToSlide }));

    return ReactLocal.createElement('mock-intro-slider', props);
  });
});

jest.mock('../src/components', () => {
  const ReactLocal = require('react');
  const Stub = ({ children, ...props }) => ReactLocal.createElement('mock-view', props, children);

  return {
    AppStatusBar: Stub,
    BoldText: Stub,
    Checkbox: Stub,
    Image: Stub,
    RegularText: Stub,
    SafeAreaViewFlex: Stub,
    Wrapper: Stub
  };
});

jest.mock('../src/config', () => ({
  consts: { a11yLabel: { button: 'button' } },
  device: { platform: 'ios' },
  Icon: {},
  normalize: (value) => value,
  texts: {
    appIntro: { continue: 'Weiter', skip: 'Überspringen' },
    profile: {
      termsAndConditionsAlertTitle: 'Bedingungen',
      termsAndConditionsAlertMessage: 'Bitte akzeptieren',
      termsAndConditionsAlertOk: 'OK'
    }
  }
}));

jest.mock('../src/helpers', () => ({
  addToStore: jest.fn(),
  Initializer: { TermsAndConditions: 'terms-and-conditions' },
  readFromStore: (...args) => mockReadFromStore(...args)
}));

jest.mock('../src/hooks', () => ({
  useStaticContent: (...args) => mockUseStaticContent(...args)
}));

jest.mock('../src/hooks/useTheme', () => ({
  useTheme: () => ({ colors: { surface: '#fff', darkText: '#000' } })
}));

jest.mock('../src/hooks/useThemeStyles', () => ({
  useThemeStyles: (createStyles) => createStyles({ surface: '#fff', darkText: '#000' })
}));

jest.mock('../src/jsonValidation', () => ({ parseIntroSlides: jest.fn() }));
jest.mock('../src/OnboardingManager', () => ({
  HAS_TERMS_AND_CONDITIONS_STORE_KEY: 'has-terms',
  TERMS_AND_CONDITIONS_STORE_KEY: 'terms'
}));
jest.mock('../src/queries', () => ({ QUERY_TYPES: {} }));
jest.mock('../src/AccessibilityProvider', () => {
  const ReactLocal = require('react');

  return { AccessibilityContext: ReactLocal.createContext({ isReduceMotionEnabled: false }) };
});
jest.mock('../src/screens/HtmlScreen', () => ({ HtmlScreen: () => null }));

import { AppIntroScreen } from '../src/screens/AppIntroScreen';

describe('AppIntroScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReadFromStore.mockResolvedValue(null);
    mockUseStaticContent.mockReturnValue({
      data: [
        { title: 'Erste Seite', text: 'Hallo' },
        { title: 'Bereit?', text: 'Weiter geht es' }
      ],
      error: false,
      loading: false
    });
  });

  it('shows and runs the final action when no terms slide exists and terms are not accepted', async () => {
    const setOnboardingComplete = jest.fn();
    let tree;

    await renderer.act(async () => {
      tree = renderer.create(<AppIntroScreen setOnboardingComplete={setOnboardingComplete} />);
    });

    const slider = tree.root.findByType('mock-intro-slider');
    expect(slider.props.showNextButton).toBe(true);

    await renderer.act(async () => {
      slider.props.renderNextButton().props.onPress();
    });

    expect(mockGoToSlide).toHaveBeenCalledWith(1, true);

    await renderer.act(async () => {
      slider.props.onSlideChange(1);
    });

    const finalSlider = tree.root.findByType('mock-intro-slider');
    expect(finalSlider.props.showDoneButton).toBe(true);
    expect(finalSlider.props.showNextButton).toBe(false);
    expect(finalSlider.props.showSkipButton).toBe(false);

    await renderer.act(async () => {
      finalSlider.props.renderDoneButton().props.onPress();
    });

    expect(setOnboardingComplete).toHaveBeenCalledTimes(1);
  });

  it('returns to an unaccepted terms slide before completing onboarding', async () => {
    const setOnboardingComplete = jest.fn();
    mockUseStaticContent.mockReturnValue({
      data: [
        { title: 'Bedingungen', onLeaveSlideName: 'terms-and-conditions' },
        { title: 'Bereit?' }
      ],
      error: false,
      loading: false
    });
    let tree;

    await renderer.act(async () => {
      tree = renderer.create(<AppIntroScreen setOnboardingComplete={setOnboardingComplete} />);
    });

    await renderer.act(async () => {
      tree.root.findByType('mock-intro-slider').props.onSlideChange(1);
    });

    const finalSlider = tree.root.findByType('mock-intro-slider');
    expect(finalSlider.props.showDoneButton).toBe(true);

    await renderer.act(async () => {
      finalSlider.props.renderDoneButton().props.onPress();
    });

    expect(mockGoToSlide).toHaveBeenCalledWith(0, true);
    expect(setOnboardingComplete).not.toHaveBeenCalled();
  });

  it('requires terms approval before advancing past a terms slide', async () => {
    const setOnboardingComplete = jest.fn();
    const termsSlide = { title: 'Bedingungen', onLeaveSlideName: 'terms-and-conditions' };
    mockUseStaticContent.mockReturnValue({
      data: [termsSlide, { title: 'Bereit?' }],
      error: false,
      loading: false
    });
    let tree;

    await renderer.act(async () => {
      tree = renderer.create(<AppIntroScreen setOnboardingComplete={setOnboardingComplete} />);
    });

    let slider = tree.root.findByType('mock-intro-slider');
    expect(slider.props.renderNextButton().props.isDisabled).toBe(true);

    await renderer.act(async () => {
      slider.props.renderNextButton().props.onPress();
    });

    expect(mockGoToSlide).not.toHaveBeenCalled();

    await renderer.act(async () => {
      slider.props
        .renderItem({ item: termsSlide })
        .props.children[1].props.onTermsAcceptanceChange(true);
    });

    slider = tree.root.findByType('mock-intro-slider');
    expect(slider.props.renderNextButton().props.isDisabled).toBe(false);

    await renderer.act(async () => {
      slider.props.renderNextButton().props.onPress();
      slider.props.onSlideChange(1);
    });

    expect(mockGoToSlide).toHaveBeenCalledWith(1, true);

    slider = tree.root.findByType('mock-intro-slider');
    await renderer.act(async () => {
      slider.props.renderDoneButton().props.onPress();
    });

    expect(setOnboardingComplete).toHaveBeenCalledTimes(1);
  });

  it('keeps the final action disabled when the final slide is unaccepted terms', async () => {
    mockUseStaticContent.mockReturnValue({
      data: [{ title: 'Bedingungen', onLeaveSlideName: 'terms-and-conditions' }],
      error: false,
      loading: false
    });
    let tree;

    await renderer.act(async () => {
      tree = renderer.create(<AppIntroScreen setOnboardingComplete={jest.fn()} />);
    });

    const slider = tree.root.findByType('mock-intro-slider');
    expect(slider.props.showDoneButton).toBe(true);
    expect(slider.props.renderDoneButton().props.isDisabled).toBe(true);
  });
});
