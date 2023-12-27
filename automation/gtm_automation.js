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
 * successfully, the template is added to the workspace.
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
      .then(function () {
        gapi.client.load('https://tagmanager.googleapis.com/$discovery/rest?version=v2');
      })
      .then(deployTemplate());
  });
}


/**
 * Stub for adding the temaplate to the workspace.
 */
function deployTemplate() {

}