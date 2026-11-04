package expo.modules.changers;

import com.blacksquared.sdk.app.Changers;
import com.blacksquared.sdk.model.UserToken;
import com.blacksquared.sdk.service.Prefs;

/** Read-only access to the pinned 1.20.7 SDK session; never authenticates or registers. */
final class ChangersStatisticsSession {
  final String uuid;
  final String token;
  final String app;
  final String device;
  final String agent;

  private ChangersStatisticsSession(String uuid, String token, String app, String device, String agent) {
    this.uuid = uuid;
    this.token = token;
    this.app = app;
    this.device = device;
    this.agent = agent;
  }

  static ChangersStatisticsSession current() {
    // These Kotlin-internal accessors are public JVM methods. Keep this adapter
    // version-bound and revalidate it when upgrading the vendor artifact.
    Changers sdk = Changers.INSTANCE;
    Prefs prefs = sdk.getSharedPrefs$sdk_stagingRelease();
    UserToken user = prefs.getUserToken();
    return new ChangersStatisticsSession(user.getUuid(), user.getToken(),
      sdk.getAppName$sdk_stagingRelease(), prefs.getUuid(), sdk.xAgent$sdk_stagingRelease());
  }

  boolean isCurrent() {
    UserToken user = Changers.INSTANCE.getSharedPrefs$sdk_stagingRelease().getUserToken();
    return uuid.equals(user.getUuid()) && token.equals(user.getToken());
  }
}
