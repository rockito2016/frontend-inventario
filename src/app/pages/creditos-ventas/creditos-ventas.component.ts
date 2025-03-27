import { CommonModule } from '@angular/common'; 
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgForm } from '@angular/forms'; 

@Component({
  selector: 'creditos-ventas',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './creditos-ventas.component.html',
  styleUrls: ['./creditos-ventas.component.css']
})
export class CreditosVentasComponent implements OnInit {
  searchTerm: string = '';
  creditos: any[] = [];
  selectedCredito: any; 
  saldoPendiente: number = 0;
  ultimoIdPorVenta: { [key: number]: { id: number; estado_pago: string } } = {};

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getCreditosVentas();
  }

  onSearch(): void {}

  getCreditosVentas(): void {
    this.http.get<any[]>('http://localhost:3000/creditos/creditos-ventas-vista').subscribe(
      (data) => {
        console.log('Datos recibidos del backend:', data); 
  
        this.creditos = data.map(credito => ({
          ...credito,
          cliente: credito.cliente || 'Desconocido', 
          cedula: credito.cedula || 'N/A', 
          abono_inicial: Number(credito.abono_inicial || 0),
          abono: Number(credito.abono || 0),
          total_abonado: Number(credito.total_abonado || 0),
          total_a_pagar: Number(credito.total_a_pagar || 0),
          saldo_pendiente: Number(credito.saldo_pendiente || 0),
          estado_pago: credito.estado_pago.toLowerCase() 
        }));
  
        console.log('Datos transformados (this.creditos):', this.creditos); 
  
        this.obtenerUltimoIdPorVenta();
      },
      (error) => {
        console.error('Error al obtener los créditos de ventas:', error);
      }
    );
  }

  filteredCreditos() {
    if (!this.searchTerm) {
      return this.creditos;
    }
  
    const searchTerm = this.searchTerm.toLowerCase();
  
    return this.creditos.filter(credito =>
      credito.cliente?.toLowerCase().includes(searchTerm) ||
      credito.cedula?.toString().includes(this.searchTerm)
    );
  }
    
  onEditSubmit(form: NgForm): void {
    this.selectedCredito.abono = 0;

    if (form.valid) {
      this.closeEditModal();
    }
  }

  editCredito(credito: any): void {
    this.selectedCredito = { 
      abono_inicial: credito.abono_inicial || 0,
      abono: 0,  
      total_abonado: credito.total_abonado || 0,
      total_a_pagar: credito.total_a_pagar || 0,
      venta_general: credito.venta_general,
      fecha: credito.fecha,
      cliente_id: credito.cliente_id,
      estado_venta: credito.estado_pago,
      saldo_pendiente: credito.saldo_pendiente || 0,
      ...credito 
    };

    this.selectedCredito.abono = 0;
    this.saldoPendiente = this.calculateSaldoPendiente();
    console.log("Cliente seleccionado:", this.selectedCredito);
  }
 
  closeEditModal() {
    this.selectedCredito = null;
  }

  updateAbono(event: Event): void {
    const input = event.target as HTMLInputElement;

    const numericValue = Number(input.value.replace(/[^0-9]/g, ''));
    this.selectedCredito.abono = numericValue;

    const formattedValue = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(numericValue);
    input.value = formattedValue;

    this.saldoPendiente = this.calculateSaldoPendiente();
    console.log("Valor de abono actualizado:", this.selectedCredito.abono);
    console.log("Saldo pendiente calculado en tiempo real:", this.saldoPendiente);
  }

  calculateSaldoPendiente(): number {
    const abono = this.selectedCredito.abono || 0;
    const totalAbonado = this.selectedCredito.total_abonado || 0;
    const totalAPagar = this.selectedCredito.total_a_pagar || 0;

    const saldoPendiente = totalAPagar - (totalAbonado + abono);

    if (saldoPendiente === 0) {
      this.selectedCredito.estado_pago = 'cancelado';
    } else {
      this.selectedCredito.estado_pago = 'pendiente'; 
    }

    return saldoPendiente;
  }

  formatAbono(): void {
    if (this.selectedCredito && this.selectedCredito.abono != null) {
      const formattedAbono = this.formatCurrency(this.selectedCredito.abono);
      (document.getElementById('abono') as HTMLInputElement).value = formattedAbono;
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  }
    
  actualizarCredito(): void {
    const nuevoCredito = {
      venta_general_id: this.selectedCredito.venta_general,
      fecha: this.selectedCredito.fecha,
      cliente_id: this.selectedCredito.cliente_id,
      abono_inicial: this.selectedCredito.abono_inicial,
      abono: this.selectedCredito.abono,
      total_a_pagar: this.selectedCredito.total_a_pagar

    };

    console.log("Valor de abono:", this.selectedCredito.abono);

    this.http.post('http://localhost:3000/creditos/ventas-agregar', nuevoCredito).subscribe(
      (response) => {
        console.log('Crédito creado exitosamente:', response);
        this.closeEditModal(); 
        this.getCreditosVentas();
      },
      (error) => {
        console.error('Error al crear el crédito:', error);
      }
    );
  }

  // logica del boton de abonar
  obtenerUltimoIdPorVenta(): void {
    this.ultimoIdPorVenta = this.creditos.reduce((acc, credito) => {
      const ventaId = credito.venta_general;
  
      if (!acc[ventaId] || credito.id > acc[ventaId].id) {
        acc[ventaId] = { id: credito.id, estado_pago: credito.estado_pago };
      }
  
      return acc;
    }, {} as { [key: number]: { id: number; estado_pago: string } });
  
    console.log('Últimos IDs por venta (agrupados):', this.ultimoIdPorVenta);
  }
  
  mostrarBoton(credito: any): boolean {
    const ventaInfo = this.ultimoIdPorVenta[credito.venta_general];
  
    return !!ventaInfo && 
           credito.id === ventaInfo.id && 
           ventaInfo.estado_pago !== 'cancelado';
  }
}
