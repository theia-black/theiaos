package ai.theiaos.android.protocol

import org.junit.Assert.assertEquals
import org.junit.Test

class TheiaOSProtocolConstantsTest {
  @Test
  fun canvasCommandsUseStableStrings() {
    assertEquals("canvas.present", TheiaOSCanvasCommand.Present.rawValue)
    assertEquals("canvas.hide", TheiaOSCanvasCommand.Hide.rawValue)
    assertEquals("canvas.navigate", TheiaOSCanvasCommand.Navigate.rawValue)
    assertEquals("canvas.eval", TheiaOSCanvasCommand.Eval.rawValue)
    assertEquals("canvas.snapshot", TheiaOSCanvasCommand.Snapshot.rawValue)
  }

  @Test
  fun a2uiCommandsUseStableStrings() {
    assertEquals("canvas.a2ui.push", TheiaOSCanvasA2UICommand.Push.rawValue)
    assertEquals("canvas.a2ui.pushJSONL", TheiaOSCanvasA2UICommand.PushJSONL.rawValue)
    assertEquals("canvas.a2ui.reset", TheiaOSCanvasA2UICommand.Reset.rawValue)
  }

  @Test
  fun capabilitiesUseStableStrings() {
    assertEquals("canvas", TheiaOSCapability.Canvas.rawValue)
    assertEquals("camera", TheiaOSCapability.Camera.rawValue)
    assertEquals("screen", TheiaOSCapability.Screen.rawValue)
    assertEquals("voiceWake", TheiaOSCapability.VoiceWake.rawValue)
  }

  @Test
  fun screenCommandsUseStableStrings() {
    assertEquals("screen.record", TheiaOSScreenCommand.Record.rawValue)
  }
}
