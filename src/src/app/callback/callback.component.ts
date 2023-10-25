import { Component, OnInit } from '@angular/core';

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



  ngOnInit(): void {
    this.fetching = true;

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (!code) {
      this.fetching = false;

      // handle error

      return;
    } else {
      this.authCode = code;

      const tokenUrl = sessionStorage.getItem('tokenUrl');
      const clientId = sessionStorage.getItem('clientId');
      const callbackUrl = sessionStorage.getItem('callbackUrl');

      if (!tokenUrl || !clientId || !callbackUrl) {
        throw new Error('Missing required parameters');
      }

      const details: Details = {
        'client_id': clientId.toString(),
        'code': code.toString(),
        'grant_type': 'authorization_code',
        'redirect_uri': callbackUrl.toString()
      };

      let formBody: string[] = [];
      
      let formBodyString: string = '';

      for (var property in details) {
        var encodedKey = encodeURIComponent(property);
        var encodedValue = encodeURIComponent(String(details[property]));
        formBody.push(encodedKey + "=" + encodedValue);
      }

      formBodyString = formBody.join("&");

      fetch(tokenUrl, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
              'Accept': 'application/json'
          },
          body: formBodyString
      })
      .then(response => response.json())
      .then(data => {
        this.fetching = false;

        this.gotResult = true;
        console.log(data);

        this.accessToken = data.access_token;
        this.idToken = data.id_token;
        this.refreshToken = data.refresh_token;
        this.expiresIn = data.expires_in;
        this.tokenType = data.token_type;
        this.scope = data.scope;

      })
      .catch(error => {
        this.fetching = false;
        
        // handle error
      });

    }

  }

}

interface Details {
  [key: string]: string;
}