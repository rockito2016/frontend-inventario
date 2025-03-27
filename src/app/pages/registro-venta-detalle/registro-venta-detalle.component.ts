import { CommonModule } from '@angular/common'; 
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'registro-venta-detalle',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './registro-venta-detalle.component.html',
  styleUrls: ['./registro-venta-detalle.component.css']
})
export class RegistroVentaDetalleComponent implements OnInit {
  searchTerm: string = '';
  ventas: any[] = [];
  ventasOriginal: any[] = []; 

  constructor(private http: HttpClient) {}
 
  ngOnInit(): void {
    this.getVentasDetalles();
  }

  getVentasDetalles(): void {
    this.http.get<any[]>('http://localhost:3000/ventas/venta-detalle-vista').subscribe(
      (data) => {
        const ventasAgrupadas = data.reduce((acc: any[], venta: any) => {
          const ventaExistente = acc.find((v: any) => v.venta_id === venta.venta_id);
          if (ventaExistente) {
            ventaExistente.detalles.push(venta);
          } else {
            acc.push({
              venta_id: venta.venta_id,
              fecha: venta.fecha,
              cliente: venta.cliente,
              cliente_cedula: venta.cliente_cedula, 
              detalles: [venta]
            });
          }
          return acc;
        }, []);
        this.ventas = ventasAgrupadas;
        this.ventasOriginal = ventasAgrupadas; 
      },
      (error) => {
        console.error('Error al obtener los detalles de las ventas:', error);
        alert(`Error al obtener los detalles de las ventas: ${error.message}`);
      }
    ); 
  }
 
  onSearch(): void {
    if (this.searchTerm.trim() === '') {
      this.ventas = this.ventasOriginal;
    } else {
      const searchTermLower = this.searchTerm.trim();
      this.ventas = this.ventasOriginal.filter(venta => 
        venta.cliente_cedula.includes(searchTermLower)
      );
    }
  }

  getTotalSubTotal(detalles: any[]): number {
    return detalles.reduce((sum, detalle) => sum + detalle.subtotal, 0);
  }
}
