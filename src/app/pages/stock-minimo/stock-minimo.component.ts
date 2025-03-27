import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { NotificationService } from '../../notification.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'stock-minimo',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './stock-minimo.component.html',
  styleUrls: ['./stock-minimo.component.css']
})
export class StockMinimoComponent implements OnInit {
  productsStock: any[] = [];
  groupedProducts: { [key: string]: any[] } = {};
  totalDinero: number = 0;
  selectedProducts: any[] = [];
  subscription!: Subscription;
  isAnimating = false;
  isSendingPedido: boolean = false;
  pedidoEnviado: boolean = false;
  totalSelected: number = 0;
  isSelectAllActive = false;


  constructor(
    private http: HttpClient,
    private router: Router,
    private notification: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadProductsStock();
    this.subscription = interval(300000).subscribe(() => {
      this.loadProductsStock();
    });
  }

  loadProductsStock(): void {
    this.http.get<any[]>('http://localhost:3000/inventario/stock-minimo').subscribe(
      (data) => {
        console.log('Datos recibidos del backend:', data);
        let restoredProducts = JSON.parse(localStorage.getItem('stockMinimo') || '[]');
        restoredProducts = restoredProducts.filter((product: any) => product.estado_id === 1);
        this.productsStock = this.removeDuplicates([...data, ...restoredProducts]);
  
        this.productsStock = this.productsStock.map(product => ({
          ...product,
          selected: product.selected || false
        }));
  
        this.groupProductsBySupplier();
        this.calculateTotalDinero();
        localStorage.setItem('stockMinimo', JSON.stringify(this.productsStock));
      },
      (error) => {
        console.error('Error al obtener los productos en stock mínimo:', error); 
      }
    );
  }
  
  groupProductsBySupplier(): void {
    this.groupedProducts = this.productsStock.reduce((acc, product) => {
      const supplierName = product.proveedor;
      if (!acc[supplierName]) {
        acc[supplierName] = [];
      }
      acc[supplierName].push(product);
      return acc;
    }, {});
  }

  calculateTotalDinero(): void {
    this.totalDinero = this.productsStock.reduce(
      (total, product) => total + product.cantidad * product.precio_compra,
      0
    );
  }

   getTotalTotalPrice(products: any[]): number {
    return products.reduce((total, product) => total + (product.cantidad * product.precio_compra), 0);
  }

  navigateToRealizarPedido(): void {
    if (this.selectedProducts.length === 0) {
      alert('Por favor seleccione al menos un producto para enviar.');
      return;
    }

    this.isSendingPedido = true;

    const codigos = this.selectedProducts.map((product) => product.codigo);
    const nuevoEstado = 2;

    this.http.post('http://localhost:3000/inventario/enviar-pedido', { codigos, estado_id: nuevoEstado }).subscribe(
      (response: any) => {
        console.log(response.message);

        const existingSelectedProducts = JSON.parse(localStorage.getItem('selectedProducts') || '[]');
        const updatedSelectedProducts = [...existingSelectedProducts, ...this.selectedProducts];

        localStorage.setItem('selectedProducts', JSON.stringify(this.removeDuplicates(updatedSelectedProducts)));

        this.productsStock = this.productsStock.filter(
          product => !this.selectedProducts.some(selected => selected.codigo === product.codigo)
        );

        localStorage.setItem('stockMinimo', JSON.stringify(this.productsStock));
 
        setTimeout(() => {
          this.isSendingPedido = false;
          this.pedidoEnviado = true;
          this.selectedProducts = [];
          this.groupProductsBySupplier();
          this.calculateTotalDinero();

          setTimeout(() => {
            this.pedidoEnviado = false;
            this.router.navigate(['/main/pedido/realizar-pedido']);
          }, 300);

        }, 400);
      },
      (error) => {
        this.isSendingPedido = false;
        console.error('Error al actualizar los productos:', error);
        alert('Hubo un problema al enviar el pedido. Intente nuevamente.');
      }
    );
  }
  
 removeDuplicates(products: any[]): any[] {
  const uniqueProducts = new Map<number, any>();
  products.forEach(product => uniqueProducts.set(product.codigo, product));
  return Array.from(uniqueProducts.values());
}

  calculateTotalSelected(): void {
    this.totalSelected = this.selectedProducts.reduce(
      (total, product) => total + (product.cantidad * product.precio_compra),
      0
    );
  }
  
  toggleSelectAll(): void {
    const allSelected = this.productsStock.every(product => product.selected);
      this.productsStock.forEach(product => product.selected = !allSelected);
      this.selectedProducts = this.productsStock.filter(product => product.selected);
      this.calculateTotalSelected();
      this.isSelectAllActive = !allSelected;
  }
  
  toggleProductSelection(product: any): void {
    product.selected = !product.selected;
  
    if (product.selected) {
      if (!this.selectedProducts.some(p => p.codigo === product.codigo)) {
        this.selectedProducts.push(product);
      }
    } else {
      this.selectedProducts = this.selectedProducts.filter(p => p.codigo !== product.codigo);
    }
  
    this.calculateTotalSelected();
  }

  getTotalSelected(): number {
    return this.selectedProducts.reduce(
      (total, product) => total + (product.cantidad * product.precio_compra),
      0
    );
  }
  

  updateSelection(product: any): void {
    if (product.selected) {
      if (!this.selectedProducts.some(p => p.codigo === product.codigo)) {
        this.selectedProducts.push(product);
      }
    } else {
      this.selectedProducts = this.selectedProducts.filter(p => p.codigo !== product.codigo);
    }
  
    this.totalSelected = this.getTotalSelected();
  }
}