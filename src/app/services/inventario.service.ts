import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { Producto } from '../models/producto';
import { ProductoBackend } from '../models/Producto-backend';

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private apiUrl = 'http://localhost:3000/api/productos';

  constructor(private http: HttpClient) {}

  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(rows =>
        rows.map(row => ({
          id:         row.id_producto,
          nombre:     row.nombre,
          precio:     row.precio,
          cantidad:   row.stock,
          imagen:     row.imagen_url,
          descripcion: row.descripcion,
          categoria:   row.categoria
        } as Producto))
      )
    );
  }

  crearProducto(nuevo: ProductoBackend): Observable<any> {
    return this.http.post(this.apiUrl, nuevo);
  }

  modificarProducto(id: number, actualizado: ProductoBackend): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, actualizado);
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  sumarStock(producto: Producto, cantidad: number): Observable<Producto> {
    const nuevoStock = producto.cantidad + cantidad;
    const actualizado: ProductoBackend = {
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      categoria: producto.categoria,
      stock: nuevoStock,
      imagen_url: producto.imagen
    };
    return this.modificarProducto(producto.id, actualizado).pipe(map(() => ({ ...producto, cantidad: nuevoStock })));
  }

  restarStock(producto: Producto, cantidad: number): Observable<Producto> {
    if (producto.cantidad < cantidad) {
      return throwError(() => new Error('No hay suficiente stock'));
    }
    const nuevoStock = producto.cantidad - cantidad;
    const actualizado: ProductoBackend = {
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      categoria: producto.categoria,
      stock: nuevoStock,
      imagen_url: producto.imagen
    };
    return this.modificarProducto(producto.id, actualizado).pipe(map(() => ({ ...producto, cantidad: nuevoStock })));
  }
}
