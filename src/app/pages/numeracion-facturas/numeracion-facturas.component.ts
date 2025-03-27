import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-numeracion-facturas',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './numeracion-facturas.component.html',
  styleUrl: './numeracion-facturas.component.css'
})
export class NumeracionFacturasComponent implements OnInit {
  facturas: any[] = [];
  fechaSeleccionada: string = '';
  facturaInicial: string = '';
  facturaFinal: string = '';
  showRegisterConfirmation: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getConfiguracionFacturas();
  }

  getConfiguracionFacturas(): void {
    this.http.get<any[]>('http://localhost:3000/api/configuracion-facturas').subscribe(
      (data) => {
        this.facturas = data.map(factura => ({
          ...factura,
          fecha: factura.fecha ? factura.fecha.split('T')[0] : '' 
        }));
      },
      (error) => {
        console.error('Error al obtener la configuración de facturas:', error);
      }
    );
  }

  openRegisterConfirmation(): void {
    this.showRegisterConfirmation = true;
  }

  closeRegisterConfirmation(): void {
    this.showRegisterConfirmation = false;
  }

  confirmRegister(): void {
    const facturaData = {
      fecha: this.fechaSeleccionada,
      numero_factura_inicial: this.facturaInicial,
      numero_factura_final: this.facturaFinal
    };
  
    this.http.post('http://localhost:3000/agregar-configuracion-factura', facturaData)
      .subscribe(
        (response) => {
          console.log('Configuración de factura agregada:', response);
          location.reload(); 
        },
        (error) => {
          console.error('Error al registrar la configuración de factura:', error);
          alert("Error al registrar la factura");
        }
      );
  }
  
}
 