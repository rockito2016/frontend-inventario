import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatCommonModule } from '@angular/material/core';

@Component({
  selector: 'categoria',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, MatCommonModule],
  templateUrl: './categoria.component.html',
  styleUrl: './categoria.component.css'
}) 

export class CategoriaComponent {
  categoriaList: any[] = []; 
  subcategoriaList: any[] = []; 
  showAddModalCategoria: boolean = false;
  showAddModalSubcategoria: boolean = false;
  showEditModal: boolean = false;
  showEditModalSubcategoria: boolean = false;
  selectedCategoria: any;
  selectedSubcategoria: any;
  showDeleteConfirmation: boolean = false;
  categoriaToDelete: number | null = null;
  subcategoriaToDelete: number | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getCategoriasList(); 
    this.getSubcategoriasList();
  }

// Categoria

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

  onAddCategoria(): void {
    this.showAddModalCategoria = true; 
  }

  onSubmit(categoryForm: NgForm): void {
    const categoriaData = {
        nombre: categoryForm.value.nombre 
    };

    this.http.post('http://localhost:3000/producto/categoria-agregar', categoriaData)
        .subscribe((response) => {
            console.log('Categoría registrada:', response);
            this.getCategoriasList(); 
            categoryForm.reset(); 
            this.closeAddModal(); 
        }, (error) => {
            console.error('Error al registrar categoría:', error);
        });
  }

  closeAddModal(): void {
    this.showAddModalCategoria = false;
  }

  onEdit(categoria: any): void {
    console.log("Editar categoría:", categoria); 
    this.selectedCategoria = { ...categoria };   
    this.showEditModal = true;                    
    console.log("Categoría seleccionada para editar:", this.selectedCategoria); 
  }
  

  onEditSubmit(editForm: NgForm): void {
    if (editForm.valid) {
      const updatedCategoriaData = {
        nombre: this.selectedCategoria.nombre 
      };

      this.http.put(`http://localhost:3000/producto/categoria-modificar/${this.selectedCategoria.id}`, updatedCategoriaData)
        .subscribe(() => {
          console.log('Categoría actualizada:', updatedCategoriaData);
          this.getCategoriasList(); 
          this.closeEditModal();
        }, (error) => {
          console.error('Error al actualizar categoría:', error);
        });
    }
  }

  closeEditModal(): void {
    this.showEditModal = false; 
    this.selectedCategoria = null; 
  }

  onDelete(categoriaId: number): void {
    console.log("Eliminar categoría con ID:", categoriaId);
    this.categoriaToDelete = categoriaId; 
    this.showDeleteConfirmation = true; 
  }

  confirmDelete(): void {
    if (this.categoriaToDelete) {
        this.http.delete(`http://localhost:3000/producto/categoria-eliminar/${this.categoriaToDelete}`).subscribe(
            () => {
                console.log('Categoría eliminada:', this.categoriaToDelete);
                this.closeDeleteConfirmation(); 
                this.getCategoriasList(); 
            },
            (error) => {
                console.error('Error al eliminar categoría:', error);
            }
        );
    }
  }  

  closeDeleteConfirmation(): void {
    this.showDeleteConfirmation = false; 
    this.categoriaToDelete = null; 
  }

// Subcategoria

getSubcategoriasList(): void {
  this.http.get<any[]>('http://localhost:3000/producto/subcategoria').subscribe(
    (data) => {
      this.subcategoriaList = data; 
      console.log('Subcategorías cargadas:', this.subcategoriaList); 
    },
    (error) => {
      console.error('Error al obtener las subcategorías:', error);
    }
  );
  }

  onAddSubcategoria(): void {
    this.selectedSubcategoria = {
      categoria_id: null, 
      subcategoria_nombre: '' 
    };
    this.showAddModalSubcategoria = true;
  }
  

  onSubmitSubcategoria(subcategoriaForm: NgForm): void {
    const subcategoriaData = {
        categoria_id: subcategoriaForm.value.categoria_id,
        nombre: subcategoriaForm.value.nombre
    };

    this.http.post('http://localhost:3000/producto/subcategoria-agregar', subcategoriaData)
        .subscribe((response) => {
            console.log('Subcategoría registrada:', response);
            this.getSubcategoriasList(); 
            subcategoriaForm.reset();
            this.closeAddModalSubcategoria(); 
        }, (error) => {
            console.error('Error al registrar subcategoría:', error);
        });
  }

  closeAddModalSubcategoria(): void {
    this.showAddModalSubcategoria = false;
  }

  onEditSubcategoria(subcategoria: any): void {
    console.log("Editar subcategoría:", subcategoria);
    
    const categoria = this.categoriaList.find(cat => cat.nombre === subcategoria.categoria_id);
    
    this.selectedSubcategoria = {
      ...subcategoria,
      categoria_id: categoria ? categoria.id : null, 
      subcategoria_nombre: subcategoria.subcategoria_nombre || subcategoria.nombre 
    };
  
    this.showEditModalSubcategoria = true;
    console.log("Subcategoría seleccionada para editar:", this.selectedSubcategoria); 
  }
  
  onEditSubmitSubcategoria(editForm: NgForm): void {
    if (editForm.valid) {
        const updatedSubcategoriaData = {
            categoria_id: this.selectedSubcategoria.categoria_id,
            nombre: this.selectedSubcategoria.nombre 
        };

        this.http.put(`http://localhost:3000/producto/subcategoria-modificar/${this.selectedSubcategoria.id}`, updatedSubcategoriaData)
            .subscribe(() => {
                console.log('Subcategoría actualizada:', updatedSubcategoriaData);
                this.getSubcategoriasList(); 
                this.closeEditModalSubcategoria(); 
            }, (error) => {
                console.error('Error al actualizar subcategoría:', error);
            });
    }
  }

  closeEditModalSubcategoria(): void {
    this.showEditModalSubcategoria = false; 
    this.selectedSubcategoria = null; 
  }  

  onDeleteSubcategoria(subcategoriaId: number): void {
    console.log("Eliminar subcategoría con ID:", subcategoriaId);
    this.subcategoriaToDelete = subcategoriaId;
    this.showDeleteConfirmation = true; 
  }
 
  confirmDeleteSubcategoria(): void {
    if (this.subcategoriaToDelete) {
        this.http.delete(`http://localhost:3000/producto/subcategoria-eliminar/${this.subcategoriaToDelete}`).subscribe(
            () => {
                console.log('Subcategoría eliminada:', this.subcategoriaToDelete);
                this.closeDeleteConfirmationSubcategoria(); 
                this.getSubcategoriasList();  
            },
            (error) => {
                console.error('Error al eliminar subcategoría:', error);
            }
        );
    }
  } 

  closeDeleteConfirmationSubcategoria(): void {
    this.showDeleteConfirmation = false; 
    this.subcategoriaToDelete = null;  
  }
}
