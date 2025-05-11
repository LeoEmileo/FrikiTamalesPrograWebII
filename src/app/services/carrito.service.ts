import { Injectable } from '@angular/core';
import { Producto } from '../models/producto';
import { ProductoService } from './producto.service';
import { Observable, of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  // Internamente guardamos cada unidad agregada al carrito.
  private carrito: Producto[] = [];

  constructor(private productoService: ProductoService) {
    this.cargarCarritoDesdeLocalStorage();
  }

  /**
   * Actualiza la cantidad de un producto en el carrito:
   * - Si 'cambio' es positivo, agrega unidades (previo chequeo de stock).
   * - Si 'cambio' es negativo, quita unidades.
   * Luego sincroniza la actualización del stock en el backend.
   */
  actualizarCantidad(producto: Producto, cambio: number): void {
    this.productoService.obtenerProductos().subscribe(productos => {
      const prod = productos.find(p => p.id === producto.id);
      if (!prod) {
        console.error('Producto no encontrado.');
        return;
      }

      if (cambio > 0) {
        // Verificar que haya suficiente stock para agregar la cantidad solicitada
        if (prod.cantidad < cambio) {
          alert('Stock insuficiente para agregar más unidades.');
          console.error('Stock insuficiente para agregar más unidades.');
          return;
        }
        // Agrega 'cambio' unidades al carrito
        for (let i = 0; i < cambio; i++) {
          this.carrito.push(producto);
        }
      } else if (cambio < 0) {
        // Para remover, quita las unidades solicitadas del carrito
        for (let i = 0; i < Math.abs(cambio); i++) {
          const index = this.carrito.findIndex(p => p.id === producto.id);
          if (index !== -1) {
            this.carrito.splice(index, 1);
          }
        }
      }

      // Actualiza el stock en el backend usando la función fusionada
      this.actualizarStock(prod, cambio);
      this.guardarCarritoEnLocalStorage();

    });


  }

  private actualizarStock(prod: Producto, cambio: number): void {
    // Si cambio > 0, se reduce el stock; si es negativo, se incrementa
    const nuevoStock = prod.cantidad - cambio;
    const productoActualizado = { ...prod, cantidad: nuevoStock };

    this.productoService.modificarProducto(productoActualizado).subscribe({
      next: () => console.log(`Stock actualizado a ${nuevoStock} para producto ID ${prod.id}`),
      error: err => console.error(`Error al actualizar stock para producto ID ${prod.id}:`, err)
    });
  }

  /**
   * Devuelve el carrito agrupado: cada producto aparece una sola vez con la cantidad correspondiente.
   */
  obtenerCarritoAgrupado(): { producto: Producto, cantidad: number }[] {
    const carritoAgrupado: { [id: number]: { producto: Producto, cantidad: number } } = {};
    this.carrito.forEach(producto => {
      if (carritoAgrupado[producto.id]) {
        carritoAgrupado[producto.id].cantidad++;
      } else {
        carritoAgrupado[producto.id] = { producto, cantidad: 1 };
      }
    });
    return Object.values(carritoAgrupado);
  }

  /**
   * Calcula el total sumando (precio * cantidad) de cada producto en el carrito.
   */
  obtenerTotal(): number {
    const agrupado = this.obtenerCarritoAgrupado();
    return agrupado.reduce((acc, item) => acc + (item.producto.precio * item.cantidad), 0);
  }

  /**
   * Genera un XML con el contenido del carrito.
   */
  generarXML(): string {
    const carrito = this.obtenerCarritoAgrupado();
    const subtotal = this.obtenerTotal();
    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4"\n`;
    xml += `Version="4.0"\n`;
    xml += `Serie="FT"\n`;
    xml += `Folio="0001"\n`;
    xml += `Fecha="${new Date().toISOString()}"\n`;
    xml += `FormaPago="03"\n`;
    xml += `Moneda="MXN"\n`;
    xml += `SubTotal="${subtotal.toFixed(2)}"\n`;
    xml += `Total="${total.toFixed(2)}"\n`;
    xml += `TipoDeComprobante="I"\n`;
    xml += `MetodoPago="PEIPAI">\n\n`;

    xml += `  <cfdi:Nombre="FrikiTamales"/>\n`;
    xml += `  <cfdi:Nombre del receptor="Juan Pérez"/>\n\n`;
    xml += `  <cfdi:Conceptos>\n`;

    carrito.forEach(item => {
      const importe = item.producto.precio * item.cantidad;
      xml += `    <cfdi:Concepto ClaveProdServ="50181900"\n`;
      xml += `      Cantidad="${item.cantidad}"\n`;
      xml += `      ClaveUnidad="H87"\n`;
      xml += `      Descripcion="${item.producto.nombre}"\n`;
      xml += `      ValorUnitario="${item.producto.precio.toFixed(2)}"\n`;
      xml += `      Importe="${importe.toFixed(2)}"/>\n`;
    });

    xml += `  </cfdi:Conceptos>\n`;
    xml += `</cfdi:Comprobante>`;

    return xml;
  }


  obtenerCantidad(id: number): number {
    return this.carrito.filter(p => p.id === id).length;
  }

  /**
   * Genera el XML y fuerza su descarga en el navegador.
   */
  generarYDescargarXML(): void {
    const xml = this.generarXML();
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recibo.xml';
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Actualiza el carrito completo (por ejemplo, para reinicializarlo).
   */
  actualizarCarrito(nuevoCarrito: Producto[]): void {
    this.carrito = nuevoCarrito;
    this.guardarCarritoEnLocalStorage();
  }

  private guardarCarritoEnLocalStorage(): void {
    localStorage.setItem('carrito', JSON.stringify(this.carrito));
  }

  cargarCarritoDesdeLocalStorage(): void {
    const data = localStorage.getItem('carrito');
    if (data) {
      const crudo: Producto[] = JSON.parse(data);
      this.carrito = crudo.map(p => ({
        ...p,
        precio: Number(p.precio),
        cantidad: Number(p.cantidad),
        id: Number(p.id)
      }));
    }
  }



  vaciarCarrito(): void {
    this.carrito = [];
    localStorage.removeItem('carrito');
  }


}
