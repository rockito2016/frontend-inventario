import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth-service.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.authService.isAuthenticated()) {
      console.warn('Acceso bloqueado: usuario no autenticado');
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    const userRole = localStorage.getItem('userRole');
    const allowedRoutes = JSON.parse(localStorage.getItem('allowedRoutes') || '[]');
    const currentRoute = state.url;

    console.log('Rol del usuario:', userRole);
    console.log('Rutas permitidas:', allowedRoutes);
    console.log('Ruta actual:', currentRoute);

    if (userRole === '1') {
      return true;
    }

    if (allowedRoutes.some((allowedRoute: string) => currentRoute.startsWith(allowedRoute))) {
      return true;
    }

    console.warn('Acceso bloqueado: ruta no permitida');
    Swal.fire({
      title: 'Acceso Denegado',
      text: 'No tienes permiso para acceder a esta sección.',
      icon: 'warning',
      confirmButtonText: 'Aceptar'
    }).then(() => {
      this.showErrorAndReload('Acceso denegado');
      this.router.navigate(['/login']);
    });
    return false;
  }

  private showErrorAndReload(message: string) {
    Swal.fire({
      title: 'Acceso Denegado',
      text: message,
      icon: 'warning',
      confirmButtonText: 'Aceptar'
    }).then(() => {
      localStorage.clear();
      location.reload();
    });
  }
}
