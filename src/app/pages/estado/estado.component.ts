import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatCommonModule } from '@angular/material/core';

@Component({
  selector: 'estado',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, MatCommonModule],
  templateUrl: './estado.component.html', 
  styleUrls: ['./estado.component.css'] 
})
export class EstadoComponent {
  estadoList: any[] = []; 
  showAddModal: boolean = false;
  showEditModal: boolean = false;
  selectedEstado: any;
  showDeleteConfirmation: boolean = false;
  estadoToDelete: number | null = null;
  
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getEstadosList(); 
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

  onAdd(): void {
    this.showAddModal = true; 
  }

  onSubmit(estadoForm: NgForm): void {
    const estadoData = {
      nombre: estadoForm.value.nombre 
    };

    this.http.post('http://localhost:3000/producto/estado-agregar', estadoData)
      .subscribe((response) => {
        console.log('Estado registrado:', response);
        this.getEstadosList(); 
        estadoForm.reset(); 
        this.closeAddModal(); 
      }, (error) => {
        console.error('Error al registrar estado:', error);
      });
  }

  closeAddModal(): void {
    this.showAddModal = false; 
  }

  onEdit(estado: any): void {
    console.log("Editar estado:", estado); 
    this.selectedEstado = { ...estado }; 
    this.showEditModal = true; 
  }
  
  onEditSubmit(editForm: NgForm): void {
    if (editForm.valid) {
      const updatedEstadoData = {
        nombre: this.selectedEstado.nombre 
      };
  
      this.http.put(`http://localhost:3000/producto/estado-modificar/${this.selectedEstado.id}`, updatedEstadoData)
        .subscribe(() => {
          console.log('Estado actualizado:', updatedEstadoData);
          this.getEstadosList(); 
          this.closeEditModal();
        }, (error) => {
          console.error('Error al actualizar estado:', error);
        });
    }
  }
  
  closeEditModal(): void {
    this.showEditModal = false; 
    this.selectedEstado = null; 
  }
  
  onDelete(estadoId: number): void {
    console.log("Eliminar estado con ID:", estadoId);
    this.estadoToDelete = estadoId; 
    this.showDeleteConfirmation = true; 
  }

  confirmDelete(): void {
    if (this.estadoToDelete) {
      this.http.delete(`http://localhost:3000/producto/estado-eliminar/${this.estadoToDelete}`).subscribe(
        () => {
          console.log('Estado eliminado:', this.estadoToDelete);
          this.closeDeleteConfirmation(); 
          this.getEstadosList();  
        },
        (error) => {
          console.error('Error al eliminar estado:', error);
        }
      );
    }
  }  

  closeDeleteConfirmation(): void {
    this.showDeleteConfirmation = false; 
    this.estadoToDelete = null; 
  }
}
