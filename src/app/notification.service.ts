import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, interval, startWith, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private apiUrl = 'http://localhost:3000/inventario/stock-minimo';
  private notificasionesSubject = new BehaviorSubject<any[]>([]);
  public notificaciones$ = this.notificasionesSubject.asObservable();

  constructor(private http: HttpClient) {
    interval(5000).pipe(
      startWith(0),
      switchMap(() => this.http.get<any[]>(this.apiUrl)),
      distinctUntilChanged((prev, curr) => prev.length === curr.length)
    ).subscribe(
      (productos) => {
        this.notificasionesSubject.next(productos);
      }, (error) => {
        console.error("Error al cargar las notificaciones: ", error);
        this.notificasionesSubject.next([]);
      }
    )
  }

  cargarNotificaciones() {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (productos) => {
        this.notificasionesSubject.next(productos);
      },
      (error) => {
        console.error("Error al cargar las notificaciones: ", error);
        this.notificasionesSubject.next([]);
      }
    )
  }
}
