import { Component } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import {COMMA, ENTER, V} from '@angular/cdk/keycodes';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css']
})
export class ConfigComponent {
  title = 'OidcTestClient';

  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  running: boolean = false;

  model = new Config(
    '',
    ['openid', 'profile', 'email', 'offline_access'],
    'test-client',
    window.location.origin + '/callback');

  constructor(private httpClient: HttpClient, private snackBar: MatSnackBar) { }

  addScope(event: MatChipInputEvent) {
    const value = (event.value || '').trim();

    // Add  scope
    if (value) {
      this.model.scopes.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  removeScope(scope: string): void {
    const index = this.model.scopes.indexOf(scope);

    if (index >= 0) {
      this.model.scopes.splice(index, 1);
    }
  }

  startAuthentication() {

    this.running = true;

    this.model.oidcAuthority = this.model.oidcAuthority.replace(/\/$/, "");

    const discoUrl = `${this.model.oidcAuthority}/.well-known/openid-configuration`;

    this.httpClient.get<DiscoveryDocument>(discoUrl)
    .subscribe({
      next: (data) => this.handleDiscoveryDoc(data),
      error: (err) => this.handleError('Error loading discovery document')
    });
  }

  handleError(error: any) {
    console.error(error);
    this.running = false;
    this.snackBar.open(error, 'Close', {duration: 5000});
  }

  handleDiscoveryDoc(data: DiscoveryDocument){
    const authUrl = data.authorization_endpoint;
    const tokenUrl = data.token_endpoint;

    if (!authUrl || !tokenUrl) {
      this.handleError('Authentication URL or token URL not found');
    } else {
      console.log('Authorization endpoint found: ' + authUrl);

      this.storeParams(tokenUrl, this.model.callbackUrl, this.model.clientId);

      const loginUrl = this.generateCallbackUrl(authUrl);

      this.navigateToLogin(loginUrl);
    }
  }

  storeParams(tokenUrl: string, callbackUrl: string, clientId: string) {
    sessionStorage.setItem('tokenUrl', tokenUrl);
    sessionStorage.setItem('callbackUrl', callbackUrl);
    sessionStorage.setItem('clientId', clientId);
  }

  generateCallbackUrl(authUrl: string): string {
    const scope = this.model.scopes.join(' ');

    const redirectUri = encodeURIComponent(this.model.callbackUrl);
    const responseType = 'code';
    const state = Math.random().toString(36).substring(7); // simple random state

    return `${authUrl}?client_id=${this.model.clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&state=${state}`;
  }

  navigateToLogin(loginUrl: string) {
    console.log(`Redirecting to ${loginUrl}`);

    window.location.href = loginUrl;
  }
}

export class Config {
  constructor(
    oidcAuthority: string,
    scopes: string[],
    clientId: string,
    callbackUrl: string
  ) {
    this.oidcAuthority = oidcAuthority;
    this.scopes = scopes;
    this.clientId = clientId;
    this.callbackUrl = callbackUrl;
  }
  oidcAuthority: string = "";
  scopes: string[] = [];
  clientId: string = "";
  callbackUrl: string = "";
}

export class DiscoveryDocument {
  authorization_endpoint: string = "";
  token_endpoint: string = "";
}