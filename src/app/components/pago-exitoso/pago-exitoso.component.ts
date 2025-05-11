import { Component, OnInit } from '@angular/core';
import { CarritoService } from '../../services/carrito.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pago-exitoso',
  standalone: true,
  templateUrl: './pago-exitoso.component.html',
  styleUrls: ['./pago-exitoso.component.css']
})
export class PagoExitosoComponent implements OnInit {

  constructor(
    private carritoService: CarritoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Genera y descarga el recibo automáticamente
    this.carritoService.generarYDescargarXML();
    // Vacía el carrito después del pago
    this.carritoService.vaciarCarrito();
  }

  regresarATienda() {
    this.router.navigate(['/']);
  }
}
