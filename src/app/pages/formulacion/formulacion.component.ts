import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatCommonModule } from '@angular/material/core';

@Component({
  selector: 'formulacion',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, MatCommonModule],
  templateUrl: './formulacion.component.html',
  styleUrl: './formulacion.component.css'
})
export class FormulacionComponent {
  formulacionList: any[] = []; 
  showAddModal: boolean = false;
  showEditModal: boolean = false;
  selectedFormulacion: any;
  showDeleteConfirmation: boolean = false;
  formulacionToDelete: number | null = null;
  

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getFormulacionesList(); 
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

  onAdd(): void {
    this.showAddModal = true; 
  }

  onSubmit(formulacionForm: NgForm): void {
    const formulacionData = {
        nombre: formulacionForm.value.nombre 
    };

    this.http.post('http://localhost:3000/producto/formulacion-agregar', formulacionData)
        .subscribe((response) => {
            console.log('Formulación registrada:', response);
            this.getFormulacionesList(); 
            formulacionForm.reset(); 
            this.closeAddModal(); 
        }, (error) => {
            console.error('Error al registrar formulación:', error);
        });
}

  closeAddModal(): void {
      this.showAddModal = false; 
  }

  onEdit(formulacion: any): void {
    console.log("Editar formulación:", formulacion); 
    this.selectedFormulacion = { ...formulacion }; 
    this.showEditModal = true; 
  }
  
  onEditSubmit(editForm: NgForm): void {
    if (editForm.valid) {
      const updatedFormulacionData = {
        nombre: this.selectedFormulacion.nombre 
      };
  
      this.http.put(`http://localhost:3000/producto/formulacion-modificar/${this.selectedFormulacion.id}`, updatedFormulacionData)
        .subscribe(() => {
          console.log('Formulación actualizada:', updatedFormulacionData);
          this.getFormulacionesList(); 
          this.closeEditModal();
        }, (error) => {
          console.error('Error al actualizar formulación:', error);
        });
    }
  }
  
  closeEditModal(): void {
    this.showEditModal = false; 
    this.selectedFormulacion = null; 
  }
  
  onDelete(formulacionId: number): void {
    console.log("Eliminar formulación con ID:", formulacionId);
    this.formulacionToDelete = formulacionId; 
    this.showDeleteConfirmation = true; 
  }

  confirmDelete(): void {
      if (this.formulacionToDelete) {
          this.http.delete(`http://localhost:3000/producto/formulacion-eliminar/${this.formulacionToDelete}`).subscribe(
              () => {
                  console.log('Formulación eliminada:', this.formulacionToDelete);
                  this.closeDeleteConfirmation(); 
                  this.getFormulacionesList();  
              },
              (error) => {
                  console.error('Error al eliminar formulación:', error);
              }
          );
      }
  }  

  closeDeleteConfirmation(): void {
      this.showDeleteConfirmation = false; 
      this.formulacionToDelete = null; 
  }
}
