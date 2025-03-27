import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatCommonModule } from '@angular/material/core';

@Component({
  selector: 'unidad',  
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, MatCommonModule],
  templateUrl: './unidad.component.html',  
  styleUrls: ['./unidad.component.css']  
})
export class UnidadComponent {
  unidadList: any[] = [];  
  showAddModal: boolean = false;
  showEditModal: boolean = false;
  selectedUnidad: any;  
  showDeleteConfirmation: boolean = false;
  unidadToDelete: number | null = null;  
  
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getUnidadesList();  
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

  onAdd(): void {
    this.showAddModal = true; 
  }

  onSubmit(unidadForm: NgForm): void {  
    const unidadData = {
        nombre: unidadForm.value.nombre  
    };

    this.http.post('http://localhost:3000/producto/unidad-agregar', unidadData)  
        .subscribe((response) => {
            console.log('Unidad registrada:', response);  
            this.getUnidadesList();  
            unidadForm.reset(); 
            this.closeAddModal(); 
        }, (error) => {
            console.error('Error al registrar unidad:', error);  
        });
}

  closeAddModal(): void {
      this.showAddModal = false; 
  }

  onEdit(unidad: any): void {  
    console.log("Editar unidad:", unidad);  
    this.selectedUnidad = { ...unidad };  
    this.showEditModal = true; 
  }
  
  onEditSubmit(editForm: NgForm): void {
    if (editForm.valid) {
      const updatedUnidadData = {
        nombre: this.selectedUnidad.nombre  
      };
  
      this.http.put(`http://localhost:3000/producto/unidad-modificar/${this.selectedUnidad.id}`, updatedUnidadData)  
        .subscribe(() => {
          console.log('Unidad actualizada:', updatedUnidadData);  
          this.getUnidadesList();  
          this.closeEditModal();
        }, (error) => {
          console.error('Error al actualizar unidad:', error);  
        });
    }
  }
  
  closeEditModal(): void {
    this.showEditModal = false; 
    this.selectedUnidad = null; 
  }
  
  onDelete(unidadId: number): void {  
    console.log("Eliminar unidad con ID:", unidadId);  
    this.unidadToDelete = unidadId;  
    this.showDeleteConfirmation = true; 
  }

  confirmDelete(): void {
      if (this.unidadToDelete) {
          this.http.delete(`http://localhost:3000/producto/unidad-eliminar/${this.unidadToDelete}`).subscribe(  
              () => {
                  console.log('Unidad eliminada:', this.unidadToDelete);  
                  this.closeDeleteConfirmation(); 
                  this.getUnidadesList();  
              },
              (error) => {
                  console.error('Error al eliminar unidad:', error);  
              }
          );
      }
  }  

  closeDeleteConfirmation(): void {
      this.showDeleteConfirmation = false; 
      this.unidadToDelete = null; 
  }
}
