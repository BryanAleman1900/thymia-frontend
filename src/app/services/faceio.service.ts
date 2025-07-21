import { Injectable } from '@angular/core';

declare const faceIO: any;

@Injectable({ providedIn: 'root' })
export class FaceioService {
  private faceioInstance: any;

  constructor() {
    this.faceioInstance = new faceIO("fioae373");
  }

  private elevateFaceIOModal(): void {
    const interval = setInterval(() => {
      const modal = document.querySelector('.fio-modal') as HTMLElement;
      if (modal) {
        modal.style.zIndex = '99999'; // 🧼 Garantiza que quede por encima de todo
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        clearInterval(interval);
      }
    }, 100);
  }

  async enroll(): Promise<string> {
    try {
      this.elevateFaceIOModal(); // ⬆️ Aplica antes de abrir el modal
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
      this.elevateFaceIOModal(); // ⬆️ Asegura que se vea
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
