import { CommonModule } from '@angular/common'; 
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
 
@Component({
  selector: 'proveedores',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule], 
  templateUrl: './proveedores.component.html',
  styleUrls: ['./proveedores.component.css'] 
}) 
export class ProveedoresComponent {
  searchTerm: string = '';
  showAddModal: boolean = false;
  proveedoresList: any[] = [];
  selectedMunicipio: string = '';
  municipios: any[] = [];
  showMunicipios: boolean = false;
  selectedProveedor: any;
  proveedortoDelete: number | null = null; 
  showDeleteConfirmation: boolean = false;

  constructor(private http: HttpClient) {} 

  ngOnInit(): void {
    this.getProveedorsList();
  }

  onSearch(): void {}

  onAdd(): void {
    this.showAddModal = true; 
  }

  getProveedorsList(): void {
    this.http.get<any[]>('http://localhost:3000/contactos/proveedores').subscribe(
      (data) => {
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
  
  filteredProveedores() {
    if (!this.searchTerm) {
      return this.proveedoresList; 
    }
  
    return this.proveedoresList.filter(proveedor =>
      proveedor.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      proveedor.nit.toString().includes(this.searchTerm) 
    );
  }
  
  closeAddModal(): void {
    this.showAddModal = false; 
  }

  onSubmit(userForm: NgForm): void {
    const proveedorData = {
      ...userForm.value,
      cedula: Number(userForm.value.cedula), 
      celular: Number(userForm.value.celular),
      municipio_codigo: this.selectedMunicipio 
    };
  
    this.http.post('http://localhost:3000/contactos/proveedores-agregar', proveedorData) 
      .subscribe((response) => {
        console.log('Proveedor registrado:', response);
        this.getProveedorsList(); 
        this.closeAddModal(); 
        userForm.reset(); 
      }, (error) => {
        console.error('Error al registrar proveedor:', error);
      });
  }

  searchMunicipios(): void {
    console.log('Valor de selectedMunicipio:', this.selectedMunicipio); 
    if (this.selectedMunicipio) {
        this.http.get<any[]>(`http://localhost:3000/api/municipios?search=${this.selectedMunicipio}`).subscribe(
            (data) => {
                this.municipios = data;
                this.showMunicipios = this.municipios.length > 0;
            },
            (error) => {
                console.error('Error al obtener municipios:', error);
            }
        );
    } else {
        this.municipios = [];
        this.showMunicipios = false;
    }
}

  selectMunicipio(municipio: any): void {
    this.selectedMunicipio = municipio.codigo; 
    this.municipios = []; 
    this.showMunicipios = false; 
  }

  onEdit(proveedor: any): void {
    this.selectedProveedor = { ...proveedor }; 
  }  

  closeEditModal(): void {
    this.selectedProveedor = null; 
  }

  onEditSubmit(editForm: NgForm): void {
    if (editForm.valid) {
      const updatedProveedorData = {
        ...this.selectedProveedor,
        celular: Number(editForm.value.celular),
        municipio_codigo: this.selectedMunicipio 
      };
  
      this.http.put(`http://localhost:3000/contactos/proveedores-modificar/${this.selectedProveedor.id}`, updatedProveedorData)
        .subscribe(() => {
          console.log('Proveedor actualizado:', updatedProveedorData);
          this.getProveedorsList(); 
          this.closeEditModal(); 
        }, (error) => {
          console.error('Error al actualizar proveedor:', error);
        });
    } else {
      console.log('Formulario no válido');
    }
  }
  
closeDeleteConfirmation(): void {
  this.showDeleteConfirmation = false; 
  this.proveedortoDelete = null; 
}

confirmDelete(): void {
  if (this.proveedortoDelete) {
    this.http.delete(`http://localhost:3000/contactos/proveedores-eliminar/${this.proveedortoDelete}`).subscribe(
      () => {
        console.log('Proveedor eliminado:', this.proveedortoDelete);
        this.closeDeleteConfirmation(); 
        this.getProveedorsList(); 
      },
      (error) => {
        console.error('Error al eliminar proveedor:', error);
      }
    );
  }
}

onDelete(proveedorId: number): void {
  this.proveedortoDelete = proveedorId; 
  this.showDeleteConfirmation = true; 
}
}
