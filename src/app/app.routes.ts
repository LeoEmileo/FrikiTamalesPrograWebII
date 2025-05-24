import { Routes } from '@angular/router';
import { ProductoComponent } from './components/producto/producto.component';
import { CarritoComponent } from './components/carrito/carrito.component';
import { InventarioComponent } from './components/inventario/inventario.component';
import { PagoExitosoComponent } from './components/pago-exitoso/pago-exitoso.component';
import { PagoCanceladoComponent } from './components/pago-cancelado/pago-cancelado.component';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { authGuard } from './guards/auth.guard';
import { SolicitarComponent } from './components/solicitar/solicitar.component';
import { RestablecerComponent } from './components/restablecer/restablecer.component';



export const routes: Routes = [
    { path: '', component: ProductoComponent }, // Ruta raíz
    { path: 'carrito', component: CarritoComponent }, 
    { path: 'inventario', component: InventarioComponent, canActivate: [authGuard], data: { rol: 'admin' }},    
    { path: 'pago-exitoso', component: PagoExitosoComponent },
    { path: 'pago-cancelado', component: PagoCanceladoComponent },
    { path: 'login', component: LoginComponent },
    { path: 'registro', component: RegistroComponent },
    { path: 'solicitar-recuperacion', component: SolicitarComponent },
    { path: 'restablecer', component: RestablecerComponent },
];
