// Autodazzler - Batch render for Daz Studio
// Copyright (c) 2018-present Frédéric Maquin <fred@ephread.com>
//
// Licensed under the MIT License.
// See LICENSE in the project root for license information.

/* global MessageBox App */

import { isConfigurationValid } from './lib/validation';
import { askForConfigurationFilePath } from './lib/ui';
import { isNullOrUndefined, millisecondsToReadableTime } from './lib/utils';
import { loadConfigurationFile } from './lib/configuration';
import { renderScenes, TaskResult } from './lib/render';
import { playSuccessSound } from './lib/sound_player';

/**
 *  Load the configuration and run Autodazzler.
 *
 *  @returns {void}
 */
function runAutodazzler() {
  var sConfigurationPath = askForConfigurationFilePath();

  if (sConfigurationPath) {
    var oDazzleConfiguration = loadConfigurationFile(sConfigurationPath);

    // We simply return since `loadConfigurationFile` already took care
    // of displaying errors to user.
    if (isNullOrUndefined(oDazzleConfiguration)) {
      return;
    }

    if (!isConfigurationValid(oDazzleConfiguration)) {
      return;
    }

    App.statusLine('[Autodazzle] Checking all specified scenes for missing nodes.', true);
    var analysisResult = renderScenes(oDazzleConfiguration, true);

    switch (analysisResult) {
    case TaskResult.Completed:
      break;
    default:
      return;
    }

    App.statusLine('[Autodazzle] All good, rendering…', true);
    var startTime = Date.now();
    var result = renderScenes(oDazzleConfiguration, false);
    var endTime = Date.now();
    var elapsedTime = millisecondsToReadableTime(endTime - startTime);

    switch (result) {
    case TaskResult.FailedSilently:
      MessageBox.information(
        'Some errors were encountered during the renders, open the log for more information.',
        '[Autodazzler]',
        '&OK'
      );
      break;
    case TaskResult.Completed:
      playSuccessSound();
      MessageBox.information(
        'All renders successfully completed in:\n' + elapsedTime + '.',
        '[Autodazzler]',
        '&OK'
      );
      break;
    default:
      break;
    }
  }
}

runAutodazzler();
