const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../pages/LoginPage.vue'),
    meta: { public: true }
  },
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: '/viajes' },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('../pages/DashboardPage.vue'),
        meta: { roles: ['SUPERADMIN', 'ADMINISTRADOR'] }
      },
      {
        path: 'vehiculos',
        name: 'vehiculos',
        component: () => import('../pages/VehiculosPage.vue'),
        meta: { roles: ['SUPERADMIN', 'ADMINISTRADOR'] }
      },
      {
        path: 'vehiculos/registrar',
        name: 'registrar-vehiculo',
        component: () => import('../pages/RegistrarVehiculoPage.vue'),
        meta: { roles: ['SUPERADMIN', 'ADMINISTRADOR'] }
      },
      {
        path: 'vehiculos/:id/mapeo',
        name: 'mapeo-vehiculo',
        component: () => import('../pages/MapeoVehiculoPage.vue'),
        meta: { roles: ['SUPERADMIN', 'ADMINISTRADOR'] }
      },
      {
        path: 'clientes',
        name: 'clientes',
        component: () => import('../pages/ClientesPage.vue'),
        meta: { roles: ['SUPERADMIN', 'ADMINISTRADOR', 'OFICINA'] }
      },
      {
        path: 'clientes/registrar',
        name: 'registrar-cliente',
        component: () => import('../pages/RegistrarClientePage.vue'),
        meta: { roles: ['SUPERADMIN', 'ADMINISTRADOR', 'OFICINA'] }
      },
      {
        path: 'viajes',
        name: 'viajes',
        component: () => import('../pages/ViajesPage.vue'),
        meta: { roles: ['SUPERADMIN', 'ADMINISTRADOR', 'OFICINA'] }
      },
      {
        path: 'viajes/crear',
        name: 'crear-viaje',
        component: () => import('../pages/CrearViajePage.vue'),
        meta: { roles: ['SUPERADMIN', 'ADMINISTRADOR'] }
      },
      {
        path: 'ventas',
        name: 'ventas',
        component: () => import('../pages/VentasPage.vue'),
        meta: { roles: ['SUPERADMIN', 'ADMINISTRADOR', 'OFICINA'] }
      },
      {
        path: 'ventas/nueva',
        name: 'nueva-venta',
        component: () => import('../pages/NuevaVentaPage.vue'),
        meta: { roles: ['SUPERADMIN', 'ADMINISTRADOR', 'OFICINA'] }
      },
      {
        path: 'ventas/manual',
        name: 'venta-manual',
        component: () => import('../pages/VentaManualPage.vue'),
        meta: { roles: ['SUPERADMIN', 'ADMINISTRADOR', 'OFICINA'] }
      },
      {
        path: 'tickets/:id',
        name: 'ticket-detalle',
        component: () => import('../pages/TicketPage.vue'),
        meta: { roles: ['SUPERADMIN', 'ADMINISTRADOR', 'OFICINA'] }
      },
      {
        path: 'usuarios',
        name: 'usuarios',
        component: () => import('../pages/UsuariosPage.vue'),
        meta: { roles: ['SUPERADMIN'] }
      },
      {
        path: 'usuarios/registrar',
        redirect: '/usuarios'
      }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    redirect: '/viajes'
  }
]

export default routes
