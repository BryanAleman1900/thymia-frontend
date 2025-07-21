import { Injectable } from '@angular/core';

declare const faceIO: any;

@Injectable({ providedIn: 'root' })
export class FaceioService {
  private faceioInstance: any;

  constructor() {
    this.faceioInstance = new faceIO('fioae373'); // Tu ID FaceIO real
  }

  /**
   * Observa el DOM hasta que aparezca el modal, y lo convierte en popup real.
   */
  private elevateFaceIOModal(): void {
    const observer = new MutationObserver(() => {
      const modal = document.querySelector('.fio-modal') as HTMLElement;
      if (modal) {
        // Forzar popup flotante
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.width = '90vw';
        modal.style.maxWidth = '400px';
        modal.style.height = 'auto';
        modal.style.zIndex = '2147483647';
        modal.style.pointerEvents = 'all';
        modal.style.display = 'block';
        modal.style.backgroundColor = '#000';
        modal.style.padding = '20px';
        modal.style.borderRadius = '12px';
        modal.style.boxShadow = '0 0 20px rgba(0,0,0,0.8)';

        // Opcional: evitar scroll del fondo
        document.body.style.overflow = 'hidden';

        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  async enroll(): Promise<string> {
    try {
      this.elevateFaceIOModal();
      const response = await this.faceioInstance.enroll({
        locale: 'auto',
        payload: { userId: 'frontend-thymia-app' }
      });
      document.body.style.overflow = ''; // Restaurar scroll
      return response.facialId;
    } catch (err) {
      document.body.style.overflow = '';
      console.error('Enrollment failed:', err);
      throw err;
    }
  }

  async authenticate(): Promise<string> {
    try {
      this.elevateFaceIOModal();
      const response = await this.faceioInstance.authenticate({
        locale: 'auto'
      });
      document.body.style.overflow = '';
      return response.facialId;
    } catch (err) {
      document.body.style.overflow = '';
      console.error('Authentication failed:', err);
      throw err;
    }
  }
}
