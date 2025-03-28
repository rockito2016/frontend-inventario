import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  name: string = '';
  username: string = '';
  password: string = '';
  role: string = '';
  roles: any[] = [];

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit() {
    this.getRoles();
  }

  getRoles() {
    this.http.get<any>('https://backend-7ahk2l57r-javier-pascuaza-s-projects.vercel.app/api/roles').subscribe(
      (response) => {
        this.roles = response;
      },
      (error) => {
        console.error('Error al obtener los roles:', error);
      }
    );
  }

  onRegister() {
    if (!this.isValidEmail(this.username)) {
      Swal.fire('Error', 'Ingrese un correo electrónico válido', 'error');
      return;
    }

    const registerData = {
      nombre: this.name,
      usuario: this.username,
      contrasena: this.password,
      rol_id: this.role
    };

    this.http.post<any>('https://backend-7ahk2l57r-javier-pascuaza-s-projects.vercel.app/api/register', registerData).subscribe(
      (response) => {
        if (response.success) {
          Swal.fire('Registro exitoso', 'El usuario ha sido registrado correctamente', 'success');
          this.router.navigate(['/login']);
        } else {
          if (response.message === 'El usuario ya está registrado') {
            this.showErrorAndReload('El usuario ya está ocupado');
          } else {
            this.showErrorAndReload(response.message);
          }
        }
      },
      (error) => {
        console.error('Error en el registro:', error);
        this.showErrorAndReload('Error en el servidor');
      }
    );
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  isValidEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }

  showErrorAndReload(message: string) {
    Swal.fire('Error', message, 'error').then(() => {
      localStorage.clear();
      location.reload();
    });
  }
}
