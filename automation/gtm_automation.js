/*
  Copyright 2023 Google LLC

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

// The OAuth token client used to authenticate API calls.
let tokenClient;

// the GTM variables we will create. This is augmented with 'attribution' if
// the attribution build is used.
const VARIABLE_NAMES = [
  'name',
  'id',
  'rating',
  'value',
  'delta',
];

/**
 * Disables all of the form elements to avoid people making changes while the
 * script runs.
 */
function lockForm() {
  const inputs = Array.from(document.getElementsByTagName('input'));
  inputs.map((e) => e.disabled = true);
}

/**
 * Enables all of the form elements.
 */
function unlockForm() {
  const inputs = Array.from(document.getElementsByTagName('input'));
  inputs.map((e) => e.disabled = false);
}

/**
 * Adds a message to the success-messages div on the page.
 *
 * @param {...string} message The message to add to the page. Arguments are joined
 * with a space.
 */
function addSuccessMessage(...message) {
  const successDiv = document.getElementById('success-messages');
  successDiv.innerHTML += message.join(' ') + '<br>';
}

/**
 * Adds a message to the error-messages div on the page.
 *
 * Also unlocks the form, since the script dies on an error.
 *
 * @param {...string} message The error message to add to the page. Arguments
 * are joined with a space.
 */
function addErrorMessage(...message) {
  const errorDiv = document.getElementById('error-messages');
  errorDiv.innerHTML += message.join(' ') + '<br>';
  unlockForm();
}

/**
 * Runs the authorization flow to allow the app to use the GTM API. If completed
 * successfully, the deployment of the template, tag, etc. is started.
 *
 * The user will be asked in a pop-up to choose an account to authorise with,
 * and then asked to allow the app to edit GTM containers.
 *
 * @param {Event} event The event that triggers the function. This event is
 * ignored.
 */
function authorizeApp(event) {
  event.preventDefault();
  const clientId = document.getElementById('oauth-id').value;
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: 'https://www.googleapis.com/auth/tagmanager.edit.containers',
    callback: '',
  });
  gapi.load('client', () => {
    gapi.client.init({})
      .then(function() {
        gapi.client.load('https://tagmanager.googleapis.com/$discovery/rest?version=v2');
      })
      .then(runDeployment());
  });
}

/**
 * Start point for deploying the template, tags, etc. to GTM.
 *
 * The configuration is collected from the web interface here to centralize
 * where the document is accessed. This config is then passed down the chain as
 * the GTM API calls are made.
 *
 * The template file is read in here and then passed to createTemplate() along
 * with the config to start the deployment workflow.
 */
function runDeployment() {
  lockForm();
  // set up the global config
  const gtmUrl = document.getElementById('gtm-url').value;
  const config = new Map();
  config.set('parent', gtmUrl.substring(gtmUrl.indexOf('accounts')));
  config.set('ga4ID', document.getElementById('ga4-id').value);
  config.set('metrics', new Map(Object.entries({
    ttfb: document.getElementById('cwv-TTFB').checked.toString(),
    fcp: document.getElementById('cwv-FCP').checked.toString(),
    lcp: document.getElementById('cwv-LCP').checked.toString(),
    cls: document.getElementById('cwv-CLS').checked.toString(),
    fid: document.getElementById('cwv-FID').checked.toString(),
    inp: document.getElementById('cwv-INP').checked.toString(),
  })));
  config.set('useUnpkg', document.getElementById('use-unpkg').checked);
  config.set('libraryUrl', document.getElementById('library-url').value);
  config.set('attributionBuild', document.getElementById('use-attribution').checked);
  config.set('gtmEventName', document.getElementById('event-name').value);

  // get the template content from the user. The file chooser is a mandiatory
  // field.
  const templateFile = document.getElementById('template-file').files[0];
  const templateReader = new FileReader();
  templateReader.addEventListener('load', () => {
    createTemplate(config, templateReader.result)
  });
  templateReader.readAsText(templateFile);
}

/**
 * Creates the template used to measure the Core web Vital Metrics in the
 * provided workspace.
 *
 * If the template is successfully created, the config and the new template ID
 * is passed to createTag() to continue the deployment.
 *
 * @param config {Map<string, *>} The configuration map.
 * @param content {string} The content of the template.
 */
function createTemplate(config, content) {
  tokenClient.callback = (resp) => {
    if (resp.error !== undefined) {
      throw (resp);
    }
    gapi.client.tagmanager.accounts.containers.workspaces.templates.create({
      parent: config.get('parent'),
      templateData: content,
    })
      .then((gtmResp) => {
        addSuccessMessage('Created Web Vitals Template');
        const templateId = gtmResp.result.templateId;
        createTag(config, templateId);
      })
      .catch((err) => {
        addErrorMessage('Error creating template:', JSON.stringify(err));
      });

  };
  // This is needed for the first API call to show the consent dialog.
  // Afterwards the API call can be made directly.
  if (gapi.client.getToken() == null) {
    tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    tokenClient.requestAccessToken({ prompt: '' });
  }
}

/**
 * Creates a tag using the previously installed template to measure CWVs.
 *
 * If the tag is successfully created, `createEventTrigger` is called.
 *
 * @param config {Map<string, *>} The configuration map.
 * @param templateId {string} The ID the template was assigned when it was
 * created.
 */
function createTag(config, templateId) {
  const containerId = config.get('parent').split('/')[3];
  const metrics = config.get('metrics');
  const tag = {
    parent: config.get('parent'),
    resource: {
      name: 'Web Vitals Tag',
      type: 'cvt_' + containerId + '_' + templateId,
      firingTriggerId: [
        "2147479553" // Trigger ID for standard "All Pages" trigger
      ],
      tagFiringOption: "oncePerEvent",
      parameter: [
        {
          type: 'template',
          key: 'libraryConfig',
          value: 'unpkg',
        },
        {
          type: 'template',
          key: 'build',
          value: config.get('attributionBuild') ?
            'attribution' : 'standard',
        },
        {
          type: 'template',
          key: 'eventName',
          value: 'webVitals',
        },
        {
          type: 'template',
          key: 'metrics',
          value: 'specificMetrics',
        },
        {
          type: 'boolean',
          key: 'ttfb',
          value: metrics.get('ttfb'),
        },
        {
          type: 'boolean',
          key: 'fcp',
          value: metrics.get('fcp'),
        },
        {
          type: 'boolean',
          key: 'lcp',
          value: metrics.get('lcp'),
        },
        {
          type: 'boolean',
          key: 'cls',
          value: metrics.get('cls'),
        },
        {
          type: 'boolean',
          key: 'fid',
          value: metrics.get('fid')
        },
        {
          type: 'boolean',
          key: 'inp',
          value: metrics.get('inp'),
        },
      ],
    }
  };
  if (config.get('useUnpkg')) {
    tag.resource.parameter.push({
      type: 'template',
      key: 'libraryConfig',
      value: 'unpkg',
    });
  } else {
    tag.resource.parameter.push({
      type: 'template',
      key: 'customURL',
      value: config.get('libraryUrl'),
    });
  }
  if (config.get('gtmEventName') === 'web_vitals') {
    tag.resource.parameter.push({
      type: 'template',
      key: 'eventName',
      value: 'web_vitals',
    });
  } else {
    tag.resource.parameter.push({
      type: 'template',
      key: 'eventName',
      value: 'custom',
    });
    tag.resource.parameter.push({
      type: 'template',
      key: 'customEventName',
      value: config.get('gtmEventName'),
    });
  }

  gapi.client.tagmanager.accounts.containers.workspaces.tags.create(tag)
    .then((gtmResp) => {
      addSuccessMessage('Web Vitals tag created');
      createEventTrigger(config);
    })
    .catch((err) => {
      addErrorMessage('Error creating template:', JSON.stringify(err));
    });
}


/**
 * Creates the custom trigger that fires when a CWV-related event is received.
 *
 * If the trigger is successfully created, createDatalayerVariables() is called.
 *
 * @param {Map<string, *>} config The configuration map.
 */
function createEventTrigger(config) {
  gapi.client.tagmanager.accounts.containers.workspaces.triggers.create({
    parent: config.get('parent'),
    name: 'Web Vitals Event Trigger',
    type: 'customEvent',
    customEventFilter: [
      {
        type: 'equals',
        parameter: [
          {
            type: 'template',
            key: 'arg0',
            value: '{{_event}}',
          },
          {
            type: 'template',
            key: 'arg1',
            value: config.get('gtmEventName'),
          },
        ]
      }
    ]
  })
    .then((gtmResp) => {
      addSuccessMessage('Created the custom event trigger');
      config.set('customTriggerId', gtmResp.result.triggerId);
      createDatalayerVariables(config);
    })
    .catch((err) => {
      addErrorMessage('Error creating the event trigger', JSON.stringify(err));
    });
}

/**
 * Creates the data layer variables used to pass event parameters from events to
 * GA4.
 *
 * The variable named are taken from the global `VariableNames` array.
 * 'attribution' is pushed on to the array if an attribution build is being
 * used.
 *
 * If the variables are all created successfully, createGA4EventTag() is called.
 *
 * @param {Map<string, *}> config The configuration map.
 */
function createDatalayerVariables(config) {
  if (config.get('attributionBuild')) {
    VARIABLE_NAMES.push('attribution');
  }

  let count = 0;
  for (const name of VARIABLE_NAMES) {
    gapi.client.tagmanager.accounts.containers.workspaces.variables.create({
      parent: config.get('parent'),
      resource: {
        name: 'Web Vitals - ' + name,
        type: 'v',
        formatValue: {},
        parameter: [
          {
            type: 'integer',
            key: 'dataLayerVersion',
            value: '2',
          },
          {
            type: 'boolean',
            key: 'setDefaultValue',
            value: 'false',
          },
          {
            type: 'template',
            key: 'name',
            value: 'webVitalsData.' + name,
          }
        ],
      }
    })
      .then((gtmResp) => {
        addSuccessMessage('Created data layer variable -', name);
        if (++count === VARIABLE_NAMES.length) {
          addSuccessMessage('Finished creating data layer variables');
          createGA4EventTag(config);
        }
      })
      .catch((err) => {
        addErrorMessage('Error creating data layer variable -', JSON.stringify(err));
      });
  }
}

/**
 * Creates the GA4 Event Tag that sends the CWV data to GA4.
 *
 * If attribution data is to be included, the value 'attribution' must be added
 * to the `VariableNames` array before this is called (should happen when the
 * data layer variables are created).
 *
 * If the tag is successfully created, a success message is displayed the
 * workflow ends and the form is enabled.
 *
 * @param {Map<string, *}> config The configuration map.
 */
function createGA4EventTag(config) {
  const eventParams = [];
  for (const v of VARIABLE_NAMES) {
    if (v === 'name') continue;
    eventParams.push({
      type: 'map',
      map: [
        {
          type: 'template',
          key: 'name',
          value: 'metric_' + v,
        },
        {
          type: 'template',
          key: 'value',
          value: '{{Web Vitals - ' + v + '}}',
        }
      ]
    });
  }
  eventParams.push({
    type: 'map',
    map: [
      {
        type: 'template',
        key: 'name',
        value: 'value',
      },
      {
        type: 'template',
        key: 'value',
        value: '{{Web Vitals - delta}}',
      },
    ]
  });
  eventParams.push({
    type: 'map',
    map: [
      {
        type: 'template',
        key: 'name',
        value: 'event_category',
      },
      {
        type: 'template',
        key: 'value',
        value: 'Web Vitals',
      },
    ],
  });

  gapi.client.tagmanager.accounts.containers.workspaces.tags.create({
    parent: config.get('parent'),
    name: 'Web Vitals GA4 Event Tag',
    type: 'gaawe',
    firingTriggerId: [config.get('customTriggerId')],
    tagFiringOption: 'oncePerEvent',
    parameter: [
      {
        type: 'template',
        key: 'measurementId',
        value: 'none',
      },
      {
        type: 'template',
        key: 'measurementIdOverride',
        value: config.get('ga4ID'),
      },
      {
        type: 'template',
        key: 'eventName',
        value: '{{Web Vitals - name}}'
      },
      {
        type: 'list',
        key: 'eventParameters',
        list: eventParams,
      }
    ],
  })
    .then((gtmResp) => {
      unlockForm();
      addSuccessMessage('Created the GA4 Event tag')
      addSuccessMessage('<br><strong>All Done!</strong>');
      addSuccessMessage(`Please open <a href="https://tagmanager.google.com/#/container/${config.get('parent')}"> your GTM Workspace</a>, check that no changes conflict with existing work, and then submit and publish the workspace to complete the setup.`)
    })
    .catch((err) => {
      addErrorMessage('Error creating the GA4 Event Tag:', JSON.stringify(err));
    });
}

document.getElementById('deploy-form').addEventListener('submit', authorizeApp);
