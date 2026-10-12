package expo.modules.changers;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import de.motiontag.tracker.internal.receivers.BootAppUpdateReceiver;

public final class ChangersBootReceiver extends BroadcastReceiver {
  @Override
  public void onReceive(Context context, Intent intent) {
    // Android may start this process solely for an update/boot broadcast. The
    // vendor receiver assumes initialization in Application.onCreate, but SVA
    // must wait for enabled globalSettings and the user's previous activation.
    // A broadcast must neither activate the module nor bypass that settings gate.
    ChangersRuntime runtime = ChangersRuntime.INSTANCE;
    if (!runtime.getEnabled() || !runtime.getInitialized() || !runtime.getActivated()) return;
    new BootAppUpdateReceiver().onReceive(context, intent);
  }
}
