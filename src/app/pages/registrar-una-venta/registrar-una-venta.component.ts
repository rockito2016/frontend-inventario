import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'registrar-una-venta',
  standalone: true,
  imports: [HttpClientModule, CommonModule, FormsModule],
  templateUrl: './registrar-una-venta.component.html',
  styleUrl: './registrar-una-venta.component.css'
})

export class RegistrarUnaVentaComponent {
  searchTerm: string = '';
  products: any[] = [];
  venta: any[] = [];
  units: any[] = [];
  selectedUnit: string = '';
  filteredUnits: any[] = [];
  showAddModal: boolean = false;
  clientList: any[] = [];
  showSearchClientModal: boolean = false;
  filteredClients: any[] = [];
  searchCedula: string = '';
  searchAttempted: boolean = false;
  selectedClient: any = {};
  mostrarModalPago: boolean = false;
  mostrarModalCredito: boolean = false;
  botonActivo: string = 'pago';
  totalRecibido: number = 0;
  MontoRecibido: string = '';
  AbonoInicial: string = '';
  fechaSeleccionada: string | null = null;
  selectedVentaId: number | null = null;
  siguienteVentaId: number | null = null;

  siguienteFacturaId: string = '';

  animaccionActiva: boolean = false;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getProducts();
    this.getUnits();
    this.getClientsList();
    this.botonActivo = 'pago';
    this.getNextVentaId();
    this.getNextFacturaId();
  }

  onSearch(): void {
    this.updateFilteredUnits();

    if (!this.searchTerm) {
      this.selectedUnit = '';
    }
  }

  limitedFilteredProducts() {
    const filtered = this.filteredProducts();

    if (!this.searchTerm) {
      return new Array(3).fill({ codigo: '', proveedor: '', subcategoria: '', nombre: '', formulacion: '', unidad: '', cantidad: '', precio_venta: null });
    }

    if (filtered.length > 0) {
      const resultsToShow = filtered.slice(0, 3);
      while (resultsToShow.length < 3) {
        resultsToShow.push({ codigo: '', proveedor: '', subcategoria: '', nombre: '', formulacion: '', unidad: '', cantidad: '', precio_venta: null });
      }
      return resultsToShow;
    }

    return new Array(3).fill({ noResults: true });
  }

  getProducts(): void {
    this.http.get<any[]>('http://localhost:3000/inventario/ventas-busqueda').subscribe(
      (data) => {
        this.products = data;
        console.log('Productos cargados:', this.products);
        this.updateFilteredUnits();
      },
      (error) => {
        console.error('Error al obtener los productos:', error);
      }
    );
  }

  getUnits(): void {
    this.http.get<any[]>('http://localhost:3000/producto/unidad').subscribe(
      (data) => {
        this.units = data;
      },
      (error) => {
        console.error('Error al obtener las unidades:', error);
      }
    );
  }

  filteredProducts() {
    let filteredProducts = this.products;

    if (this.searchTerm) {
      filteredProducts = filteredProducts.filter(product =>
        product.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.codigo.toString().includes(this.searchTerm)
      );
    }

    if (this.selectedUnit) {
      filteredProducts = filteredProducts.filter(product =>
        product.unidad === this.selectedUnit
      );
    }

    return filteredProducts;
  }

  updateFilteredUnits(): void {
    const filteredProducts = this.filteredProducts();
    const uniqueUnits = new Set(filteredProducts.map(product => product.unidad));
    this.filteredUnits = Array.from(uniqueUnits).map(unit => ({ nombre: unit }));
  }

  onAdd(product: any): void {
    if (!product || !product.codigo || !product.nombre) {
      return;
    }

    const productExists = this.venta.some(item => item.codigo === product.codigo);
    if (!productExists) {
      this.venta.push({
        codigo: product.codigo,
        proveedor_id: product.proveedor_id,
        subcategoria_id: product.subcategoria_id,
        formulacion_id: product.formulacion_id,
        unidad_id: product.unidad_id,
        proveedor: product.proveedor,
        subcategoria: product.subcategoria,
        nombre: product.nombre,
        formulacion: product.formulacion,
        unidad: product.unidad,
        cantidad: 1,
        precio_venta: product.precio_venta,
        subtotal: 1 * product.precio_venta
      });
      console.log("Producto agregado a la venta:", this.venta);
    }
  }

  incrementQuantity(index: number): void {
    const productInStock = this.products.find(
      product => product.codigo === this.venta[index].codigo
    );

    if (productInStock && this.venta[index].cantidad < productInStock.cantidad) {
      this.venta[index].cantidad += 1;
      this.venta[index].subtotal = this.venta[index].cantidad * this.venta[index].precio_venta;
    }
  }

  decrementQuantity(index: number): void {
    if (this.venta[index].cantidad > 1) {
      this.venta[index].cantidad -= 1;
      this.venta[index].subtotal = this.venta[index].cantidad * this.venta[index].precio_venta;
    }
  }

  onRemove(index: number): void {
    this.venta.splice(index, 1);
  }

  getTotalTotalPrice(): number {
    return this.venta.reduce((total, product) => total + product.subtotal, 0);
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

  openSearchClient(): void {
    this.showSearchClientModal = true;
    this.searchCedula = '';
    this.filteredClients = [];
    this.searchAttempted = false;
  }

  onSearchClient(): void {
  }

  limitedFilteredClients() {
    if (this.searchCedula.trim() === '') {
      return new Array(3).fill({ nombre: '', cedula: '', emptyRow: true, showIcon: false });
    }

    const filtered = this.clientList
      .filter(client => client.cedula.toString().includes(this.searchCedula))
      .slice(0, 3);

    if (filtered.length > 0) {
      const resultsToShow = filtered.map(client => ({ ...client, emptyRow: false, showIcon: true }));
      while (resultsToShow.length < 3) {
        resultsToShow.push({ nombre: '', cedula: '', emptyRow: true, showIcon: false });
      }
      return resultsToShow;
    }

    return new Array(3).fill({ noResults: true });
  }

  closeSearchClientModal(): void {
    this.showSearchClientModal = false;
    this.searchCedula = '';
    this.filteredClients = [];
    this.searchAttempted = false;
  }

  createEmptyRows(currentLength: number): any[] {
    const emptyRows = 3 - currentLength;
    return Array(emptyRows > 0 ? emptyRows : 0);
  }

  selectClient(client: any): void {
    this.selectedClient = { ...client };
    console.log('Cliente seleccionado:', this.selectedClient);
    this.closeSearchClientModal();
  }

  onAddCliente(): void {
    this.showAddModal = true;
  }

  onSubmitClientes(userForm: NgForm): void {
    const clienteData = {
      ...userForm.value,
      cedula: Number(userForm.value.cedula),
      celular: Number(userForm.value.celular)
    };

    this.http.post('http://localhost:3000/contactos/cliente-agregar', clienteData)
      .subscribe((response) => {
        console.log('Cliente registrado:', response);
        this.getClientsList();
        this.closeAddModalCliente();
        userForm.reset();
      }, (error) => {
        console.error('Error al registrar cliente:', error);
      });
  }

  closeAddModalCliente(): void {
    this.showAddModal = false;
  }

  toggleModalPago() {
    this.mostrarModalPago = !this.mostrarModalPago;
    this.mostrarModalCredito = false;
  }

  toggleModalCredito() {
    this.mostrarModalCredito = !this.mostrarModalCredito;
    this.mostrarModalPago = false;
  }

  activarBoton(tipo: string) {
    this.botonActivo = tipo;
    this.MontoRecibido = '';
    this.AbonoInicial = '';
  }

  calcularRegreso(): number {
    const numericTotalRecibido = parseFloat(this.MontoRecibido.replace(/[^0-9.]/g, ''));
    return Math.abs(numericTotalRecibido - this.getTotalTotalPrice());
  }

  formatCurrency() {
    let numericValue = this.MontoRecibido ? this.MontoRecibido.replace(/[^0-9]/g, '') : '';
    this.MontoRecibido = numericValue ? `$${Number(numericValue).toLocaleString('en-US')}` : '';
  }

  formatAbonoInicial() {
    let numericValue = this.AbonoInicial ? this.AbonoInicial.replace(/[^0-9]/g, '') : '';
    this.AbonoInicial = numericValue ? `$${Number(numericValue).toLocaleString('en-US')}` : '';
  }

  get totalCredito(): number {
    const numericAbonoInicial = parseFloat(this.AbonoInicial.replace(/[^0-9.]/g, ''));
    return Math.abs(numericAbonoInicial - this.getTotalTotalPrice());
  }

  finalizarVenta(): void {
    const total = this.getTotalTotalPrice();
    const forma_pago_id = this.botonActivo === 'pago' ? 1 : 2;
    const estado_venta_id = this.botonActivo === 'pago' ? 1 : 2;

    if (this.fechaSeleccionada && this.selectedClient.id && this.venta.length > 0) {
      const ventaData: any = {
        fecha: this.fechaSeleccionada,
        cliente_id: this.selectedClient.id,
        total_a_pagar: total,
        forma_pago_id: forma_pago_id,
        estado_venta_id: estado_venta_id,
        productos: this.venta.map(product => ({
          codigo: product.codigo,
          proveedor_id: product.proveedor_id,
          subcategoria_id: product.subcategoria_id,
          formulacion_id: product.formulacion_id,
          unidad_id: product.unidad_id,
          cantidad: product.cantidad,
          precio_venta: product.precio_venta
        }))
      };

      if (forma_pago_id === 2) {
        ventaData.abono_inicial = parseFloat(this.AbonoInicial.replace(/[^0-9.]/g, '')) || 0;
      }

      console.log("Datos completos de venta antes de enviar:", JSON.stringify(ventaData, null, 2));

      this.http.post('http://localhost:3000/ventas/venta-completa', ventaData)
        .subscribe(
          (response) => {
            console.log('Venta completa registrada:', response);
            this.fechaSeleccionada = null;
            this.venta = [];
            this.searchTerm = '';
            this.selectedUnit = '';
            this.botonActivo = 'pago';
            this.selectedClient = {};
            this.MontoRecibido = '';
            this.AbonoInicial = '';
            this.getNextVentaId();
            this.getProducts();
            this.getNextFacturaId();
            this.showAnimation();
          },
          (error) => {
            console.error('Error al registrar venta completa:', error);
          }
        );
    } else {
      alert('Por favor, selecciona una fecha, un cliente, y agrega productos a la venta.');
    }
  }

  showAnimation(): void {
    this.animaccionActiva = true;
    setTimeout(() => {
      this.animaccionActiva = false;
    }, 2000);
  }

  getNextVentaId(): void {
    this.http.get<{ siguienteId: number }>('http://localhost:3000/ventas/ultimo-id')
      .subscribe(
        (response) => {
          this.siguienteVentaId = response.siguienteId;
        },
        (error) => {
          console.error('Error al obtener el próximo ID de venta:', error);
        }
      );
  }

  getNextFacturaId(): void {
    this.http.get<{ factura_actual: string }>('http://localhost:3000/api/factura-actual')
      .subscribe(
        (response) => {
          this.siguienteFacturaId = response.factura_actual;
        },
        (error) => {
          console.error('Error al obtener el próximo ID de factura:', error);
        }
      );
  }
}
