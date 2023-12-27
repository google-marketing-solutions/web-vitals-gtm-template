Copyright 2021 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License

# Automated deployment of the Web Vitals Template to GTM

This solution simplifies the additional steps required to send the Core Web
Vitals data collected via the template to GA4.

The steps the solution automates are:

1. Optionally deploy the CWV template to GTM.
1. If the template is deployed, configure it appropriately.
1. Creates a custom trigger for CWV events.
1. Creates the data-layer variables used to store CWV measurements.
1. Deploys a GA4 event tag to send the CWV data to GA4.

Using the automation ensures that all of the variables are properly named and
the events are properly linked to the triggers.  

## Prerequisites

Using the template automation requires the following:

* An OAuth Client ID to use when authenticating (see Getting an OAuth ID for
  more information).
* The URL of the Google Tag Manager Workspace where the tag will be deployed
  to.
* The GA4 Measurement ID of the GA4 property to send the CWV measurements to.

### Getting an OAuth ID An OAuth ID is required to authenticate with the GTM API
    when deploying the GTM tags, etc. Before creating an OAuth ID, you will
    need to decide where you will be hosting the solution web page. If you will
    be using you local computer, this is localhost. Otherwise, you will need
    the fully qualified domain name of the server you will be using
    (i.e. everything after the http:// or https://, e.g. stuff.example.com).

To create the OAuth ID, open the Google Cloud Project you will be using to store
your CWV data in BigQuery. From the overflow menu (aka hamburger menu),
choose _APIs & Services >> OAuth consent screen_, then follow these steps:

1.  On the first page of the OAuth Consent Screen set up, choose the _Internal
    User_ type and click the **Create** button.
1.  Fill in the _App name_, _User support email_, and _Developer contact
    information > Email address_ fields in the form. Click the **+ ADD DOMAIN**
    button and add `http://localhost:<PORT NUMBER>` replacing &lt;PORT
    NUMBER&gt; with the port you will run your webserver on locally (often 8000
    or 8080). If you plan on serving the page on a public webserver, us the
    address of that webserver instead.
1.  Click the **Save and Continue** button and then, on the Scopes page, click
    **Save and Continue** again.

Once you have configured the OAuth consent screen, you can create the actual
OAuth Client ID. To do so,

1.  Open the _Credentials_ page in the GCP console.
1.  Click the **+ CREATE CREDENTIALS** button at the top of the page.
1.  Choose _OAuth Client ID_ from the menu.
1.  Choose _Web application_ as the application type.
1.  Name your client ID something meaningful to you. This will not be shown
    publicly.
1.  Use the **+ADD URI** button to add the origin you will be serving the
    application from. If serving from your local computer, this should be
    `localhost`. If you are hosting this on a public server, it will be that
    server’s domain. Don’t forget to add http:// or https:// and the port you
    will be serving from (e.g. http://localhost:8080).
1.  Click the **Save** button to finish.
