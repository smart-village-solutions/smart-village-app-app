package expo.modules.changers;

import android.app.Application;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import de.motiontag.tracker.internal.receivers.BootAppUpdateReceiver;

public final class ChangersBootReceiver extends BroadcastReceiver {
  @Override
  public void onReceive(Context context, Intent intent) {
    if (intent == null || !(Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction()) ||
        Intent.ACTION_MY_PACKAGE_REPLACED.equals(intent.getAction()) ||
        "android.intent.action.QUICKBOOT_POWERON".equals(intent.getAction()) ||
        "com.htc.intent.action.QUICKBOOT_POWERON".equals(intent.getAction()))) return;
    ChangersRuntime runtime = ChangersRuntime.INSTANCE;
    // Usually already bootstrapped by the Expo Application listener. This is idempotent.
    runtime.bootstrap((Application) context.getApplicationContext());
    if (!runtime.getEnabled() || !runtime.getInitialized() || !runtime.getActivated()) return;
    new BootAppUpdateReceiver().onReceive(context, intent);
  }
}
