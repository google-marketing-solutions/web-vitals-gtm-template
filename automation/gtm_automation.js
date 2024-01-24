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

/**
 * Runs the authorization flow to allow the app to use the GTM API. If completed
 * successfully, the deployment of the template, tag, etc. is started.
 *
 * The user will be asked in a pop-up to choose an account to authorise with,
 * and then asked to allow the app to edit GTM containers.
 *
 * @param {Event} event The event that triggers the function. This event is
 *                      ignored.
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
 * Start point for deploying the template to GTM. The template file is read in
 * here and then passed to createTemplate() to start the deployment workflow.
 */
function runDeployment() {
  const gtmURL = document.getElementById('gtm-url').value;
  const parent = gtmURL.substring(gtmURL.indexOf('accounts'));

  const templateFile = document.getElementById('template-file').files[0];
  const templateReader = new FileReader();
  templateReader.addEventListener('load', () => {
    createTemplate(parent, templateReader.result)
  });
  templateReader.readAsText(templateFile);
}

/**
 * Creates the template used to measure the Core web Vital Metrics in the
 * provided workspace.
 *
 * If the template is successfully created, the template ID is passed to
 * createTag() to continue the deployment.
 *
 * @param parent {string} The GTM parent being deployed to.
 * @param content {string} The content of the template.
 */
function createTemplate(parent, content) {
  tokenClient.callback = (resp) => {
    if (resp.error !== undefined) {
      throw (resp);
    }
    gapi.client.tagmanager.accounts.containers.workspaces.templates.create({
      parent: parent,
      templateData: content,
    })
      .then((gtmResp) => {
        const templateID = gtmResp.result.templateId;
        createTag(parent, templateID);
      })
      .catch((err) => {
        console.error('Error creating template: ' + err);
      });

  };
  if (gapi.client.getToken() == null) {
    tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    tokenClient.requestAccessToken({ prompt: '' });
  }
}

/**
 * Creates a tag using the previously installed template. The template config
 * is taken from the webpage.
 *
 * @param parent {string} The GTM parent string to create the tag in.
 * @param templateID {string} The ID the template was assigned when it was
 *     created.
 */
function createTag(parent, templateID) {
  const containerID = parent.split('/')[3];

  const tag = {
    parent: parent,
    resource: {
      name: 'Web Vitals Tag',
      type: 'cvt_' + containerID + '_' + templateID,
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
          value: document.getElementById('use-attribution').checked ?
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
          value: document.getElementById('cwv-TTFB').checked.toString()
        },
        {
          type: 'boolean',
          key: 'fcp',
          value: document.getElementById('cwv-FCP').checked.toString()
        },
        {
          type: 'boolean',
          key: 'lcp',
          value: document.getElementById('cwv-LCP').checked.toString()
        },
        {
          type: 'boolean',
          key: 'cls',
          value: document.getElementById('cwv-CLS').checked.toString()
        },
        {
          type: 'boolean',
          key: 'fid',
          value: document.getElementById('cwv-FID').checked.toString()
        },
        {
          type: 'boolean',
          key: 'inp',
          value: document.getElementById('cwv-INP').checked.toString()
        },
      ],
    }
  };
  if (document.getElementById('use-unpkg').checked) {
    tag.resource.parameter.push({
      type: 'template',
      key: 'libraryConfig',
      value: 'unpkg',
    });
  } else {
    tag.resource.parameter.push({
      type: 'template',
      key: 'customURL',
      value: document.getElementById('library-url').value,
    });
  }
  if (document.getElementById('event-name').value === 'webVitals') {
    tag.resource.parameter.push({
      type: 'template',
      key: 'eventName',
      value: 'webVitals',
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
      value: document.getElementById('event-name').value,
    });
  }

  gapi.client.tagmanager.accounts.containers.workspaces.tags.create(tag)
      .then((gtmResp) => {
        console.log("Created the Tag!");
      })
    .catch((err) => {
      console.error('Error creating template: ' + err.result.error.details[0].detail);
    });
}

document.getElementById('deploy-form').addEventListener('submit', authorizeApp);
