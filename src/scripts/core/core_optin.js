import { getSoiCookie } from './core_cookies';
import { logPreviewInfo } from './core_log';

/**
 * Check Opt In
 * @return Promise with updated cookie value
 */
export function checkOptIn() {
  return new Promise((resolve) => {
    let soiOptIn = getSoiCookie().opt_in;

    if (soiOptIn) {
      logPreviewInfo('User has given SOI permit, OIL not shown.');
    } else {
      logPreviewInfo('User has not opted in at all, OIL should be shown.');
    }

    resolve(soiOptIn);
  });
}

