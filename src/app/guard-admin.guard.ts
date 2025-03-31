import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  private router = inject(Router);

  canActivate(): boolean {
    const userRole = localStorage.getItem('userRole');

    if (userRole === '1') {
      return true;
    }

    this.router.navigate(['/main/inicio']);
    return false;
  }
}
