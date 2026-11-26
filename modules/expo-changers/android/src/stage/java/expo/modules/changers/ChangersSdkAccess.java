package expo.modules.changers;

import com.blacksquared.sdk.app.Changers;
import com.blacksquared.sdk.service.Prefs;

// Compile only with the matching vendor artifact. No reflection or signup fallback.
final class ChangersSdkAccess {
  static Prefs prefs() { return Changers.INSTANCE.getSharedPrefs$sdk_stagingRelease(); }
  static String app() { return Changers.INSTANCE.getAppName$sdk_stagingRelease(); }
  static String agent() { return Changers.INSTANCE.xAgent$sdk_stagingRelease(); }
}
