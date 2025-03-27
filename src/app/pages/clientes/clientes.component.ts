import { CommonModule } from '@angular/common'; 
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

@Component({ 
  selector: 'clientes',
  standalone: true, 
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.css']
})  
export class ClientesComponent implements OnInit {
  clientList: any[] = []; 
  searchTerm: string = '';
  selectedClient: any; 
  showAddModal: boolean = false;
  showDeleteConfirmation: boolean = false; 
  clientToDelete: number | null = null; 

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getClientsList();
  } 

  getClientsList(): void {
    this.http.get<any[]>('http://localhost:3000/contactos/cliente').subscribe(
      (data) => {
        this.clientList = data.map(cliente => ({
          ...cliente,
          cedula: Number(cliente.cedula),
          celular: Number(cliente.celular)
        }));
      },
      (error) => {
        console.error('Error al obtener los clientes:', error);
      }
    );
  }

  filteredClients() {
    if (!this.searchTerm) {
      return this.clientList; 
    }
 
    return this.clientList.filter(cliente =>
      cliente.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      cliente.cedula.toString().includes(this.searchTerm)
    );
  } 

  onSearch(): void {}

  onSubmit(userForm: NgForm): void {
    const clienteData = {
      ...userForm.value,
      cedula: Number(userForm.value.cedula),
      celular: Number(userForm.value.celular)
    };
  
    this.http.post('http://localhost:3000/contactos/cliente-agregar', clienteData)
      .subscribe((response) => {
        console.log('Cliente registrado:', response);
        this.getClientsList(); 
        this.closeAddModal(); 
        userForm.reset(); 
      }, (error) => {
        console.error('Error al registrar cliente:', error);
      });
  }

  onEdit(cliente: any): void {
    this.selectedClient = { ...cliente }; 
  }
 
  onEditSubmit(editForm: NgForm): void {
    const updatedClientData = {
      ...editForm.value,
      cedula: Number(editForm.value.cedula),
      celular: Number(editForm.value.celular)
    };

    this.http.put(`http://localhost:3000/contactos/cliente-modificar/${this.selectedClient.cedula}`, updatedClientData)
    .subscribe(() => {
        console.log('Cliente actualizado:', updatedClientData);
        this.getClientsList();
        this.closeEditModal();
      }, (error) => {
        console.error('Error al actualizar cliente:', error);
      });
  } 

  closeEditModal(): void {
    this.selectedClient = null; 
  }

   onRequestDelete(cliente: any): void {
    this.clientToDelete = cliente.cedula; 
    this.showDeleteConfirmation = true; 
  }
  formatCedula(cedula: number): string {
    return cedula.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  

  onDelete(client: any): void {
    this.clientToDelete = client; 
    this.showDeleteConfirmation = true; 
  }

  closeDeleteConfirmation(): void {
    this.showDeleteConfirmation = false; 
    this.clientToDelete = null; 
  }
 
  // Método para confirmar la eliminación
  confirmDelete(): void {
    if (this.clientToDelete) {
      this.http.delete(`http://localhost:3000/contactos/cliente-eliminar/${this.clientToDelete}`).subscribe(
        () => {
          console.log('Cliente eliminado:', this.clientToDelete);
          this.closeDeleteConfirmation(); 
          this.getClientsList(); 
        },
        (error) => {
          console.error('Error al eliminar cliente:', error);
        }
      );
    }
  }

  onAdd(): void {
    this.showAddModal = true; 
  }

  closeAddModal(): void {
    this.showAddModal = false; 
  }
}


