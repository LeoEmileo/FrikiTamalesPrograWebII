import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {

  credenciales = {
    correo: '',
    contrasena: ''
  };

  error = '';

  constructor(private http: HttpClient, private router: Router) { }


irARegistro(): void {
  this.router.navigate(['/registro']);
}

irAInicio(): void {
  this.router.navigate(['/']);
}


  iniciarSesion(): void {
    this.http.post<any>('http://localhost:3000/api/login', this.credenciales).subscribe({
      next: (res) => {
        console.log('Login exitoso:', res);
        localStorage.setItem('usuario', JSON.stringify(res));
        if (res.rol === 'admin') {
          this.router.navigate(['/inventario']);
        } else {
          this.router.navigate(['/']);
        }
      },

      error: (err) => {
        this.error = err.error?.error || 'Error al iniciar sesión.';
      }
    });
  } 

}
