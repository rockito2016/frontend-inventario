import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificationService } from '../../notification.service';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
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
      transition: transform 0.3s ease; /* Transición suave para el icono */
    }

    .icon-container:hover {
      transform: scale(1.1); /* Aumenta ligeramente al hacer hover */
    }

    .notification-icon {
      font-size: 35px;
      animation: bellShake 1s infinite; /* Animación de sacudida */
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
      animation: pulse 1.5s infinite; /* Animación de pulso */
    }

    /* Animaciones */
    @keyframes bellShake {
      0%, 100% { transform: rotate(0deg); }
      10%, 30%, 50%, 70%, 90% { transform: rotate(-10deg); }
      20%, 40%, 60%, 80% { transform: rotate(10deg); }
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
  `],
})
export class NotificationComponent implements OnInit, OnDestroy {
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
    this.notificationSubscription = this.notificationService.notificaciones$.subscribe(productos => {
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

  mostrarNotiInitial(): void {
    Swal.fire({
      title: '¡Productos en stock mínimo!',
      text: 'Hay productos en stock mínimo, revisa el inventario',
      icon: 'warning',
      confirmButtonText: 'OK',
      showClass: {
        popup: 'animate__animated animate__fadeInDown'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOutUp'
      }
    }).then(() => {
      // this.router.navigate(['/main/inventario/stock-minimo']);
    });
  }

  showNotification(): void {
    if (this.productoEnStockMinimo.length > 0 && this.rolId !== 2) {
      let productosHTML = '<ul>';
      this.productoEnStockMinimo.forEach(producto => {
        productosHTML += `<li>${producto.nombre_producto}: ${producto.cantidad} unidades</li>`;
      });
      productosHTML += '</ul>';

      Swal.fire({
        title: 'Productos en stock mínimo',
        html: productosHTML,
        icon: 'warning',
        confirmButtonText: 'OK',
        showClass: {
          popup: 'animate__animated animate__fadeIn'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOut'
        }
      });
    }
  }
}
