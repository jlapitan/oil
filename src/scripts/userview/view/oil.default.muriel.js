import { JS_CLASS_BUTTON_OPTIN, JS_CLASS_BUTTON_ADVANCED_SETTINGS, DATA_CONTEXT_ADVANCED_SETTINGS, DATA_CONTEXT_YES } from '../../core/core_constants.js';
import { getLabel } from '../userview_config.js';
import { OIL_LABELS } from '../userview_constants.js';

export function oilDefaultTemplate() {
  return `
    <div class="cmp-banner" data-qa="oil-full">
        <div class="cmp-banner__content">
            <div class="cmp-banner__heading">
                ${getLabel(OIL_LABELS.ATTR_LABEL_INTRO_HEADING)}
            </div>
            <p class="cmp-banner__intro-txt">
                ${getLabel(OIL_LABELS.ATTR_LABEL_INTRO)}
            </p>
        </div>
        <div class="cmp-banner__buttons">
            <button class="components-button is-button is-default ${JS_CLASS_BUTTON_ADVANCED_SETTINGS}" data-context="${DATA_CONTEXT_ADVANCED_SETTINGS}" data-qa="oil-AdvancedSettingsButton">
                ${getLabel(OIL_LABELS.ATTR_LABEL_BUTTON_ADVANCED_SETTINGS)}
            </button>
            <button class="components-button is-button is-primary ${JS_CLASS_BUTTON_OPTIN}" data-context="${DATA_CONTEXT_YES}" data-qa="oil-YesButton">
              ${getLabel(OIL_LABELS.ATTR_LABEL_BUTTON_YES)}
            </button>
        </div>
    </div>
`
}
