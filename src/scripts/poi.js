import { OIL_CONFIG } from './constants.js';
import { getConfiguration } from './config.js';
import { addFrame } from './iframe.js';
import { getOrigin, registerMessageListener, removeMessageListener } from './utils.js';
import { logDebug, logError, logInfo } from './log.js';

// Timeout after which promises should return
const TIMEOUT = 500;
let config = null,
  frameListenerRegistered = false;

// INTERNAL FUNCTIONS


/**
 * Initializes the OIL iFrame
 * @function
 * @return promise as object {iframe:Element,config:{}}when iFrame is loaded
 */
function init() {
  return new Promise((resolve) => setTimeout(() => {
    logInfo("initFrame");
    // read config data if not already set
    if (!config) {
      config = getConfiguration();
    }
    if (config) {
      logInfo("initFrame2");
      let hubLocation = config[OIL_CONFIG.ATTR_HUB_LOCATION];
      if (hubLocation) {
        logInfo("initFrame3");
        // setup iframe
        let iframe = addFrame(hubLocation);
        logInfo("initFrame4");
        if (iframe && !iframe.onload) {
          // Listen to message from child window after iFrame load
          iframe.onload = () => resolve({ iframe: iframe, config: config });
        } else {
          // if already loaded directly invoke
          resolve({ iframe: iframe, config: config });
        }
      } else {
        logError(`Config for ${OIL_CONFIG.ATTR_HUB_ORIGIN} and ${OIL_CONFIG.ATTR_HUB_PATH} isnt set. No POI possible.`);
        resolve({});
      }
    } else {
      logError('Empty Config');
      resolve({});
    }
  }));
}
/**
 * Sent given event to hidden iframe
 * @param eventName - event to sent
 * @param origin - orgin url (aka parent)
 * @function
 */
function sendEventToFrame(eventName, origin) {
  logInfo("Send to Frame:",eventName,origin);
  init().then((result) => {
    let iframe = result.iframe,
        config = result.config;
    let hubDomain = config[OIL_CONFIG.ATTR_HUB_ORIGIN];
    logDebug(hubDomain);
    if (iframe && hubDomain) {
      // tag::subscriber-postMessage[]
      // see https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage#Syntax
      iframe.contentWindow.postMessage({ event: eventName, origin: origin }, hubDomain);
      // end::subscriber-postMessage[]
    }
  });
}
/**
 * Read configuration from hidden iframe
 * @param origin - origin url (aka parent)
 * @function
 * @return promise with result of the
 */
function readConfigFromFrame(origin) {
  return new Promise((resolve) => {
    function handler(event) {
      // tag::subscriber-receiveMessage[]
      // only listen to our hub
      let hubOrigin = config[OIL_CONFIG.ATTR_HUB_ORIGIN];
      if (config && hubOrigin && hubOrigin.indexOf(event.origin) !== -1) {
        logDebug('Message from hub received...', event.origin, event.data);
        removeMessageListener(handler);
        frameListenerRegistered = false;
        resolve(event.data);
      }
      // end::subscriber-receiveMessage[]
    }
    // defer post to next tick
    setTimeout(() => sendEventToFrame('oil-config-read', origin));
    if (!frameListenerRegistered) {
      // Listen to message from child window
      registerMessageListener(handler);
      frameListenerRegistered = true;
    }
    // add timeout for config read
    setTimeout(() => {
      removeMessageListener(handler);
      frameListenerRegistered = false;
      resolve(false);
    }, TIMEOUT);
  });
}

// PUBLIC API

/**
 * Read config for Power Opt IN from hidden iframe
 * @function
 * @return promise with result (is true if POI ist set, otherwise false)
 */
export function verifyPowerOptIn() {
  return new Promise((resolve) => {
    init().then((result) => {
      let iframe = result.iframe;
      if (iframe) {
        if (!iframe.onload) {
          // Listen to message from child window after iFrame load
          iframe.onload = () => readConfigFromFrame(getOrigin()).then((data) => resolve(data));
        } else {
          // if already loaded directly invoke
          readConfigFromFrame(getOrigin()).then((data) => resolve(data));
        }
      } else {
        logDebug('Could not initialize POI. Fallback to POI false.');
        resolve(false);
      }
    });
  });
}
/**
 * Activate Power Opt IN
 * @function
 * @return promise when done
 */
export function activatePowerOptIn() {
  logDebug('activatePowerOptIn');
  // reset config
  config = null;
  // init iFrame first
  return new Promise((resolve) => init().then(() => {
    // then activate
    sendEventToFrame('oil-poi-activate', getOrigin());
    // defer answer to next tick
    setTimeout(resolve);
  }));
}