import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Producto } from '../models/producto';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private apiUrl = 'http://localhost:3000/api/productos';

  constructor(private http: HttpClient) {}

  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(rows =>
        rows.map(row => ({
          id:       row.id_producto,
          nombre:   row.nombre,
          precio:   row.precio,
          cantidad: row.stock, // asegúrate de que en el backend devuelvas 'stock'
          imagen:   row.imagen_url
        } as Producto))
      )
    );
  }
}
