import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.css']
})
export class CallbackComponent implements OnInit {
  
  fetching: boolean = false;

  gotResult: boolean = false;

  authCode: string = '';

  accessToken: string = '';
  idToken: string = '';
  refreshToken: string = '';
  expiresIn: string = '';
  tokenType: string = '';
  scope: string = '';

  tokenUrl: string | null = '';
  clientId: string | null = '';
  callbackUrl: string | null = '';

  error: string | null = null;

  constructor(private httpClient: HttpClient, private snackBar: MatSnackBar, private router: Router) { }

  displayMessage(error: string) {
    console.log(error);
    this.fetching = false;
    this.snackBar.open(error, 'Close', {duration: 5000});
  }

  CopyToClipboard(token: string) {
    navigator.clipboard.writeText(token).then(() => {
      this.displayMessage('Copied to clipboard');
    });
  }

  ngOnInit(): void {
    this.fetching = true;

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (!code) {
      this.fetching = false;

      this.displayMessage('Authorization code missing');

      return;
    } else {
      this.authCode = code;

      this.tokenUrl = sessionStorage.getItem('tokenUrl');
      this.clientId = sessionStorage.getItem('clientId');
      this.callbackUrl = sessionStorage.getItem('callbackUrl');

      if (!this.tokenUrl || !this.clientId || !this.callbackUrl) {
        this.fetching = false;

        this.displayMessage('Missing configuration: tokenUrl, clientId, callbackUrl');

        return;
      }

      const formBodyString = this.getBody('authorization_code');

      this.sendTokenRequest(formBodyString);
    }
  }

  sendTokenRequest(body: string, showMessage: boolean = false) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'Accept': 'application/json'
    });

    if (!this.tokenUrl) {
      this.displayMessage('Missing configuration: tokenUrl');
      throw new Error('Missing configuration: tokenUrl');
    }

    this.httpClient.post<TokenResponse>(this.tokenUrl, body, { headers, responseType: 'json' })
      .subscribe({
        next: (data) => {
          this.handleTokenResponse(data);
          if (showMessage) {
            this.displayMessage('Token received');
          }
        },
        error: (err) => {
          this.displayMessage('Error getting token');
          this.error = err.message;
        }
      });
  }

  testRefreshToken() {
    this.fetching = true;

    const formBodyString = this.getBody('refresh_token');

    this.sendTokenRequest(formBodyString, true);
  }

  getBody(grantType: string): string {

    if (!this.clientId || !this.callbackUrl) {
      
      this.fetching = false;
      this.displayMessage('Missing configuration: clientId, callbackUrl');
      return '';

    } else {

      const details: Details = {
        'client_id': this.clientId.toString(),
        'grant_type': grantType,
        'redirect_uri': this.callbackUrl.toString()
      };
  
      if (grantType === 'authorization_code') {
        details['code'] = this.authCode;
      } else if (grantType === 'refresh_token') {
        details['refresh_token'] = this.refreshToken;
      }
  
      return Object.keys(details)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(details[key]))
        .join('&');

    }
  }

  handleTokenResponse(data: TokenResponse) {
    this.fetching = false;
    this.gotResult = true;

    console.log(data);

    this.accessToken = data.access_token;
    this.idToken = data.id_token;
    this.refreshToken = data.refresh_token;
    this.expiresIn = data.expires_in;
    this.tokenType = data.token_type;
    this.scope = data.scope;
  }

  goBack() {
    this.router.navigate(['/']);
  }

}

interface Details {
  [key: string]: string;
}

interface TokenResponse {
  access_token: string;
  id_token: string;
  refresh_token: string;
  expires_in: string;
  token_type: string;
  scope: string;
}