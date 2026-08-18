import {
  resolveAppDesignSystem,
  resolveThemeOverrides
} from '../../src/helpers/appDesignSystemHelper';

const appDesignSystem = {
  serviceTiles: {
    numberOfLines: 3,
    tileStyle: {
      backgroundColor: '#7CF7EF',
      borderRadius: 8
    },
    fontStyle: {
      color: '#000000',
      fontSize: 14
    },
    dark: {
      tileStyle: {
        backgroundColor: '#164E4A'
      },
      fontStyle: {
        color: '#F5F5F5'
      }
    }
  },
  sueStatus: {
    statusViewColors: {
      Abgeschlossen: '#D1FADF',
      disabled: '#EBEBEB'
    },
    statuses: [{ status: 'Abgeschlossen', matchingStatuses: ['Geschlossen'] }],
    dark: {
      statusViewColors: {
        Abgeschlossen: '#123B2A',
        disabled: '#2A2A2A'
      }
    }
  }
};

describe('resolveAppDesignSystem', () => {
  it('uses root styles in light mode and removes dark metadata', () => {
    expect(resolveAppDesignSystem(appDesignSystem, 'light')).toEqual({
      serviceTiles: {
        numberOfLines: 3,
        tileStyle: {
          backgroundColor: '#7CF7EF',
          borderRadius: 8
        },
        fontStyle: {
          color: '#000000',
          fontSize: 14
        }
      },
      sueStatus: {
        statusViewColors: {
          Abgeschlossen: '#D1FADF',
          disabled: '#EBEBEB'
        },
        statuses: [{ status: 'Abgeschlossen', matchingStatuses: ['Geschlossen'] }]
      }
    });
  });

  it('recursively merges dark overrides while preserving shared values', () => {
    expect(resolveAppDesignSystem(appDesignSystem, 'dark')).toEqual({
      serviceTiles: {
        numberOfLines: 3,
        tileStyle: {
          backgroundColor: '#164E4A',
          borderRadius: 8
        },
        fontStyle: {
          color: '#F5F5F5',
          fontSize: 14
        }
      },
      sueStatus: {
        statusViewColors: {
          Abgeschlossen: '#123B2A',
          disabled: '#2A2A2A'
        },
        statuses: [{ status: 'Abgeschlossen', matchingStatuses: ['Geschlossen'] }]
      }
    });
  });

  it('supports a dark override at the appDesignSystem root', () => {
    expect(
      resolveAppDesignSystem(
        {
          widgets: {
            widgetStyle: {
              borderColor: '#BCBBC1',
              borderWidth: 2
            }
          },
          dark: {
            widgets: {
              widgetStyle: {
                borderColor: '#54545A'
              }
            }
          }
        },
        'dark'
      )
    ).toEqual({
      widgets: {
        widgetStyle: {
          borderColor: '#54545A',
          borderWidth: 2
        }
      }
    });
  });

  it('resolves nested dark overrides in static content arrays', () => {
    expect(
      resolveThemeOverrides(
        [
          {
            button: {
              style: {
                iconColor: '#FFFFFF',
                iconPosition: 'right',
                dark: {
                  iconColor: '#141414'
                }
              }
            }
          }
        ],
        'dark'
      )
    ).toEqual([
      {
        button: {
          style: {
            iconColor: '#141414',
            iconPosition: 'right'
          }
        }
      }
    ]);
  });

  it('does not mutate the remote configuration', () => {
    const originalConfiguration = JSON.parse(JSON.stringify(appDesignSystem));

    resolveAppDesignSystem(appDesignSystem, 'dark');

    expect(appDesignSystem).toEqual(originalConfiguration);
  });

  it('returns an empty configuration for invalid input', () => {
    expect(resolveAppDesignSystem(null, 'dark')).toEqual({});
    expect(resolveAppDesignSystem([], 'dark')).toEqual({});
  });
});
