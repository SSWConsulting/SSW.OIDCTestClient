# SSW.OIDCTestClient

A simple app for testing OIDC servers

<img width="600" alt="image" src="https://github.com/SSWConsulting/SSW.OIDCTestClient/assets/19944129/9a8ac59b-9ad7-4e8a-ab67-eb17d5c606df">


## Purpose

Sometimes when working on an OIDC server you need to test changes that require a UI client app. For example, UI changes to the login page. It can be cumbersome and annoying to have a full client application running just to test UI or config changes in your OIDC backend, so this client provides a simple, configurable, lightweight alternative.

## Features

* **Simple validation:** Checks that a client ID and authority have been provided (note authority is not validated as a URL, see: #1)
* **Configuraable client ID:** Client ID can be changed to suit testing for a specific client configuration in your server, or set up a test client (see below)
* **Configurable scopes:** Default scopes are provided, but you can remove these and/or add your own
* **Copy tokens to clipboard:** For easy testing in [https://jwt.ms](https://jwt.ms) or [DevToys](https://devtoys.app/)
* **Test refresh tokens:** One-click token refresh

## Pre-requisites

* NodeJS (latest should be fine): https://nodejs.org/en
* NPM (latest should be fine): https://www.npmjs.com/
* Angular CLI (latest should be fine): https://angular.io/cli

## Usage

You will need to ensure you have a client (or App Registration in Azure, for example) configured in your OIDC server with a callback URL of `https://localhost:4200` (or whatever port you have Angular congfigured to run on). You can add this to an existing client configuration, or add a specific client for testing. For IdentityServer, for example, you could use the following configuration:

```json
"Clients": {
  "TestClient": {
    "ClientName": "Test Client",
    "ClientId": "test-client",
    "RequirePkce": false,
    "RequireClientSecret": false,
    "AlwaysIncludeUserClaimsInIdToken": true,
    "AlwaysSendClientClaims": true,
    "AllowedGrantTypes": [ "authorization_code" ],
    "AllowOfflineAccess": true,
    "AllowedScopes": [
      "openid",
      "profile",
      "email"
    ],
    "RedirectUris": [ "https://localhost:4200/callback" ],
    "AllowedCorsOrigins": [ "https://localhost:4200" ]
  }
},
```

Install dependencies:

```bash
npm i
```

Then simply run the app:

```bash
ng serve -o --ssl
```

When running, change the client ID or scopes as requird (see screenshot above). Click the `Start Authentication` button to be redirected to your OIDC server's login page. Authenticate there and get redirected back, the app will then retrieve your tokens:

<img width="600" alt="image" src="https://github.com/SSWConsulting/SSW.OIDCTestClient/assets/19944129/7b3cc65f-3c91-4377-b2fd-c67edbc18002">


