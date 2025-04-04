import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'creditos-compras',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './creditos-compras.component.html',
  styleUrls: ['./creditos-compras.component.css']
})
export class CreditosComprasComponent implements OnInit {
  searchTerm: string = '';
  creditos: any[] = [];
  selectedCredito: any;
  saldoPendiente: number = 0;
  ultimoIdPorCompra: { [key: number]: { id: number; estado_pago: string } } = {};

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getCreditosCompras();
  }

  onSearch(): void { }

  getCreditosCompras(): void {
    this.http.get<any[]>('http://localhost:3000/creditos/creditos-compras-vista').subscribe(
      (data) => {
        console.log('Datos recibidos del backend:', data);

        this.creditos = data.map(credito => ({
          ...credito,
          proveedor: credito.proveedor || 'Desconocido',
          abono_inicial: Number(credito.abono_inicial || 0),
          abono: Number(credito.abono || 0),
          total_abonado: Number(credito.total_abonado || 0),
          total_a_pagar: Number(credito.total_a_pagar || 0),
          saldo_pendiente: Number(credito.saldo_pendiente || 0),
          estado_pago: credito.estado_pago?.toLowerCase()
        }));

        console.log('Datos transformados (this.creditos):', this.creditos);

        this.obtenerUltimoIdPorCompra();
      },
      (error) => {
        console.error('Error al obtener los créditos de compras:', error);
      }
    );
  }

  filteredCreditos() {
    if (!this.searchTerm) {
      return this.creditos;
    }

    const searchTerm = this.searchTerm.toLowerCase();

    return this.creditos.filter(credito =>
      credito.proveedor?.toLowerCase().includes(searchTerm) ||
      credito.nit?.toLowerCase().includes(searchTerm)
    );
  }


  obtenerUltimoIdPorCompra(): void {
    this.ultimoIdPorCompra = this.creditos.reduce((acc, credito) => {
      if (!acc[credito.compra_general_id] || acc[credito.compra_general_id].id < credito.id) {
        acc[credito.compra_general_id] = { id: credito.id, estado_pago: credito.estado_pago };
      }
      return acc;
    }, {});
  }

  esUltimoCredito(credito: any): boolean {
    return this.ultimoIdPorCompra[credito.compra_general_id]?.id === credito.id;
  }

  closeEditModal() {
    this.selectedCredito = null;
  }

  mostrarBoton(credito: any): boolean {
    const compraInfo = this.ultimoIdPorCompra[credito.compra_general_id];

    return !!compraInfo &&
      credito.id === compraInfo.id &&
      compraInfo.estado_pago !== 'cancelado';
  }

  editCredito(credito: any): void {
    this.selectedCredito = {
      abono_inicial: credito.abono_inicial || 0,
      abono: 0,
      total_abonado: credito.total_abonado || 0,
      total_a_pagar: credito.total_a_pagar || 0,
      compra_general_id: credito.compra_general_id,
      fecha: credito.fecha,
      proveedor_id: credito.proveedor_id,
      estado_pago: credito.estado_pago,
      saldo_pendiente: credito.saldo_pendiente || 0,
      ...credito
    };

    this.selectedCredito.abono = 0;
    this.saldoPendiente = this.calculateSaldoPendiente();
    console.log("Proveedor seleccionado:", this.selectedCredito);
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
      (document.getElementById('abonoCompra') as HTMLInputElement).value = formattedAbono;
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value).replace('US$', '$');
  }


  onEditSubmit(form: NgForm): void {
    if (form.valid) {
      console.log('Formulario válido. Datos del crédito de compra:', this.selectedCredito);
      this.actualizarCredito();
      this.closeEditModal();
    } else {
      console.warn('El formulario no es válido. Por favor, verifica los datos ingresados.');
    }
  }

  actualizarCredito(): void {
    const nuevoCredito = {
      compra_general_id: this.selectedCredito.compra_general_id,
      fecha: this.selectedCredito.fecha,
      proveedor_id: this.selectedCredito.proveedor_id,
      abono_inicial: this.selectedCredito.abono_inicial,
      abono: this.selectedCredito.abono,
      total_a_pagar: this.selectedCredito.total_a_pagar
    };

    console.log("Valor de abono:", this.selectedCredito.abono);


    this.http.post('http://localhost:3000/compras/creditos/agregar', nuevoCredito).subscribe(
      (response) => {
        console.log('Crédito de compra creado exitosamente:', response);
        this.closeEditModal();
        this.getCreditosCompras();
      },
      (error) => {
        console.error('Error al crear el crédito de compra:', error);
      }
    );
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
}
