export interface Producto {
    id: number;
    nombre: string;
    precio: number;
    cantidad: number; 
    imagen: string;
    descripcion: '';
    categoria: '';
  }
  
  export interface ProductoCarrito extends Producto {
    cantidadCarrito: number;
  }
  