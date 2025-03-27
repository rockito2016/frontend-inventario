import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'elaborar',
  standalone: true,
  imports: [HttpClientModule, CommonModule, FormsModule],
  templateUrl: './elaborar.component.html',
  styleUrl: './elaborar.component.css'
})
export class ElaborarComponent {
  searchTerm: string = '';
  products: any[] = [];
  selectedProducto: any;
  elaboradoList: any[] = [];
  cantidadElaborar: number = 0;
  productosElaborados: any[] = []; 

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getProducts(); 
    this.getElaboradosList();
    this.getProductosElaborados();
  }

  onSearch(): void {
  }

  getProducts(): void {
    this.http.get<any[]>('http://localhost:3000/inventario/elaborar-busqueda').subscribe(
      (data) => {
        this.products = data;
        console.log('Productos cargados:', this.products);
      },
      (error) => {
        console.error('Error al obtener los productos:', error);
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
    return filteredProducts;
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

  onElaborar(products: any): void {
    this.selectedProducto = { ...products }; 
  }
 
  onElaborarSubmit(editForm: NgForm): void {
    const elaboracionDestinoNombre = this.elaboradoList.find(e => e.id === +editForm.value.elaborado_id)?.nombre;

    console.log('Estado de elaboración destino (elaboracionDestinoNombre):', elaboracionDestinoNombre);

    const elaborarData = {
      nombre: this.selectedProducto.nombre,                
      cantidadDestino: Number(this.cantidadElaborar),      
      elaboracionDestino: elaboracionDestinoNombre         
    };

    console.log('Datos preparados para enviar (elaborarData):', elaborarData);

    this.http.put('http://localhost:3000/inventario/elaborar-agregar', elaborarData)
      .subscribe(
        (response) => {
          console.log('Respuesta del servidor:', response);
          this.getProducts();              
          this.getProductosElaborados();    
          this.closeElaborarModal();        
        },
        (error) => {
          console.error('Error al elaborar producto:', error);
        }
      );
  }
  
  getElaboradoNombreById(id: number): string | undefined {
    const elaborado = this.elaboradoList.find(e => e.id === id);
    return elaborado ? elaborado.nombre : undefined;
  }
  
  closeElaborarModal(): void {
    this.selectedProducto = null; 
  }

  getProductosElaborados(): void {
    this.http.get<any[]>('http://localhost:3000/inventario/elaborar-registro').subscribe(
      (data) => {
        this.productosElaborados = data;
        console.log('Productos elaborados:', this.productosElaborados);
      },
      (error) => {
        console.error('Error al obtener productos elaborados:', error);
      }
    );
  }
}
 