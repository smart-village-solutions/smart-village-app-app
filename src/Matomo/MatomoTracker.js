class MatomoTracker {
  constructor(userOptions) {
    if (!userOptions.urlBase) {
      throw new Error('urlBase is required for Matomo tracking.');
    }
    if (!userOptions.siteId) {
      throw new Error('siteId is required for Matomo tracking.');
    }

    this.initialize(userOptions);
  }

  initialize({ urlBase, trackerUrl, siteId, userId, disabled = false, log = false }) {
    const normalizedUrlBase = urlBase[urlBase.length - 1] !== '/' ? `${urlBase}/` : urlBase;

    this.disabled = disabled;
    this.log = log;

    if (disabled) {
      log && console.log('Matomo tracking is disabled.');

      return;
    }

    this.trackerUrl = trackerUrl ?? `${normalizedUrlBase}matomo.php`;
    this.siteId = siteId;

    if (userId) {
      this.userId = userId;
    }

    log &&
      console.log('Matomo tracking is enabled for:', {
        trackerUrl: this.trackerUrl,
        siteId: this.siteId,
        userId: this.userId
      });
  }

  /**
   * Tracks app start as action with prefixed 'App' category
   */
  trackAppStart() {
    this.trackAction({ name: 'App / start' });
  }

  /**
   * Tracks screen view as action with prefixed 'Screen' category
   *
   * @param {String} name - The title of the action being tracked. It is possible to use slashes / to set one or several categories for this action. For example, Help / Feedback will create the Action Feedback in the category Help.
   */
  trackScreenView(name) {
    if (!name) throw new Error('Error: name is required.');

    this.trackAction({ name: `Screen / ${name}` });
  }

  /**
   * Tracks actions
   *
   * Doc: https://developer.matomo.org/api-reference/tracking-api#recommended-parameters
   *
   * @param {Object} data -
   * {String} `name` - The title of the action being tracked. It is possible to use slashes / to set one or several categories for this action. For example, Help / Feedback will create the Action Feedback in the category Help.
   */
  trackAction({ name }) {
    if (!name) throw new Error('Error: name is required.');

    this.track({ action_name: name });
  }

  /**
   * Tracks custom events
   *
   * Doc: https://developer.matomo.org/api-reference/tracking-api#optional-event-trackinghttpsmatomoorgdocsevent-tracking-info
   *
   * @param {Object} data -
   * {String} `category` - The event category. Must not be empty. (eg. Videos, Music, Games...)
   * {String} `action` - The event action. Must not be empty. (eg. Play, Pause, Duration, Add Playlist, Downloaded, Clicked...)
   * {String} `name` - The event name. (eg. a Movie name, or Song name, or File name...)
   * {String} `value` - The event value. Must be a float or integer value (numeric), not a string.
   */
  trackEvent({ category, action, name, value }) {
    if (!category) throw new Error('Error: category is required.');
    if (!action) throw new Error('Error: action is required.');

    this.track({ e_c: category, e_a: action, e_n: name, e_v: value });
  }

  /**
   * Tracks site search
   *
   * Doc: https://developer.matomo.org/api-reference/tracking-api#optional-action-info-measure-page-view-outlink-download-site-search
   *
   * @param {Object} data -
   * {String} `keyword` - The Site Search keyword. When specified, the request will not be tracked as a normal pageview but will instead be tracked as a Site Search request.
   *
   * {String} `category` - when `keyword` is specified, you can optionally specify a search category with this parameter.
   *
   * {String} `count` - when `keyword` is specified, we also recommend setting the search_count to the number of search results displayed on the results page. When keywords are tracked with &search_count=0 they will appear in the "No Result Search Keyword" report.
   */
  trackSiteSearch({ keyword, category, count }) {
    if (!keyword) throw new Error('Error: keyword is required.');

    this.track({ search: keyword, search_cat: category, search_count: count });
  }

  /**
   * Tracks outgoing links to other sites
   *
   * Doc: https://developer.matomo.org/api-reference/tracking-api#optional-action-info-measure-page-view-outlink-download-site-search
   *
   * @param {Object} data -
   * {String} `link` - An external URL the user has opened. Used for tracking outlink clicks.
   */
  trackLink({ link }) {
    if (!link) throw new Error('Error: link is required.');

    this.track({ link, url: link });
  }

  /**
   * Tracks downloads
   *
   * Doc: https://developer.matomo.org/api-reference/tracking-api#optional-action-info-measure-page-view-outlink-download-site-search
   *
   * @param {Object} data -
   * {String} `download` - URL of a file the user has downloaded. Used for tracking downloads.
   */
  trackDownload({ download }) {
    if (!download) throw new Error('Error: download is required.');

    this.track({ download, url: download });
  }

  /**
   * Sends the tracking to Matomo
   */
  track(data) {
    if (this.disabled) return;
    if (!data) return;

    const fetchObj = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      },
      body: new URLSearchParams({
        idsite: this.siteId,
        rec: 1,
        apiv: 1,
        ...data
      }).toString()
    };

    fetch(this.trackerUrl, fetchObj)
      .catch((err) => console.error('error', err))
      .finally(
        () => this.log && console.log('Matomo tracking is sent:', this.trackerUrl, fetchObj)
      );
  }
}

export default MatomoTracker;
