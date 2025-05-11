import { Routes } from '@angular/router';
import { ProductoComponent } from './components/producto/producto.component';
import { CarritoComponent } from './components/carrito/carrito.component';
import { InventarioComponent } from './components/inventario/inventario.component';
import { PagoExitosoComponent } from './components/pago-exitoso/pago-exitoso.component';
import { PagoCanceladoComponent } from './components/pago-cancelado/pago-cancelado.component';


export const routes: Routes = [
    { path: '', component: ProductoComponent }, // Ruta raíz
    { path: 'carrito', component: CarritoComponent }, // Ruta al carrito
    { path: 'inventario', component: InventarioComponent },
    { path: 'pago-exitoso', component: PagoExitosoComponent },
    { path: 'pago-cancelado', component: PagoCanceladoComponent }
];
