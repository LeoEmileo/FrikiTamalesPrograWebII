import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) {}

  // Obtiene el usuario actual desde localStorage
  obtenerUsuario(): any {
    const data = localStorage.getItem('usuario');
    return data ? JSON.parse(data) : null;
  }

  // Verifica si hay un usuario logueado
  estaLogueado(): boolean {
    return !!localStorage.getItem('usuario');
  }

  // Verifica si el usuario es administrador
  esAdmin(): boolean {
    const usuario = this.obtenerUsuario();
    return usuario?.rol === 'admin';
  }

  // Verifica si el usuario es cliente
  esCliente(): boolean {
    const usuario = this.obtenerUsuario();
    return usuario?.rol === 'cliente';
  }

  // Cierra la sesión
  cerrarSesion(): void {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}
