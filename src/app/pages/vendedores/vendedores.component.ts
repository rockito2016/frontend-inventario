import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-vendedores',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './vendedores.component.html',
  styleUrl: './vendedores.component.css'
})
export class VendedoresComponent {
  vendedortList: any[] = [];
  searchTerm: string = '';
  showAddModal: boolean = false;
  selectedVendedor: any;
  vendedorToDelete: number | null = null;
  showDeleteConfirmation: boolean = false; 

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getVendedorList();
  }

  onSearch(): void {}

  getVendedorList(): void {
    this.http.get<any[]>('http://localhost:3000/contactos/vendedor').subscribe(
      (data) => {
        this.vendedortList = data.map(vendedor => ({
          ...vendedor,
          id: Number(vendedor.id), 
          celular: Number(vendedor.celular) 
        }));
      },
      (error) => {
        console.error('Error al obtener los vendedores:', error);
      }
    );
  }

  filteredVendedor() {
    if (!this.searchTerm) {
      return this.vendedortList; 
    }
  
    return this.vendedortList.filter(vendedor =>
      vendedor.nombre.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
  
  onEdit(vendedor: any): void {
    this.selectedVendedor = { ...vendedor }; 
  }

  onDelete(vendedor: any): void {
    this.vendedorToDelete = vendedor; 
    this.showDeleteConfirmation = true; 
  }
  
  
  onAdd(): void {
    this.showAddModal = true; 
  }

  closeAddModal(): void {
    this.showAddModal = false; 
  }

  onSubmit(form: NgForm): void {
    if (form.valid) {
      const nuevoVendedor = {
        nombre: form.value.nombre,
        celular: form.value.celular,
        correo: form.value.correo,
        contrasena: form.value.contrasena, 
      };
  
      this.http.post('http://localhost:3000/contactos/vendedor-agregar', nuevoVendedor)
        .subscribe(response => {
          console.log('Vendedor registrado:', response);
          this.getVendedorList(); 
          this.closeAddModal(); 
        }, error => {
          console.error('Error al registrar vendedor:', error);
        });
    }
  } 

  closeEditModal(): void {
    this.selectedVendedor = null; 
  }

  onEditSubmit(editForm: NgForm): void {
    const updatedVendedorData = {
      ...editForm.value,
      celular: Number(editForm.value.celular),
      contrasena: editForm.value.contrasena 
    };

    this.http.put(`http://localhost:3000/contactos/vendedor-modificar/${this.selectedVendedor.id}`, updatedVendedorData)
    .subscribe(() => {
        console.log('Vendedor actualizado:', updatedVendedorData);
        this.getVendedorList();
        this.closeEditModal();
      }, (error) => {
        console.error('Error al actualizar vendedor:', error);
      });
  }

  closeDeleteConfirmation(): void {
    this.showDeleteConfirmation = false; 
    this.vendedorToDelete = null; 
  }

  confirmDelete(): void {
    if (this.vendedorToDelete) {
      this.http.delete(`http://localhost:3000/contactos/vendedor-eliminar/${this.vendedorToDelete}`).subscribe(
        () => {
          console.log('Vendedor eliminado:', this.vendedorToDelete);
          this.closeDeleteConfirmation();
          this.getVendedorList(); 
        },
        (error) => {
          console.error('Error al eliminar vendedor:', error);
        }
      );
    }
  }
}
 