import { Component, OnInit } from '@angular/core';
import { NotificationService } from '../../notification.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { interval, Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'notification-stock-minimo',
  standalone: true,
  imports: [HttpClientModule, CommonModule],
  template: `
  <div class="icon-container" (click)="showNotification()">
    <i class="bi bi-bell-fill notification-icon" *ngIf="hayNotification"></i>
    <i class="bi bi-bell notification-icon" *ngIf="!hayNotification"></i>
    <span class="badge" *ngIf="cantidadNotificacion > 0">{{ cantidadNotificacion }}</span>
  </div>
  `,
  styles: [`
    .icon-container {
      position: relative;
      cursor: pointer;
    }

    .notification-icon {
      font-size: 35px;
    }

    .badge {
      position: absolute;
      top: -5px;
      right: -5px;
      background-color: red;
      color: white;
      border-radius: 50%;
      padding: 4px 6px;
      font-size: 0.8rem;
    }
    `],
})
export class NotificationComponent implements OnInit {

  cantidadNotificacion: number = 0;
  hayNotification: boolean = false;
  productoEnStockMinimo: any[] = [];
  private notificationSubscription: Subscription | undefined;
  private count: number = 0;
  private rolId: number = 1;

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.rolId = user.rol_id || 1;
    this.notificationService.notificaciones$.subscribe(productos => {
      this.productoEnStockMinimo = productos;
      this.cantidadNotificacion = productos.length;
      this.hayNotification = productos.length > 0;

      if (this.cantidadNotificacion > 0 && this.count === 0 && this.rolId !== 2) {
        this.mostrarNotiInitial();
      }

      this.count = this.cantidadNotificacion;
    });
  }

  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  mostrarNotiInitial() {
    Swal.fire({
      title: '¡Productos en stock!',
      text: 'Hay productos en stock mínimo, revisa el inventario',
      icon: 'warning',
      confirmButtonText: 'OK'
    }).then(() => {
      this.router.navigate(['/main/inventario/stock-minimo']);
    });
  }

  showNotification() {
    if (this.productoEnStockMinimo.length > 0 && this.rolId !== 2) {
      let productosHTML = '<ul>';
      this.productoEnStockMinimo.forEach(producto => {
        productosHTML += `<li>${producto.nombre_producto}: ${producto.cantidad} unidades</li>`
      });
      productosHTML += `</ul>`;

      Swal.fire({
        title: 'Productos en stock mínimo',
        html: productosHTML,
        icon: 'warning',
        confirmButtonText: 'OK'
      });
    }
  }
}
