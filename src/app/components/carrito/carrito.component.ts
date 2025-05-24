import { Component, OnInit } from '@angular/core';
import { CarritoService } from '../../services/carrito.service';
import { ProductoService } from '../../services/producto.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Producto } from '../../models/producto';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit {
  carrito: { producto: Producto, cantidad: number }[] = [];
  subtotal: number = 0;
  iva: number = 0;
  total: number = 0;

  constructor(
    private carritoService: CarritoService,
    private productoService: ProductoService,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.actualizarCarrito();
  }



  pagarConPaypal(): void {
    const subtotal = this.carritoService.obtenerTotal();
    const iva = subtotal * 0.16;
    const total = +(subtotal + iva).toFixed(2);

    if (total <= 0) {
      alert('Tu carrito está vacío.');
      return;
    }

    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    if (!usuario?.id) {
      alert('Debes iniciar sesión para realizar el pago.');
      return;
    }

    const carritoBackend = this.carritoService.obtenerCarritoAgrupado().map(item => ({
      producto: {
        id: item.producto.id,
        precio: item.producto.precio
      },
      cantidad: item.cantidad
    }));

    this.http.post<any>('http://localhost:3000/api/pagar', {
      total,
      id_usuario: usuario.id,
      carrito: carritoBackend
    }).subscribe({
      next: (res) => {
        const link = res.links.find((l: any) => l.rel === 'approve');
        if (link) {
          window.location.href = link.href; // Redirige a PayPal
        } else {
          alert('No se pudo obtener enlace de aprobación.');
        }
      },
      error: (err) => {
        console.error('Error al generar orden de PayPal:', err);
        alert('Ocurrió un error al generar la orden de pago.');
      }
    });
  }



  actualizarCarrito() {
    this.carrito = this.carritoService.obtenerCarritoAgrupado();
    this.subtotal = this.carritoService.obtenerTotal();
    this.iva = this.subtotal * 0.16;
    this.total = this.subtotal + this.iva;
  }


  // Al aumentar o disminuir se llama al método unificado y se refresca la vista tras un retardo breve
  aumentarCantidad(producto: Producto) {
    this.carritoService.actualizarCantidad(producto, 1);
    setTimeout(() => {
      this.actualizarCarrito();
    }, 50);
  }


  disminuirCantidad(producto: Producto) {
    this.carritoService.actualizarCantidad(producto, -1);
    setTimeout(() => {
      this.actualizarCarrito();
    }, 50);
  }


  eliminarProducto(item: { producto: Producto, cantidad: number }) {
    // quita tantas unidades como tenga ese producto
    this.carritoService.actualizarCantidad(item.producto, -item.cantidad);
    // refresca la vista un poquito después (igual que en tus otros métodos)
    setTimeout(() => this.actualizarCarrito(), 50);
  }


  generarYDescargarXML() {
    const xml = this.carritoService.generarXML();
    console.log("Recibo generado:\n", xml);
    this.descargarXML(xml);
  }

  descargarXML(xml: string) {
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recibo.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  navegarATienda() {
    this.router.navigate(['/']);
  }

  vaciarCarrito(): void {
    this.carritoService.vaciarCarrito();
    setTimeout(() => this.actualizarCarrito(), 50);
  }


}
