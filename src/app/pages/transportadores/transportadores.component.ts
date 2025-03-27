import { CommonModule } from '@angular/common'; 
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
 
@Component({ 
  selector: 'transportadores',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './transportadores.component.html',
  styleUrls: ['./transportadores.component.css']
})
export class TransportadorComponent implements OnInit {
  transportadorList: any[] = [];
  searchTerm: string = '';
  showAddModal: boolean = false;
  municipios: any[] = []; 
  selectedMunicipio: string = ''; 
  showMunicipios: boolean = false;
  transportadorToDelete: number | null = null; 
  showDeleteConfirmation: boolean = false; 
  selectedTransportador: any;
  showEditModal: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getTransportadorsList();
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

  onSearch(): void {}

  onAdd(): void {
    this.showAddModal = true; 
    this.selectedMunicipio = ''; 
    this.municipios = []; 
    this.showMunicipios = false; 
  }

  filteredTransportador() {
    if (!this.searchTerm) {
      return this.transportadorList; 
    }

    return this.transportadorList.filter(transportador =>
      transportador.nombre.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  closeAddModal(): void {
    this.showAddModal = false; 
  }

  searchMunicipios(): void {
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

  onSubmit(userForm: NgForm): void {
    const transportadorData = {
        nombre: userForm.value.nombre, 
        celular: Number(userForm.value.celular), 
        municipio_id: this.selectedMunicipio 
    };

    this.http.post('http://localhost:3000/contactos/transportador-agregar', transportadorData)
        .subscribe((response) => {
            console.log('Transportador registrado:', response);
            this.getTransportadorsList(); 
            userForm.reset(); 
            this.closeAddModal(); 
        }, (error) => {
            console.error('Error al registrar transportador:', error);
        });
  }

  onDelete(transportador: any): void {
    this.transportadorToDelete = transportador; 
    this.showDeleteConfirmation = true; 
  }

  onEdit(transportador: any) {
    this.selectedTransportador = { ...transportador }; 
    this.selectedMunicipio = transportador.municipio_id; 
    this.showEditModal = true;
  }
  

  onEditSubmit(editForm: NgForm): void {
    if (editForm.valid) {
      const updatedTransportadorData = {
        ...this.selectedTransportador,
        celular: Number(this.selectedTransportador.celular),
        municipio_id: this.selectedMunicipio 
      };
  
      this.http.put(`http://localhost:3000/contactos/transportador-modificar/${this.selectedTransportador.id}`, updatedTransportadorData)
        .subscribe(() => {
          console.log('Transportador actualizado:', updatedTransportadorData);
          this.getTransportadorsList();
          this.closeEditModal();
        }, (error) => {
          console.error('Error al actualizar transportador:', error);
        });
    }
  }

  closeEditModal(): void {
    this.showEditModal = false; 
    this.selectedTransportador = null; 
  }

  closeDeleteConfirmation(): void {
    this.showDeleteConfirmation = false;
    this.transportadorToDelete = null; 
  }

  confirmDelete(): void {
    if (this.transportadorToDelete) {
      this.http.delete(`http://localhost:3000/contactos/transportador-eliminar/${this.transportadorToDelete}`).subscribe(
        () => {
          console.log('Transportador eliminado:', this.transportadorToDelete);
          this.closeDeleteConfirmation(); 
          this.getTransportadorsList(); 
        },
        (error) => {
          console.error('Error al eliminar transportador:', error);
        }
      );
    }
  }
}
