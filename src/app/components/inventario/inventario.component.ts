import { Component, OnInit } from '@angular/core';
import { ProductoService} from '../../services/producto.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { Producto } from '../../models/producto'

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent implements OnInit {
  productos: Producto[] = [];
  // Modelo para crear un producto nuevo (sin id)
  productoModelo: Omit<Producto, 'id'> = {
    nombre: '',
    precio: 0,
    cantidad: 0,
    imagen: '',
    //descripcion: ''
  };

  constructor(private productoService: ProductoService, private router: Router) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos() {
    this.productoService.obtenerProductos().subscribe(data => {
      this.productos = data;
    });
  }

  crearProducto() {
    this.productoService.crearProducto(this.productoModelo as Producto)
      .subscribe(() => {
        this.cargarProductos();
        this.productoModelo = { nombre: '', precio: 0, cantidad: 0, imagen: '', /*descripcion: ''*/ };
      });
  }

  modificarProducto(producto: Producto) {
    this.productoService.modificarProducto(producto)
      .subscribe(() => {
        this.cargarProductos();
      });
  }

  eliminarProducto(id: number) {
    this.productoService.eliminarProducto(id)
      .subscribe(() => {
        this.cargarProductos();
      });
  }

  irATienda(): void {
    this.router.navigate(['/']);
  }

}
