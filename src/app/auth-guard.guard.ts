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
    const requiredRoles = route.data['roles'];

    console.log('Rol del usuario:', userRole);
    console.log('Roles requeridos:', requiredRoles);

    if (userRole === '1') {
      return true;
    }

    if (requiredRoles) {
      const hasRequiredRole = requiredRoles.includes(userRole);
      if (!hasRequiredRole) {
        console.warn('Acceso bloqueado: rol no autorizado');
        Swal.fire({
          title: 'Acceso Denegado',
          text: 'No tienes permiso para acceder a esta sección.',
          icon: 'warning',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          this.showErrorAndReload('Error en el servidor');
          this.router.navigate(['/login']);
        });
        return false;
      }
    }

    return true;
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
