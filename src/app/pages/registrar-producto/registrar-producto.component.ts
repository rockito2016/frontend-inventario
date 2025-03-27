import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatCommonModule } from '@angular/material/core';

@Component({
  selector: 'app-registrar-producto',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, MatCommonModule],
  templateUrl: './registrar-producto.component.html',
  styleUrl: './registrar-producto.component.css'
})
export class RegistrarProductoComponent {
  productosList: any[] = []; 
  showAddModal: boolean = false;
  searchTerm: string = '';
  productos: any[] = [];
  categoriaList: any[] = [];  
  subcategoriaList: any[] = [];
  proveedoresList: any[] = [];
  transportadorList: any[] = [];
  formulacionList: any[] = [];
  unidadList: any[] = [];
  elaboradoList: any[] = [];
  estadoList: any[] = [];
  fecha_vencimiento: string = '';
  precio_compra: number | null = null;
  precio_venta: number | null = null;
  cantidad: number | null = null;
  stock_minimo: number | null = null;
  showDeleteConfirmation: boolean = false;
  productoToDelete: number | null = null;

  selectedCategoriaId: string | null = null;
  showEditModal: boolean = false; 
  selectedProducto: any = {
    nombre: '',
    categoria_id: null,
    subcategoria_id: null,
    proveedor_id: null,
    transportador_id: null,
    formulacion_id: null,
    unidad_id: null,
    fecha_vencimiento: null, 
    precio_compra: null,
    precio_venta: null,
    cantidad: null,
    stock_minimo: null,
    estado_id: null,
    elaborado_id: null,
  };
  
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getProductosList(); 
    this.getCategoriasList(); 
    this.getProveedorsList();
    this.getTransportadorsList();
    this.getFormulacionesList();
    this.getUnidadesList();
    this.getElaboradosList();
    this.getEstadosList();
    console.log("ngOnInit: Categoría list cargada en ngOnInit:", this.categoriaList);
  }
  
  getCategoriasList(): void {
    this.http.get<any[]>('http://localhost:3000/producto/categoria').subscribe(
      (data) => {
        this.categoriaList = data;
        console.log('Categorías cargadas:', this.categoriaList);
      },
      (error) => {
        console.error('Error al obtener las categorías:', error);
      }
    );
  }

  onCategoriaChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement; 
    const categoriaId = selectElement.value;

    if (categoriaId) {
      this.http.get<any[]>(`http://localhost:3000/producto/subcategoria-filtro?categoria_id=${categoriaId}`).subscribe(
        (data) => {
          this.subcategoriaList = data; 
          console.log('Subcategorías cargadas:', this.subcategoriaList);
        },
        (error) => {
          console.error('Error al obtener subcategorías:', error);
          this.subcategoriaList = []; 
        }
      );
    } else {
      this.subcategoriaList = []; 
    }
  }

onCategoriaChangeById(categoriaId: string, subcategoriaNombre?: string): void {
  this.http.get<any[]>(`http://localhost:3000/producto/subcategoria-filtro?categoria_id=${categoriaId}`).subscribe(
      (data) => {
          this.subcategoriaList = data;
          console.log('Subcategorías cargadas:', this.subcategoriaList);

          if (subcategoriaNombre) {
              const subcategoria = this.subcategoriaList.find(s => s.nombre === subcategoriaNombre);
              if (subcategoria) {
                  this.selectedProducto.subcategoria_id = subcategoria.id;
              }
          }
      },
      (error) => {
          console.error('Error al obtener subcategorías:', error);
          this.subcategoriaList = [];
      }
  );
}

  getProveedorsList(): void {
    this.http.get<any[]>('http://localhost:3000/contactos/proveedores').subscribe(
      (data) => {
        console.log('Datos de proveedores:', data);
        this.proveedoresList = data.map(proveedor => ({
          ...proveedor,
          celular: Number(proveedor.celular) 
        }));
      },
      (error) => {
        console.error('Error al obtener los proveedores:', error);
      }
    );
  }

  getTransportadorsList(): void {
    this.http.get<any[]>('http://localhost:3000/contactos/transportador').subscribe(
      (data) => {
        this.transportadorList = data.map(transportador => ({
          ...transportador,
          celular: Number(transportador.celular),
        }));
      },
      (error) => {
        console.error('Error al obtener los clientes:', error);
      }
    );
  }

  getFormulacionesList(): void {
    this.http.get<any[]>('http://localhost:3000/producto/formulacion').subscribe(
      (data) => {
        this.formulacionList = data; 
        console.log('Formulaciones cargadas:', this.formulacionList); 
      },
      (error) => {
        console.error('Error al obtener las formulaciones:', error);
      }
    );
  }

  getUnidadesList(): void {
    this.http.get<any[]>('http://localhost:3000/producto/unidad').subscribe(  
      (data) => {
        this.unidadList = data;  
        console.log('Unidades cargadas:', this.unidadList); 
      },
      (error) => {
        console.error('Error al obtener las unidades:', error);  
      }
    );
  }

  getElaboradosList(): void {
    this.http.get<any[]>('http://localhost:3000/producto/elaborado').subscribe(
      (data) => {
        this.elaboradoList = data; 
        console.log('Elaborados cargados:', this.elaboradoList); 
      },
      (error) => {
        console.error('Error al obtener los elaborados:', error);
      }
    );
  }
  getEstadosList(): void {
    this.http.get<any[]>('http://localhost:3000/producto/estado').subscribe(
      (data) => {
        this.estadoList = data; 
        console.log('Estados cargados:', this.estadoList); 
      },
      (error) => {
        console.error('Error al obtener los estados:', error);
      }
    );
  }

  filteredProductos() {
    console.log(this.searchTerm); 
    if (!this.searchTerm) {
        return this.productosList; 
    }

    return this.productosList.filter(producto =>
        producto.nombre && 
        producto.nombre.toLowerCase().includes(this.searchTerm.toLowerCase())||
        producto.codigo.toString().includes(this.searchTerm)
    );
  }

  onSearch(): void {}
  
  getProductosList(): void {
    this.http.get<any[]>('http://localhost:3000/producto').subscribe(
      (data) => {
        this.productosList = data; 
        console.log('Productos cargados:', this.productosList); 
      },
      (error) => {
        console.error('Error al obtener los productos:', error);
      }
    );
  }
 
  onAdd(): void {
    this.showAddModal = true; 
  }

  onSubmit(productoForm: NgForm): void {
    const productoData = {
        nombre: productoForm.value.nombre,
        categoria_id: productoForm.value.categoria_id,
        subcategoria_id: productoForm.value.subcategoria_id,
        proveedor_id: productoForm.value.proveedor_id,
        transportador_id: productoForm.value.transportador_id,       
        formulacion_id: productoForm.value.formulacion_id,
        unidad_id: productoForm.value.unidad_id,
        fecha_vencimiento: productoForm.value.fecha_vencimiento, 
        precio_compra: productoForm.controls['precio_compra'].value.replace(/\D/g, ''),
        precio_venta: productoForm.controls['precio_venta'].value.replace(/\D/g, ''),         
        cantidad: productoForm.value.cantidad ? parseInt(productoForm.value.cantidad, 10) : null,
        stock_minimo: productoForm.value.stock_minimo ? parseInt(productoForm.value.stock_minimo, 10) : null,
        estado_id: productoForm.value.estado_id,
        elaborado_id: productoForm.value.elaborado_id,
    };

    this.http.post('http://localhost:3000/producto-agregar', productoData)
        .subscribe((response) => {
            console.log('Producto registrado:', response);
            this.getProductosList();  
            productoForm.reset();  
            this.closeAddModal();   
        }, (error) => {
            console.error('Error al registrar producto:', error);
        });
  }

  closeAddModal(): void {
      this.showAddModal = false; 
  }

  onEditProducto(producto: any): void {
    console.log("Editar producto:", producto);

    const categoria = this.categoriaList.find(cat => cat.nombre === producto.categoria);
    const proveedor = this.proveedoresList.find(prov => prov.nombre === producto.proveedor);
    const transportador = this.transportadorList.find(trans => trans.nombre === producto.transportador);
    const formulacion = this.formulacionList.find(form => form.nombre === producto.formulacion);
    const unidad = this.unidadList.find(un => un.nombre === producto.unidad);
    const elaborado = this.elaboradoList.find(elab => elab.nombre === producto.elaborado);
    const estado = this.estadoList.find(est => est.nombre === producto.estado);

    this.selectedProducto = {
        ...producto,
        categoria_id: categoria ? categoria.id : null,
        proveedor_id: proveedor ? proveedor.id : null,
        transportador_id: transportador ? transportador.id : null,
        formulacion_id: formulacion ? formulacion.id : null,
        unidad_id: unidad ? unidad.id : null,
        elaborado_id: elaborado ? elaborado.id : null,
        estado_id: estado ? estado.id : null,
        fecha_vencimiento: producto.fecha_vencimiento ? new Date(producto.fecha_vencimiento).toISOString().split('T')[0] : null 
    };

    if (this.selectedProducto.categoria_id) {
        this.onCategoriaChangeById(this.selectedProducto.categoria_id, producto.subcategoria);
    }

    this.showEditModal = true; 
    console.log("Producto seleccionado para editar:", this.selectedProducto); 
}

  onEditSubmitProducto(editForm: NgForm): void {
    if (editForm.valid) {
        const updatedProductoData = {
            nombre: this.selectedProducto.nombre, 
            categoria_id: editForm.value.categoria_id,
            subcategoria_id: editForm.value.subcategoria_id,
            proveedor_id: editForm.value.proveedor_id,
            transportador_id: editForm.value.transportador_id,
            formulacion_id: editForm.value.formulacion_id,
            unidad_id: editForm.value.unidad_id,
            fecha_vencimiento: editForm.value.fecha_vencimiento,
            precio_compra: editForm.controls['precio_compra'].value.replace(/\D/g, ''),
            precio_venta: editForm.controls['precio_venta'].value.replace(/\D/g, ''),
            cantidad: editForm.value.cantidad ? parseInt(editForm.value.cantidad, 10) : null,
            stock_minimo: editForm.value.stock_minimo ? parseInt(editForm.value.stock_minimo, 10) : null,
            estado_id: editForm.value.estado_id,
            elaborado_id: editForm.value.elaborado_id,
        };

        this.http.put(`http://localhost:3000/producto-modificar/${this.selectedProducto.codigo}`, updatedProductoData)
            .subscribe(() => {
                console.log('Producto actualizado:', updatedProductoData);
                this.getProductosList(); 
                this.closeEditModalProducto(); 
            }, (error) => {
                console.error('Error al actualizar producto:', error);
            });
    } else {
        console.warn('El formulario no es válido');
    }
  }

  closeEditModalProducto(): void {
      this.showEditModal = false; 
      this.selectedProducto = null; 
  }

  onDelete(productoCodigo: string): void {
    console.log("Eliminar producto con código:", productoCodigo);
    this.productoToDelete = Number(productoCodigo); 
    this.showDeleteConfirmation = true; 
}

confirmDelete(): void {
  if (this.productoToDelete) {
      this.http.delete(`http://localhost:3000/producto-eliminar/${this.productoToDelete}`).subscribe(
          () => {
              console.log('Producto eliminado:', this.productoToDelete);
              this.closeDeleteConfirmation(); 
              this.getProductosList(); 
          },
          (error) => {
              console.error('Error al eliminar producto:', error);
          }
      );
  }
}

closeDeleteConfirmation(): void {
  this.showDeleteConfirmation = false; 
  this.productoToDelete = null; 
}

selectProducto(producto: any): void {
  this.selectedProducto = { ...producto };

  const categoria = this.categoriaList.find(c => c.nombre === producto.categoria);
  if (categoria) {
      this.selectedProducto.categoria_id = categoria.id;

      this.onCategoriaChangeById(categoria.id, producto.subcategoria);
  }

  const proveedor = this.proveedoresList.find(p => p.nombre === producto.proveedor);
  if (proveedor) {
      this.selectedProducto.proveedor_id = proveedor.id;
  }

  const transportador = this.transportadorList.find(t => t.nombre === producto.transportador);
  if (transportador) {
      this.selectedProducto.transportador_id = transportador.id;
  }

  const formulacion = this.formulacionList.find(f => f.nombre === producto.formulacion);
  if (formulacion) {
      this.selectedProducto.formulacion_id = formulacion.id;
  }

  const unidad = this.unidadList.find(u => u.nombre === producto.unidad);
  if (unidad) {
      this.selectedProducto.unidad_id = unidad.id;
  }

  const elaborado = this.elaboradoList.find(e => e.nombre === producto.elaborado);
  if (elaborado) {
      this.selectedProducto.elaborado_id = elaborado.id;
  }

  const estado = this.estadoList.find(s => s.nombre === producto.estado);
  if (estado) {
      this.selectedProducto.estado_id = estado.id;
  }

  console.log('Producto seleccionado con IDs asignados:', this.selectedProducto);

  this.showEditModal = true;
}
 
  formatCurrency(event: any) {
    const rawValue = event.target.value.replace(/\D/g, ''); 
    const numberValue = parseInt(rawValue, 10) || 0;

    const formattedValue = new Intl.NumberFormat('es-CO', { 
        style: 'currency', 
        currency: 'COP',
        minimumFractionDigits: 0 
    }).format(numberValue);

    event.target.value = formattedValue;
    event.target.dataset.rawValue = numberValue; 
  }

  validateNumberInput(event: any): void {
    const value = event.target.value.replace(/\D/g, ''); 
    event.target.value = value; 
  }
}
 