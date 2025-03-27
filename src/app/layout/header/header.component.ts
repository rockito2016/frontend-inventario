import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NotificationComponent } from '../../pages/notification/notification.component';

@Component({
  selector: 'header',
  standalone: true,
  imports: [MatToolbarModule, CommonModule, HttpClientModule, FormsModule, NotificationComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  showModal: boolean = false;
  userImage: string = '';
  selectedImage: string | null = null;
  selectedFileName: string = '';
  userId: string | null = null;
  showDeleteConfirmation: boolean = false;
  showLogoutConfirmationModal = false;
  showPassword: boolean = false;
  rol: string = '';
  nombre: string = '';
  usuario: string = '';
  contrasena: string = '';

  constructor(private router: Router, private http: HttpClient) { }

  ngOnInit(): void {
    this.userId = localStorage.getItem('userId');

    if (this.userId) {
      this.obtenerDatosUsuario(Number(this.userId));
      this.loadUserImage();
    } else {
      console.warn('No se encontró el ID de usuario en localStorage');
    }
  }

  loadUserImage(): void {
    const savedImage = localStorage.getItem(`userImage_${this.userId}`);
    this.userImage = savedImage ? savedImage : 'assets/default-avatar.jpg';
    this.selectedFileName = localStorage.getItem(`selectedFileName_${this.userId}`) || '';
  }

  obtenerDatosUsuario(id: number): void {
    const token = localStorage.getItem('token'); // Obtener el token del localStorage

    if (token) { // Verificar que el token no sea null
      const headers = new HttpHeaders().set('Authorization', token);

      this.http.get<any>(`http://localhost:3000/api/datos-usuarios/${id}`, { headers }).subscribe(
        (data) => {
          this.rol = data.rol;
          this.nombre = data.nombre;
          this.usuario = data.usuario;
        },
        (error) => {
          console.error('Error al obtener los datos del usuario:', error);
        }
      );
    } else {
      console.error('No se encontró el token de autorización');
    }
  }

  openModal(): void {
    this.selectedFileName = localStorage.getItem(`selectedFileName_${this.userId}`) || '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onImageSelect(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFileName = file.name;
      localStorage.setItem(`selectedFileName_${this.userId}`, this.selectedFileName);

      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  saveChanges(): void {
    if (this.selectedImage) {
      this.userImage = this.selectedImage;
      localStorage.setItem(`userImage_${this.userId}`, this.userImage);
    }
    if (this.selectedFileName) {
      localStorage.setItem(`selectedFileName_${this.userId}`, this.selectedFileName);
    }
    this.closeModal();
  }

  selectFile(): void {
    const fileInput = document.getElementById('foto') as HTMLInputElement;
    fileInput.click();
  }

  showLogoutConfirmation() {
    this.showLogoutConfirmationModal = true;
  }

  closeLogoutConfirmation() {
    this.showLogoutConfirmationModal = false;
  }

  confirmLogout() {
    this.showLogoutConfirmationModal = false;
    localStorage.removeItem('userId');
    this.router.navigate(['/login']);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
