import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatCommonModule } from '@angular/material/core';

@Component({
  selector: 'elaborado',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, MatCommonModule],
  templateUrl: './elaborado.component.html',
  styleUrls: ['./elaborado.component.css'] 
})
export class ElaboradoComponent {
  elaboradoList: any[] = []; 
  showAddModal: boolean = false;
  showEditModal: boolean = false;
  selectedElaborado: any;
  showDeleteConfirmation: boolean = false;
  elaboradoToDelete: number | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getElaboradosList(); 
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

  onAdd(): void {
    this.showAddModal = true; 
  }

  onSubmit(elaboradoForm: NgForm): void {
    const elaboradoData = {
        nombre: elaboradoForm.value.nombre 
    };

    this.http.post('http://localhost:3000/producto/elaborado-agregar', elaboradoData)
        .subscribe((response) => {
            console.log('Elaboración registrada:', response);
            this.getElaboradosList(); 
            elaboradoForm.reset(); 
            this.closeAddModal(); 
        }, (error) => {
            console.error('Error al registrar elaboración:', error);
        });
  }

  closeAddModal(): void {
      this.showAddModal = false; 
  }

  onEdit(elaborado: any): void {
    console.log("Editar elaboración:", elaborado); 
    this.selectedElaborado = { ...elaborado }; 
    this.showEditModal = true; 
  }
  
  onEditSubmit(editForm: NgForm): void {
    if (editForm.valid) {
      const updatedElaboradoData = {
        nombre: this.selectedElaborado.nombre 
      };

      this.http.put(`http://localhost:3000/producto/elaborado-modificar/${this.selectedElaborado.id}`, updatedElaboradoData)
        .subscribe(() => {
          console.log('Elaboración actualizada:', updatedElaboradoData);
          this.getElaboradosList(); 
          this.closeEditModal();
        }, (error) => {
          console.error('Error al actualizar elaboración:', error);
        });
    }
  }
  
  closeEditModal(): void {
    this.showEditModal = false; 
    this.selectedElaborado = null; 
  }
  
  onDelete(elaboradoId: number): void {
    console.log("Eliminar elaboración con ID:", elaboradoId);
    this.elaboradoToDelete = elaboradoId; 
    this.showDeleteConfirmation = true; 
  }

  confirmDelete(): void {
      if (this.elaboradoToDelete) {
          this.http.delete(`http://localhost:3000/producto/elaborado-eliminar/${this.elaboradoToDelete}`).subscribe(
              () => {
                  console.log('Elaboración eliminada:', this.elaboradoToDelete);
                  this.closeDeleteConfirmation(); 
                  this.getElaboradosList(); 
              },
              (error) => {
                  console.error('Error al eliminar elaboración:', error);
              }
          );
      }
  }  

  closeDeleteConfirmation(): void {
      this.showDeleteConfirmation = false; 
      this.elaboradoToDelete = null; 
  }
}
