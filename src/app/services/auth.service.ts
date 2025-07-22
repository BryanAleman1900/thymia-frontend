import { inject, Injectable } from '@angular/core';
import { IAuthority, ILoginResponse, IResponse, IRoleType, IUser } from '../interfaces';
import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private accessToken!: string;
  private expiresIn!: number;
  private user: IUser = { email: '', authorities: [] };
  private http: HttpClient = inject(HttpClient);
  private apiURL: string = 'http://localhost:8080';

  constructor() {
    this.load();
  }

  public save(): void {
    if (this.user) localStorage.setItem('auth_user', JSON.stringify(this.user));
    if (this.accessToken) localStorage.setItem('access_token', JSON.stringify(this.accessToken));
    if (this.expiresIn) localStorage.setItem('expiresIn', JSON.stringify(this.expiresIn));
  }

  private load(): void {
    let token = localStorage.getItem('access_token');
    if (token) this.accessToken = JSON.parse(token); // ✅ corrección de Bryan

    let exp = localStorage.getItem('expiresIn');
    if (exp) this.expiresIn = JSON.parse(exp);

    const user = localStorage.getItem('auth_user');
    if (user) this.user = JSON.parse(user);
  }

  public getUser(): IUser | undefined {
    return this.user;
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  public check(): boolean {
    return !!this.accessToken;
  }

  public login(credentials: { email: string; password: string }): Observable<ILoginResponse> {
    return this.http.post<ILoginResponse>('auth/login', credentials).pipe(
      tap((response: any) => {
        this.accessToken = response.token;
        this.expiresIn = response.expiresIn;
        this.user = response.authUser;
        this.save();
      })
    );
  }

  public signup(user: IUser): Observable<ILoginResponse> {
    return this.http.post<ILoginResponse>('auth/signup', user);
  }

  // ✅ Google login
  public loginWithGoogle(idToken: string): Observable<ILoginResponse> {
    return this.http.post<any>('auth/google', { idToken }).pipe(
      tap((response: any) => {
        this.accessToken = response.token;
        this.expiresIn = response.expiresIn;
        this.user = response.authUser;
        this.save();
      })
    );
  }

  // ✅ Face ID login
  public loginWithFacialId(facialId: string): Observable<ILoginResponse> {
    return this.http.post<ILoginResponse>('auth/face-id/login', { facialId }).pipe(
      tap((response: any) => {
        this.accessToken = response.token;
        this.expiresIn = response.expiresIn;
        this.user = response.authUser;
        this.save();
      })
    );
  }

  // ✅ Face ID register
  public registerFacialId(facialId: string): Observable<IResponse<IUser>> {
    return this.http.post<IResponse<IUser>>('users/me/face-id/register', { facialId });
  }

  public logout(): void {
    this.accessToken = '';
    localStorage.removeItem('access_token');
    localStorage.removeItem('expiresIn');
    localStorage.removeItem('auth_user');
  }

  public hasRole(role: string): boolean {
    return this.user.authorities ? this.user.authorities.some(a => a.authority === role) : false;
  }

  public isSuperAdmin(): boolean {
    return this.hasRole(IRoleType.superAdmin);
  }

  public hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  public getPermittedRoutes(routes: any[]): any[] {
    return routes.filter(route =>
      route.data?.authorities && this.hasAnyRole(route.data.authorities)
    );
  }

  public getUserAuthorities(): IAuthority[] | undefined {
    return this.user.authorities;
  }

  public areActionsAvailable(routeAuthorities: string[]): boolean {
    let userAuthorities = this.getUserAuthorities();

    let allowedUser = routeAuthorities.some(role =>
      userAuthorities?.some(auth => auth.authority === role)
    );

    let isAdmin = userAuthorities?.some(
      a => a.authority === IRoleType.admin || a.authority === IRoleType.superAdmin
    );

    return allowedUser && !!isAdmin;
  }

  // ✅ Lógica de bloqueo por email (de Carlos)
  public verificarBloqueo(email: string): Observable<any> {
    return this.http.get<any>(`${this.apiURL}/auth/status?email=${email}`);
  }
}
