import { Component, OnInit } from '@angular/core';
import { Producto } from '../../models/producto';
import { ProductoService } from '../../services/producto.service';
import { CommonModule } from '@angular/common';
import { CarritoService } from '../../services/carrito.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './producto.component.html', 
  styleUrls: ['./producto.component.css']
})
export class ProductoComponent implements OnInit {
  productos: Producto[] = [];

  constructor( 
    private productoService: ProductoService,
    private carritoService: CarritoService, 
    private router: Router
  ){}

  ngOnInit(): void {
    this.cargarProductos();
  }


  getStockVisual(producto: Producto): number {
  const enCarrito = this.carritoService.obtenerCantidad(producto.id) || 0;
  return producto.cantidad - enCarrito;
}

  cargarProductos() {
    this.productoService.obtenerProductos().subscribe({
      next: (data: Producto[]) => {
        this.productos = data;
      },
      error: (error) => {
        console.error('Error al obtener productos:', error);
      }
    });
  }

  agregarAlCarrito(producto: Producto) {
    if (producto.cantidad > 0) {
      // Llama al servicio para agregar el producto al carrito y actualizar el stock en el backend
      this.carritoService.actualizarCantidad(producto, 1);
    } else {
      alert('No hay stock disponible para este producto.');
    }
  }

  irAlCarrito(){
    this.router.navigate(['/carrito']);
  }

  irAlInventario() {
    this.router.navigate(['/inventario']);
  }

  
}
