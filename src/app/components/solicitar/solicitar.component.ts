import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-solicitar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitar.component.html',
  styleUrls: ['./solicitar.component.css']
})
export class SolicitarComponent {
  correo = '';
  mensaje = '';
  error = '';

  constructor(private http: HttpClient, private router: Router) {}

  solicitar(): void {
    this.http.post<any>('http://localhost:3000/api/solicitar-recuperacion', { correo: this.correo }).subscribe({
      next: (res) => {
        this.mensaje = 'Te enviamos un correo electronico, ahí puedes continuar el restablecimiento de contraseña.';
        this.error = '';        
      },
      error: (err) => {
        this.error = err.error?.error || 'Error al solicitar recuperación.';
        this.mensaje = '';
      }
    });
  }
}
