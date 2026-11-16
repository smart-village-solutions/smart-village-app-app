type AppContext = {
  applicationId?: string | null;
  slug: string;
  channel?: string | null;
  runtimeVersion?: string | null;
  updateId?: string | null;
  isEmbeddedLaunch: boolean;
};

// Keep SDK-generated release/dist values; identify the actual native app and OTA independently.
export const buildSentryAppTags = (context: AppContext) => ({
  'app.identifier': context.applicationId ?? 'unknown',
  'app.slug': context.slug,
  'expo.channel': context.channel ?? 'unknown',
  'expo.runtime_version': context.runtimeVersion ?? 'unknown',
  'expo.update_id': context.updateId ?? 'embedded',
  'expo.is_embedded_launch': String(context.isEmbeddedLaunch)
});
