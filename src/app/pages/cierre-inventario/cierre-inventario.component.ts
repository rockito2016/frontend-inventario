import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cierre-inventario',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './cierre-inventario.component.html',
  styleUrl: './cierre-inventario.component.css'
})
export class CierreInventarioComponent implements OnInit  {
  fechaSeleccionadainicio: string = '';
  fechaSeleccionadafin: string = '';
  showRealizarConfirmation: boolean = false;
  cierresInventario: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.obtenerCierresInventario();

  }

  obtenerCierresInventario() {
    this.http.get<any[]>('http://localhost:3000/visualizar/cierre-inventario')
      .subscribe(data => {
        this.cierresInventario = data;
      }, error => {
        console.error("Error al obtener los cierres de inventario", error);
      });
  }

  openRalizarConfirmation(): void {
    this.showRealizarConfirmation = true;
  }

  closeRealizarConfirmation(): void {
    this.showRealizarConfirmation = false;
  }

  confirmRealizar(): void {
    if (!this.fechaSeleccionadainicio || !this.fechaSeleccionadafin) {
      alert("Por favor, selecciona ambas fechas antes de confirmar.");
      return;
    }
  
    const requestBody = {
      fecha_inicio: this.fechaSeleccionadainicio,
      fecha_cierre: this.fechaSeleccionadafin
    };
  
    this.http.post('http://localhost:3000/realizar/cierre-inventario', requestBody)
      .subscribe(
        (response: any) => {
          this.closeRealizarConfirmation(); 
          window.location.reload(); 
        },
        (error) => {
          console.error("Error al realizar el cierre de inventario", error);
        }
      );
  }
}
 