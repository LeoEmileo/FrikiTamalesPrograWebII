import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { Producto } from '../models/producto';



@Injectable({
  providedIn: 'root'
})
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
        cantidad: row.stock,
        imagen:   row.imagen_url
      } as Producto))
    )
  );
  }

  crearProducto(nuevo: Producto): Observable<any> {
    return this.http.post(this.apiUrl, nuevo);
  }

  modificarProducto(producto: Producto): Observable<any> {
    console.log('[ProductoService] Enviando PUT:', producto);
    return this.http.put(`${this.apiUrl}/${producto.id}`, producto);
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }



  sumarStock(producto: Producto, cantidad: number): Observable<Producto> {
    const nuevoStock = producto.cantidad + cantidad;
    const productoActualizado = { ...producto, cantidad: nuevoStock };
    return this.modificarProducto(productoActualizado).pipe(
      map(() => productoActualizado)
    );
  }
  

restarStock(producto: Producto, cantidad: number): Observable<Producto> {
  // Verificar stock
  if (producto.cantidad < cantidad) {
    return throwError(() => new Error('No hay suficiente stock'));
  }

  // Crear el objeto con la cantidad restada
  const nuevoStock = producto.cantidad - cantidad;
  const productoActualizado = { ...producto, cantidad: nuevoStock };

  // Llamar al backend para actualizar
  return this.modificarProducto(productoActualizado).pipe(
    map(() => productoActualizado) // Retornamos el producto con stock actualizado
  );
}


  
  generarXML(productos: Producto[]): string {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<productos>\n';
    productos.forEach(p => {
      xml += `  <producto>
    <id>${p.id}</id>
    <nombre>${p.nombre}</nombre>
    <precio>${p.precio}</precio>
    <cantidad>${p.cantidad}</cantidad>
    <imagen>${p.imagen}</imagen>
  </producto>\n`;
    });
    xml += '</productos>';
    return xml;
  }
}
