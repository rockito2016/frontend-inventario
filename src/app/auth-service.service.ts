import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { jwtDecode } from "jwt-decode";

export interface User {
  id: string;
  username: string;
  roles: string[];
}

export interface AuthResponse {
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/datos-usuarios/:id';
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromToken());
  public currentUser$ = this.currentUserSubject.asObservable();
  private jwtHelper = new JwtHelperService();

  constructor(private http: HttpClient) { }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  register(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { usuario: username, contrasena: password }).pipe(
      tap(response => this.handleAuthentication(response.token)),
      catchError(error => this.handleError(error, 'Error en el registro'))
    );
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { usuario: username, contrasena: password }).pipe(
      tap(response => this.handleAuthentication(response.token)),
      catchError(error => this.handleError(error, 'Error en la autenticación'))
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  refreshToken(): Observable<AuthResponse> {
    const token = this.getToken();
    if (!token) return throwError(() => new Error('No token found'));

    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh-token`, { token }).pipe(
      tap(response => this.handleAuthentication(response.token)),
      catchError(error => this.handleError(error, 'Error al refrescar el token'))
    );
  }

  getUserFromToken(): User | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decodedToken = jwtDecode<{ id: string; username: string; roles: string[] }>(token);
      return { id: decodedToken.id, username: decodedToken.username, roles: decodedToken.roles };
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      return null;
    }
  }

  hasRole(role: string): boolean {
    return this.currentUserSubject.value?.roles.includes(role) ?? false;
  }

  private handleAuthentication(token: string): void {
    localStorage.setItem('token', token);
    this.currentUserSubject.next(this.getUserFromToken());
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decodedToken = jwtDecode<{ exp: number }>(token);
      return decodedToken.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  private handleError(error: any, defaultMessage: string) {
    console.error(defaultMessage, error);
    return throwError(() => new Error(error.error?.message || defaultMessage));
  }
}

