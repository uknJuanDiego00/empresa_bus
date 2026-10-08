<template>
  <q-layout view="lHh Lpr lFf" class="bg-surface-screen">
    <!-- TOPBAR / HEADER -->
    <q-header elevated="false" class="app-topbar print-hide">
      <q-toolbar class="q-px-lg toolbar-height">
        <!-- Sidebar Toggle (Hamburguesa) -->
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Abrir menú"
          class="text-grey-9 q-mr-sm"
          @click="toggleDrawer"
        >
          <q-tooltip>Menú de Navegación</q-tooltip>
        </q-btn>

        <!-- Current Section / Breadcrumbs -->
        <div class="row items-center q-gutter-x-sm">
          <span class="text-subtitle1 text-weight-bold text-dark-title">
            {{ tituloActual }}
          </span>
          <q-badge color="grey-3" text-color="grey-8" class="text-caption gt-xs text-weight-medium">
            Terminal Principal
          </q-badge>
        </div>

        <q-space />

        <!-- Right Side: Date, Notifications, User -->
        <div class="row items-center q-gutter-x-md">
          <!-- Fecha actual en pill minimalista -->
          <div class="date-pill gt-sm">
            <q-icon name="calendar_today" size="14px" class="q-mr-xs text-grey-6" />
            <span class="text-caption text-weight-medium text-grey-8">{{ fechaActual }}</span>
          </div>

          <!-- Notificaciones -->
          <q-btn flat round dense icon="notifications" class="text-grey-7">
            <q-badge floating color="primary" rounded />
            <q-menu anchor="bottom end" self="top end" class="rounded-borders-md shadow-md" style="min-width: 280px;">
              <div class="q-pa-md">
                <div class="text-subtitle2 text-weight-bold text-grey-9 q-mb-xs">Notificaciones</div>
                <div class="text-caption text-grey-6">Operaciones en tiempo real</div>
              </div>
              <q-separator />
              <q-list dense class="q-py-xs">
                <q-item clickable v-ripple>
                  <q-item-section avatar>
                    <q-icon name="check_circle" color="positive" size="20px" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-caption text-weight-medium">Sistema sincronizado</q-item-label>
                    <q-item-label caption class="text-grey-6">Base de datos lista</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <!-- Perfil Usuario -->
          <div class="user-pill row items-center q-gutter-x-sm cursor-pointer">
            <q-avatar size="32px" color="primary" text-color="white" class="text-weight-bold">
              OP
            </q-avatar>
            <div class="gt-xs column items-start">
              <span class="text-caption text-weight-bold text-grey-9 line-height-tight">Operador</span>
              <span class="text-caption text-grey-6" style="font-size: 11px;">VIABUS Central</span>
            </div>
          </div>
        </div>
      </q-toolbar>
    </q-header>

    <!-- SIDEBAR / DRAWER EN MODO OVERLAY (TIPO MÓVIL) -->
    <q-drawer
      v-model="leftDrawerOpen"
      overlay
      behavior="mobile"
      elevated
      class="app-sidebar print-hide"
      :width="280"
    >
      <div class="column full-height justify-between">
        <div>
          <!-- BRAND HEADER CON BOTÓN CERRAR -->
          <div class="sidebar-brand-box row items-center justify-between no-wrap">
            <div class="row items-center no-wrap">
              <div class="brand-logo-icon">
                <q-icon name="directions_bus" size="22px" color="white" />
              </div>
              <div class="q-ml-md">
                <div class="text-weight-bolder text-subtitle1 brand-text-title tracking-wide">VIABUS</div>
                <div class="text-caption brand-text-sub">Gestión de Transporte</div>
              </div>
            </div>

            <!-- Botón Cerrar (X) -->
            <q-btn
              flat
              round
              dense
              icon="close"
              class="text-grey-4"
              @click="leftDrawerOpen = false"
            >
              <q-tooltip>Cerrar menú</q-tooltip>
            </q-btn>
          </div>

          <div class="sidebar-divider q-my-sm"></div>

          <!-- LISTA DE ENLACES CON AUTO-CIERRE AL SELECCIONAR -->
          <q-list padding class="sidebar-nav-list">
            <!-- SECCIÓN PRINCIPAL -->
            <div class="nav-section-header">PRINCIPAL</div>

            <q-item
              clickable
              v-ripple
              to="/dashboard"
              active-class="sidebar-nav-active"
              class="sidebar-nav-item"
              @click="leftDrawerOpen = false"
            >
              <q-item-section avatar class="nav-item-icon">
                <q-icon name="dashboard" size="20px" />
              </q-item-section>
              <q-item-section>Dashboard</q-item-section>
            </q-item>

            <div class="sidebar-divider q-my-md"></div>

            <!-- SECCIÓN GESTIÓN -->
            <div class="nav-section-header">GESTIÓN</div>

            <q-item
              clickable
              v-ripple
              to="/vehiculos"
              active-class="sidebar-nav-active"
              class="sidebar-nav-item"
              @click="leftDrawerOpen = false"
            >
              <q-item-section avatar class="nav-item-icon">
                <q-icon name="directions_bus" size="20px" />
              </q-item-section>
              <q-item-section>Vehículos</q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              to="/clientes"
              active-class="sidebar-nav-active"
              class="sidebar-nav-item"
              @click="leftDrawerOpen = false"
            >
              <q-item-section avatar class="nav-item-icon">
                <q-icon name="groups" size="20px" />
              </q-item-section>
              <q-item-section>Clientes</q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              to="/viajes"
              active-class="sidebar-nav-active"
              class="sidebar-nav-item"
              @click="leftDrawerOpen = false"
            >
              <q-item-section avatar class="nav-item-icon">
                <q-icon name="route" size="20px" />
              </q-item-section>
              <q-item-section>Viajes</q-item-section>
            </q-item>

            <div class="sidebar-divider q-my-md"></div>

            <!-- SECCIÓN OPERACIÓN -->
            <div class="nav-section-header">OPERACIÓN</div>

            <q-item
              clickable
              v-ripple
              to="/ventas"
              active-class="sidebar-nav-active"
              class="sidebar-nav-item"
              @click="leftDrawerOpen = false"
            >
              <q-item-section avatar class="nav-item-icon">
                <q-icon name="receipt_long" size="20px" />
              </q-item-section>
              <q-item-section>Ventas</q-item-section>
            </q-item>

            <q-item
              clickable
              v-ripple
              to="/ventas/nueva"
              active-class="sidebar-nav-active"
              class="sidebar-nav-item nav-item-action"
              @click="leftDrawerOpen = false"
            >
              <q-item-section avatar class="nav-item-icon">
                <q-icon name="add_shopping_cart" size="20px" />
              </q-item-section>
              <q-item-section>Nueva Venta</q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- PIE DEL MENÚ -->
        <div class="q-pa-md text-caption text-grey-6 text-center">
          VIABUS Enterprise v1.0
        </div>
      </div>
    </q-drawer>

    <!-- CONTENEDOR PRINCIPAL -->
    <q-page-container class="bg-surface-screen">
      <main class="page-content-wrapper">
        <router-view />
      </main>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const leftDrawerOpen = ref(false) // Inicia cerrado

// Si cambia la ruta por cualquier medio, asegurarse de que el menú se cierre
watch(() => route.fullPath, () => {
  leftDrawerOpen.value = false
})

const titulos = {
  '/dashboard': 'Dashboard',
  '/vehiculos': 'Vehículos',
  '/vehiculos/registrar': 'Registrar Vehículo',
  '/clientes': 'Clientes',
  '/clientes/registrar': 'Registrar Cliente',
  '/viajes': 'Viajes & Despacho',
  '/viajes/crear': 'Programar Viaje',
  '/ventas': 'Ventas Realizadas',
  '/ventas/nueva': 'Nueva Venta de Tiquete'
}

const tituloActual = computed(() => {
  if (route.path.includes('/vehiculos/') && route.path.includes('/mapeo')) {
    return 'Configuración de Puestos'
  }
  if (route.path.includes('/tickets/')) {
    return 'Detalle de Tiquete'
  }
  return titulos[route.path] || 'VIABUS'
})

const fechaActual = computed(() => {
  const d = new Date()
  return d.toLocaleDateString('es-CO', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
})

function toggleDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>

<style scoped>
.bg-surface-screen {
  background-color: #F8F9FA;
  min-height: 100vh;
}

/* TOPBAR */
.app-topbar {
  background: #FFFFFF !important;
  color: #18181B !important;
  border-bottom: 1px solid #E4E4E7;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.04);
}

.toolbar-height {
  min-height: 64px;
}

.text-dark-title {
  color: #18181B;
  letter-spacing: -0.01em;
}

.date-pill {
  background: #F4F4F5;
  border: 1px solid #E4E4E7;
  padding: 6px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
}

.user-pill {
  padding: 4px 10px 4px 4px;
  border-radius: 24px;
  background: #FAFAFA;
  border: 1px solid #E4E4E7;
  transition: background-color 0.15s ease;
}

.user-pill:hover {
  background: #F4F4F5;
}

.line-height-tight {
  line-height: 1.2;
}

/* SIDEBAR EN FONDO OSCURO SÓLIDO (#111111) */
.app-sidebar,
:deep(.q-drawer),
:deep(.q-drawer__content) {
  background-color: #111111 !important;
  color: #E4E4E7 !important;
}

.sidebar-brand-box {
  padding: 20px 16px 16px 18px;
}

.brand-logo-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #2563EB;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.35);
  flex-shrink: 0;
}

.brand-text-title {
  color: #FFFFFF !important;
  line-height: 1.2;
}

.brand-text-sub {
  color: #A1A1AA !important;
  font-size: 11px;
  font-weight: 500;
}

.sidebar-divider {
  height: 1px;
  background-color: #27272A;
  margin-left: 14px;
  margin-right: 14px;
}

.nav-section-header {
  font-size: 10.5px;
  font-weight: 700;
  color: #71717A;
  letter-spacing: 0.08em;
  padding: 10px 16px 6px 18px;
  text-transform: uppercase;
}

.sidebar-nav-list {
  padding: 4px 12px;
}

.sidebar-nav-item {
  border-radius: 8px;
  color: #D4D4D8;
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 500;
  min-height: 42px;
  transition: all 0.15s ease;
}

.sidebar-nav-item:hover {
  background: #18181B;
  color: #FFFFFF;
}

.nav-item-icon {
  min-width: 36px;
  padding-right: 8px;
}

/* Elemento Activo */
.sidebar-nav-active {
  background: #27272A !important;
  color: #FFFFFF !important;
  font-weight: 600 !important;
  box-shadow: inset 3px 0 0 #2563EB;
}

.sidebar-nav-active .q-icon {
  color: #3B82F6 !important;
}

.nav-item-action:hover {
  color: #60A5FA !important;
}

.page-content-wrapper {
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
}
</style>
