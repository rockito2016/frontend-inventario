import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {

  private apiUrl = 'http://localhost:3000/api/productos-stock-minimo';
  private apiUrl2 = 'http://localhost:3000/api/productos-lista-precios';
  private apiUrl3 = 'http://localhost:3000/api/productos-stock-minimo-table';

  constructor(private http: HttpClient) { }

  getProducts(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getProductsList(): Observable<any> {
    return this.http.get<any>(this.apiUrl2);
  }

  getProductsStock(): Observable<any> {
    return this.http.get<any>(this.apiUrl3)
  }
}
