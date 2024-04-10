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
* Enabling the tagmanager API in your Cloud Project (see Enabling the tagmanager
  API below).

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
    NUMBER&gt; with the port you will run your web server on locally (often 8000
    or 8080). If you plan on serving the page on a public web server, us the
    address of that web server instead.
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

### Enabling the tagmanager API

Enabling the tagmanager API for your Google Cloud project is necessary for
allowing the solution to make changes to your Tag Manager workspaces. To enable
the API, follow these steps:

1. Open the Google Cloud Console and navigate to the 
[APIs & Services page](https://console.cloud.google.com/apis/dashboard).
1. Click the + ENABLE APIS AND SERVICES button at the top of the page.
1. Using the search box at the top of the page, search for Tag Manager API
1. Click the resulting card labeled Tag Manager API
1. Click the ENABLE button to enable the API.

You may need to wait a few minutes for the API to be usable after enabling it.

## Serving the Solution Website

There are a number of ways to serve the solution website. The simplest is to use
your local computer. Below are two ways you can do that from the command line.

Once you have started serving the website open the URL in your browser. For
example, if you are serving the site from your computer on port 8080, open the
URL http://localhost:8080.

### Using Python

1. Move to the directory you downloaded the solution to using (e.g. cd
   cwv_from_ga4_exports)
1. Type python -m http.server <PORT> where <PORT> is the port number specified
   when setting up the OAuth Client ID.

### Using NodeJS

1. Install the http-server module by typing sudo npm i -g http-server
1. Move to the directory you downloaded the solution to.
1. Type http-server . -p <PORT> where <PORT> is the port number specified when
   setting up the OAuth Client ID.

## Deploying to GTM

The web vitals tag is deployed to GTM via the solution website. Once the site is
open, fill in the form and click the **Deploy GTM Tag** button. When asked,
authorize the app to make changes to your GTM workspace (this may be asked
multiple times).

You can find the information you will need in the following places:

<dl> 
<dt>OAuth Client ID</dt>
<dd>Found in the Cloud Console under __API & Services >> Credentials__ (created
in the prerequisites).
<dt>GTM Workspace URL</dt>
<dd>The URL of the overview page for the GTM workspace you will be deploying to.
</dd>
<dt>GA4 Measurement ID</dt>
<dd>Found on your GA4 property under __Admin >> Data Streams__ along with the
details for the Web Stream being used to collect the data. It will start with
"G-".</dd>
<dt>Template File</dt>
<dd>This is the `template.tpl` file included with the solution. It is included
in the solution when cloned and can be found at the root of the cloned
directory.</dd>
</dl>

As the parts are deployed, success messages will be displayed on the page. Once
the **All Done** message is displayed, open the GTM workspace you deployed to in
your browser. Check if all of the changes are acceptable and don't conflict with
anything else you're currently working on. If everything is good, submit the
changes and deploy the new version of the GTM container to start collecting Core
Web Vitals for your website.

## Possible Issues
* Deploying the template a second time results in an **400 BAD REQUEST** error
  on the first step without any additional context. To remedy this, delete the
  template from the container and start again.

<!--  LocalWords:  GTM OAuth tagmanager localhost APIs
 -->
