import { OilVersion, sendEventToHostSite, setGlobalOilObject } from './core_utils';
import { logError, logInfo} from './core_log';
import { getLocale} from './core_config';
import { EVENT_NAME_HAS_OPTED_IN, EVENT_NAME_NO_COOKIES_ALLOWED } from './core_constants';
import Cookie from 'js-cookie';

/**
 * Initialize Oil on Host Site
 * This functions gets called directly after Oil has loaded
 */
export function initOilLayer() {
  logInfo(`Init OilLayer (version ${OilVersion.get()})`);

  attachUtilityFunctionsToWindowObject();

  /**
   * Cookies are not enabled
   */
  if (!isBrowserCookieEnabled()) {
    logInfo('This browser doesn\'t allow cookies.');
    import('../userview/locale/userview_oil.js')
      .then(userview_modal => {
        userview_modal.locale(uv_m => uv_m.renderOil({noCookie: true}));
      })
      .catch((e) => {
        logError('Locale could not be loaded.', e);
      });
    sendEventToHostSite(EVENT_NAME_NO_COOKIES_ALLOWED);
    return;
  }

  /**
   * We read our cookie and get an opt-in value, true or false
   */
  quickCheckOptIn().then((optin) => {
    if (optin) {
      /**
       * User has opted in
       */
      import('./core_command_collection')
        .then(module => {

          sendEventToHostSite(EVENT_NAME_HAS_OPTED_IN);
          module.executeCommandCollection();
          attachCommandCollectionFunctionToWindowObject(module.executeCommandCollection);
      });
    } else {
      /**
       * Any other case, when the user didn't decide before and oil needs to be shown:
       */
      import('../userview/locale/userview_oil.js')
        .then(userview_modal => {
          userview_modal.locale(uv_m => uv_m.renderOil({optIn: false}));
          import('./core_command_collection')
            .then(module => {
              attachCommandCollectionFunctionToWindowObject(module.executeCommandCollection);
            });
        })
        .catch((e) => {
          logError('Locale could not be loaded.', e);
        });
    }
  });
}

function isBrowserCookieEnabled() {
  Cookie.set('oil_cookie_exp', 'cookiedata');
  let result = isCookie('oil_cookie_exp');
  Cookie.remove('oil_cookie_exp');
  return result;
}

function isCookie(name) {
  return typeof (Cookie.get(name)) !== 'undefined';
}

function quickCheckOptIn() {
  return new Promise((resolve) => {
    let soiCookie = getOilCookie();
    let optin = false;
    let monthInMilliseconds = 2592000000;

    if (soiCookie.opt_in && (Date.now() - soiCookie.dateSet) < monthInMilliseconds  ) {
      logInfo('User has given SOI permit, OIL not shown.');
      optin = true;
    } else {
      logInfo('User has not opted in at all, OIL should be shown.');
      optin = false;
    }

    resolve(optin);
  });
}

function getOilCookie() {
  if (isCookie('oil_data')) {
    let cookieJson = Cookie.getJSON('oil_data');
    return cookieJson;
  }

  return false;
}

function attachCommandCollectionFunctionToWindowObject(callback) {
  setGlobalOilObject('commandCollectionExecutor', callback);
}

/**
 * Attach Utility Functions to window Object, so users of oil can use it.
 */
function attachUtilityFunctionsToWindowObject() {

  function loadLocale(callbackMethod) {
    import('../userview/locale/userview_oil.js')
      .then(userview_modal => {
        if (!getLocale()) {
          userview_modal.locale(callbackMethod);
        } else {
          callbackMethod(userview_modal);
        }
      })
      .catch((e) => {
        logError('Locale could not be loaded.', e);
      });
  }

  setGlobalOilObject('showPreferenceCenter', () => {
    loadLocale(userview_modal => {
      userview_modal.oilShowPreferenceCenter();
    });
  });

}
