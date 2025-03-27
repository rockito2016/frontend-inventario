import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import 'jspdf-autotable';


@Component({
  selector: 'realizar-pedido',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './realizar-pedido.component.html',
  styleUrls: ['./realizar-pedido.component.css'],
})

export class RealizarPedidoComponent implements OnInit {
  searchTerm: string = '';
  selectedUnit: string = '';
  selectedProducts: any[] = [];
  filteredUnits: any[] = [];
  products: any[] = [];
  units: any[] = [];
  groupedSuppliers: { [key: string]: any[] } = {};
  compraId: number | string = '';
  siguienteCompraId: number | null = null; 
  facturaNumero: string = '';
  formasPagoList: any[] = [];
  selectedFormaPago: number | null = null; 
  selectedDate: string | null = null;
  abonoInicial: string = ''; 
  compraIdsBySupplier: { [key: string]: number } = {};
  isAbonoInicialEnabled: boolean = false; 
  supplierData: { [key: string]: any } = {};
  groupedSuppliersArray: { key: string; value: any[] }[] = [];

  private proveedoresMap: { [key: string]: number } = {};


  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    this.initializeSelectedProducts();
    this.loadInitialData();
    this.getNextCompraId();
    this.getFormasPagoList();

    this.loadProveedores();


    const storedSupplierData = JSON.parse(localStorage.getItem('supplierData') || '{}');
    const returnedPedidos = JSON.parse(localStorage.getItem('returnedPedidos') || '[]'); 
    this.supplierData = {}; 

    if (returnedPedidos.length > 0) {
        returnedPedidos.forEach((pedido: any) => {
            pedido.productos.forEach((producto: any) => {
                this.selectedProducts.push({
                    ...producto, 
                    precio_compra: producto.precioCompra || 0, 
                    nombre_producto: producto.nombre || 'Producto sin nombre', 
                    proveedor: pedido.proveedor, 
                });
            });

            this.supplierData[pedido.proveedor] = {
                facturaNumero: pedido.facturaNumero || '',
                fecha: pedido.fecha || '',
                formaPago: pedido.formaPago || '',
                abonoInicial: pedido.abonoInicial || '',
            };
        });

        localStorage.removeItem('returnedPedidos');
    }

    Object.keys(storedSupplierData).forEach((key) => {
        if (!this.supplierData[key]) {
            this.supplierData[key] = storedSupplierData[key];
        }
    });

    this.groupedSuppliers = this.getGroupedBySupplier();
  this.groupedSuppliersArray = Object.entries(this.groupedSuppliers).map(([key, value]) => ({
    key,
    value,
  }));

    Object.keys(this.supplierData).forEach((key) => {
        if (!this.groupedSuppliers[key]) {
            delete this.supplierData[key];
        }
    });

    if (this.siguienteCompraId) {
        this.compraIdsBySupplier = this.assignCompraIdsToSuppliers(this.siguienteCompraId);
    } else {
        this.compraIdsBySupplier = {}; 
    }

    this.initializeSupplierData();
    this.updateLocalStorage();
  }

  private loadProveedores(): void {
    this.http.get<any[]>('http://localhost:3000/contactos/proveedores').subscribe({
      next: (proveedores) => {
        this.proveedoresMap = proveedores.reduce((map, proveedor) => {
          map[proveedor.nombre] = proveedor.id;
          return map;
        }, {} as { [key: string]: number });
  
        console.log('Proveedores cargados:', this.proveedoresMap);
  
        this.initializeSupplierData();
      },
      error: (error) => {
        console.error('Error al cargar los proveedores:', error);
      },
    });
  }  

  private initializeSupplierData(): void {
    const orderedSuppliers = Object.keys(this.groupedSuppliers);
  
    const newSupplierData: { [key: string]: any } = {};
  
    orderedSuppliers.forEach((supplier) => {
      const proveedorId = this.proveedoresMap[supplier] || null;
  
      if (!this.supplierData[supplier]) {
        newSupplierData[supplier] = {
          id: proveedorId, 
          facturaNumero: '',
          fecha: null,
          formaPago: null,
          abonoInicial: '',
        };
      } else {
        newSupplierData[supplier] = {
          ...this.supplierData[supplier],
          id: proveedorId, 
        };
      }
    });
  
    this.supplierData = newSupplierData;
  
    console.log('Datos inicializados para los proveedores:', this.supplierData);
  }
  
  private initializeSelectedProducts(): void {
    const products = localStorage.getItem('selectedProducts');
    this.selectedProducts = products
      ? JSON.parse(products).map((product: any) => ({
          ...product,
          cantidad: product.cantidad ? parseInt(product.cantidad, 10) : 1,
          subtotal: product.cantidad
            ? parseInt(product.cantidad, 10) * product.precio_compra
            : product.precio_compra,
        }))
      : [];
  }
  
  private loadInitialData(): void {
    this.getProducts();
    this.getUnits();
  }
  
  getProducts(): void {
    this.http.get<any[]>('http://localhost:3000/pedido/busqueda-pedido').subscribe(
      (data) => {
        this.products = data;
        this.updateFilterUnits();
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

  onSearch(): void {
    this.updateFilterUnits();
    if (!this.searchTerm) {
      this.selectedUnit = '';
    }
  }

  filteredProducts() {
    let filteredProducts = this.products;

    if (this.searchTerm) {
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          product.codigo.toString().includes(this.searchTerm)
      );
    }
    if (this.selectedUnit) {
      filteredProducts = filteredProducts.filter((product) => product.unidad === this.selectedUnit);
    }
    filteredProducts = filteredProducts.filter((product) => product.estado_id === 1);
    return filteredProducts;
  }

  updateFilterUnits(): void {
    const filteredProducts = this.filteredProducts();
    const uniqueUnits = new Set(filteredProducts.map((product: { unidad: any }) => product.unidad));
    this.filteredUnits = Array.from(uniqueUnits).map((unit) => ({ nombre: unit }));
  }

  limitedFilteredProducts() {
    const filtered = this.filteredProducts();

    if (!this.searchTerm) {
      return new Array(3).fill({
        codigo: '',
        proveedor: '',
        subcategoria: '',
        nombre: '',
        formulacion: '',
        unidad: '',
        cantidad: '',
        precio_compra: null,
      });
    }

    if (filtered.length > 0) {
      const resultsToShow = filtered.slice(0, 3);
      while (resultsToShow.length < 3) {
        resultsToShow.push({
          codigo: '',
          proveedor: '',
          subcategoria: '',
          nombre: '',
          formulacion: '',
          unidad: '',
          cantidad: '',
          precio_compra: null,
        });
      }
      return resultsToShow;
    }

    return new Array(3).fill({ noResults: true });
  }

  onAdd(product: any): void {
    if (!product || !product.codigo || !product.nombre) {
      return;
    }
  
    const existingProduct = this.selectedProducts.find(
      (item) => item.codigo === product.codigo && item.proveedor === product.proveedor
    );
  
    if (existingProduct) {
      existingProduct.cantidad++;
      existingProduct.subtotal = existingProduct.cantidad * existingProduct.precio_compra;
    } else {
      this.selectedProducts = [
        ...this.selectedProducts,
        {
          codigo: product.codigo,
          proveedor: product.proveedor,
          subcategoria: product.subcategoria,
          nombre_producto: product.nombre,
          formulacion: product.formulacion,
          unidad: product.unidad,
          cantidad: 1,
          precio_compra: product.precio_compra,
          subtotal: product.precio_compra,
        },
      ];
    }
  
    if (!this.supplierData[product.proveedor]) {
      this.supplierData[product.proveedor] = {
        facturaNumero: '',
        fecha: null,
        formaPago: null,
        abonoInicial: '',
      };
    }
  
    this.groupedSuppliers = this.getGroupedBySupplier();
    this.groupedSuppliersArray = Object.entries(this.groupedSuppliers).map(([key, value]) => ({
      key,
      value,
    }));
  
    if (this.siguienteCompraId) {
      this.compraIdsBySupplier = this.assignCompraIdsToSuppliers(this.siguienteCompraId);
    }
  
    this.updateLocalStorage(); 
    console.log('Producto agregado a la lista de pedido:', this.selectedProducts);
  }
  
  getFormasPagoList(): void {
    this.http.get<any[]>('http://localhost:3000/api/formas-pago').subscribe(
      (data) => {
        this.formasPagoList = data;
      },
      (error) => {
        console.error('Error al obtener las formas de pago:', error);
      }
    );
  }

 getGroupedBySupplier(): { [key: string]: any[] } {
  const grouped = new Map<string, any[]>();

  this.selectedProducts.forEach((product) => {
    const supplier = product.proveedor;
    if (!grouped.has(supplier)) {
      grouped.set(supplier, []);
    }
    grouped.get(supplier)?.push(product);
  });

  const groupedObject: { [key: string]: any[] } = {};
  Array.from(grouped.entries()).forEach(([key, value]) => {
    groupedObject[key] = value;
  });

  return groupedObject;
  }

  assignCompraIdsToSuppliers(lastId: number): { [key: string]: number } {
    const compraIds: { [key: string]: number } = {};
  
    const enviadosPedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
    const transportePedidos = JSON.parse(localStorage.getItem('transporte') || '[]');
  
    const idsUsados = new Set<number>([
      ...enviadosPedidos.map((pedido: any) => pedido.compraNumero),
      ...transportePedidos.map((pedido: any) => pedido.compraNumero),
    ]);
  
    const minIdUsado = idsUsados.size > 0 ? Math.min(...Array.from(idsUsados)) : 1;
    const maxIdUsado = idsUsados.size > 0 ? Math.max(...Array.from(idsUsados)) : 0;
  
    const numerosVacios: number[] = [];
    for (let i = minIdUsado; i <= maxIdUsado; i++) {
      if (!idsUsados.has(i)) {
        numerosVacios.push(i);
      }
    }
  
    let compraCounter = Math.max(lastId, maxIdUsado + 1);
  
    Object.keys(this.groupedSuppliers).forEach((supplier) => {
      const proveedorPedido = enviadosPedidos.find((pedido: any) => pedido.proveedor === supplier);
  
      const proveedorTransporte = transportePedidos.find((pedido: any) => pedido.proveedor === supplier);
  
      if (proveedorPedido) {
        compraIds[supplier] = proveedorPedido.compraNumero;
      } else if (proveedorTransporte) {
        compraIds[supplier] = proveedorTransporte.compraNumero;
      } else if (numerosVacios.length > 0) {
        compraIds[supplier] = numerosVacios.shift()!;
      } else {
        compraIds[supplier] = compraCounter++;
      }
    });
  
    localStorage.setItem('compraIds', JSON.stringify(compraIds));
  
    return compraIds;
  }
  
  getNextCompraId(): void {
  this.http.get<{ siguienteId: number }>('http://localhost:3000/compras/ultimo-id')
    .subscribe(
      (response) => {
        this.siguienteCompraId = response.siguienteId; 

        this.compraIdsBySupplier = this.assignCompraIdsToSuppliers(this.siguienteCompraId);
      },
      (error) => {
        console.error('Error al obtener el próximo ID de compra:', error);
      }
    );
  }

  incrementQuantity(product: any): void {
    if (product) {
      product.cantidad += 1; 
      product.subtotal = product.cantidad * product.precio_compra; 
      this.updateLocalStorage(); 
      this.groupedSuppliers = this.getGroupedBySupplier(); 
    } else {
      console.error('Producto no encontrado:', product);
    }
  }

  decrementQuantity(product: any): void {
    if (product && product.cantidad > 1) {
      product.cantidad -= 1; 
      product.subtotal = product.cantidad * product.precio_compra; 
      this.updateLocalStorage(); 
      this.groupedSuppliers = this.getGroupedBySupplier(); 
    } else {
      console.error('Producto no encontrado:', product);
    }
  }

  removeFromPedido(product: any): void {
    this.http
      .post('http://localhost:3000/inventario/cambiar-estado', { codigo: product.codigo })
      .subscribe(
        (response: any) => {
          console.log(response.message);
  
          this.selectedProducts = this.selectedProducts.filter((p) => p.codigo !== product.codigo);
  
          this.groupedSuppliers = this.getGroupedBySupplier();
          this.groupedSuppliersArray = Object.entries(this.groupedSuppliers).map(([key, value]) => ({
            key,
            value,
          }));
  
          if (this.siguienteCompraId) {
            this.compraIdsBySupplier = this.assignCompraIdsToSuppliers(this.siguienteCompraId);
          }
  
          this.updateLocalStorage();
  
          const stockMinimo = JSON.parse(localStorage.getItem('stockMinimo') || '[]');
          stockMinimo.push(product);
          localStorage.setItem('stockMinimo', JSON.stringify(stockMinimo));
        },
        (error) => {
          console.error('Error al cambiar el estado del producto:', error);
          alert('Hubo un problema al intentar actualizar el producto. Intente nuevamente.');
        }
      );
  }
  
  getTotalTotalPrice(products: any[]): number {
    return products.reduce((total, product) => total + product.cantidad * product.precio_compra, 0);
  }

  updateLocalStorage(): void {
    localStorage.setItem('selectedProducts', JSON.stringify(this.selectedProducts));
    
    localStorage.setItem('supplierData', JSON.stringify(this.supplierData));
  }

  formatAbonoInicial(supplierKey: string): void {
    let abono = this.supplierData[supplierKey].abonoInicial;
  
    abono = abono.replace(/[^0-9]/g, '');
    this.supplierData[supplierKey].abonoInicial = abono
      ? `$${Number(abono).toLocaleString('es-CO')}`
      : '';
  }
  
  onFormaPagoChange(supplierKey: string): void {
    const formaPago = this.supplierData[supplierKey]?.formaPago;
  
    console.log(`Forma de Pago cambiada para ${supplierKey}:`, formaPago);
  
    const isAbonoInicialEnabled = typeof formaPago === 'string'
      ? parseInt(formaPago, 10) === 2
      : formaPago === 2;
  
    this.supplierData[supplierKey].isAbonoInicialEnabled = isAbonoInicialEnabled;
  
    if (!isAbonoInicialEnabled) {
      this.supplierData[supplierKey].abonoInicial = '';
      console.log(`Abono Inicial limpiado para ${supplierKey}`);
    }
  
    console.log('isAbonoInicialEnabled:', this.supplierData[supplierKey].isAbonoInicialEnabled);
  }
  
  updateAbonoInicial(event: Event, supplierKey: string): void {
    const input = event.target as HTMLInputElement; 
  
    if (input) {
      const rawValue = input.value.replace(/[^0-9]/g, '');
      
      const numericValue = parseFloat(rawValue);
  
      if (!isNaN(numericValue)) {
        input.value = numericValue.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        });
  
        this.supplierData[supplierKey].abonoInicial = numericValue;
      } else {
        input.value = ''; 
        this.supplierData[supplierKey].abonoInicial = '';
      }
  
      this.updateSupplierDataInLocalStorage(supplierKey);
    }
  }
  
  exportToPDF(supplier: string): void {
    const doc = new jsPDF();
  
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(25);
    doc.text(`${supplier}`, 105, 20, { align: 'center' });
  
    const rows: any[] = [];
    this.groupedSuppliers[supplier].forEach((product: any) => {
      rows.push([
        product.nombre_producto,
        product.formulacion,
        product.unidad,
        product.cantidad,
      ]);
    });
  
    (doc as any).autoTable({
      head: [['Nombre', 'Formulación', 'Unidad', 'Cantidad']],
      body: rows,
      startY: 40,
      styles: { fontSize: 12 },
      headStyles: { fillColor: [0, 128, 0] },
    });
  
    const safeSupplier = supplier.replace(/[^a-zA-Z0-9]/g, '_'); 
    doc.save(`${safeSupplier}.pdf`);
  
    this.groupedSuppliers = this.getGroupedBySupplier();
  }

  updatePrecioCompraLocal(product: any, nuevoPrecio: any): void {
    if (!product) {
      console.error('El producto no es válido.');
      return;
    }
  
    const precio = parseFloat(nuevoPrecio);
    if (!isNaN(precio) && precio > 0) {
      product.precio_compra = precio;
      console.log(`Precio actualizado localmente para el producto ${product.codigo}: ${product.precio_compra}`);
    } else {
      console.error('Precio inválido:', nuevoPrecio);
    }
  }
  
  formatPrecioCompra(product: any, event: FocusEvent): void {
    const input = event.target as HTMLInputElement; 
    if (input && input.value) {
      const rawValue = parseFloat(input.value.replace(/[^0-9.]/g, ''));
      if (!isNaN(rawValue) && rawValue > 0) {
        product.precio_compra = rawValue;
      } else {
        console.error('Valor de precio no válido:', input.value);
      }
      
      input.value = product.precio_compra.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    } else {
      console.error('El campo de entrada no contiene un valor válido.');
    }
  }
  
  removeCurrencyFormat(event: FocusEvent): void {
    const input = event.target as HTMLInputElement; 
  
    if (input && input.value) {
      const rawValue = parseFloat(input.value.replace(/[^0-9.]/g, ''));
      input.value = isNaN(rawValue) ? '' : rawValue.toString();
    }
  }

  finalizarPedido(supplierKey: string): void {
    if (!this.groupedSuppliers[supplierKey]) {
      console.error(`No se encontró información para el proveedor: ${supplierKey}`);
      return;
    }
  
    const totalProveedor = this.groupedSuppliers[supplierKey]
      .reduce((sum, product) => sum + product.cantidad * product.precio_compra, 0);
  
    console.log('Total del Proveedor calculado:', totalProveedor);
  
    const pedido = {
      proveedor: supplierKey,
      proveedorId: this.supplierData[supplierKey]?.id || null, 
      compraNumero: this.compraIdsBySupplier[supplierKey] || null,
      facturaNumero: this.supplierData[supplierKey]?.facturaNumero || '',
      fecha: this.supplierData[supplierKey]?.fecha || new Date().toISOString(),
      formaPago: this.supplierData[supplierKey]?.formaPago || null,
      abonoInicial: this.supplierData[supplierKey]?.abonoInicial || '',
      total: totalProveedor,
      productos: this.groupedSuppliers[supplierKey].map((product) => ({
        codigo: product.codigo,
        subcategoria: product.subcategoria,
        nombre: product.nombre_producto,
        formulacion: product.formulacion,
        unidad: product.unidad,
        cantidad: product.cantidad,
        precioCompra: product.precio_compra,
        total: product.cantidad * product.precio_compra,
      })),
    };
  
    console.log('Pedido enviado:', pedido);
  
    const pedidosGuardados = JSON.parse(localStorage.getItem('pedidos') || '[]');
    pedidosGuardados.push(pedido);
    localStorage.setItem('pedidos', JSON.stringify(pedidosGuardados));
  
    delete this.groupedSuppliers[supplierKey];
    delete this.supplierData[supplierKey];
    delete this.compraIdsBySupplier[supplierKey];
    this.selectedProducts = this.selectedProducts.filter(
      (product) => product.proveedor !== supplierKey
    );
  
    this.groupedSuppliersArray = Object.entries(this.groupedSuppliers).map(([key, value]) => ({
      key,
      value,
    }));
  
    this.updateLocalStorage(); 
  
    console.log(`Proveedor eliminado: ${supplierKey}`);
    console.log('Proveedores restantes:', this.groupedSuppliers);
  }
  
  updateSupplierDataInLocalStorage(supplierKey: string): void {
    if (!this.supplierData[supplierKey]) {
      console.error(`No se encontró información para el proveedor: ${supplierKey}`);
      return;
    }
  
    const storedData = JSON.parse(localStorage.getItem('supplierData') || '{}');
  
    const abonoInicial = this.supplierData[supplierKey].abonoInicial;
    if (typeof abonoInicial === 'string') {
      this.supplierData[supplierKey].abonoInicial = Number(
        abonoInicial.replace(/[^0-9]/g, '')
      );
    }
  
    storedData[supplierKey] = storedData[supplierKey] || {};
    storedData[supplierKey].facturaNumero = this.supplierData[supplierKey].facturaNumero || '';
    storedData[supplierKey].fecha = this.supplierData[supplierKey].fecha || '';
    storedData[supplierKey].formaPago = this.supplierData[supplierKey].formaPago || '';
    storedData[supplierKey].abonoInicial = this.supplierData[supplierKey].abonoInicial || 0; 
  
    localStorage.setItem('supplierData', JSON.stringify(storedData));
  
  }
}

