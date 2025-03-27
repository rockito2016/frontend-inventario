import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-balance-mensual',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  templateUrl: './balance-mensual.component.html',
  styleUrl: './balance-mensual.component.css'
})
export class BalanceMensualComponent implements OnInit{
  balanceMensual: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.obtenerBalanceMensual();
  }

  obtenerBalanceMensual(): void {
    this.http.get<any[]>('http://localhost:3000/balance-total').subscribe(
      data => {
        this.balanceMensual = data.map(item => ({
          ...item,
          mes: item.mes.charAt(0).toUpperCase() + item.mes.slice(1) 
        }));
      },
      error => console.error('Error al obtener el balance mensual:', error)
    );
  }
}
 