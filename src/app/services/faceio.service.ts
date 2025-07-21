import { Injectable } from '@angular/core';

declare const faceIO: any;

@Injectable({ providedIn: 'root' })
export class FaceioService {
  private faceioInstance: any;

  constructor() {
    this.faceioInstance = new faceIO("fioae373");
  }

  async enroll(): Promise<string> {
    try {
      const response = await this.faceioInstance.enroll({
        locale: "auto",
        payload: {
          userId: "frontend-thymia-app"
        }
      });
      return response.facialId;
    } catch (err) {
      console.error('Enrollment failed:', err);
      throw err;
    }
  }

  async authenticate(): Promise<string> {
    try {
      const response = await this.faceioInstance.authenticate({
        locale: "auto"
      });
      return response.facialId;
    } catch (err) {
      console.error('Authentication failed:', err);
      throw err;
    }
  }
}
