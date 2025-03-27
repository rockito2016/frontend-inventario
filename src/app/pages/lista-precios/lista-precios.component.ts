import { Component, OnInit } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'lista-precios',
  standalone: true,
  imports: [HttpClientModule, CommonModule, FormsModule],
  templateUrl: './lista-precios.component.html',
  styleUrls: ['./lista-precios.component.css']
})
export class ListaPreciosComponent implements OnInit {
  productsList: any[] = [];
  searchTerm: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getProductsList();
  }
 
  getProductsList(): void {
    this.http.get<any[]>('http://localhost:3000/inventario/lista-precios').subscribe(
      (data) => {
        this.productsList = data;
      },
      (error) => {
        console.error('Error al obtener los productos:', error);
      }
    );
  }

  onSearch(): void {
  }

filteredProducts() {
  if (!this.searchTerm) {
    return this.productsList; 
  }

  return this.productsList.filter(product =>
    product.nombre_producto.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
    product.codigo.toString().includes(this.searchTerm)
  );
}

}
