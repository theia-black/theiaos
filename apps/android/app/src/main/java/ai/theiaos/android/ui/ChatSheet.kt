package ai.theiaos.android.ui

import androidx.compose.runtime.Composable
import ai.theiaos.android.MainViewModel
import ai.theiaos.android.ui.chat.ChatSheetContent

@Composable
fun ChatSheet(viewModel: MainViewModel) {
  ChatSheetContent(viewModel = viewModel)
}
