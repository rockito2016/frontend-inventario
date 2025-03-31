import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'login',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  loading: boolean = false;

  constructor(private http: HttpClient, private router: Router) { }

  onLogin() {
    this.loading = true;
    const loginData = {
      usuario: this.username,
      contrasena: this.password
    };

    this.http.post<any>('http://localhost:3000/api/login', loginData).subscribe(
      (response) => {
        this.loading = false;
        if (response.success) {
          const userId = response.id;
          const token = response.token;
          const userRole = response.rol_id;

          localStorage.setItem('userId', userId);
          localStorage.setItem('token', token);
          localStorage.setItem('userRole', userRole.toString());

          Swal.fire({
            title: '¡Bienvenido!',
            text: 'Inicio de sesión exitoso',
            icon: 'success',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
            willClose: () => {
              this.router.navigate(['/main/inicio']);
            }
          });
        } else {
          this.showErrorAndReload('Usuario o contraseña incorrectos');
        }
      },
      (error) => {
        this.loading = false;
        if (error.status === 401) {
          this.showErrorAndReload('Usuario o contraseña incorrectos');
        } else {
          this.showErrorAndReload('Error en el servidor');
          console.error('Error en el login:', error);
        }
      }
    );
  }

  showErrorAndReload(message: string) {
    Swal.fire('Error', message, 'error').then(() => {
      localStorage.clear();
      location.reload();
    });
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }
}
