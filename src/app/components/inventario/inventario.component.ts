import { Component, OnInit } from '@angular/core';
import { InventarioService } from '../../services/inventario.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { Producto } from '../../models/producto';
import { ProductoBackend } from '../../models/Producto-backend';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.component.html',
  styleUrls: ['./inventario.component.css']
})
export class InventarioComponent implements OnInit {
  productos: Producto[] = [];

  productoModelo: Omit<Producto, 'id'> = {
    nombre: '',
    precio: 0,
    cantidad: 0,
    imagen: '',
    descripcion: '',
    categoria: ''
  };

  constructor(private inventarioService: InventarioService, private router: Router) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos() {
    this.inventarioService.obtenerProductos().subscribe(data => {
      this.productos = data;
    });
  }

  crearProducto() {
    const nuevo: ProductoBackend = {
      nombre: this.productoModelo.nombre,
      descripcion: this.productoModelo.descripcion,
      precio: this.productoModelo.precio,
      categoria: this.productoModelo.categoria,
      stock: this.productoModelo.cantidad,
      imagen_url: this.productoModelo.imagen
    };

    this.inventarioService.crearProducto(nuevo).subscribe(() => {
      this.cargarProductos();
      this.productoModelo = {
        nombre: '',
        precio: 0,
        cantidad: 0,
        imagen: '',
        descripcion: '',
        categoria: ''
      };
    });
  }

  modificarProducto(producto: Producto) {
    const actualizado: ProductoBackend = {
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      categoria: producto.categoria,
      stock: producto.cantidad,
      imagen_url: producto.imagen
    };

    this.inventarioService.modificarProducto(producto.id, actualizado).subscribe(() => {
      this.cargarProductos();
    });
  }

  eliminarProducto(id: number) {
    this.inventarioService.eliminarProducto(id).subscribe(() => {
      this.cargarProductos();
    });
  }

  irATienda(): void {
    this.router.navigate(['/']);
  }
}
