import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { StockComponent } from './pages/stock/stock.component';
import { StockMinimoComponent } from './pages/stock-minimo/stock-minimo.component';
import { ListaPreciosComponent } from './pages/lista-precios/lista-precios.component';
import { ClientesComponent } from './pages/clientes/clientes.component';
import { ProveedoresComponent } from './pages/proveedores/proveedores.component';
import { VendedoresComponent } from './pages/vendedores/vendedores.component';
import { TransportadorComponent } from './pages/transportadores/transportadores.component';
import { RegistrarProductoComponent } from './pages/registrar-producto/registrar-producto.component';
import { CategoriaComponent } from './pages/categoria/categoria.component';
import { FormulacionComponent } from './pages/formulacion/formulacion.component';
import { UnidadComponent } from './pages/unidad/unidad.component';
import { EstadoComponent } from './pages/estado/estado.component';
import { ElaboradoComponent } from './pages/elaborado/elaborado.component';
import { RegistrarUnaVentaComponent } from './pages/registrar-una-venta/registrar-una-venta.component';
import { ProximosVencerComponent } from './pages/proximos-vencer/proximos-vencer.component';
import { ElaborarComponent } from './pages/elaborar/elaborar.component';
import { RegistroVentaGeneralComponent } from './pages/registro-venta-general/registro-venta-general.component';
import { RegistroVentaDetalleComponent } from './pages/registro-venta-detalle/registro-venta-detalle.component';
import { CreditosVentasComponent } from './pages/creditos-ventas/creditos-ventas.component';
import { AnalisisComponent } from './pages/analisis/analisis.component';
import { RealizarPedidoComponent } from './pages/realizar-pedido/realizar-pedido.component';
import { CreditosComprasComponent } from './pages/creditos-compras/creditos-compras.component';
import { RegistroCompraDetalleComponent } from './pages/registro-compra-detalle/registro-compra-detalle.component';
import { RegistroCompraGeneralComponent } from './pages/registro-compra-general/registro-compra-general.component';
import { AsignarTransportadorComponent } from './pages/asignar-transportador/asignar-transportador.component';
import { RegistrarCompraComponent } from './pages/registrar-compra/registrar-compra.component';
import { BalanceDiarioComponent } from './pages/balance-diario/balance-diario.component';
import { BalanceMensualComponent } from './pages/balance-mensual/balance-mensual.component';
import { DevolucionVentaComponent } from './pages/devolucion-venta/devolucion-venta.component';
import { NumeracionFacturasComponent } from './pages/numeracion-facturas/numeracion-facturas.component';
import { CierreInventarioComponent } from './pages/cierre-inventario/cierre-inventario.component';
import { RegisterComponent } from './register/register.component';
import { AuthGuard } from './auth-guard.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'main',
    loadComponent: () => import('./main/main.component').then(m => m.MainComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'inicio',
        children: [
          {
            path: '',
            redirectTo: 'analisis',
            pathMatch: 'full'
          },
          {
            path: 'analisis',
            canActivate: [AuthGuard],
            data: { roles: 1 },
            component: AnalisisComponent
          },
          {
            path: 'balance-diario',
            canActivate: [AuthGuard],
            data: { roles: 1 },
            component: BalanceDiarioComponent
          },
          {
            path: 'balance-mensual',
            component: BalanceMensualComponent
          }
        ]
      },
      {
        path: 'inventario',
        children: [
          {
            path: '',
            redirectTo: 'stock',
            pathMatch: 'full'
          },
          {
            path: 'stock',
            component: StockComponent
          },
          {
            path: 'stock-minimo',
            component: StockMinimoComponent
          },
          {
            path: 'lista-precios',
            component: ListaPreciosComponent
          },
          {
            path: 'proximos-vencer',
            component: ProximosVencerComponent
          },
          {
            path: 'elaborar',
            component: ElaborarComponent
          }
        ]
      },
      {
        path: 'producto',
        children: [
          {
            path: '',
            redirectTo: 'registrar-producto',
            pathMatch: 'full'
          },
          {
            path: 'registrar-producto',
            component: RegistrarProductoComponent
          },
          {
            path: 'categoria',
            component: CategoriaComponent
          },
          {
            path: 'formulacion',
            component: FormulacionComponent
          },
          {
            path: 'unidad',
            component: UnidadComponent
          },
          {
            path: 'estado',
            component: EstadoComponent
          },
          {
            path: 'elaborado',
            component: ElaboradoComponent
          }
        ]
      },
      {
        path: 'pedido',
        children: [
          {
            path: '',
            redirectTo: 'realizar-pedido',
            pathMatch: 'full'
          },
          {
            path: 'realizar-pedido',
            component: RealizarPedidoComponent
          },
          {
            path: 'asignar-transportador',
            component: AsignarTransportadorComponent
          }
        ]
      },
      {
        path: 'compras',
        children: [
          {
            path: '',
            redirectTo: 'registrar-compra',
            pathMatch: 'full'
          },
          {
            path: 'registrar-compra',
            component: RegistrarCompraComponent
          },
          {
            path: 'registro-compra-general',
            component: RegistroCompraGeneralComponent
          },
          {
            path: 'registro-compra-detalle',
            component: RegistroCompraDetalleComponent
          }
        ]
      },
      {
        path: 'ventas',
        children: [
          {
            path: '',
            redirectTo: 'registrar-una-venta',
            pathMatch: 'full'
          },
          {
            path: 'registrar-una-venta',
            component: RegistrarUnaVentaComponent
          },
          {
            path: 'registro-venta-general',
            component: RegistroVentaGeneralComponent
          },
          {
            path: 'registro-venta-detalle',
            component: RegistroVentaDetalleComponent
          },
          {
            path: 'devolucion-venta',
            component: DevolucionVentaComponent
          }
        ]
      },
      {
        path: 'contactos',
        children: [
          {
            path: '',
            redirectTo: 'clientes',
            pathMatch: 'full'
          },
          {
            path: 'clientes',
            component: ClientesComponent
          },
          {
            path: 'proveedores',
            component: ProveedoresComponent
          },
          {
            path: 'transportadores',
            component: TransportadorComponent
          },
          {
            path: 'vendedores',
            component: VendedoresComponent
          }
        ]
      },
      {
        path: 'creditos',
        children: [
          {
            path: '',
            redirectTo: 'creditos-ventas',
            pathMatch: 'full'
          },
          {
            path: 'creditos-ventas',
            component: CreditosVentasComponent
          },
          {
            path: 'creditos-compras',
            component: CreditosComprasComponent
          }
        ]
      },
      {
        path: 'extras',
        children: [
          {
            path: '',
            redirectTo: 'numeracion-facturas',
            pathMatch: 'full'
          },
          {
            path: 'numeracion-facturas',
            component: NumeracionFacturasComponent
          },
          {
            path: 'cierre-inventario',
            component: CierreInventarioComponent
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
