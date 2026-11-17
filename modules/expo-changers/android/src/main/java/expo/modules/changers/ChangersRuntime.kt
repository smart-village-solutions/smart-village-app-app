package expo.modules.changers

import android.app.*
import android.content.Context
import android.os.Bundle
import androidx.core.app.NotificationCompat
import com.blacksquared.sdk.app.Changers
import com.blacksquared.sdk.activity.WebActivity
import org.json.JSONObject

internal object ChangersRuntime {
  lateinit var application: Application
  var initialized = false
  @Volatile var enabled = false
    private set
  var environment = "stage"
  var configured = false
  var errorCode: String? = null
  private var configuration = JSONObject()
  private val prefs get() = application.getSharedPreferences("changers_activated", Context.MODE_PRIVATE)
  val activated get() = prefs.getBoolean("accepted", false)
  var providerActivity: Activity? = null
  var opening = false
  var onProviderClosed: (() -> Unit)? = null
  val networkBusy = java.util.concurrent.atomic.AtomicBoolean(false)
  val worker = java.util.concurrent.Executors.newSingleThreadExecutor()
  fun bootstrap(app: Application) {
    if (::application.isInitialized) return
    application = app
    try {
      configuration = JSONObject(app.assets.open("changers-config.json").bufferedReader().use { it.readText() })
      environment = configuration.optString("environment", "stage")
      configured = listOf("clientId", "clientSecret", "clientName").all { configuration.optString(it).isNotBlank() }
      app.registerActivityLifecycleCallbacks(object : Application.ActivityLifecycleCallbacks {
        override fun onActivityCreated(a: Activity, b: Bundle?) { if (a is WebActivity) { providerActivity = a; opening = false; if (!enabled) a.finish() } }
        override fun onActivityDestroyed(a: Activity) { if (providerActivity === a) { providerActivity = null; opening = false; if (!a.isChangingConfigurations) onProviderClosed?.invoke() } }
        override fun onActivityStarted(a: Activity) { /* No SDK action is needed for this lifecycle callback. */ }
        override fun onActivityResumed(a: Activity) { /* No SDK action is needed for this lifecycle callback. */ }
        override fun onActivityPaused(a: Activity) { /* No SDK action is needed for this lifecycle callback. */ }
        override fun onActivityStopped(a: Activity) { /* No SDK action is needed for this lifecycle callback. */ }
        override fun onActivitySaveInstanceState(a: Activity, b: Bundle) { /* No SDK action is needed for this lifecycle callback. */ }
      })
      // Wait for globalSettings before initializing, even after a previous activation.
    } catch (_: Exception) { errorCode = "E_CONFIGURATION" }
  }
  fun initialize() {
    check(enabled) { "E_DISABLED" }
    check(configured) { "E_CONFIGURATION" }
    check(activated) { "E_NOT_ACTIVE" }
    if (initialized) return
    val channel = "changers_tracking"
    val manager = application.getSystemService(NotificationManager::class.java)
    if (android.os.Build.VERSION.SDK_INT >= 26) {
      manager.createNotificationChannel(NotificationChannel(channel, "Klima-Taler-Tracking", NotificationManager.IMPORTANCE_LOW))
    }
    val intent = application.packageManager.getLaunchIntentForPackage(application.packageName)
    val pending = PendingIntent.getActivity(application, 0, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    val notification = NotificationCompat.Builder(application, channel)
      .setSmallIcon(android.R.drawable.ic_menu_mylocation).setContentTitle("Klima-Taler")
      .setContentText("Die von Ihnen erlaubte Wegeaufzeichnung ist aktiv").setContentIntent(pending)
      .setOngoing(true).setCategory(NotificationCompat.CATEGORY_SERVICE).build()
    Changers.with(application, Changers.Settings(appName = configuration.getString("clientName"),
      clientId = configuration.getString("clientId"), clientSecret = configuration.getString("clientSecret"),
      notification = notification, displayName = application.applicationInfo.loadLabel(application.packageManager).toString(), version = application.packageManager.getPackageInfo(application.packageName, 0).versionName ?: "", pusherInstanceId = ""))
    initialized = true
    errorCode = null
    // Nur initialisieren; diese Schnittstelle ruft startTracking niemals selbst auf.
    // Das Onboarding des Anbieters steuert Berechtigungsanfragen und die Tracking-Einwilligung.
  }
  fun accept() { check(enabled) { "E_DISABLED" }; check(configured) { "E_CONFIGURATION" }; prefs.edit().putBoolean("accepted", true).commit(); initialize() }
  fun setEnabledFromSettings(value: Boolean) {
    enabled = value
    if (value) {
      if (configured && activated) initialize()
    } else {
      providerActivity?.finish()
      // Remote disable preserves identity and activation history; it is not logout.
      if (initialized) Changers.stopTracking()
    }
  }
  fun stop() { if (initialized) Changers.stopTracking(); prefs.edit().putBoolean("accepted", false).commit() }
  fun requireReady() { check(enabled) { "E_DISABLED" }; check(configured) { "E_CONFIGURATION" }; check(activated) { "E_NOT_ACTIVE" }; check(initialized) { "E_NOT_READY" } }
  fun status(): Map<String, Any?> = mapOf(
    "platform" to "android", "environment" to environment, "sdkVersion" to "1.20.6", "motionTagVersion" to "7.2.5",
    "state" to when {
      !configured -> "unconfigured"
      !activated -> "inactive"
      errorCode != null -> "error"
      initialized -> "ready"
      else -> "idle"
    },
    "errorCode" to errorCode, "activated" to activated, "initialized" to initialized,
    "authenticated" to (initialized && Changers.isUserAuthenticated(application)),
    "tracking" to "unknown", "providerOpen" to (providerActivity != null || opening)
  )
}
