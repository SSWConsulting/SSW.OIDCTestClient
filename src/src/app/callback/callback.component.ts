import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

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

  constructor(private httpClient: HttpClient, private snackBar: MatSnackBar) { }

  handleError(error: string) {
    console.log(error);
    this.snackBar.open(error, 'Close', {duration: 5000});
  }

  ngOnInit(): void {
    this.fetching = true;

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (!code) {
      this.fetching = false;

      this.handleError('Authorization code missing');

      return;
    } else {
      this.authCode = code;

      const tokenUrl = sessionStorage.getItem('tokenUrl');
      const clientId = sessionStorage.getItem('clientId');
      const callbackUrl = sessionStorage.getItem('callbackUrl');

      if (!tokenUrl || !clientId || !callbackUrl) {
        this.fetching = false;

        this.handleError('Missing configuration: tokenUrl, clientId, callbackUrl');

        return;
      }

      const details: Details = {
        'client_id': clientId.toString(),
        'code': code.toString(),
        'grant_type': 'authorization_code',
        'redirect_uri': callbackUrl.toString()
      };

      const formBodyString = Object.keys(details)
      .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(details[key]))
      .join('&');

      const headers = new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Accept': 'application/json'
      });

      this.httpClient.post<TokenResponse>(tokenUrl, formBodyString, { headers, responseType: 'json' })
        .subscribe({
          next: (data) => this.handleTokenResponse(data),
          error: (err) => this.handleError('Error getting token')
        });
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