package expo.modules.changers

import org.junit.Assert.*
import org.junit.Test

class ChangersSettingsGateTest {
  @Test fun coldProcessRequiresSavedGateAndActivation() {
    var saved = false
    var initializations = 0
    fun process(activated: Boolean): ChangersSettingsGate {
      return ChangersSettingsGate({ saved }, { saved = it; true }).also {
        it.restore(activated) { initializations++ }
      }
    }
    process(true)
    assertEquals(0, initializations)
    saved = true
    process(false)
    assertEquals(0, initializations)
    process(true) // boot, update or OS process recreation
    assertEquals(1, initializations)
  }

  @Test fun disableSurvivesProcessRecreationWithoutClearingActivation() {
    var saved = true
    var stops = 0
    val gate = ChangersSettingsGate({ saved }, { saved = it; true })
    gate.restore(true) {}
    gate.update(false, { fail("Disabled SDK initialized") }, { stops++ })
    val restarted = ChangersSettingsGate({ saved }, { true })
    restarted.restore(true) { fail("Disabled SDK initialized after restart") }
    assertFalse(restarted.enabled)
    assertEquals(1, stops)
  }

  @Test fun storageReadFailureDoesNotResumeTheSdk() {
    val gate = ChangersSettingsGate({ error("storage unavailable") }, { true })
    gate.restore(true) { fail("SDK initialized without a readable gate") }
    assertFalse(gate.enabled)
  }

  @Test fun failedDisableStillStopsAndReportsFailure() {
    val effects = mutableListOf<String>()
    val gate = ChangersSettingsGate({ true }, { effects.add("save"); false })
    gate.restore(true) {}
    try {
      gate.update(false, {}, { effects.add("stop") })
      fail("Storage failure was hidden")
    } catch (error: IllegalStateException) { assertEquals("E_STORAGE", error.message) }
    assertEquals(listOf("save", "stop"), effects)
    assertFalse(gate.enabled)
  }

  @Test fun failedEnableDoesNotInitializeAndCanBeRetried() {
    var writable = false
    var starts = 0
    val gate = ChangersSettingsGate({ false }, { writable })
    try {
      gate.update(true, { starts++ }, {})
      fail("Storage failure was hidden")
    } catch (error: IllegalStateException) { assertEquals("E_STORAGE", error.message) }
    assertFalse(gate.enabled)
    assertEquals(0, starts)
    writable = true
    gate.update(true, { starts++ }, {})
    assertTrue(gate.enabled)
    assertEquals(1, starts)
  }
  @Test fun stopFailureStillPersistsDisableForNextProcess() {
    var saved = true
    val gate = ChangersSettingsGate({ saved }, { saved = it; true })
    gate.restore(true) {}
    try {
      gate.update(false, {}, { error("vendor stop failed") })
      fail("Expected vendor error")
    } catch (_: IllegalStateException) {}
    assertFalse(saved)
    ChangersSettingsGate({ saved }, { true }).restore(true) { fail("SDK resumed after disable") }
  }

}
