import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'devolucion-venta',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './devolucion-venta.component.html',
  styleUrl: './devolucion-venta.component.css'
})
export class DevolucionVentaComponent {
  searchTerm: string = '';
  ventas: any[] = [];
  ventasOriginal: any[] = [];
  clientList: any[] = []; 
  selectedVentas: any[] = [];
  products: any[] = [];

  showDeleteConfirmation: boolean = false;
  ventaIndexToDelete: number | null = null;

  productosMarcadosParaEliminar: number[] = [];

  constructor(private http: HttpClient) {}
  
  ngOnInit(): void {
    this.getVentasDetalles();
    this.ventas = []; 
}

onSearch(): void {
  if (this.searchTerm.trim() === '') {
      this.ventas = []; 
      return;
  }

  const searchTermLower = this.searchTerm.trim().toLowerCase();
  this.ventas = this.ventasOriginal.filter(venta => 
      (venta.cliente_cedula?.toString() || '').toLowerCase().includes(searchTermLower)
  );
}

getVentasDetalles(): void {
  this.http.get<any[]>('http://localhost:3000/ventas/venta-detalle-vista').subscribe(
    (data) => {
      if (!data || data.length === 0) {
          console.warn("No se encontraron datos en la API.");
          this.ventasOriginal = [];
          this.ventas = []; 
          return;
      }

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

      console.log("Ventas obtenidas:", ventasAgrupadas); 
      this.ventasOriginal = ventasAgrupadas; 
      this.ventas = []; 
    },
    (error) => {
      console.error('Error al obtener los detalles de las ventas:', error);
      alert(`Error al obtener los detalles de las ventas: ${error.message}`);
    }
  ); 
}

    getClientsList(): void {
      this.http.get<any[]>('http://localhost:3000/contactos/cliente').subscribe(
        (data) => {
          this.clientList = data.map(cliente => ({
            ...cliente,
            cedula: Number(cliente.cedula),
            celular: Number(cliente.celular)
          }));
        },
        (error) => {
          console.error('Error al obtener los clientes:', error);
        }
      );
    }

  getTotalSubTotal(detalles: any[]): number {
    return detalles.reduce((sum, detalle) => sum + detalle.subtotal, 0);
  }

  onSelectVenta(venta: any): void {
    const ventaCopia = JSON.parse(JSON.stringify(venta));
  
    ventaCopia.detalles = ventaCopia.detalles.map((detalle: any) => ({
      ...detalle,
      cantidad_original: detalle.cantidad 
    }));
  
    this.selectedVentas.push(ventaCopia); 
    this.searchTerm = ''; 
    this.ventas = []; 
  
    console.log("Estado de selectedVentas después de agregar:", this.selectedVentas);
  }
  
  incrementQuantity(ventaIndex: number, detalleIndex: number): void {
    const venta = this.selectedVentas[ventaIndex];
    const detalle = venta.detalles[detalleIndex];
  
    console.log("Producto antes de incrementar:", detalle);
  
    if (detalle.cantidad < detalle.cantidad_original) {
        detalle.cantidad += 1;
        detalle.subtotal = detalle.cantidad * detalle.precio_unitario;
  
        console.log("Nueva cantidad después de incrementar:", detalle.cantidad);
    } else {
        console.warn("No se puede incrementar más allá de la cantidad original.");
    }
  }
  
  decrementQuantity(ventaIndex: number, detalleIndex: number): void {
    const venta = this.selectedVentas[ventaIndex];
    const detalle = { ...venta.detalles[detalleIndex] }; 
  
    console.log("Antes de disminuir cantidad:", detalle);
  
    if (detalle.cantidad > 1) {
        detalle.cantidad -= 1;
        detalle.subtotal = detalle.cantidad * detalle.precio_unitario;
  
        this.selectedVentas[ventaIndex].detalles[detalleIndex] = detalle;
  
        this.selectedVentas = [...this.selectedVentas];
    } else {
        console.warn("No se puede reducir más la cantidad.");
    }
  
    console.log("Después de disminuir cantidad:", this.selectedVentas);
  }

  actualizarVenta(ventas: any[]): void {
    if (!ventas || ventas.length === 0) {
      alert("No hay productos para devolver.");
      return;
    }

    const productosEliminados = this.productosMarcadosParaEliminar ?? [];

    const devoluciones = ventas.flatMap(venta =>
      venta.detalles
        .filter((detalle: any) => detalle.cantidad < (detalle.cantidad_original ?? detalle.cantidad))
        .map((detalle: any) => ({
          venta_id: venta.venta_id,
          producto_codigo: detalle.producto_codigo,
          cantidad_devuelta: (detalle.cantidad_original ?? detalle.cantidad) - detalle.cantidad
        }))
    );

    console.log("🔍 Productos eliminados:", productosEliminados);
    console.log("🔍 Datos enviados a la API:", JSON.stringify(devoluciones, null, 2));

    if (productosEliminados.length > 0) {
        productosEliminados.forEach(detalleId => {
            this.http.delete(`http://localhost:3000/api/eliminar-detalle-venta/${detalleId}`).subscribe(
                (response) => {
                    console.log(`✅ Detalle de venta ${detalleId} eliminado correctamente.`);
                },
                (error) => {
                    console.error(`❌ Error al eliminar detalle de venta ${detalleId}:`, error);
                }
            );
        });

        this.productosMarcadosParaEliminar = [];
    }

    if (devoluciones.length > 0) {
        this.http.post(`http://localhost:3000/api/devolucion-venta`, { devoluciones }).subscribe(
            (response) => {
                console.log("✅ Devoluciones registradas exitosamente:", response);
                setTimeout(() => {
                    location.reload();
                }, 500);
            },
            (error) => {
                console.error("❌ Error al registrar devoluciones:", error);
            }
        );
    } else if (productosEliminados.length > 0) {
        setTimeout(() => {
            location.reload();
        }, 500);
    }
}


  
  
  
  













removeFila(ventaIndex: number, detalleIndex: number): void {
  const venta = this.selectedVentas[ventaIndex];

  // Guardar el ID del detalle eliminado para luego enviarlo a la API
  const detalleEliminado = venta.detalles[detalleIndex].id;

  // Almacenar los IDs de los productos a eliminar en la propiedad temporal `productosMarcadosParaEliminar`
  if (!this.productosMarcadosParaEliminar) {
    this.productosMarcadosParaEliminar = [];
  }
  this.productosMarcadosParaEliminar.push(detalleEliminado);

  // Ocultar visualmente eliminando la fila del array
  venta.detalles.splice(detalleIndex, 1);

  // Si ya no hay productos en la venta, eliminar la venta visualmente
  if (venta.detalles.length === 0) {
    this.selectedVentas.splice(ventaIndex, 1);
  }

  console.log("🔍 Productos eliminados temporalmente:", this.productosMarcadosParaEliminar);
}


onDelete(ventaIndex: number): void {
  this.ventaIndexToDelete = ventaIndex;
  this.showDeleteConfirmation = true;
}

closeDeleteConfirmation(): void {
  this.showDeleteConfirmation = false;
  this.ventaIndexToDelete = null;
}

confirmDelete(): void {
  if (this.ventaIndexToDelete !== null && this.ventaIndexToDelete >= 0) {
    const ventaId = this.selectedVentas[this.ventaIndexToDelete].venta_id;

    this.http.delete(`http://localhost:3000/api/eliminar-venta/${ventaId}`).subscribe(
      () => {
        console.log(`Venta con ID ${ventaId} eliminada correctamente`);
        this.selectedVentas.splice(this.ventaIndexToDelete as number, 1); // 🔥 Forzar como número
        this.ventaIndexToDelete = null;
        this.showDeleteConfirmation = false; // Cerrar modal
       // 🔄 Recargar la página después de eliminar
       setTimeout(() => {
        location.reload();
      }, 500); // Pequeño retraso para asegurar la eliminación
      },
      (error) => {
        console.error("Error al eliminar la venta:", error);
        alert("Error al eliminar la venta");
      }
    );
  }
}



}
 