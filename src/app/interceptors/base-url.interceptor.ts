import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const baseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  const base = environment.apiUrl ?? '';

  // 1) URLs absolutas: no tocar
  if (/^https?:\/\//i.test(req.url)) {
    return next(req);
  }

  // 2) Normaliza
  const normalizedBase = base.replace(/\/+$/, '');
  const normalizedUrl  = req.url.replace(/^\/+/, '');

  // 3) EXCEPCIONES (van SIN /api):
  //    - auth/*  (login, signup)
  //    - users/* (listado, by-role, me)
  const noApiPrefix =
    normalizedUrl.startsWith('auth/') ||
    normalizedUrl.startsWith('users/');

  const finalPath = noApiPrefix
    ? normalizedUrl
    : (normalizedUrl.startsWith('api/') ? normalizedUrl : `api/${normalizedUrl}`);

  return next(req.clone({ url: `${normalizedBase}/${finalPath}` }));
};
