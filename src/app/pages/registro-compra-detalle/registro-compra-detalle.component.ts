import { CommonModule } from '@angular/common'; 
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'registro-compra-detalle',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './registro-compra-detalle.component.html',
  styleUrls: ['./registro-compra-detalle.component.css']
})
export class RegistroCompraDetalleComponent implements OnInit {
  searchTerm: string = '';
  compras: any[] = [];
  comprasOriginal: any[] = []; 

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getComprasDetalles();
  }

  getComprasDetalles(): void {
    this.http.get<any[]>('http://localhost:3000/compras/compra-detalle-vista').subscribe(
      (data) => {
        const comprasAgrupadas = data.reduce((acc: any[], compra: any) => {
          const compraExistente = acc.find((c: any) => c.compra_id === compra.compra_id);
          if (compraExistente) {
            compraExistente.detalles.push(compra);
          } else {
            acc.push({
              compra_id: compra.compra_id,
              fecha: compra.fecha,
              proveedor: compra.proveedor,
              proveedor_nit: compra.proveedor_nit, 
              detalles: [compra]
            });
          }
          return acc;
        }, []);
        this.compras = comprasAgrupadas;
        this.comprasOriginal = comprasAgrupadas; 
      },
      (error) => {
        console.error('Error al obtener los detalles de las compras:', error);
        alert(`Error al obtener los detalles de las compras: ${error.message}`);
      }
    ); 
  }
 
  onSearch(): void {
    if (this.searchTerm.trim() === '') {
      this.compras = this.comprasOriginal;
    } else {
      const searchTermLower = this.searchTerm.trim();
      this.compras = this.comprasOriginal.filter(compra => 
        compra.proveedor_nit.includes(searchTermLower)
      );
    }
  }

  getTotalSubTotal(detalles: any[]): number {
    return detalles.reduce((sum, detalle) => sum + detalle.subtotal, 0);
  }
}
