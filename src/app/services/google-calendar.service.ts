// src/app/core/services/google-calendar.service.ts

import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

declare const gapi: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleCalendarService {
  private readonly API_KEY = environment.googleApiKey;
  private readonly CLIENT_ID = environment.googleClientId;
  private readonly SCOPES = 'https://www.googleapis.com/auth/calendar';

  private isInitialized = false;

  async initClient(): Promise<void> {
    if (this.isInitialized) return;

    await new Promise<void>((resolve) => {
      gapi.load('client:auth2', () => resolve());
    });

    await gapi.client.init({
      apiKey: this.API_KEY,
      clientId: this.CLIENT_ID,
      scope: this.SCOPES,
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
    });

    this.isInitialized = true;
  }

  async signIn(): Promise<string> {
    await this.initClient();
    const authInstance = gapi.auth2.getAuthInstance();
    const user = authInstance.currentUser.get();
    
    if (!user.isSignedIn()) {
      await authInstance.signIn();
    }

    return user.getAuthResponse().access_token;
  }

  async createEvent(event: any, accessToken: string): Promise<any> {
    await this.initClient();
    
    return new Promise((resolve, reject) => {
      gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        oauth_token: accessToken
      }).then(resolve, reject);
    });
  }
}