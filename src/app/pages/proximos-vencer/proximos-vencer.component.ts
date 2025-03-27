import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'proximos-vencer',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './proximos-vencer.component.html',
  styleUrls: ['./proximos-vencer.component.css']
})
export class ProximosVencerComponent implements OnInit {
  groupedProducts: { [key: string]: any[] } = {};
  groupedProductsProximosAVencer: { [key: string]: any[] } = {};
  totalDinero: number = 0;
  totalDinero2: number = 0;
  
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getProductosVencidos();
    this.getProductosProximosAVencer();
  }

  getMesEnEspanol(claveMesAno: string): string {
    const [year, month] = claveMesAno.split('-');
    const fecha = new Date(+year, +month - 1);
    const opciones: Intl.DateTimeFormatOptions = { month: 'long' };
    const mesEnEspanol = fecha.toLocaleDateString('es-ES', opciones);
    return mesEnEspanol.charAt(0).toUpperCase() + mesEnEspanol.slice(1);
}

  getProductosVencidos(): void {
    this.http.get<any[]>('http://localhost:3000/inventario/productos-vencidos').subscribe(
      (data) => {
        const groupedMap = new Map<string, any[]>(); 

        data.forEach(product => {
          const fechaVencimiento = new Date(product.fecha_vencimiento);
          const mes = (fechaVencimiento.getMonth() + 1).toString().padStart(2, '0'); 
          const claveMesAno = `${fechaVencimiento.getFullYear()}-${mes}`; 

          if (!groupedMap.has(claveMesAno)) {
            groupedMap.set(claveMesAno, []);
          }
          groupedMap.get(claveMesAno)!.push(product);
        });

        this.groupedProducts = Object.fromEntries(groupedMap);
        this.calculateTotalDinero();

        console.log('Productos vencidos agrupados por mes y año:', this.groupedProducts);
      },
      (error) => {
        console.error('Error al obtener los productos vencidos:', error);
      }
    );
  
  }
  getTotalTotalPrice(products: any[]): number {
    return products.reduce((acc, product) => {
      return acc + (product.cantidad * product.precio_compra);
    }, 0);
  }

  getProductosProximosAVencer(): void {
    this.http.get<any[]>('http://localhost:3000/inventario/productos-proximos-vencer').subscribe(
      (data) => {
        const groupedMap = new Map<string, any[]>(); 

        data.forEach(product => {
          const fechaVencimiento = new Date(product.fecha_vencimiento);
          const mes = (fechaVencimiento.getMonth() + 1).toString().padStart(2, '0'); 
          const claveMesAno = `${fechaVencimiento.getFullYear()}-${mes}`; 

          if (!groupedMap.has(claveMesAno)) {
            groupedMap.set(claveMesAno, []);
          }
          groupedMap.get(claveMesAno)!.push(product);
        });

        this.groupedProductsProximosAVencer = Object.fromEntries(groupedMap);
        this.calculateTotalDinero2();

        console.log('Productos próximos a vencer agrupados por mes y año:', this.groupedProductsProximosAVencer);
      },
      (error) => {
        console.error('Error al obtener productos próximos a vencer:', error);
      }
    );
  }

  calculateTotalDinero(): void {
    this.totalDinero = Object.values(this.groupedProducts).reduce((total, products) => {
      return total + products.reduce((groupTotal, product) => groupTotal + (product.cantidad * product.precio_compra), 0);
    }, 0);
  }

  calculateTotalDinero2(): void {
    this.totalDinero2 = Object.values(this.groupedProductsProximosAVencer).reduce((total, products) => {
      return total + products.reduce((groupTotal, product) => groupTotal + (product.cantidad * product.precio_compra), 0);
    }, 0);
  }
}
