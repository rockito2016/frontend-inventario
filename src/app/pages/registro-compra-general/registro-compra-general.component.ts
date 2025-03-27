import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'registro-compra-general',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './registro-compra-general.component.html',
  styleUrl: './registro-compra-general.component.css'
})
export class RegistroCompraGeneralComponent {

  comprasAgrupadasPorMes: { [key: string]: any[] } = {};
  compras: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getCompras();

  }

  getMesEnEspanol(claveMesAno: string): string {
    const [year, month] = claveMesAno.split('-');
    const fecha = new Date(+year, +month - 1); 
    const opciones: Intl.DateTimeFormatOptions = { month: 'long' };
    const mesEnEspanol = fecha.toLocaleDateString('es-ES', opciones);
    return mesEnEspanol.charAt(0).toUpperCase() + mesEnEspanol.slice(1);
  }

  compareMesesDesc(a: { key: string }, b: { key: string }): number {
    const [yearA, monthA] = a.key.split('-').map(part => parseInt(part, 10));
    const [yearB, monthB] = b.key.split('-').map(part => parseInt(part, 10));
  
    const fechaA = new Date(yearA, monthA - 1); 
    const fechaB = new Date(yearB, monthB - 1);
  
    return fechaB.getTime() - fechaA.getTime(); 
  }
  
  getCompras(): void {
    this.http.get<any[]>('http://localhost:3000/compras/compra-general-vista').subscribe(
      (data) => {
        const groupedMap = new Map<string, any[]>();
  
        data.forEach(compra => {
          const fecha = new Date(compra.fecha);
          const mesAno = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}`;
          const dia = fecha.getDate().toString().padStart(2, '0');
  
          if (!groupedMap.has(mesAno)) {
            groupedMap.set(mesAno, []);
          }
  
          const comprasDelDia = groupedMap.get(mesAno)!.find(item => item.fecha === dia);
  
          if (comprasDelDia) {
            if (compra.forma_pago_id === 1) {
              comprasDelDia.efectivoCantidad += 1;
              comprasDelDia.efectivoTotal += compra.total;
            } else if (compra.forma_pago_id === 2) {
              comprasDelDia.creditoCantidad += 1;
              comprasDelDia.creditoTotal += compra.total;
            }
          } else {
            groupedMap.get(mesAno)!.push({
              fecha: dia,
              efectivoCantidad: compra.forma_pago_id === 1 ? 1 : 0,
              efectivoTotal: compra.forma_pago_id === 1 ? compra.total : 0,
              creditoCantidad: compra.forma_pago_id === 2 ? 1 : 0,
              creditoTotal: compra.forma_pago_id === 2 ? compra.total : 0
            });
          }
        });
  
        const orderedMap = Array.from(groupedMap.entries()).reduce<{ [key: string]: any[] }>((acc, [key, value]) => {
          acc[key] = value.sort((a, b) => parseInt(b.fecha, 10) - parseInt(a.fecha, 10)); 
          return acc;
        }, {});
  
        this.comprasAgrupadasPorMes = orderedMap;
        console.log('Compras agrupadas por mes y día:', this.comprasAgrupadasPorMes);
      },
      (error) => {
        console.error('Error al obtener las compras:', error);
      }
    );
  }

  getTotalEfectivo(compras: any[]): number {
    return compras.reduce((total, compra) => total + compra.efectivoTotal, 0);
  }
  
  getTotalCredito(compras: any[]): number {
    return compras.reduce((total, compra) => total + compra.creditoTotal, 0);
  }
  
  getTotalCantidadEfectivo(compras: any[]): number {
    return compras.reduce((total, compra) => total + compra.efectivoCantidad, 0);
  }
  
  getTotalCantidadCredito(compras: any[]): number {
    return compras.reduce((total, compra) => total + compra.creditoCantidad, 0);
  }
}
 