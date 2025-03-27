import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'registrar-compra',
  standalone: true,
  imports: [CommonModule,FormsModule, HttpClientModule],
  templateUrl: './registrar-compra.component.html',
  styleUrl: './registrar-compra.component.css',
})
export class RegistrarCompraComponent implements OnInit {
  envioData: any = null;
  pedidos: any[] = [];
  transportadorNombre: string = ''; 
  envio = {
    id: null,
    transportador_id: null,
    kilos: null,
    precio_kilo: null,
    total_cajas: null
  };

  private proveedoresMap: { [key: string]: number } = {};
  private formulacionesMap: { [key: string]: number } = {};
  private subcategoriasMap: { [key: string]: number } = {};
  private unidadesMap: { [key: string]: number } = {};
  isProcessing: boolean = false; 

  constructor(private http: HttpClient) {} 
  
  ngOnInit(): void {
    const enviosGuardados = localStorage.getItem('envioFinalizado');
    const parsedEnvios = enviosGuardados ? JSON.parse(enviosGuardados) : [];
  
    this.envioData = Array.isArray(parsedEnvios) ? parsedEnvios : [parsedEnvios];
  
    if (!this.envioData || this.envioData.length === 0) {
      console.error('No se encontraron datos de envío en el Local Storage.');
      return;
    }
  
    console.log('Datos de envíos recibidos en RegistrarCompraComponent:', this.envioData);
  
    this.loadProveedores();
    this.loadFormulaciones();
    this.loadSubcategorias();
    this.loadUnidades();
  
    const primerEnvio = this.envioData[0]; 
    this.envio = {
      id: primerEnvio.id,
      transportador_id: primerEnvio.transportador_id || null,
      kilos: primerEnvio.kilos || null,
      precio_kilo: primerEnvio.precio_kilo || null,
      total_cajas: primerEnvio.total_cajas || null,
    };
  
    if (this.envio.transportador_id) {
      this.getTransportadorNombre(this.envio.transportador_id, this.envio);
    }
  }

  private loadProveedores(): void {
    this.http.get<any[]>('http://localhost:3000/contactos/proveedores').subscribe({
      next: (proveedores) => {
        this.proveedoresMap = proveedores.reduce((map, proveedor) => {
          map[proveedor.nombre] = proveedor.id;
          return map;
        }, {} as { [key: string]: number });
  
          this.syncEnvioDataWithProveedores();
      },
      error: (error) => {
        console.error('Error al cargar los proveedores:', error);
      },
    });
  }
  
  private syncEnvioDataWithProveedores(): void {
    this.envioData.forEach((envio: any) => {
      envio.pedidos.forEach((pedido: any) => {
        pedido.proveedor_id = this.proveedoresMap[pedido.proveedor] || null;
      });
    });
    }
  
  private loadFormulaciones(): void {
    this.http.get<any[]>('http://localhost:3000/producto/formulacion').subscribe({
      next: (formulaciones) => {
        this.formulacionesMap = formulaciones.reduce((map, formulacion) => {
          map[formulacion.nombre] = formulacion.id;
          return map;
        }, {} as { [key: string]: number });
  
        this.syncProductosWithFormulaciones();
      },
      error: (error) => {
        console.error('Error al cargar las formulaciones:', error);
      },
    });
  }
  
  private syncProductosWithFormulaciones(): void {
    this.envioData.forEach((envio: any) => {
      envio.pedidos.forEach((pedido: any) => {
        pedido.productos.forEach((producto: any) => {
          producto.formulacion_id = this.formulacionesMap[producto.formulacion] || null;
        });
      });
    });
  }

  private loadSubcategorias(): void {
    this.http.get<any[]>('http://localhost:3000/producto/subcategoria').subscribe({
      next: (subcategorias) => {
        this.subcategoriasMap = subcategorias.reduce((map, subcategoria) => {
          map[subcategoria.subcategoria_nombre] = subcategoria.id;
          return map;
        }, {} as { [key: string]: number });
  
          this.syncProductosWithSubcategorias();
      },
      error: (error) => {
        console.error('Error al cargar las subcategorías:', error);
      },
    });
  }
  
  private syncProductosWithSubcategorias(): void {
    this.envioData.forEach((envio: any) => {
      envio.pedidos.forEach((pedido: any) => {
        pedido.productos.forEach((producto: any) => {
          producto.subcategoria_id = this.subcategoriasMap[producto.subcategoria] || null;
        });
      });
    });
    }
  
  private loadUnidades(): void {
    this.http.get<any[]>('http://localhost:3000/producto/unidad').subscribe({
      next: (unidades) => {
        this.unidadesMap = unidades.reduce((map, unidad) => {
          map[unidad.nombre] = unidad.id;
          return map;
        }, {} as { [key: string]: number });
        this.syncProductosWithUnidades();
      },
      error: (error) => {
        console.error('Error al cargar las unidades:', error);
      },
    });
  }

  private syncProductosWithUnidades(): void {
    this.envioData.forEach((envio: any) => {
      envio.pedidos.forEach((pedido: any) => {
        pedido.productos.forEach((producto: any) => {
          producto.unidad_id = this.unidadesMap[producto.unidad] || null;
        });
      });
    });
  }
  
  getTransportadorNombre(id: string, envio: any): void {
    this.http.get<{ nombre: string }>(`http://localhost:3000/api/transportador/${id}`).subscribe({
      next: (response) => {
        envio.transportadorNombre = response.nombre; 
      },
      error: (err) => {
        console.error('Error al obtener el transportador:', err);
        envio.transportadorNombre = 'Desconocido'; 
      },
    });
  }

registrarCompra(envio: any): void {
  console.log('Método registrarCompra ejecutado');

  if (this.isProcessing) {
    console.warn('Ya se está procesando un registro. Por favor, espera.');
    return;
  }

  this.isProcessing = true;

  if (!envio || !envio.pedidos || envio.pedidos.length === 0) {
    console.error('No hay datos de envío disponibles para registrar.');
    alert('No hay datos de envío disponibles.');
    return;
  }

  const datosParaEnviar = {
    envio_id: envio.id || null, 
    transportador_id: envio.transportador_id,
    kilos: envio.kilos,
    precio_kilo: envio.precio_kilo,
    total_cajas: envio.total_cajas,
    proveedores: envio.pedidos.map((pedido: any) => ({
      proveedor_id: pedido.proveedor_id,
      fecha: pedido.fecha,
      forma_pago_id: parseInt(pedido.formaPago, 10) || null,
      abono_inicial: pedido.abonoInicial || 0,
      total_a_pagar: pedido.total || 0,
      productos: pedido.productos.map((producto: any) => ({
        producto_codigo: producto.codigo,
        subcategoria_id: producto.subcategoria_id,
        formulacion_id: producto.formulacion_id,
        unidad_id: producto.unidad_id,
        cantidad: producto.cantidad,
        precio_unitario: producto.precioCompra,
      })),
    })),
  };

  console.log('Datos para enviar (antes del POST):', JSON.stringify(datosParaEnviar, null, 2));

  const compraCompletaUrl = 'http://localhost:3000/compras/compra-completa';

  this.http.post(compraCompletaUrl, datosParaEnviar).subscribe({
    next: (response) => {
      console.log('Envío y compras registradas con éxito:', response);
      this.envioData = this.envioData.filter((e: any) => e.id !== envio.id);
      localStorage.setItem('envioFinalizado', JSON.stringify(this.envioData));
    },
    error: (error) => {
      console.error('Error al registrar el envío y las compras:', error);
      alert('Error al registrar el envío y las compras.');
    },
    complete: () => {
      this.isProcessing = false; 
    },
  }); 
}
}
