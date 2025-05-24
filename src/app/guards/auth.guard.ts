import { Injectable } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const rolRequerido = route.data['rol']; // ya sea admin o cliente

  const usuario = auth.obtenerUsuario();

  if (!usuario) {
    router.navigate(['/login']);
    return false;
  }

  if (rolRequerido && usuario.rol !== rolRequerido) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
