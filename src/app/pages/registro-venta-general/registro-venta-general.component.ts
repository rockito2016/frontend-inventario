import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'registro-venta-general',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './registro-venta-general.component.html',
  styleUrl: './registro-venta-general.component.css'
})
export class RegistroVentaGeneralComponent {
  ventasAgrupadasPorMes: { [key: string]: any[] } = {};
  ventas: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getVentas();
  }
 
  getMesEnEspanol(claveMesAno: string): string {
    const [year, month] = claveMesAno.split('-');
    const fecha = new Date(+year, +month - 1);
    const opciones: Intl.DateTimeFormatOptions = { month: 'long' };
    const mesEnEspanol = fecha.toLocaleDateString('es-ES', opciones);
    return mesEnEspanol.charAt(0).toUpperCase() + mesEnEspanol.slice(1);
  }

  getVentas(): void {
    this.http.get<any[]>('http://localhost:3000/ventas/venta-general-vista').subscribe(
      (data) => {
        const groupedMap = new Map<string, any[]>();
  
        data.forEach(venta => {
          const fecha = new Date(venta.fecha);
          const mesAno = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;
          const dia = fecha.getDate().toString().padStart(2, '0');
  
          if (!groupedMap.has(mesAno)) {
            groupedMap.set(mesAno, []);
          }
  
          const ventasDelDia = groupedMap.get(mesAno)!.find(item => item.fecha === dia);
  
          if (ventasDelDia) {
            if (venta.forma_pago_id === 1) {
              ventasDelDia.efectivoCantidad += 1;
              ventasDelDia.efectivoTotal += venta.total;
            } else if (venta.forma_pago_id === 2) {
              ventasDelDia.creditoCantidad += 1;
              ventasDelDia.creditoTotal += venta.total;
            }
          } else {
            groupedMap.get(mesAno)!.push({
              fecha: dia,
              efectivoCantidad: venta.forma_pago_id === 1 ? 1 : 0,
              efectivoTotal: venta.forma_pago_id === 1 ? venta.total : 0,
              creditoCantidad: venta.forma_pago_id === 2 ? 1 : 0,
              creditoTotal: venta.forma_pago_id === 2 ? venta.total : 0
            });
          }
        });
  
        this.ventasAgrupadasPorMes = Object.fromEntries(groupedMap);
        console.log('Ventas agrupadas por mes y día:', this.ventasAgrupadasPorMes);
      },
      (error) => {
        console.error('Error al obtener las ventas:', error);
      }
    );
  }

  getTotalEfectivo(ventas: any[]): number {
    return ventas.reduce((total, venta) => total + venta.efectivoTotal, 0);
  }
  
  getTotalCredito(ventas: any[]): number {
    return ventas.reduce((total, venta) => total + venta.creditoTotal, 0);
  }

  getTotalCantidadEfectivo(ventas: any[]): number {
    return ventas.reduce((total, venta) => total + venta.efectivoCantidad, 0);
  }
  
  getTotalCantidadCredito(ventas: any[]): number {
    return ventas.reduce((total, venta) => total + venta.creditoCantidad, 0);
  }
} 
