import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pago-cancelado',
  standalone: true,
  templateUrl: './pago-cancelado.component.html',
  styleUrls: ['./pago-cancelado.component.css']
})
export class PagoCanceladoComponent {
  constructor(private router: Router) {}

  volverAlCarrito() {
    this.router.navigate(['/carrito']);
  }
}
