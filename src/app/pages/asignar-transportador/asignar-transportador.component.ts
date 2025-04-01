import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'asignar-transportador',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './asignar-transportador.component.html',
  styleUrl: './asignar-transportador.component.css'
})

export class AsignarTransportadorComponent {
  transportadoresList: any[] = [];
  selectedTransportador: number | null = null;
  siguienteEnvioId: number | null = null;
  pedido: any;
  pedidos: any[] = [];
  pedidosAsignados: any[] = [];
  envio = {
    envioNumero: '',
    kilos: null as number | null,
    precioKilo: null as number | null,
    totalCajas: null as number | null,
    totalEnvio: 0,
  };
  cajaPrice: number = 0;

  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
    this.getTransportadores();
    this.getNextEnvioId();

    const storedEnvios = localStorage.getItem('envioFinalizado');
    const enviosPrevios = storedEnvios ? JSON.parse(storedEnvios) : [];
    console.log('Envíos previos recuperados desde Local Storage:', enviosPrevios);

    const storedEnvio = localStorage.getItem('envio');
    this.envio = storedEnvio
      ? JSON.parse(storedEnvio)
      : { kilos: null, precioKilo: null, totalCajas: null, totalEnvio: 0 };

    if (this.envio.kilos !== null) {
      this.envio.kilos = Number(this.envio.kilos);
    }
    if (this.envio.precioKilo !== null) {
      this.envio.precioKilo = Number(this.envio.precioKilo);
    }
    if (this.envio.totalCajas !== null) {
      this.envio.totalCajas = Number(this.envio.totalCajas);
    }

    const storedTransportador = localStorage.getItem('selectedTransportador');
    this.selectedTransportador = storedTransportador ? JSON.parse(storedTransportador) : null;

    const storedPedidos = localStorage.getItem('pedidos');
    this.pedidos = storedPedidos ? JSON.parse(storedPedidos) : [];

    const storedPedidosAsignados = localStorage.getItem('pedidosAsignados');
    this.pedidosAsignados = storedPedidosAsignados ? JSON.parse(storedPedidosAsignados) : [];

    if (this.pedidos.length > 0) {
      this.pedidos = this.pedidos.map((pedido) => {
        if (typeof pedido.abonoInicial === 'string') {
          pedido.abonoInicial = Number(pedido.abonoInicial.replace(/[^0-9]/g, ''));
        }
        return pedido;
      });
      console.log('Pedidos activos recibidos y procesados:', this.pedidos);
    }

    if (this.pedidosAsignados.length > 0) {
      this.pedidosAsignados = this.pedidosAsignados.map((pedido) => {
        if (typeof pedido.abonoInicial === 'string') {
          pedido.abonoInicial = Number(pedido.abonoInicial.replace(/[^0-9]/g, ''));
        }
        return pedido;
      });
      console.log('Pedidos asignados recibidos y procesados:', this.pedidosAsignados);
    }

    if (this.pedidos.length === 0 && this.pedidosAsignados.length === 0) {
      console.log('No hay pedidos activos ni asignados en el Local Storage.');
    }

    this.applyFormatToEnvio();
  }

  // Obtiene los transportadores desde el back
  getTransportadores(): void {
    const url = 'http://localhost:3000/api/transportadores';

    this.http.get<any[]>(url).subscribe(
      (data) => {
        this.transportadoresList = data;
      },
      (error) => {
        console.error('Error al obtener los transportadores:', error);
      }
    );
  }

  onTransportadorChange(transportadorId: number): void {
    if (!transportadorId) {
      console.error('Transportador seleccionado no válido:', transportadorId);
      return;
    }

    localStorage.setItem('selectedTransportador', JSON.stringify(transportadorId));

    console.log('Transportador seleccionado guardado en Local Storage:', transportadorId);
  }

  // Obtiene el id del siguiente envio
  getNextEnvioId(): void {
    this.http.get<{ siguienteId: number }>('http://localhost:3000/envios/ultimo-id')
      .subscribe(
        (response) => {
          this.siguienteEnvioId = response.siguienteId;

          this.envio.envioNumero = this.siguienteEnvioId.toString();
        },
        (error) => {
          console.error('Error al obtener el próximo ID de envío:', error);
        }
      );
  }

  updateKilos(event: Event): void {
    const input = event.target as HTMLInputElement;

    const numericValue = Number(input.value.replace(/[^0-9]/g, ''));

    this.envio.kilos = numericValue;

    const formattedValue = new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numericValue);

    input.value = formattedValue;

    localStorage.setItem('envio', JSON.stringify(this.envio));

    console.log("Valor de kilos actualizado y guardado en Local Storage:", this.envio.kilos);
  }

  updatePrecioKilo(event: Event): void {
    const input = event.target as HTMLInputElement;

    const numericValue = Number(input.value.replace(/[^0-9]/g, ''));

    this.envio.precioKilo = numericValue;

    localStorage.setItem('envio', JSON.stringify(this.envio));

  }

  formatPrecioKilo(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (this.envio.precioKilo !== null) {
      const formattedValue = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
      }).format(this.envio.precioKilo);

      input.value = formattedValue;

      console.log("Formato aplicado al Precio Kilo:", formattedValue);
    }
  }

  applyFormatToEnvio(): void {
    if (this.envio.precioKilo !== null) {
      const formattedValue = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
      }).format(this.envio.precioKilo);

    }
  }

  updateTotalCajas(event: Event): void {
    const input = event.target as HTMLInputElement;

    const numericValue = Number(input.value.replace(/[^0-9]/g, ''));

    this.envio.totalCajas = numericValue;

    localStorage.setItem('envio', JSON.stringify(this.envio));

    console.log("Valor de Total Cajas actualizado y guardado en Local Storage:", this.envio.totalCajas);

    const formattedValue = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(numericValue);

    input.value = formattedValue;

    console.log("Formato aplicado al Total Cajas:", formattedValue);
  }

  getTotalKilos(): number {
    const kilos = this.envio.kilos || 0;
    const precioKilo = this.envio.precioKilo || 0;

    return kilos * precioKilo;
  }

  getTotalEnvio(): number {
    const totalKilos = (this.envio.kilos || 0) * (this.envio.precioKilo || 0);
    const totalCajas = this.envio.totalCajas || 0;

    return totalKilos + totalCajas;
  }

  // Devuelve el pedido a realizar pedido
  clearPedido(pedidoSeleccionado: any): void {
    this.pedidos = this.pedidos.filter(pedido => pedido !== pedidoSeleccionado);

    localStorage.setItem('pedidos', JSON.stringify(this.pedidos));

    const returnedPedidos = JSON.parse(localStorage.getItem('returnedPedidos') || '[]');

    returnedPedidos.push(pedidoSeleccionado);
    localStorage.setItem('returnedPedidos', JSON.stringify(returnedPedidos));

    console.log(`Pedido eliminado y devuelto al componente anterior:`, pedidoSeleccionado);
  }

  // Método para asignar un pedido al envío
  asignarPedido(pedidoSeleccionado: any): void {
    if (!pedidoSeleccionado) {
      console.error('Pedido seleccionado no válido:', pedidoSeleccionado);
      return;
    }

    const index = this.pedidos.findIndex(pedido => pedido === pedidoSeleccionado);
    if (index === -1) {
      console.error('El pedido seleccionado no se encuentra en la lista de pedidos:', pedidoSeleccionado);
      return;
    }

    this.pedidosAsignados.push(pedidoSeleccionado);

    this.pedidos.splice(index, 1);

    localStorage.setItem('pedidos', JSON.stringify(this.pedidos));
    localStorage.setItem('pedidosAsignados', JSON.stringify(this.pedidosAsignados));

    console.log('Pedido asignado correctamente:', pedidoSeleccionado);
    console.log('Pedidos restantes:', this.pedidos);
    console.log('Pedidos asignados:', this.pedidosAsignados);
  }

  // Método para devolver el pedido al array de pedidos
  devolverPedido(pedidoSeleccionado: any): void {
    if (!pedidoSeleccionado) {
      console.error('Pedido seleccionado no válido:', pedidoSeleccionado);
      return;
    }

    this.pedidos.push(pedidoSeleccionado);

    this.pedidosAsignados = this.pedidosAsignados.filter(
      pedido => pedido !== pedidoSeleccionado
    );

    localStorage.setItem('pedidos', JSON.stringify(this.pedidos));
    localStorage.setItem('pedidosAsignados', JSON.stringify(this.pedidosAsignados));

    console.log('Pedido devuelto:', pedidoSeleccionado);
    console.log('Pedidos actualizados:', this.pedidos);
    console.log('Pedidos asignados actualizados:', this.pedidosAsignados);
  }

  cerrarEnvio(): void {
    if (this.pedidosAsignados.length === 0) {
      console.warn('No hay pedidos asignados para enviar.');
      return;
    }

    const selectedTransportador = localStorage.getItem('selectedTransportador');
    const transportadorId = selectedTransportador ? JSON.parse(selectedTransportador) : null;

    if (!transportadorId) {
      console.error('No se ha seleccionado un transportador.');
      return;
    }

    const envioData = localStorage.getItem('envio');
    const envio = envioData ? JSON.parse(envioData) : {};

    const kilos = envio.kilos || null;
    const precioKilo = envio.precioKilo || null;
    const totalCajas = envio.totalCajas || null;

    if (!kilos || !precioKilo || !totalCajas) {
      console.error('Faltan datos por ingresar.');
      return;
    }

    const data = {
      transportador_id: transportadorId,
      kilos: kilos,
      total_kilos: this.getTotalKilos(),
      precio_kilo: precioKilo,
      total_cajas: totalCajas,
      total_envio: this.getTotalEnvio(),
      pedidos: this.pedidosAsignados || []
    };

    const url = 'http://localhost:3000/pedido/envios-agregar';

    this.http.post(url, data).subscribe({
      next: (response: any) => {
        console.log('Envío registrado correctamente:', response);

        const envioFinalizado = {
          ...data,
          id: response.id
        };

        const enviosGuardados = localStorage.getItem('envioFinalizado');
        const enviosPrevios = enviosGuardados ? JSON.parse(enviosGuardados) : [];

        const nuevosEnvios = Array.isArray(enviosPrevios)
          ? [...enviosPrevios, envioFinalizado]
          : [envioFinalizado];

        localStorage.setItem('envioFinalizado', JSON.stringify(nuevosEnvios));

        this.pedidosAsignados = [];
        localStorage.removeItem('pedidosAsignados');

        this.envio = {
          envioNumero: this.envio.envioNumero,
          kilos: null,
          precioKilo: null,
          totalCajas: null,
          totalEnvio: 0
        };

        this.selectedTransportador = null;
        localStorage.removeItem('selectedTransportador');
        localStorage.removeItem('envio');

        console.log('Valores reseteados correctamente.');

        this.getNextEnvioId();
      },
      error: (error) => {
        console.error('Error al registrar el envío:', error);
      }
    });
  }
}
