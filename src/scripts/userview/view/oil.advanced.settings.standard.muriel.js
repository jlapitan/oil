import '../../../styles/cpc_standard.muriel.scss';
import { OIL_LABELS } from '../userview_constants';
import { forEach } from '../userview_modal';
import { getLabel, getLabelWithDefault, getTheme } from '../userview_config';
import { getCustomPurposes, getCustomVendorListUrl } from '../../core/core_config';
import { JS_CLASS_BUTTON_OPTIN, OIL_GLOBAL_OBJECT_NAME, DATA_CONTEXT_YES } from '../../core/core_constants';
import {setGlobalOilObject, addClass, removeClass, hasClass} from '../../core/core_utils';
import {getCustomVendorList, getFeatures, getPurposes, getVendorList, getVendorsToDisplay} from '../../core/core_vendor_lists';
import { CloseButton, YesButton } from './components/oil.buttons';


const CLASS_NAME_FOR_ACTIVE_MENU_SECTION = 'as-oil-cpc__category-link--active';

export function oilAdvancedSettingsTemplate() {
  return `
  <div id="as-oil-cpc" class="components-modal__screen-overlay" data-qa="oil-cpc-overlay">
    ${oilAdvancedSettingsInlineTemplate()}
  </div>`
}

export function oilAdvancedSettingsInlineTemplate() {
  return `<div class="components-modal__frame">
    <div class="wp-cmp-settings components-modal__content">
      <div class="components-modal__header">
        <div class="components-modal__header-heading-container">
          <h1 class="components-modal__header-heading">${getLabel(OIL_LABELS.ATTR_LABEL_CPC_HEADING)}</h1>
        </div>
        ${CloseButton()}
      </div>
      <p class="wp-cmp-settings__intro-txt">
        ${getLabel(OIL_LABELS.ATTR_LABEL_CPC_TEXT)}
      </p>
      ${ContentSnippet()}
      <div class="components-modal__footer">
        <button class="components-button is-button is-primary ${JS_CLASS_BUTTON_OPTIN}" data-context="${DATA_CONTEXT_YES}" data-qa="oil-YesButton">
          ${getLabel(OIL_LABELS.ATTR_LABEL_BUTTON_YES)}
        </button>
      </div>
    </div>
  </div>`
}

export function attachCpcHandlers() {
  forEach(document.querySelectorAll('.as-js-btn-activate-all'), (domNode) => {
    domNode && domNode.addEventListener('click', activateAll, false);
  });
  forEach(document.querySelectorAll('.as-js-btn-deactivate-all'), (domNode) => {
    domNode && domNode.addEventListener('click', deactivateAll, false);
  });

  forEach(document.querySelectorAll('.as-js-purpose-slider'), (domNode) => {
    domNode && domNode.addEventListener('change', (e) => {
      setToggleState(e.target, e.target.checked);
    }, false);
  });

  forEach(document.querySelectorAll('.components-panel__body-toggle'), (domNode) => {
    domNode && domNode.addEventListener('click', (e) => {
      togglePanel(e.currentTarget);
    }, false);
  });

}

function togglePanel(element) {
  //Get panel element
  let panel = element.parentElement.parentElement;

  if (hasClass(panel, 'is-opened')) {
    removeClass(panel, 'is-opened');
  } else {
    addClass(panel, 'is-opened');
  }
}

const ContentSnippet = () => {
  return `
  <div data-qa="cpc-snippet" class="as-js-purpose">
  
      <div class="wp-cmp-settings__all-btns">
          
        <div class="wp-cmp-settings__row-title" id="as-oil-cpc-purposes">
          ${getLabel(OIL_LABELS.ATTR_LABEL_CPC_PURPOSE_DESC)}
        </div>
        
        ${ActivateButtonSnippet()}
        
      </div>
      
      ${buildPurposeEntries(getPurposes())}
      
      <div class="wp-cmp-settings__row-title" id="as-oil-cpc-features">
        ${getLabel(OIL_LABELS.ATTR_LABEL_CPC_FEATURE_DESC)}
      </div>
      
      ${buildFeatureEntries(getFeatures())}
      
      ${buildIabVendorList()}
      
  </div>`;
};

const PurposeContainerSnippet = ({id, header, text, value}) => {
  return `
  <div class="wp-cmp__purpose">
        <span class="wp-cmp__purpose-toggle components-form-toggle">
            <input data-id="${id}" id="as-js-purpose-slider-${id}" class="as-js-purpose-slider components-form-toggle__input" type="checkbox" name="oil-cpc-purpose-${id}" value="${value}" />
            <span class="components-form-toggle__track"></span>
            <span class="components-form-toggle__thumb"></span>
            <svg class="components-form-toggle__on" width="2" height="6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2 6" role="img" aria-hidden="true" focusable="false"><path d="M0 0h2v6H0z"></path></svg>
            <svg class="components-form-toggle__off" width="6" height="6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6 6" role="img" aria-hidden="true" focusable="false"><path d="M3 1.5c.8 0 1.5.7 1.5 1.5S3.8 4.5 3 4.5 1.5 3.8 1.5 3 2.2 1.5 3 1.5M3 0C1.3 0 0 1.3 0 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3z"></path></svg>
        </span>
        <div class="wp-cmp__purpose-header">${header}</div>
        <div class="wp-cmp__purpose-text">${text}</div>
  </div>`
};

const FeatureContainerSnippet = ({header, text}) => {
  return `
  <div class="wp-cmp__purpose">
        <div class="wp-cmp__purpose-header">${header}</div>
        <div class="wp-cmp__purpose-text">${text}</div>
  </div>`
};

const IsCustomVendorsEnables = () => {
  return !!getCustomVendorListUrl();
};

const buildIabVendorList = () => {
  return `
    <div class="wp-cmp-settings__row-title" id="as-oil-cpc-third-parties">
      ${getLabel(OIL_LABELS.ATTR_LABEL_THIRD_PARTY)}
    </div>
    <div class="wp-cmp__third-party-list" id="as-js-third-parties-list">
      ${buildIabVendorEntries()}
    </div>`
};

const buildCustomVendorList = () => {
  if (IsCustomVendorsEnables()) {
    return `
<div class="as-oil-cpc__row-title" id="as-oil-cpc-custom-third-parties">
  ${getLabel(OIL_LABELS.ATTR_LABEL_CUSTOM_THIRD_PARTY_HEADING)}
</div>
<div id="as-oil-custom-third-parties-list">
  ${buildCustomVendorEntries()}
</div>`
  } else {
    return '';
  }
};

const buildIabVendorEntries = () => {
  let vendorList = getVendorList();

  if (vendorList && !vendorList.isDefault) {
    let listWrapped = getVendorsToDisplay().map((element) => {
      return buildVendorListEntry(element);
    });
    return `<div class="as-oil-poi-group-list">${listWrapped.join('')}</div>`;
  } else {
    return 'Missing vendor list! Maybe vendor list retrieval has failed! Please contact web administrator!';
  }
};

const buildCustomVendorEntries = () => {
  let customVendorList = getCustomVendorList();

  if (customVendorList && !customVendorList.isDefault) {
    let listWrapped = customVendorList.vendors.map((element) => {
      return buildVendorListEntry(element);
    });
    return `<div class="as-oil-poi-group-list">${listWrapped.join('')}</div>`;
  } else {
    return 'Missing custom vendor list! Maybe vendor list retrieval has failed! Please contact web administrator!';
  }
};

const buildVendorListEntry = (element) => {
  if (element.name) {
    let allPurposes = getPurposes();
    let allFeatures = getFeatures();

    let purposes = element.purposeIds.map(id => {
      return `${allPurposes.find(p => p.id === id).name}<br />`;
    }).join('');

    let legitPurposes = element.legIntPurposeIds.map(id => {
      return `${allPurposes.find(p => p.id === id).name}<br />`;
    }).join('');

    let features = element.featureIds.map(id => {
      return `${allFeatures.find(p => p.id === id).name}<br />`;
    }).join('');

    return `
      <div class="components-panel">
        <div class="components-panel__body">
          <h2 class="components-panel__body-title">
            <button type="button" aria-expanded="false" class="components-button components-panel__body-toggle">
              <span aria-hidden="true">
                <svg class="components-panel__arrow components-panel__arrow-down" width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" focusable="false"><g><path fill="none" d="M0,0h24v24H0V0z"></path></g><g><path d="M7.41,8.59L12,13.17l4.59-4.58L18,10l-6,6l-6-6L7.41,8.59z"></path></g></svg>
                <svg class="components-panel__arrow components-panel__arrow-up" width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true" focusable="false"><g><path fill="none" d="M0,0h24v24H0V0z"></path></g><g><path d="M12,8l-6,6l1.41,1.41L12,10.83l4.59,4.58L18,14L12,8z"></path></g></svg>
              </span>
              ${element.name} 
            </button>
          </h2>
          <div class="components-panel__row">
            <a class='as-oil-third-party-link' href='${element.policyUrl}' target="_blank">${element.policyUrl}</a>
            ${
                purposes.length === 0 ? '' :
                  `<h4 style="margin-top: 10px !important;">Purposes:</h4>
                  <div class="as-oil-cpc__purpose-text">
                    ${purposes}
                  </div>`
              }
              ${
                legitPurposes.length === 0 ? '' :
                  `<h4 style="margin-top: 10px !important;">Legitimate Interest Purposes:</h4>
                  <div class="as-oil-cpc__purpose-text">
                    ${legitPurposes}
                  </div>`
              }
              ${
                features.length === 0 ? '' :
                  `<h4 style="margin-top: 10px !important;">Features:</h4>
                  <div class="as-oil-cpc__purpose-text">
                    ${features}
                  </div>`
              }
          </div> 
        </div>
      </div> 
    `;
  }
};

const ActivateButtonSnippet = () => {
  return `
    <div>
      <button class="components-button is-button is-default as-js-btn-deactivate-all">
          ${getLabel(OIL_LABELS.ATTR_LABEL_CPC_DEACTIVATE_ALL)}
      </button>
      <button class="components-button is-button is-primary as-js-btn-activate-all">
        ${getLabel(OIL_LABELS.ATTR_LABEL_CPC_ACTIVATE_ALL)}
      </button>
    </div>`
};

const buildPurposeEntries = (list) => {
  return list.map(purpose => PurposeContainerSnippet({
    id: purpose.id,
    header: getLabelWithDefault(`label_cpc_purpose_${formatPurposeId(purpose.id)}_text`, purpose.name || `Error: Missing text for purpose with id ${purpose.id}!`),
    text: getLabelWithDefault(`label_cpc_purpose_${formatPurposeId(purpose.id)}_desc`, purpose.description || ''),
    value: false
  })).join('');
};

const buildFeatureEntries = (list) => {
  return list.map(feature => FeatureContainerSnippet({
    header: getLabelWithDefault(`label_cpc_feature_${formatFeatureId(feature.id)}_text`, feature.name || `Error: Missing text for feature with id ${feature.id}!`),
    text: getLabelWithDefault(`label_cpc_feature_${formatFeatureId(feature.id)}_desc`, feature.description || '')
  })).join('');
};

const formatPurposeId = (id) => {
  return id < 10 ? `0${id}` : id;
};

const formatFeatureId = (id) => {
  return id < 10 ? `0${id}` : id;
};

function activateAll() {
  let elements = document.querySelectorAll('.as-js-purpose-slider');
  forEach(elements, (domNode) => {
    domNode && (setToggleState(domNode, true));
  });
}

export function deactivateAll() {
  forEach(document.querySelectorAll('.as-js-purpose-slider'), (domNode) => {
    domNode && (setToggleState(domNode, false));
  });
}

export function setToggleState(element, state) {

  element.checked = state;

  if (element.checked) {
    addClass(element.parentElement, 'is-checked');
  } else {
    removeClass(element.parentElement, 'is-checked');
  }

}

function switchLeftMenuClass(element) {
  let allElementsInMenu = element.parentNode.children;

  forEach(allElementsInMenu, (el) => {
    el.className = el.className.replace(new RegExp(`\\s?${CLASS_NAME_FOR_ACTIVE_MENU_SECTION}\\s?`, 'g'), '');
  });
  element.className += ` ${CLASS_NAME_FOR_ACTIVE_MENU_SECTION}`;
}

setGlobalOilObject('_switchLeftMenuClass', switchLeftMenuClass);
