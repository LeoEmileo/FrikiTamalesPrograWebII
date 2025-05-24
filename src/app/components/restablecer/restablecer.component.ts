import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-restablecer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './restablecer.component.html',
  styleUrls: ['./restablecer.component.css']
})
export class RestablecerComponent implements OnInit {
  token: string = '';
  nueva: string = '';
  mensaje = '';
  error = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.error = 'Token no válido o faltante.';
    }
  }

  enviar(): void {
    if (!this.token || !this.nueva) return;

    this.http.post('http://localhost:3000/api/resetear-contrasena', {
      token: this.token,
      nueva: this.nueva
    }).subscribe({
      next: res => {
        this.mensaje = 'Contraseña actualizada correctamente.';
        this.error = '';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: err => {
        this.error = err.error?.error || 'Error al restablecer contraseña.';
        this.mensaje = '';
      }
    });
  }
}
