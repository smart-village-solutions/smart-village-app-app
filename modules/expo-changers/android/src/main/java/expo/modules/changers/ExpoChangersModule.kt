package expo.modules.changers

import com.blacksquared.sdk.app.Changers
import com.blacksquared.sdk.activity.WebActivity
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import expo.modules.kotlin.functions.Queues
import android.os.Handler
import android.os.Looper
import android.net.Uri
import java.util.concurrent.atomic.AtomicBoolean

class ExpoChangersModule : Module() {
  private companion object {
    const val STATISTICS_MESSAGE = "Klima-Taler konnten nicht geladen werden. Bitte erneut versuchen."
  }
  private val statisticsClient = ChangersStatisticsClient()

  private fun resolve(p: Promise, action: () -> Any?) {
    try { p.resolve(action()) } catch (e: Exception) {
      val code = e.message?.takeIf { it in setOf("E_STORAGE", "E_DISABLED", "E_CONFIGURATION", "E_NOT_ACTIVE", "E_NOT_READY", "E_BUSY", "E_NO_ACTIVITY", "E_INVALID_ARGUMENT", "E_ALREADY_AUTHENTICATED", "E_AUTHENTICATION") } ?: "E_PROVIDER"
      p.reject(code, "Der Changers-Vorgang ist fehlgeschlagen. Bitte Konfiguration, Verbindung und Anmeldung prüfen.", null)
    }
  }
  private fun loginUser(uuid: String, p: Promise) {
    if (!ChangersRuntime.networkBusy.compareAndSet(false, true)) {
      p.reject("E_BUSY", "Die vorherige SDK-Anfrage wird noch bearbeitet.", null)
    } else {
      val settled = AtomicBoolean(false)
      val handler = Handler(Looper.getMainLooper())
      val timeout = Runnable { if (settled.compareAndSet(false, true)) p.reject("E_TIMEOUT", "Das SDK hat nicht geantwortet. Eine erneute Anmeldung ist erst nach Abschluss der vorherigen Anfrage möglich.", null) }
      handler.postDelayed(timeout, 30000)
      ChangersRuntime.worker.execute { performLogin(uuid, p, settled, handler, timeout) }
    }
  }
  private fun performLogin(uuid: String, p: Promise, settled: AtomicBoolean, handler: Handler, timeout: Runnable) {
    try {
      ChangersRuntime.requireReady()
      check(uuid.isNotBlank() && uuid.length <= 128) { "E_INVALID_ARGUMENT" }
      check(!Changers.isUserAuthenticated(ChangersRuntime.application)) { "E_ALREADY_AUTHENTICATED" }
      Changers.logUserIn(uuid)
      check(Changers.isUserAuthenticated(ChangersRuntime.application)) { "E_AUTHENTICATION" }
      if (!ChangersRuntime.enabled || !ChangersRuntime.activated) Changers.stopTracking()
      if (settled.compareAndSet(false, true)) p.resolve(Changers.uuid)
    } catch (e: Exception) {
      if (settled.compareAndSet(false, true)) p.reject(e.message?.takeIf { it in setOf("E_STORAGE", "E_DISABLED", "E_CONFIGURATION", "E_NOT_ACTIVE", "E_NOT_READY", "E_BUSY", "E_NO_ACTIVITY", "E_INVALID_ARGUMENT", "E_ALREADY_AUTHENTICATED", "E_AUTHENTICATION") } ?: "E_PROVIDER", "Anmeldung fehlgeschlagen. Bitte Verbindung und Sitzung prüfen.", null)
    } finally { handler.removeCallbacks(timeout); ChangersRuntime.networkBusy.set(false) }
  }
  private fun completeStatistics(p: Promise, session: ChangersStatisticsSession, result: Result<Map<String, Double>>) {
    try {
      ChangersRuntime.requireReady()
      check(session.isCurrent()) { "E_AUTHENTICATION" }
      val error = result.exceptionOrNull()
      if (error != null) {
        val code = (error as? StatisticsFailure)?.code ?: "E_PROVIDER"
        p.reject(code, STATISTICS_MESSAGE, null)
      } else {
        p.resolve(result.getOrThrow())
      }
    } catch (error: Exception) {
      val code = error.message?.takeIf { it in setOf("E_DISABLED", "E_NOT_ACTIVE", "E_NOT_READY", "E_CONFIGURATION", "E_AUTHENTICATION") } ?: "E_PROVIDER"
      p.reject(code, STATISTICS_MESSAGE, null)
    } finally { ChangersRuntime.networkBusy.set(false) }
  }
  private fun fetchStatistics(p: Promise) {
    if (!ChangersRuntime.networkBusy.compareAndSet(false, true)) {
      p.reject("E_BUSY", "Die vorherige SDK-Anfrage wird noch bearbeitet.", null)
    } else {
      try {
        ChangersRuntime.requireReady()
        check(ChangersRuntime.providerActivity == null && !ChangersRuntime.opening) { "E_BUSY" }
        val session = ChangersStatisticsSession.current()
        check(session.uuid.isNotBlank() && session.token.isNotBlank()) { "E_AUTHENTICATION" }
        ChangersRuntime.worker.execute {
          val result = runCatching {
            ChangersRuntime.requireReady()
            statisticsClient.read(session.token, session.app, session.device, session.agent)
          }
          Handler(Looper.getMainLooper()).post { completeStatistics(p, session, result) }
        }
      } catch (error: Exception) {
        ChangersRuntime.networkBusy.set(false)
        val code = error.message?.takeIf { it in setOf("E_DISABLED", "E_NOT_ACTIVE", "E_NOT_READY", "E_CONFIGURATION", "E_AUTHENTICATION", "E_BUSY") } ?: "E_PROVIDER"
        p.reject(code, STATISTICS_MESSAGE, null)
      }
    }

  }
  private fun openProvider(): Any? {
    ChangersRuntime.requireReady()
    check(!ChangersRuntime.networkBusy.get()) { "E_BUSY" }
    val activity = appContext.currentActivity ?: error("E_NO_ACTIVITY")
    if (ChangersRuntime.providerActivity == null && !ChangersRuntime.opening) {
      ChangersRuntime.opening = true
      try { activity.startActivity(WebActivity.newIntent(activity)) } catch (e: Exception) { ChangersRuntime.opening = false; throw e }
    }
    return null
  }
  private fun logout(): Any? {
    check(!ChangersRuntime.networkBusy.get()) { "E_BUSY" }
    ChangersRuntime.providerActivity?.finish()
    if (ChangersRuntime.initialized) { Changers.stopTracking(); Changers.logUserOut() }
    ChangersRuntime.stop()
    return null
  }
  private fun openLink(url: String) {
    ChangersRuntime.requireReady()
    check(!ChangersRuntime.networkBusy.get() && !ChangersRuntime.opening) { "E_BUSY" }
    val activity = ChangersRuntime.providerActivity ?: appContext.currentActivity ?: error("E_NO_ACTIVITY")
    if (ChangersRuntime.providerActivity != null) {
      Changers.handleDeepLink(Uri.parse(url))
    } else {
      ChangersRuntime.opening = true
      try {
        // The SDK holds the target while its own onboarding/web app becomes ready.
        Changers.openLink(activity, Uri.parse(url))
      } catch (e: Exception) { ChangersRuntime.opening = false; throw e }
    }
  }

  override fun definition() = ModuleDefinition {
    Name("ExpoChangers")
    Constants("safeStatistics" to true, "badgeLinks" to true)
    Events("onProviderClosed")
    OnCreate { ChangersRuntime.onProviderClosed = { sendEvent("onProviderClosed", emptyMap<String, Any>()) } }
    OnDestroy { ChangersRuntime.onProviderClosed = null }
    AsyncFunction("getStatus") { ChangersRuntime.status() }.runOnQueue(Queues.MAIN)
    AsyncFunction("setEnabled") { enabled: Boolean, p: Promise -> resolve(p) { ChangersRuntime.setEnabledFromSettings(enabled); null } }.runOnQueue(Queues.MAIN)
    AsyncFunction("activate") { p: Promise -> resolve(p) { ChangersRuntime.accept(); ChangersRuntime.status() } }.runOnQueue(Queues.MAIN)
    AsyncFunction("getUserUUID") { p: Promise -> resolve(p) { ChangersRuntime.requireReady(); if (Changers.isUserAuthenticated(ChangersRuntime.application)) Changers.uuid.takeIf { it.isNotBlank() } else null } }
    AsyncFunction("openProvider") { p: Promise -> resolve(p) { openProvider() } }.runOnQueue(Queues.MAIN)
    AsyncFunction("closeProvider") { ChangersRuntime.providerActivity?.finish(); null }.runOnQueue(Queues.MAIN)
    AsyncFunction("openOffer") { offerId: String, p: Promise -> resolve(p) {
      val url = changersOfferLink(offerId) ?: error("E_INVALID_ARGUMENT")
      openLink(url)
      null
    } }.runOnQueue(Queues.MAIN)
    AsyncFunction("loginUser") { uuid: String, p: Promise -> loginUser(uuid, p) }
    AsyncFunction("registerUser") { p: Promise -> p.reject("E_UNSUPPORTED", "Unter Android erfolgt die Registrierung neuer Benutzer in der Anbieteroberfläche.", null) }
    AsyncFunction("fetchStatistics") { p: Promise -> fetchStatistics(p) }.runOnQueue(Queues.MAIN)
    AsyncFunction("stopTracking") { p: Promise -> resolve(p) { ChangersRuntime.stop(); null } }.runOnQueue(Queues.MAIN)
    AsyncFunction("logout") { p: Promise -> resolve(p) { logout() } }.runOnQueue(Queues.MAIN)
    AsyncFunction("openTarget") { target: String, p: Promise -> resolve(p) {
      val url = changersPageLink(target) ?: error("E_INVALID_ARGUMENT")
      openLink(url)
      null
    } }.runOnQueue(Queues.MAIN)
  }
}
