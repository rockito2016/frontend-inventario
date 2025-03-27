import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-balance-diario',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './balance-diario.component.html',
  styleUrl: './balance-diario.component.css'
})
export class BalanceDiarioComponent implements OnInit {
  balance: any[] = [];
  filteredBalance: any[] = [];
  showAddModal: boolean = false;
  detalles: any[] = [];
  cantidadFormateada: string = '';
  nombreMes: string = "";
  fechaActual: Date = new Date(); 

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.obtenerBalance();
    this.obtenerDetalles();
    this.actualizarNombreMes();
  }

  cambiarMes(direccion: number): void {
    this.fechaActual.setMonth(this.fechaActual.getMonth() + direccion);
    this.actualizarNombreMes();
    this.filtrarPorMes(); 
  }

  actualizarNombreMes(): void {
    const opciones: Intl.DateTimeFormatOptions = { month: "long", year: "numeric" };
    let fechaFormateada = this.fechaActual.toLocaleDateString("es-ES", opciones);
    this.nombreMes = fechaFormateada.replace(" de ", " "); 
  }

  obtenerBalance(): void {
    this.http.get<any[]>('http://localhost:3000/balance-diario')
      .subscribe(
        data => {
          this.balance = data;
          this.filtrarPorMes(); 
        },
        error => console.error('Error al obtener los datos del balance:', error)
      );
  }

  filtrarPorMes(): void {
    const mes = this.fechaActual.getMonth() + 1;
    const año = this.fechaActual.getFullYear();

    this.filteredBalance = this.balance.filter(item => {
      const fecha = new Date(item.fecha);
      return fecha.getMonth() + 1 === mes && fecha.getFullYear() === año;
    });
  }

  onAdd(): void {
    this.showAddModal = true; 
  }

  closeAddModal(): void {
    this.showAddModal = false; 
  }

  obtenerDetalles(): void {
    this.http.get<any[]>('http://localhost:3000/api/tipos-detalle')
      .subscribe(
        data => {
          this.detalles = data.filter(item => [5, 6, 7, 8].includes(item.id));
        },
        error => console.error('Error al obtener los detalles:', error)
      );
  }

  onSubmit(form: NgForm): void {
    if (form.valid) {
      const datosEnviar = {
        fecha: form.value.fecha,
        detalle_id: Number(form.value.detalle),
        gastos: Number(form.value.cantidad.replace(/[^0-9]/g, "")) 
      };

      console.log("Datos que se enviarán al backend:", datosEnviar);

      this.http.post('http://localhost:3000/balance-agregar', datosEnviar)
        .subscribe(
          response => {
            console.log("Gasto registrado correctamente:", response);
            this.closeAddModal();
            this.obtenerBalance();
          },
          error => {
            console.error("Error al registrar gasto:", error);
          }
        );
    }
  }

  formatearCantidad(event: any): void {
    let valor = event.target.value.replace(/\D/g, ''); 
    if (valor) {
      this.cantidadFormateada = '$ ' + parseInt(valor, 10).toLocaleString('es-CO');
    } else {
      this.cantidadFormateada = ''; 
    }
  }
}
