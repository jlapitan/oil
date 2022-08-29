import { sendEventToHostSite } from '../core/core_utils.js';
import {
  EVENT_NAME_OPT_IN,
  PRIVACY_FULL_TRACKING
} from '../core/core_constants';
import { setSoiCookie } from '../core/core_cookies';

/**
 * Oil SOI optIn
 *
 * @param privacySettings - defaults to '1' for FULL TRACKING
 * @return {Promise} promise with updated cookie value
 */
export function oilOptIn(privacySettings = PRIVACY_FULL_TRACKING) {
  return new Promise((resolve, reject) => {
    setSoiCookie(privacySettings).then(() => {
      sendEventToHostSite(EVENT_NAME_OPT_IN);
      resolve(true);
    }).catch((error) => reject(error));
  });
}

