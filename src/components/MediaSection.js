import _filter from 'lodash/filter';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { ActivityIndicator, Linking, Platform } from 'react-native';
import WebView from 'react-native-webview';
import YoutubeIframe from 'react-native-youtube-iframe';

import { consts, normalize } from '../config';
import { AudioTrackSourceContext } from '../AudioPlayerProvider';
import { useAudioPlayerSettings } from '../AudioPlayerSettings';
import { trimNewLines } from '../helpers';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { useTheme } from '../hooks/useTheme';

import { LoadingContainer } from './LoadingContainer';
import { AudioPlayerControls } from './AudioPlayerControls';
import { WrapperHorizontal, WrapperVertical } from './Wrapper';

// Extracts the YouTube video ID from an embed URL or an iframe HTML string.
// Matches both youtube.com and youtube-nocookie.com embed URLs.
const extractYoutubeId = (url) => {
  const match = url?.match(/youtube(?:-nocookie)?\.com\/embed\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
};

// Reads the height attribute from the first <iframe> tag in an HTML string.
const extractIframeHeight = (html) => {
  const match = html?.match(/<iframe[^>]+height="(\d+)"/i);
  return match ? parseInt(match[1], 10) : null;
};

// Checks if the HTML string contains a SoundCloud embed and returns the player src URL.
const extractSoundCloudPlayerUrl = (html) => {
  const match = html?.match(/src="(https:\/\/w\.soundcloud\.com\/player\/[^"]+)"/);
  return match ? match[1] : null;
};

const getSoundCloudPlayerUrl = (url) =>
  extractSoundCloudPlayerUrl(url) ||
  (/^https:\/\/w\.soundcloud\.com\/player\//i.test(url) ? url : null);

// Rewrites SoundCloud player URL to use the classic waveform player (visual=false)
// which plays audio directly without the album-art overlay that forces users to
// tap "Play on SoundCloud" or "Listen in browser".
const buildSoundCloudClassicUrl = (url) =>
  url
    .replace(/visual=true/gi, 'visual=false')
    .replace(/show_comments=true/gi, 'show_comments=false')
    .replace(/show_teaser=true/gi, 'show_teaser=false');

// A realistic mobile browser User-Agent prevents bot-detection walls
// (e.g. Cloudflare) when third-party embeds redirect to their websites.
const MOBILE_USER_AGENT = Platform.select({
  ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  android:
    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
});

// Only allow http(s) URLs to be opened externally; reject custom schemes
// (tel:, intent:, etc.) that could be injected via content.
const isSafeHttpUrl = (url) => /^https?:\/\//i.test(url);

const usesNativeAudioPlayer = ({ contentType, sourceUrl }) => {
  const url = sourceUrl?.url;
  return (
    contentType === 'audio' &&
    isSafeHttpUrl(url) &&
    !extractYoutubeId(url) &&
    !getSoundCloudPlayerUrl(url)
  );
};

// SoundCloud widget and CDN domains that must be allowed to navigate freely.
// Parses the hostname and requires an exact match or a proper subdomain suffix
// to prevent hosts like "soundcloud.com.evil.example" from matching.
const isSoundCloudDomain = (url) => {
  try {
    const { hostname } = new URL(url);
    return (
      hostname === 'soundcloud.com' ||
      hostname.endsWith('.soundcloud.com') ||
      hostname === 'sndcdn.com' ||
      hostname.endsWith('.sndcdn.com')
    );
  } catch {
    return false;
  }
};

// SoundCloud-specific navigation handler:
// allows all soundcloud.com / sndcdn.com navigation (widget, API, CDN),
// opens everything else (e.g. artist websites) in the system browser.
const handleSoundCloudNavigation = (request) => {
  if (!request.isTopFrame) return true;
  if (request.url === 'about:blank' || request.url.startsWith('data:')) return true;
  if (isSoundCloudDomain(request.url)) return true;
  if (isSafeHttpUrl(request.url)) {
    Linking.openURL(request.url).catch(() => null);
  }
  return false;
};

// Generic handler: allows iframe requests (not top-frame) but opens any
// top-frame external link in the system browser so the embed stays intact.
const handleShouldStartLoadWithRequest = (request) => {
  if (!request.isTopFrame) return true;
  if (request.url === 'about:blank' || request.url.startsWith('data:')) return true;
  if (isSafeHttpUrl(request.url)) {
    Linking.openURL(request.url).catch(() => null);
  }
  return false;
};

// NOTE:
// Historically this constant modified `navigator.webdriver` and `navigator.plugins`
// inside the WebView to evade bot/automation detection for some embeds.
// This kind of fingerprint spoofing is brittle, can violate third‑party ToS,
// and may break embeds in unexpected ways, so it has been intentionally
// disabled. The constant is kept as a no‑op to preserve the existing API shape.
const ANTI_BOT_JS = 'true;';

// Wraps raw iframe HTML in a complete document so third-party players
// (e.g. SoundCloud) load correctly. The viewport meta tag is placed in
// <head> which is more reliable than injecting it via JavaScript.
const buildHtmlDocument = (content) => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=0.99, user-scalable=0">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { background-color: transparent; }
      iframe { width: 100% !important; border: none; }
    </style>
  </head>
  <body>${content}</body>
</html>`;

// eslint-disable-next-line complexity
export const MediaItem = ({ mediaContent }) => {
  const { enabled: audioPlayerEnabled } = useAudioPlayerSettings();
  const audioSource = useContext(AudioTrackSourceContext);
  const { colors: colors } = useTheme();

  const styles = useThemeStyles(createStyles);
  const rawUrl = mediaContent?.sourceUrl?.url ?? '';

  const youtubeId = extractYoutubeId(rawUrl);

  if (youtubeId) {
    return <YoutubeIframe videoId={youtubeId} height={normalize(210)} />;
  }

  const soundCloudPlayerUrl = getSoundCloudPlayerUrl(rawUrl);

  if (soundCloudPlayerUrl) {
    // Load the player URL directly (source={{ uri }}) so the WebView origin is
    // w.soundcloud.com — this satisfies CORS for the API calls the widget makes
    // and avoids Cloudflare bot detection that triggers with a null/data: origin.
    // Standard height for a single-track classic waveform player is 166px.
    const classicUrl = buildSoundCloudClassicUrl(soundCloudPlayerUrl);

    return (
      <WebView
        accessibilityLabel={`SoundCloud ${consts.a11yLabel.webViewHint}`}
        source={{ uri: classicUrl }}
        style={[styles.iframeWebView, { height: normalize(166) }]}
        userAgent={MOBILE_USER_AGENT}
        scrollEnabled={false}
        bounces={false}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        originWhitelist={['*']}
        injectedJavaScript={ANTI_BOT_JS}
        onShouldStartLoadWithRequest={handleSoundCloudNavigation}
        startInLoadingState
        renderLoading={() => (
          <LoadingContainer web>
            <ActivityIndicator color={colors.refreshControl} />
          </LoadingContainer>
        )}
      />
    );
  }

  if (mediaContent?.contentType === 'audio' && isSafeHttpUrl(rawUrl)) {
    if (!audioPlayerEnabled) return null;
    return (
      <AudioPlayerControls
        track={{
          ...(audioSource ? { source: audioSource } : {}),
          title: mediaContent.captionText || mediaContent.sourceUrl?.description || 'Audio',
          url: rawUrl
        }}
      />
    );
  }

  // Generic iframe fallback: use height declared in the tag, default to 210.
  const iframeHeight = extractIframeHeight(rawUrl) ?? 210;

  return (
    <WebView
      accessibilityLabel={`Medieninhalt ${consts.a11yLabel.webViewHint}`}
      source={{ html: buildHtmlDocument(trimNewLines(rawUrl)) }}
      style={[styles.iframeWebView, { height: normalize(iframeHeight) }]}
      userAgent={MOBILE_USER_AGENT}
      scrollEnabled={false}
      bounces={false}
      javaScriptEnabled
      domStorageEnabled
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
      originWhitelist={['*']}
      onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
      startInLoadingState
      renderLoading={() => (
        <LoadingContainer web>
          <ActivityIndicator color={colors.refreshControl} />
        </LoadingContainer>
      )}
    />
  );
};

export const MediaSection = ({ mediaContents }) => {
  const { enabled: audioPlayerEnabled } = useAudioPlayerSettings();
  const filteredContents = _filter(
    mediaContents,
    (mediaContent) =>
      (mediaContent.contentType === 'video' || mediaContent.contentType === 'audio') &&
      !!mediaContent?.sourceUrl?.url &&
      (audioPlayerEnabled || !usesNativeAudioPlayer(mediaContent))
  );

  if (!filteredContents?.length) {
    return null;
  }

  return (
    <WrapperHorizontal>
      {filteredContents.map((mediaContent) => (
        <WrapperVertical key={`mediaContent${mediaContent.id || mediaContent.sourceUrl.url}`}>
          <MediaItem mediaContent={mediaContent} />
        </WrapperVertical>
      ))}
    </WrapperHorizontal>
  );
};

const createStyles = () => ({
  iframeWebView: {
    height: normalize(210),
    width: '100%'
  }
});

MediaSection.propTypes = {
  mediaContents: PropTypes.array
};

MediaItem.propTypes = {
  mediaContent: PropTypes.shape({
    captionText: PropTypes.string,
    contentType: PropTypes.string,
    sourceUrl: PropTypes.shape({
      description: PropTypes.string,
      url: PropTypes.string
    })
  })
};
