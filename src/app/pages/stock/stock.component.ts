import { Component, OnInit } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
 
@Component({
  selector: 'stock',
  standalone: true,
  imports: [HttpClientModule, CommonModule, FormsModule],
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css'],
})
export class StockComponent implements OnInit {
  products: any[] = [];
  totalProductos: number = 0;
  totalDinero: number = 0;
  searchTerm: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getProducts();
  }

  getProducts(): void {
    this.http.get<any[]>('http://localhost:3000/inventario/stock').subscribe(
      (data) => {
        this.products = data;
        this.calcularTotales();
      },
      (error) => {
        console.error('Error al obtener los productos:', error);
      }
    ); 
  }
 
  calcularTotales(): void {
    this.totalProductos = this.products.length;
    this.totalDinero = Math.round(this.products.reduce((sum, product) => {
      return sum + (product.precio_compra * product.cantidad);
    }, 0));
  }

  onSearch(): void {
  }
 
filteredProducts() {
  if (!this.searchTerm) {
    return this.products; 
  }

  return this.products.filter(product =>
    product.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
    product.codigo.toString().includes(this.searchTerm)
  );
}

}
