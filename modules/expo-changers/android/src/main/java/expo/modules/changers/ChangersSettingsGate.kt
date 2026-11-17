package expo.modules.changers

/** Last applied customer gate. SDK initialization does not grant tracking consent. */
internal class ChangersSettingsGate(
  private val read: () -> Boolean,
  private val write: (Boolean) -> Boolean
) {
  @Volatile var enabled = false
    private set

  fun restore(canInitialize: Boolean, initialize: () -> Unit) {
    enabled = try { read() } catch (_: Exception) { false }
    if (enabled && canInitialize) initialize()
  }

  fun update(value: Boolean, onEnabled: () -> Unit, onDisabled: () -> Unit) {
    if (!value) {
      // Stop even when persistence fails. Never report an unsuccessful save as applied.
      enabled = false
      val persisted = try { write(false) } finally { onDisabled() }
      check(persisted) { "E_STORAGE" }
    } else {
      // A failed enable must not initialize/resume the SDK.
      check(write(true)) { "E_STORAGE" }
      enabled = true
      onEnabled()
    }
  }
}
