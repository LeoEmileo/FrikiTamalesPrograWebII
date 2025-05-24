import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';


@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})


export class RegistroComponent {
  usuario = {
    nombre_usuario: '',
    correo: '',
    contrasena: '',
    direccion: '',
    rol: 'cliente'
  };

  mensaje = '';
  error = '';
  confirmacion = '';

  constructor(private http: HttpClient, private router: Router) { }

  irAInicio(): void {
    this.router.navigate(['/']);
  }
  
  irALogin(): void {
    this.router.navigate(['/login']);
  }



  registrar(): void {
    if (this.usuario.contrasena !== this.confirmacion) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }
    if (this.usuario.contrasena.length < 2 || this.usuario.contrasena.length > 30) {
      this.error = 'La contraseña no esta en el rango de caracteres.';
      return;
    }
    if (this.usuario.correo.length < 2 || this.usuario.correo.length > 60){
      this.error = 'El correo es muy corto/largo.';
      return;
    }

    this.http.post('http://localhost:3000/api/registrar', this.usuario).subscribe({
      next: () => {
        this.mensaje = 'Usuario registrado con éxito.';
        this.error = '';
        this.usuario = { nombre_usuario: '', correo: '', contrasena: '', direccion: '', rol: 'cliente' };
        this.confirmacion = '';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.error = err.error?.error || 'Error al registrar usuario.';
        this.mensaje = '';
      }
    });
  }


}
