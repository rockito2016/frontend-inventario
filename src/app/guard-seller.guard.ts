import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class VendedorGuard implements CanActivate {
  private router = inject(Router);

  private rutasPermitidas: string[] = [
    '/main/inventario/stock-minimo',
    'main/inventario/lista-precios',
    '/main/ventas',
    '/main/contactos/clientes',
    'main/creditos/creditos-ventas'
  ];

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const userRole = localStorage.getItem('userRole');
    const rutaActual = route.routeConfig?.path || '';

    if (userRole === '1') {
      return true;
    }

    if (userRole === '2' && this.rutasPermitidas.includes(`/${rutaActual}`)) {
      return true;
    }

    this.router.navigate(['/main/inicio']);
    return false;
  }
}
