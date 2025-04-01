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
  showModal = false;
  userImage: string | null = null;
  selectedImage: string | null = null;
  selectedFileName = '';
  userId: string | null = null;
  showLogoutConfirmationModal = false;
  showPassword = false;
  rol = '';
  nombre = '';
  usuario = '';
  contrasena = '';

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
    if (this.userId) {
      this.userImage = localStorage.getItem(`userImage_${this.userId}`);
      this.selectedFileName = localStorage.getItem(`selectedFileName_${this.userId}`) || '';
    }
  }

  obtenerDatosUsuario(id: number): void {
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders().set('Authorization', token);
      this.http.get<any>(`http://localhost:3000/api/datos-usuarios/${id}`, { headers }).subscribe({
        next: (data) => {
          this.rol = data.rol;
          this.nombre = data.nombre;
          this.usuario = data.usuario;
        },
        error: (error) => {
          console.error('Error al obtener los datos del usuario:', error);
        }
      });
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
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  saveChanges(): void {
    if (this.selectedImage && this.userId) {
      this.userImage = this.selectedImage;
      localStorage.setItem(`userImage_${this.userId}`, this.userImage);
    }
    if (this.selectedFileName && this.userId) {
      localStorage.setItem(`selectedFileName_${this.userId}`, this.selectedFileName);
    }
    this.closeModal();
  }

  selectFile(): void {
    const fileInput = document.getElementById('foto') as HTMLInputElement;
    fileInput.click();
  }

  showLogoutConfirmation(): void {
    this.showLogoutConfirmationModal = true;
  }

  closeLogoutConfirmation(): void {
    this.showLogoutConfirmationModal = false;
  }

  confirmLogout(): void {
    this.showLogoutConfirmationModal = false;
    localStorage.removeItem('userId');
    this.router.navigate(['/login']);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
