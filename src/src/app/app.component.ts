import { Component } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import {COMMA, ENTER} from '@angular/cdk/keycodes';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'OidcTestClient';

  oidcAuthority: string = "";

  scopes: string[] = ['openid', 'profile', 'email', 'offline_access'];

  clientId: string = "test-client";

  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  callbackUrl: string = window.location.origin + '/callback.html';

  addScope(event: MatChipInputEvent) {
    const value = (event.value || '').trim();

    // Add  scope
    if (value) {
      this.scopes.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  removeScope(scope: string): void {
    const index = this.scopes.indexOf(scope);

    if (index >= 0) {
      this.scopes.splice(index, 1);
    }
  }

  startAuthentication() {

    this.oidcAuthority = this.oidcAuthority.replace(/\/$/, "");

    const discoUrl = `${this.oidcAuthority}/.well-known/openid-configuration`;

    var authUrl = '';
    var tokenUrl = '';

    // get the authorization endpoint
    fetch(discoUrl)
      .then(response => response.json())
      .then(data => {
        authUrl = data.authorization_endpoint;
        tokenUrl = data.token_endpoint;

        if (!authUrl) {
          throw new Error('Authorization endpoint not found');

          // todo: handle better
        } else {
          console.log('Authorization endpoint found: ' + authUrl);
          const scope = this.scopes.join(' ');

          const redirectUri = encodeURIComponent(this.callbackUrl);
          const responseType = 'code';
          const state = Math.random().toString(36).substring(7); // simple random state

          var loginUrl = `${authUrl}?client_id=${this.clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&state=${state}`;

          console.log(`Redirecting to ${loginUrl}`);

          sessionStorage.setItem('tokenUrl', tokenUrl);
          sessionStorage.setItem('callbackUrl', this.callbackUrl);
          sessionStorage.setItem('clientId', this.clientId);

          window.location.href = loginUrl;
        }
      });
  }
}
