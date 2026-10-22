<template>
  <q-page class="q-pa-lg bg-grey-1">
    <div class="q-mx-auto" style="max-width: 1200px;">

      <!-- HERO HEADER PREMIUM -->
      <div class="premium-header q-pa-lg rounded-borders-lg q-mb-lg text-white">
        <div class="row items-center justify-between q-col-gutter-md">
          <div class="col-12 col-md-8">
            <div class="row items-center q-gutter-x-sm q-mb-xs">
              <q-badge color="amber-5" text-color="dark" class="text-weight-bolder text-caption q-px-sm">
                <q-icon name="fiber_manual_record" size="10px" class="q-mr-xs text-positive animate-pulse" />
                CENTRO DE OPERACIONES
              </q-badge>
              <span class="text-caption text-blue-2">Terminal de Despacho VIABUS</span>
            </div>
            <div class="text-h4 text-weight-bolder tracking-tight">
              Viajes &amp; Trayectorias
            </div>
            <div class="text-subtitle2 text-blue-1 q-mt-xs font-regular">
              Consulta rutas y disponibilidad en tiempo real. Inicia ventas directamente desde cada viaje.
            </div>
          </div>

          <div class="col-12 col-md-4 text-right row justify-end q-gutter-x-sm items-center">
            <q-btn
              v-if="authStore.esAdmin()"
              color="white"
              text-color="primary"
              icon="add"
              label="Programar Viaje"
              to="/viajes/crear"
              no-caps
              unelevated
              class="text-weight-bold btn-glow q-py-sm q-px-md"
            />
          </div>
        </div>

        <!-- KPI METRICS STATS BAR -->
        <div class="row q-col-gutter-md q-mt-md">
          <div class="col-6 col-sm-3">
            <div class="kpi-mini-card">
              <div class="row items-center justify-between">
                <div>
                  <div class="text-caption text-blue-2">Viajes Activos</div>
                  <div class="text-h5 text-weight-bolder">{{ obtenerViajesActivos().length }}</div>
                </div>
                <q-avatar size="36px" color="white" text-color="primary" icon="route" class="shadow-1" />
              </div>
            </div>
          </div>

          <div class="col-6 col-sm-3">
            <div class="kpi-mini-card">
              <div class="row items-center justify-between">
                <div>
                  <div class="text-caption text-blue-2">Puestos Disponibles</div>
                  <div class="text-h5 text-weight-bolder text-positive">{{ obtenerTotalPuestosDisponibles() }}</div>
                </div>
                <q-avatar size="36px" color="green-1" text-color="positive" icon="event_seat" class="shadow-1" />
              </div>
            </div>
          </div>

          <div class="col-6 col-sm-3">
            <div class="kpi-mini-card">
              <div class="row items-center justify-between">
                <div>
                  <div class="text-caption text-blue-2">Pasajeros Confirmados</div>
                  <div class="text-h5 text-weight-bolder text-amber-3">{{ obtenerTotalPuestosOcupados() }}</div>
                </div>
                <q-avatar size="36px" color="amber-1" text-color="warning" icon="people" class="shadow-1" />
              </div>
            </div>
          </div>

          <div class="col-6 col-sm-3">
            <div class="kpi-mini-card">
              <div class="row items-center justify-between">
                <div>
                  <div class="text-caption text-blue-2">Tarifa Promedio</div>
                  <div class="text-h5 text-weight-bolder">${{ obtenerTarifaPromedio().toLocaleString('es-CO') }}</div>
                </div>
                <q-avatar size="36px" color="blue-1" text-color="primary" icon="payments" class="shadow-1" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- BARRA DE HERRAMIENTAS -->
      <q-card flat bordered class="q-pa-md q-mb-lg rounded-borders-md vb-card shadow-sm">
        <div class="row items-center justify-between q-col-gutter-sm">
          <div class="col-12 col-md-5">
            <q-input
              v-model="filtroTexto"
              outlined
              dense
              placeholder="Buscar por origen, destino, código, placa o conductor..."
              clearable
              class="search-input"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="primary" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-4">
            <div class="row q-gutter-xs items-center">
              <q-btn
                v-for="st in estadosFiltro"
                :key="st"
                dense
                rounded
                no-caps
                :color="filtroEstado === st ? 'primary' : 'grey-3'"
                :text-color="filtroEstado === st ? 'white' : 'grey-8'"
                :label="st"
                class="q-px-sm text-caption"
                @click="filtroEstado = st"
                unelevated
              />
            </div>
          </div>

          <div class="col-12 col-md-3 text-right">
            <q-btn-toggle
              v-model="vistaModo"
              push
              rounded
              dense
              toggle-color="primary"
              color="grey-2"
              text-color="grey-8"
              :options="[
                { label: 'Tarjetas', value: 'cards', icon: 'grid_view' },
                { label: 'Tabla', value: 'table', icon: 'view_list' }
              ]"
              no-caps
            />
          </div>
        </div>
      </q-card>

      <!-- SIN RESULTADOS -->
      <div v-if="obtenerViajesFiltrados().length === 0" class="text-center q-pa-xl vb-card rounded-borders-md border-dashed">
        <q-icon name="alt_route" size="56px" color="grey-5" />
        <div class="text-h6 text-grey-8 q-mt-md">No se encontraron viajes</div>
        <div class="text-caption text-grey-6 q-mb-md">
          Intente ajustar el término de búsqueda o cambie el filtro de estado.
        </div>
        <q-btn
          outline
          color="primary"
          label="Limpiar Filtros"
          icon="clear_all"
          @click="limpiarFiltros"
          no-caps
        />
      </div>

      <!-- VISTA EN TARJETAS -->
      <div v-else-if="vistaModo === 'cards'" class="row q-col-gutter-lg">
        <div
          v-for="viaje in obtenerViajesFiltrados()"
          :key="viaje.id || viaje._id"
          class="col-12 col-md-6 col-lg-4"
        >
          <q-card flat bordered class="trip-card column justify-between">
            <div>
              <!-- Cabecera -->
              <div class="trip-card-header q-pa-md row items-center justify-between">
                <div class="row items-center q-gutter-x-xs">
                  <q-badge color="blue-1" text-color="primary" class="text-weight-bold font-mono text-subtitle2 q-px-sm">
                    {{ viaje.codigo }}
                  </q-badge>
                  <q-badge :color="colorEstado(viaje.estado)" class="text-weight-medium">
                    {{ viaje.estado }}
                  </q-badge>
                </div>
                <div class="text-h6 text-weight-bolder text-primary">
                  ${{ viaje.precio.toLocaleString('es-CO') }}
                </div>
              </div>

              <q-separator />

              <!-- Itinerario de Ruta -->
              <div class="q-pa-md">
                <div class="row items-center justify-between q-mb-sm">
                  <div class="col-5 text-left">
                    <div class="text-caption text-grey-6">Origen</div>
                    <div class="text-subtitle1 text-weight-bold text-grey-9 ellipsis">{{ viaje.origen }}</div>
                  </div>
                  <div class="col-2 text-center">
                    <div class="route-icon-box">
                      <q-icon name="directions_bus" color="primary" size="18px" />
                    </div>
                  </div>
                  <div class="col-5 text-right">
                    <div class="text-caption text-grey-6">Destino</div>
                    <div class="text-subtitle1 text-weight-bold text-grey-9 ellipsis">{{ viaje.destino }}</div>
                  </div>
                </div>

                <!-- Paradas intermedias -->
                <div v-if="viaje.paradasIntermedias && viaje.paradasIntermedias.length > 0" class="q-mb-sm">
                  <div class="text-caption text-grey-6 q-mb-xs">
                    <q-icon name="linear_scale" size="12px" class="q-mr-xs" />
                    Paradas: {{ viaje.paradasIntermedias.join(' → ') }}
                  </div>
                </div>

                <!-- Horario y estimaciones -->
                <div class="bg-grey-1 q-py-xs q-px-sm rounded-borders row items-center justify-between q-my-xs text-caption">
                  <div class="row items-center q-gutter-x-xs text-grey-9">
                    <q-icon name="schedule" size="14px" color="primary" />
                    <span class="text-weight-bold">{{ getRutaInfo(viaje).duracionTexto }}</span>
                    <span class="text-caption text-grey-6">aprox.</span>
                  </div>
                  <div class="row items-center q-gutter-x-xs text-grey-7">
                    <q-icon name="straighten" size="14px" color="grey-6" />
                    <span>{{ getRutaInfo(viaje).distanciaTexto }}</span>
                  </div>
                </div>

                <!-- Detalles Horarios -->
                <div class="row q-col-gutter-xs q-my-xs text-caption">
                  <div class="col-6">
                    <div class="bg-grey-1 q-pa-xs rounded-borders row items-center">
                      <q-icon name="event" size="16px" color="grey-7" class="q-mr-xs" />
                      <span class="text-weight-medium">{{ viaje.fecha }}</span>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="bg-grey-1 q-pa-xs rounded-borders row items-center">
                      <q-icon name="schedule" size="16px" color="grey-7" class="q-mr-xs" />
                      <span class="text-weight-bold text-primary">{{ viaje.hora }}</span>
                    </div>
                  </div>
                </div>

                <!-- Info Vehículo -->
                <div class="bg-blue-0 q-pa-sm rounded-borders q-mt-sm">
                  <div class="row items-center justify-between text-caption q-mb-xs">
                    <div class="row items-center q-gutter-x-xs text-grey-9">
                      <q-icon name="business" size="14px" color="primary" />
                      <span class="text-weight-bold">{{ getVehiculo(viaje.vehiculoId)?.empresa || 'VIABUS Express' }}</span>
                    </div>
                  </div>
                  <div class="row items-center justify-between text-caption">
                    <div class="row items-center q-gutter-x-xs">
                      <q-icon name="commute" size="16px" color="primary" />
                      <span class="text-weight-bold text-grey-9">{{ getVehiculo(viaje.vehiculoId)?.placa || 'Placa N/A' }}</span>
                      <span class="text-grey-6">({{ getVehiculo(viaje.vehiculoId)?.tipo || 'Bus' }})</span>
                    </div>
                    <div class="text-grey-7 ellipsis" style="max-width: 140px;" :title="getVehiculo(viaje.vehiculoId)?.conductor">
                      <q-icon name="person" size="14px" /> {{ getVehiculo(viaje.vehiculoId)?.conductor || 'Conductor asignado' }}
                    </div>
                  </div>
                </div>

                <!-- Barra de Ocupación -->
                <div class="q-mt-md">
                  <div class="row items-center justify-between text-caption q-mb-xs">
                    <span class="text-weight-bold text-grey-8">Ocupación del Bus</span>
                    <span>
                      <strong class="text-positive">{{ getDisponibles(viaje) }} disponibles</strong>
                      <span class="text-grey-5 q-mx-xs">/</span>
                      <strong class="text-negative">{{ getOcupados(viaje) }} ocupados</strong>
                    </span>
                  </div>
                  <q-linear-progress
                    :value="getPorcentajeOcupacion(viaje)"
                    rounded
                    size="8px"
                    :color="getPorcentajeOcupacion(viaje) > 0.85 ? 'negative' : (getPorcentajeOcupacion(viaje) > 0.5 ? 'warning' : 'positive')"
                    track-color="grey-3"
                  />
                </div>
              </div>
            </div>

            <!-- Botones de Acción -->
            <div>
              <q-separator />
              <div class="q-pa-md bg-grey-0 row items-center justify-between q-gutter-x-sm">
                <q-btn
                  flat
                  dense
                  color="grey-8"
                  icon="visibility"
                  label="Ver Mapa"
                  @click="abrirVistaMapa(viaje)"
                  no-caps
                  class="q-px-sm"
                />
                <q-btn
                  color="primary"
                  icon="add_shopping_cart"
                  label="Nueva Venta"
                  @click="iniciarNuevaVenta(viaje)"
                  no-caps
                  unelevated
                  class="text-weight-bold btn-action-sell"
                />
              </div>
            </div>
          </q-card>
        </div>
      </div>

      <!-- VISTA EN TABLA -->
      <q-card v-else flat bordered class="rounded-borders-md vb-card shadow-sm overflow-hidden">
        <q-table
          flat
          :rows="obtenerViajesFiltrados()"
          :columns="columns"
          row-key="id"
          :pagination="{ rowsPerPage: 10 }"
          no-data-label="No hay viajes registrados"
        >
          <template v-slot:body-cell-codigo="props">
            <q-td :props="props">
              <q-badge color="blue-1" text-color="primary" class="text-weight-bold font-mono">
                {{ props.row.codigo }}
              </q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-ruta="props">
            <q-td :props="props">
              <div class="row items-center q-gutter-x-xs no-wrap">
                <span class="text-weight-bold text-grey-9">{{ props.row.origen }}</span>
                <q-icon name="arrow_forward" size="14px" color="primary" />
                <span class="text-weight-bold text-grey-9">{{ props.row.destino }}</span>
              </div>
              <div v-if="props.row.paradasIntermedias && props.row.paradasIntermedias.length > 0" class="text-caption text-grey-6">
                {{ props.row.paradasIntermedias.length }} parada(s) intermedia(s)
              </div>
              <div class="text-caption text-grey-6 row items-center q-gutter-x-xs">
                <q-icon name="schedule" size="12px" color="primary" />
                <span>{{ getRutaInfo(props.row).duracionTexto }}</span>
                <span>•</span>
                <span>{{ getRutaInfo(props.row).distanciaTexto }}</span>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-horario="props">
            <q-td :props="props">
              <div class="text-caption">
                <div class="text-weight-medium">{{ props.row.fecha }}</div>
                <div class="text-primary text-weight-bold">{{ props.row.hora }}</div>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-vehiculo="props">
            <q-td :props="props">
              <div>
                <span class="text-weight-bold text-primary">{{ getVehiculo(props.row.vehiculoId)?.placa || '—' }}</span>
                <span class="text-caption text-grey-6 q-ml-xs">({{ getVehiculo(props.row.vehiculoId)?.tipo }})</span>
                <div class="text-caption text-grey-7">{{ getVehiculo(props.row.vehiculoId)?.conductor }}</div>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-disponibilidad="props">
            <q-td :props="props" style="min-width: 160px;">
              <div class="row items-center justify-between text-caption q-mb-xs">
                <q-badge color="positive" dense class="text-weight-bold">
                  {{ getDisponibles(props.row) }} disp.
                </q-badge>
                <q-badge color="negative" dense>
                  {{ getOcupados(props.row) }} ocup.
                </q-badge>
              </div>
              <q-linear-progress
                :value="getPorcentajeOcupacion(props.row)"
                rounded
                size="6px"
                :color="getPorcentajeOcupacion(props.row) > 0.85 ? 'negative' : 'positive'"
                track-color="grey-3"
              />
            </q-td>
          </template>

          <template v-slot:body-cell-precio="props">
            <q-td :props="props">
              <span class="text-weight-bolder text-primary text-subtitle2">
                ${{ props.row.precio.toLocaleString('es-CO') }}
              </span>
            </q-td>
          </template>

          <template v-slot:body-cell-estado="props">
            <q-td :props="props">
              <q-badge :color="colorEstado(props.row.estado)" class="q-py-xs q-px-sm">
                {{ props.row.estado }}
              </q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-acciones="props">
            <q-td :props="props">
              <div class="row q-gutter-x-xs justify-end">
                <q-btn
                  flat
                  round
                  dense
                  color="grey-7"
                  icon="visibility"
                  @click="abrirVistaMapa(props.row)"
                  title="Ver mapa de asientos"
                />
                <q-btn
                  color="primary"
                  size="sm"
                  icon="add_shopping_cart"
                  label="Nueva Venta"
                  @click="iniciarNuevaVenta(props.row)"
                  no-caps
                  unelevated
                  class="text-weight-bold q-px-sm"
                />
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card>

      <!-- =====================================================
           MODAL: MAPA DE ASIENTOS (solo visualización)
           ===================================================== -->
      <q-dialog v-model="modalMapaVisible" maximized-mobile>
        <q-card style="width: 700px; max-width: 95vw;" class="rounded-borders-lg">
          <q-card-section class="bg-primary text-white row items-center justify-between q-pa-md">
            <div>
              <div class="text-subtitle1 text-weight-bold">Mapa de Asientos en Vivo</div>
              <div class="text-caption text-blue-2" v-if="viajeSeleccionadoModal">
                {{ viajeSeleccionadoModal.origen }} → {{ viajeSeleccionadoModal.destino }} | {{ viajeSeleccionadoModal.fecha }} {{ viajeSeleccionadoModal.hora }}
              </div>
            </div>
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section class="q-pa-lg text-center" v-if="obtenerVehiculoModal()">
            <SeatMap
              :puestos="obtenerVehiculoModal().puestos || []"
              :capacidad="Number(obtenerVehiculoModal().capacidad || 20)"
              :tipoVehiculo="obtenerVehiculoModal().tipo || 'Bus'"
              :puestosOcupados="obtenerPuestosOcupadosModal()"
              :puestosPendientes="obtenerPuestosPendientesModal()"
              :selectable="false"
              :conductor="obtenerVehiculoModal().conductor"
            />
          </q-card-section>

          <q-separator />

          <q-card-actions align="right" class="q-pa-md bg-grey-1">
            <q-btn flat label="Cerrar" color="grey-8" v-close-popup no-caps />
            <q-btn
              color="primary"
              icon="add_shopping_cart"
              label="Nueva Venta para este Viaje"
              @click="() => { modalMapaVisible = false; iniciarNuevaVenta(viajeSeleccionadoModal) }"
              no-caps
              unelevated
              class="text-weight-bold"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- =====================================================
           MODAL: NUEVA VENTA — FLUJO COMPLETO POR TRAYECTORIA
           ===================================================== -->
      <q-dialog v-model="modalVentaVisible" persistent maximized-mobile>
        <q-card style="width: 820px; max-width: 98vw; max-height: 95vh;" class="rounded-borders-lg column no-wrap">

          <!-- Encabezado del modal -->
          <q-card-section class="venta-modal-header text-white q-pa-md row items-center justify-between flex-shrink-0">
            <div>
              <div class="text-subtitle1 text-weight-bolder">Nueva Venta por Trayectoria</div>
              <div class="text-caption text-blue-2" v-if="ventaViaje">
                Viaje {{ ventaViaje.codigo }} · {{ ventaViaje.origen }} → {{ ventaViaje.destino }} · {{ ventaViaje.fecha }} {{ ventaViaje.hora }}
              </div>
            </div>
            <div class="row items-center q-gutter-x-xs">
              <!-- Indicadores de paso -->
              <div class="row items-center q-gutter-x-xs gt-xs">
                <div
                  v-for="n in 3"
                  :key="n"
                  class="paso-indicator"
                  :class="{ 'paso-active': ventaPaso === n, 'paso-done': ventaPaso > n }"
                >
                  <q-icon v-if="ventaPaso > n" name="check" size="10px" />
                  <span v-else>{{ n }}</span>
                </div>
              </div>
              <q-btn flat round dense icon="close" @click="cerrarModalVenta" class="text-white" />
            </div>
          </q-card-section>

          <!-- ---- PASO 1: Trayectoria y origen/destino ---- -->
          <q-card-section v-if="ventaPaso === 1" class="q-pa-lg overflow-auto col">

            <!-- Resumen del viaje seleccionado -->
            <div class="viaje-summary-box q-pa-md q-mb-lg rounded-borders">
              <div class="row items-center q-gutter-x-md">
                <q-icon name="route" color="primary" size="24px" />
                <div class="col">
                  <div class="text-weight-bold text-grey-9">{{ ventaViaje?.origen }} → {{ ventaViaje?.destino }}</div>
                  <div class="text-caption text-grey-6">
                    {{ ventaViaje?.fecha }} {{ ventaViaje?.hora }} ·
                    Bus: {{ getVehiculo(ventaViaje?.vehiculoId)?.placa || 'N/A' }} ·
                    Tarifa base: ${{ (ventaViaje?.precio || 0).toLocaleString('es-CO') }}
                  </div>
                  <div v-if="ventaViaje?.paradasIntermedias?.length" class="text-caption text-grey-6 q-mt-xs">
                    <q-icon name="linear_scale" size="12px" class="q-mr-xs" />
                    Ruta: {{ obtenerParadasViaje(ventaViaje).join(' → ') }}
                  </div>
                </div>
                <q-badge :color="colorEstado(ventaViaje?.estado)" class="text-weight-bold">
                  {{ ventaViaje?.estado }}
                </q-badge>
              </div>
            </div>

            <!-- Selección de tipo de venta -->
            <div class="text-subtitle2 text-weight-bold q-mb-sm" style="color: var(--vb-text-primary);">
              Tipo de Venta
            </div>
            <div class="row q-gutter-md q-mb-lg">
              <div class="col-12 col-sm-6">
                <div
                  class="tipo-venta-card cursor-pointer"
                  :class="{ 'tipo-venta-active': ventaTipo === 'trayectoria' }"
                  @click="ventaTipo = 'trayectoria'; ventaOrigen = ''; ventaDestino = ''"
                >
                  <q-icon name="alt_route" size="28px" :color="ventaTipo === 'trayectoria' ? 'primary' : 'grey-6'" />
                  <div class="text-weight-bold q-mt-xs" :class="ventaTipo === 'trayectoria' ? 'text-primary' : 'text-grey-8'">
                    Venta por Trayectoria
                  </div>
                  <div class="text-caption text-grey-6">
                    Selecciona origen y destino entre las paradas de la ruta
                  </div>
                </div>
              </div>
              <div class="col-12 col-sm-6">
                <div
                  class="tipo-venta-card cursor-pointer"
                  :class="{ 'tipo-venta-active': ventaTipo === 'completo' }"
                  @click="seleccionarViajeCompleto()"
                >
                  <q-icon name="directions_bus" size="28px" :color="ventaTipo === 'completo' ? 'positive' : 'grey-6'" />
                  <div class="text-weight-bold q-mt-xs" :class="ventaTipo === 'completo' ? 'text-positive' : 'text-grey-8'">
                    Viaje Completo
                  </div>
                  <div class="text-caption text-grey-6">
                    Desde {{ ventaViaje?.origen }} hasta {{ ventaViaje?.destino }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Selección de origen y destino (para trayectoria) -->
            <div v-if="ventaTipo === 'trayectoria'" class="q-mb-lg">
              <div class="row items-center justify-between q-mb-sm">
                <div class="text-subtitle2 text-weight-bold" style="color: var(--vb-text-primary);">
                  Tramo del Recorrido
                </div>
                <q-badge v-if="obtenerParadasViaje(ventaViaje).length > 2" color="blue-1" text-color="primary" class="text-weight-bold">
                  {{ obtenerParadasViaje(ventaViaje).length }} paradas en la ruta
                </q-badge>
              </div>

              <!-- Banner informativo si la ruta no tiene paradas intermedias configuradas -->
              <q-banner
                v-if="obtenerParadasViaje(ventaViaje).length <= 2 && !cargandoParadasViaje"
                class="bg-blue-1 text-primary rounded-borders q-mb-md"
                rounded
                dense
              >
                <template v-slot:avatar>
                  <q-icon name="info" color="primary" size="20px" />
                </template>
                <div class="text-caption">
                  <strong>Ruta directa:</strong> Este viaje opera entre <strong>{{ ventaViaje?.origen }}</strong> y <strong>{{ ventaViaje?.destino }}</strong> sin paradas intermedias configuradas. El pasajero viajará el recorrido completo.
                </div>
              </q-banner>

              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-6">
                  <q-select
                    v-model="ventaOrigen"
                    :options="opcionesOrigen()"
                    outlined
                    dense
                    label="Origen del pasajero *"
                    emit-value
                    map-options
                    :loading="cargandoParadasViaje"
                    @update:model-value="onOrigenChange"
                  >
                    <template v-slot:prepend>
                      <q-icon name="trip_origin" color="positive" />
                    </template>
                    <template v-slot:option="scope">
                      <q-item v-bind="scope.itemProps">
                        <q-item-section avatar>
                          <q-avatar
                            size="24px"
                            :color="scope.opt.esOrigen ? 'positive' : 'primary'"
                            text-color="white"
                            :icon="scope.opt.esOrigen ? 'trip_origin' : 'place'"
                          />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">{{ scope.opt.label }}</q-item-label>
                          <q-item-label caption class="text-grey-6">{{ scope.opt.sublabel }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>
                <div class="col-12 col-sm-6">
                  <q-select
                    v-model="ventaDestino"
                    :options="opcionesDestino()"
                    outlined
                    dense
                    label="Destino del pasajero *"
                    emit-value
                    map-options
                    :disable="!ventaOrigen || cargandoParadasViaje"
                    :loading="cargandoParadasViaje"
                    @update:model-value="onDestinoChange"
                  >
                    <template v-slot:prepend>
                      <q-icon name="place" color="negative" />
                    </template>
                    <template v-slot:option="scope">
                      <q-item v-bind="scope.itemProps">
                        <q-item-section avatar>
                          <q-avatar
                            size="24px"
                            :color="scope.opt.esDestinoFinal ? 'negative' : 'primary'"
                            text-color="white"
                            :icon="scope.opt.esDestinoFinal ? 'flag' : 'place'"
                          />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="text-weight-medium">{{ scope.opt.label }}</q-item-label>
                          <q-item-label caption class="text-grey-6">{{ scope.opt.sublabel }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey text-caption">
                          No hay paradas posteriores disponibles para este origen
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>
              </div>

              <!-- Precio calculado por trayectoria -->
              <div v-if="ventaOrigen && ventaDestino" class="precio-trayectoria-box q-pa-md q-mt-md rounded-borders">
                <div class="row items-center justify-between">
                  <div>
                    <div class="text-caption text-grey-6">Tarifa del Tramo Seleccionado</div>
                    <div class="text-h6 text-weight-bolder text-primary">
                      ${{ calcularPrecioTrayectoria().toLocaleString('es-CO') }}
                    </div>
                    <div class="text-caption text-grey-7 q-mt-xs">
                      <q-icon name="route" size="14px" class="q-mr-xs text-primary" />
                      Tramo: <strong>{{ ventaOrigen }}</strong> → <strong>{{ ventaDestino }}</strong>
                    </div>
                    <div class="text-caption text-grey-6">
                      Parada {{ obtenerIndicePosicion(ventaOrigen) + 1 }} a {{ obtenerIndicePosicion(ventaDestino) + 1 }}
                      (recorre {{ Math.max(1, obtenerIndicePosicion(ventaDestino) - obtenerIndicePosicion(ventaOrigen)) }} de {{ Math.max(1, obtenerParadasViaje(ventaViaje).length - 1) }} tramos de la ruta)
                    </div>
                  </div>
                  <div class="text-right">
                    <q-badge color="primary" class="q-pa-xs text-caption text-weight-bold">
                      {{ obtenerPorcentajeTramo() }}% del trayecto
                    </q-badge>
                    <div class="q-mt-xs">
                      <q-icon name="payments" size="32px" color="primary" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Resumen viaje completo -->
            <div v-if="ventaTipo === 'completo'" class="precio-trayectoria-box q-pa-md q-mb-lg rounded-borders">
              <div class="row items-center justify-between">
                <div>
                  <div class="text-caption text-grey-6">Precio — Viaje Completo</div>
                  <div class="text-h6 text-weight-bolder text-positive">
                    ${{ (ventaViaje?.precio || 0).toLocaleString('es-CO') }}
                  </div>
                  <div class="text-caption text-grey-6">
                    {{ ventaViaje?.origen }} → {{ ventaViaje?.destino }}
                  </div>
                </div>
                <q-icon name="directions_bus" size="32px" color="positive" />
              </div>
            </div>

            <!-- Error de validación -->
            <q-banner v-if="ventaErrorPaso1" class="bg-red-1 text-negative rounded-borders q-mb-md" rounded>
              <template v-slot:avatar>
                <q-icon name="error_outline" color="negative" />
              </template>
              {{ ventaErrorPaso1 }}
            </q-banner>

            <!-- Disponibilidad -->
            <div class="row items-center q-gutter-x-sm q-mt-sm">
              <q-icon name="event_seat" :color="getDisponiblesViaje() > 0 ? 'positive' : 'negative'" size="18px" />
              <span class="text-caption text-weight-bold" :class="getDisponiblesViaje() > 0 ? 'text-positive' : 'text-negative'">
                {{ getDisponiblesViaje() }} puesto(s) disponibles en este viaje
              </span>
            </div>
          </q-card-section>

          <!-- ---- PASO 2: Mapa de asientos ---- -->
          <q-card-section v-else-if="ventaPaso === 2" class="q-pa-lg overflow-auto col">
            <div class="text-subtitle2 text-weight-bold q-mb-sm" style="color: var(--vb-text-primary);">
              Selección de Asiento(s)
            </div>
            <div class="text-caption text-grey-7 q-mb-md">
              Haga clic en un asiento disponible para seleccionarlo. Puede seleccionar múltiples puestos.
            </div>

            <div v-if="obtenerVehiculoVenta()" class="text-center">
              <SeatMap
                :puestos="obtenerVehiculoVenta().puestos || []"
                :capacidad="Number(obtenerVehiculoVenta().capacidad || 20)"
                :tipoVehiculo="obtenerVehiculoVenta().tipo || 'Bus'"
                :puestosOcupados="obtenerPuestosOcupadosVenta()"
                :puestosPendientes="[]"
                :puestosSeleccionados="ventaPuestosSeleccionados"
                :puestoSeleccionado="null"
                :selectable="true"
                :conductor="obtenerVehiculoVenta().conductor"
                @seleccionar="onSeleccionarAsientoModal"
              />
            </div>
            <div v-else class="text-center q-pa-xl">
              <q-icon name="warning" color="warning" size="40px" />
              <div class="text-caption text-grey-7 q-mt-sm">No se encontró el vehículo asignado a este viaje.</div>
            </div>

            <q-banner v-if="ventaErrorPaso2" class="bg-red-1 text-negative rounded-borders q-mt-md" rounded>
              <template v-slot:avatar><q-icon name="error_outline" color="negative" /></template>
              {{ ventaErrorPaso2 }}
            </q-banner>

            <!-- Resumen de selección con chips interactivos -->
            <div v-if="ventaPuestosSeleccionados.length > 0" class="q-mt-md bg-blue-1 text-primary q-pa-sm rounded-borders">
              <div class="row items-center justify-between q-mb-xs">
                <div class="text-caption text-weight-bold">
                  {{ ventaPuestosSeleccionados.length }} puesto(s) seleccionado(s):
                </div>
                <q-btn flat dense size="xs" color="negative" icon="clear_all" label="Limpiar selección" @click="ventaPuestosSeleccionados = []" no-caps />
              </div>
              <div class="row q-gutter-xs q-mb-xs">
                <q-chip
                  v-for="p in ventaPuestosSeleccionados"
                  :key="p.numero || p.id"
                  removable
                  @remove="onSeleccionarAsientoModal(p)"
                  color="primary"
                  text-color="white"
                  icon="event_seat"
                  dense
                >
                  Puesto #{{ p.numero || p.id }}
                </q-chip>
              </div>
              <div class="text-caption text-grey-8">
                Total estimado: <strong>${{ (calcularPrecioTrayectoria() * ventaPuestosSeleccionados.length).toLocaleString('es-CO') }}</strong>
              </div>
            </div>
          </q-card-section>

          <!-- ---- PASO 3: Datos de pasajeros y confirmación ---- -->
          <q-card-section v-else-if="ventaPaso === 3" class="q-pa-lg overflow-auto col">
            <div class="text-subtitle2 text-weight-bold q-mb-sm" style="color: var(--vb-text-primary);">
              Datos de Pasajero(s)
            </div>
            <div class="text-caption text-grey-7 q-mb-md">
              Complete nombre completo y número de documento para cada puesto seleccionado.
            </div>

            <div
              v-for="(puesto, idx) in ventaPuestosSeleccionados"
              :key="puesto.id || puesto.numero"
              class="pasajero-form-card q-pa-md q-mb-md rounded-borders"
            >
              <div class="row items-center q-gutter-x-sm q-mb-sm">
                <q-avatar size="28px" color="primary" text-color="white" class="text-caption text-weight-bold">
                  {{ puesto.numero || puesto.id }}
                </q-avatar>
                <span class="text-weight-bold text-grey-9">Puesto #{{ puesto.numero || puesto.id }}</span>
                <q-badge color="blue-1" text-color="primary" class="text-caption">Piso {{ puesto.piso || 1 }}</q-badge>
              </div>
              <div class="row q-col-gutter-sm">
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="ventaPasajeros[idx].nombre"
                    outlined
                    dense
                    label="Nombre completo *"
                    :error="!!ventaPasajeros[idx].errorNombre"
                    :error-message="ventaPasajeros[idx].errorNombre"
                  >
                    <template v-slot:prepend><q-icon name="person" color="primary" /></template>
                  </q-input>
                </div>
                <div class="col-12 col-sm-6">
                  <q-input
                    v-model="ventaPasajeros[idx].documento"
                    outlined
                    dense
                    label="Número de documento *"
                    :error="!!ventaPasajeros[idx].errorDocumento"
                    :error-message="ventaPasajeros[idx].errorDocumento"
                  >
                    <template v-slot:prepend><q-icon name="badge" color="primary" /></template>
                  </q-input>
                </div>
              </div>
            </div>

            <!-- Método de pago -->
            <div class="q-mt-md q-mb-sm">
              <div class="text-caption text-weight-bold text-grey-8 q-mb-xs">Método de Pago</div>
              <div class="row q-gutter-sm">
                <q-btn
                  v-for="mp in metodosPago"
                  :key="mp.value"
                  :outline="ventaMetodoPago !== mp.value"
                  :color="ventaMetodoPago === mp.value ? 'primary' : 'grey-5'"
                  :icon="mp.icon"
                  :label="mp.label"
                  @click="ventaMetodoPago = mp.value"
                  no-caps
                  size="sm"
                  class="q-px-md"
                />
              </div>
            </div>

            <!-- Resumen final -->
            <div class="resumen-venta-box q-pa-md q-mt-md rounded-borders">
              <div class="text-subtitle2 text-weight-bold q-mb-sm text-primary">Resumen de Venta</div>
              <div class="row q-col-gutter-sm text-caption">
                <div class="col-6">
                  <div class="text-grey-6">Viaje</div>
                  <div class="text-weight-bold text-grey-9">{{ ventaViaje?.codigo }}</div>
                </div>
                <div class="col-6">
                  <div class="text-grey-6">Bus</div>
                  <div class="text-weight-bold text-grey-9">{{ getVehiculo(ventaViaje?.vehiculoId)?.placa || 'N/A' }}</div>
                </div>
                <div class="col-6">
                  <div class="text-grey-6">Origen</div>
                  <div class="text-weight-bold text-grey-9">{{ ventaOrigen || ventaViaje?.origen }}</div>
                </div>
                <div class="col-6">
                  <div class="text-grey-6">Destino</div>
                  <div class="text-weight-bold text-grey-9">{{ ventaDestino || ventaViaje?.destino }}</div>
                </div>
                <div class="col-6">
                  <div class="text-grey-6">Puestos</div>
                  <div class="text-weight-bold text-grey-9">{{ ventaPuestosSeleccionados.map(p => `#${p.numero || p.id}`).join(', ') }}</div>
                </div>
                <div class="col-6">
                  <div class="text-grey-6">Pago</div>
                  <div class="text-weight-bold text-grey-9">{{ ventaMetodoPago }}</div>
                </div>
                <div class="col-12 q-mt-sm">
                  <q-separator class="q-mb-sm" />
                  <div class="row items-center justify-between">
                    <span class="text-weight-bold text-grey-9">TOTAL A COBRAR</span>
                    <span class="text-h6 text-weight-bolder text-primary">
                      ${{ (calcularPrecioTrayectoria() * ventaPuestosSeleccionados.length).toLocaleString('es-CO') }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <q-banner v-if="ventaErrorPaso3" class="bg-red-1 text-negative rounded-borders q-mt-md" rounded>
              <template v-slot:avatar><q-icon name="error_outline" color="negative" /></template>
              {{ ventaErrorPaso3 }}
            </q-banner>
          </q-card-section>

          <!-- Pie del modal con acciones -->
          <q-separator />
          <q-card-actions align="right" class="q-pa-md bg-grey-1 flex-shrink-0">
            <q-btn
              flat
              label="Cancelar"
              color="grey-7"
              @click="cerrarModalVenta"
              no-caps
              :disable="ventaGuardando"
            />
            <q-btn
              v-if="ventaPaso > 1"
              flat
              icon="arrow_back"
              label="Atrás"
              color="primary"
              @click="ventaPaso--"
              no-caps
              :disable="ventaGuardando"
            />
            <q-btn
              v-if="ventaPaso < 3"
              color="primary"
              icon-right="arrow_forward"
              :label="ventaPaso === 1 ? 'Seleccionar Asientos' : 'Datos del Pasajero'"
              @click="avanzarPaso"
              no-caps
              unelevated
              class="text-weight-bold"
            />
            <q-btn
              v-else
              color="positive"
              icon="check_circle"
              label="Confirmar y Emitir Tiquetes"
              @click="confirmarVenta"
              no-caps
              unelevated
              class="text-weight-bold"
              :loading="ventaGuardando"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useViajeStore } from '../stores/viajeStore'
import { useVehiculoStore } from '../stores/vehiculoStore'
import { useVentaStore } from '../stores/ventaStore'
import { useAuthStore } from '../stores/authStore'
import SeatMap from '../components/SeatMap.vue'
import { estimarRutaViaje } from '../utils/distanceCalculator'

const $q = useQuasar()
const router = useRouter()

const viajeStore = useViajeStore()
const vehiculoStore = useVehiculoStore()
const ventaStore = useVentaStore()
const authStore = useAuthStore()

// ─── Estado de filtros y vista ────────────────────────────────────────────────
const vistaModo = ref('cards')
const filtroTexto = ref('')
const filtroEstado = ref('Todos')
const estadosFiltro = ['Todos', 'Disponible', 'Programado', 'Completo']

// ─── Modal mapa de asientos ───────────────────────────────────────────────────
const modalMapaVisible = ref(false)
const viajeSeleccionadoModal = ref(null)

// ─── Modal Nueva Venta ────────────────────────────────────────────────────────
const modalVentaVisible = ref(false)
const cargandoParadasViaje = ref(false)
const ventaViaje = ref(null)
const ventaPaso = ref(1)
const ventaTipo = ref('trayectoria')
const ventaOrigen = ref('')
const ventaDestino = ref('')
const ventaPuestosSeleccionados = ref([])
const ventaPasajeros = ref([])
const ventaMetodoPago = ref('Efectivo')
const ventaGuardando = ref(false)
const ventaErrorPaso1 = ref('')
const ventaErrorPaso2 = ref('')
const ventaErrorPaso3 = ref('')

const metodosPago = [
  { label: 'Efectivo', value: 'Efectivo', icon: 'payments' },
  { label: 'Tarjeta', value: 'Tarjeta', icon: 'credit_card' },
  { label: 'Transferencia', value: 'Transferencia', icon: 'account_balance' }
]

// ─── Carga inicial ────────────────────────────────────────────────────────────
onMounted(async () => {
  await Promise.allSettled([
    viajeStore.cargarViajes(),
    vehiculoStore.cargarVehiculos(),
    ventaStore.cargarVentas()
  ])
})

// ─── Funciones de datos ───────────────────────────────────────────────────────
function getRutaInfo(viaje) {
  if (!viaje) return { distanciaTexto: '—', duracionTexto: '—' }
  return estimarRutaViaje(viaje.origen, viaje.destino)
}

function obtenerViajes() {
  return viajeStore.viajes || []
}

function obtenerViajesActivos() {
  return obtenerViajes().filter(v => v.estado !== 'Cancelado' && v.estado !== 'Finalizado')
}

function obtenerViajesFiltrados() {
  return obtenerViajes().filter(v => {
    if (filtroEstado.value !== 'Todos' && v.estado !== filtroEstado.value) return false
    if (!filtroTexto.value) return true
    const term = filtroTexto.value.toLowerCase().trim()
    const veh = getVehiculo(v.vehiculoId)
    const placa = veh?.placa?.toLowerCase() || ''
    const conductor = veh?.conductor?.toLowerCase() || ''
    const empresa = (veh?.empresa || 'VIABUS Express').toLowerCase()
    return (
      (v.codigo && v.codigo.toLowerCase().includes(term)) ||
      (v.origen && v.origen.toLowerCase().includes(term)) ||
      (v.destino && v.destino.toLowerCase().includes(term)) ||
      placa.includes(term) ||
      conductor.includes(term) ||
      empresa.includes(term)
    )
  })
}

function obtenerTotalPuestosDisponibles() {
  return obtenerViajesActivos().reduce((acc, v) => acc + getDisponibles(v), 0)
}

function obtenerTotalPuestosOcupados() {
  return obtenerViajesActivos().reduce((acc, v) => acc + getOcupados(v), 0)
}

function obtenerTarifaPromedio() {
  const activos = obtenerViajesActivos()
  if (activos.length === 0) return 0
  const suma = activos.reduce((acc, v) => acc + (Number(v.precio) || 0), 0)
  return Math.round(suma / activos.length)
}

const columns = [
  { name: 'codigo', label: 'Código', field: 'codigo', align: 'left', sortable: true },
  { name: 'ruta', label: 'Ruta', field: 'origen', align: 'left' },
  { name: 'horario', label: 'Horario', field: 'fecha', align: 'left', sortable: true },
  { name: 'vehiculo', label: 'Vehículo / Conductor', field: 'vehiculoId', align: 'left' },
  { name: 'disponibilidad', label: 'Capacidad & Puestos', field: 'id', align: 'center' },
  { name: 'precio', label: 'Tarifa', field: 'precio', align: 'right', sortable: true },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', align: 'right' }
]

function getVehiculo(id) {
  if (!id) return null
  return vehiculoStore.obtenerVehiculo(id)
}

function getOcupados(viaje) {
  const vId = viaje.id || viaje._id
  return ventaStore.puestosOcupadosPorViaje(vId).length
}

function getDisponibles(viaje) {
  const vId = viaje.vehiculoId || (viaje.bus?._id || viaje.bus)
  const veh = getVehiculo(vId)
  if (!veh) return 0
  const ocupados = getOcupados(viaje)
  return Math.max(0, veh.capacidad - ocupados)
}

function getPorcentajeOcupacion(viaje) {
  const vId = viaje.vehiculoId || (viaje.bus?._id || viaje.bus)
  const veh = getVehiculo(vId)
  if (!veh || !veh.capacidad) return 0
  const ocupados = getOcupados(viaje)
  return Math.min(1, ocupados / veh.capacidad)
}

function colorEstado(estado) {
  const map = {
    'Programado': 'info',
    'Disponible': 'positive',
    'Completo': 'negative',
    'Finalizado': 'grey-7',
    'Cancelado': 'warning'
  }
  return map[estado] || 'grey'
}

function limpiarFiltros() {
  filtroTexto.value = ''
  filtroEstado.value = 'Todos'
}

// ─── Modal Mapa ───────────────────────────────────────────────────────────────
function obtenerVehiculoModal() {
  if (!viajeSeleccionadoModal.value) return null
  const vId = viajeSeleccionadoModal.value.vehiculoId || (viajeSeleccionadoModal.value.bus?._id || viajeSeleccionadoModal.value.bus)
  return getVehiculo(vId)
}

function obtenerPuestosOcupadosModal() {
  if (!viajeSeleccionadoModal.value) return []
  return ventaStore.puestosOcupadosPorViaje(viajeSeleccionadoModal.value.id || viajeSeleccionadoModal.value._id)
}

function obtenerPuestosPendientesModal() {
  return []
}

function abrirVistaMapa(viaje) {
  viajeSeleccionadoModal.value = viaje
  modalMapaVisible.value = true
}

function iniciarNuevaVenta(viaje) {
  if (!viaje) return
  const id = viaje.id || viaje._id
  router.push({ path: '/ventas/nueva', query: { viajeId: id } })
}

// ─── Modal Nueva Venta (Alternativa directa por trayectoria) ───────────────────
async function abrirModalVenta(viaje) {
  if (!viaje) return
  ventaViaje.value = { ...viaje }
  ventaPaso.value = 1
  ventaTipo.value = 'trayectoria'
  ventaOrigen.value = ''
  ventaDestino.value = ''
  ventaPuestosSeleccionados.value = []
  ventaPasajeros.value = []
  ventaMetodoPago.value = 'Efectivo'
  ventaGuardando.value = false
  ventaErrorPaso1.value = ''
  ventaErrorPaso2.value = ''
  ventaErrorPaso3.value = ''
  modalVentaVisible.value = true

  // Consultar paradas e información actualizada del viaje desde la API si tiene identificador
  const idViaje = viaje.id || viaje._id
  if (idViaje) {
    cargandoParadasViaje.value = true
    try {
      const res = await viajeApi.obtenerPorId(idViaje)
      const vData = res?.data || res
      if (vData && (vData.origen || vData.origin)) {
        ventaViaje.value = {
          ...ventaViaje.value,
          ...vData,
          id: vData.id || vData._id || idViaje,
          _id: vData._id || ventaViaje.value._id,
          origen: vData.origen || vData.origin || ventaViaje.value.origen,
          destino: vData.destino || vData.destination || ventaViaje.value.destino,
          precio: Number(vData.precio !== undefined ? vData.precio : (vData.price !== undefined ? vData.price : ventaViaje.value.precio)),
          paradasIntermedias: Array.isArray(vData.paradasIntermedias)
            ? vData.paradasIntermedias
            : (Array.isArray(ventaViaje.value.paradasIntermedias) ? ventaViaje.value.paradasIntermedias : [])
        }
      }
    } catch (err) {
      console.warn('Utilizando paradas registradas localmente en el viaje:', err.message)
    } finally {
      cargandoParadasViaje.value = false
    }
  }

  // Preseleccionar por defecto la primera parada como origen sugerido
  const paradasDisponibles = obtenerParadasViaje(ventaViaje.value)
  if (paradasDisponibles.length > 0) {
    ventaOrigen.value = paradasDisponibles[0]
  }
}

function cerrarModalVenta() {
  if (ventaGuardando.value) return
  modalVentaVisible.value = false
}

// Paradas ordenadas y deduplicadas de la ruta oficial del viaje
function obtenerParadasViaje(viaje) {
  if (!viaje) return []
  const lista = []

  const orig = String(viaje.origen || '').trim()
  if (orig) lista.push(orig)

  if (Array.isArray(viaje.paradasIntermedias)) {
    for (const p of viaje.paradasIntermedias) {
      const str = String(p || '').trim()
      if (str && !lista.some(item => item.toLowerCase() === str.toLowerCase())) {
        lista.push(str)
      }
    }
  }

  const dest = String(viaje.destino || '').trim()
  if (dest && !lista.some(item => item.toLowerCase() === dest.toLowerCase())) {
    lista.push(dest)
  }

  return lista
}

function obtenerIndicePosicion(parada) {
  if (!ventaViaje.value || !parada) return -1
  const paradas = obtenerParadasViaje(ventaViaje.value)
  return paradas.findIndex(p => p.toLowerCase() === String(parada).trim().toLowerCase())
}

// Opciones de origen: todas las paradas excepto la última (destino final)
function opcionesOrigen() {
  const paradas = obtenerParadasViaje(ventaViaje.value)
  if (paradas.length <= 1) return []
  const paradasOrigen = paradas.slice(0, paradas.length - 1)
  return paradasOrigen.map((p, idx) => ({
    label: `${idx + 1}. ${p} ${idx === 0 ? '(Inicio de Ruta)' : ''}`,
    value: p,
    sublabel: idx === 0 ? `Terminal de Origen: ${p}` : `Parada intermedia #${idx + 1}`,
    esOrigen: idx === 0,
    indice: idx
  }))
}

// Opciones de destino: ÚNICAMENTE paradas posteriores al origen seleccionado
function opcionesDestino() {
  const paradas = obtenerParadasViaje(ventaViaje.value)
  if (!ventaOrigen.value || paradas.length <= 1) return []
  const idxOrigen = obtenerIndicePosicion(ventaOrigen.value)
  if (idxOrigen === -1) return []

  const paradasDestino = paradas.slice(idxOrigen + 1)
  const totalParadas = paradas.length

  return paradasDestino.map((p) => {
    const realIdx = obtenerIndicePosicion(p)
    const esFinal = realIdx === totalParadas - 1
    return {
      label: `${realIdx + 1}. ${p} ${esFinal ? '(Destino Final)' : ''}`,
      value: p,
      sublabel: esFinal ? `Terminal de Llegada: ${p}` : `Parada intermedia #${realIdx + 1}`,
      esDestinoFinal: esFinal,
      indice: realIdx
    }
  })
}

// Actualización dinámica cuando el usuario cambia el origen
function onOrigenChange(nuevoOrigen) {
  ventaOrigen.value = nuevoOrigen
  ventaErrorPaso1.value = ''

  // Limpiar la selección anterior si deja de ser válida en las paradas posteriores
  const destinosValidos = opcionesDestino().map(o => o.value)
  if (!ventaDestino.value || !destinosValidos.includes(ventaDestino.value)) {
    ventaDestino.value = ''
  }
}

// Actualización cuando cambia el destino
function onDestinoChange(nuevoDestino) {
  ventaDestino.value = nuevoDestino
  ventaErrorPaso1.value = ''
  validarTramo()
}

// Validaciones del recorrido
function validarTramo() {
  if (!ventaOrigen.value || !ventaDestino.value) return false
  const idxO = obtenerIndicePosicion(ventaOrigen.value)
  const idxD = obtenerIndicePosicion(ventaDestino.value)

  if (idxO === -1) {
    ventaErrorPaso1.value = `El origen "${ventaOrigen.value}" no pertenece a la ruta del viaje.`
    return false
  }

  if (idxD === -1) {
    ventaErrorPaso1.value = `El destino "${ventaDestino.value}" no pertenece a la ruta del viaje.`
    return false
  }

  if (idxO === idxD) {
    ventaErrorPaso1.value = 'El origen y el destino del pasajero no pueden ser iguales.'
    return false
  }

  if (idxD <= idxO) {
    ventaErrorPaso1.value = 'El destino debe ser una parada posterior al origen en el recorrido de la ruta.'
    return false
  }

  return true
}

// Porcentaje del trayecto cubierto por el tramo seleccionado
function obtenerPorcentajeTramo() {
  if (!ventaViaje.value || !ventaOrigen.value || !ventaDestino.value) return 100
  const paradas = obtenerParadasViaje(ventaViaje.value)
  if (paradas.length <= 2) return 100
  const totalTramos = paradas.length - 1
  const idxO = obtenerIndicePosicion(ventaOrigen.value)
  const idxD = obtenerIndicePosicion(ventaDestino.value)
  if (idxO === -1 || idxD === -1 || idxD <= idxO) return 100
  return Math.round(((idxD - idxO) / totalTramos) * 100)
}

// Selección automática para viaje completo
function seleccionarViajeCompleto() {
  ventaTipo.value = 'completo'
  if (ventaViaje.value) {
    ventaOrigen.value = ventaViaje.value.origen
    ventaDestino.value = ventaViaje.value.destino
    ventaErrorPaso1.value = ''
  }
}

// Calcular precio por trayectoria (proporcional al tramo recorrido)
function calcularPrecioTrayectoria() {
  if (!ventaViaje.value) return 0
  const precioTotal = Number(ventaViaje.value.precio) || 0
  const paradas = obtenerParadasViaje(ventaViaje.value)
  if (paradas.length <= 2) return precioTotal

  const totalTramos = paradas.length - 1
  if (!ventaOrigen.value || !ventaDestino.value) return precioTotal
  const idxO = obtenerIndicePosicion(ventaOrigen.value)
  const idxD = obtenerIndicePosicion(ventaDestino.value)
  if (idxO === -1 || idxD === -1 || idxD <= idxO) return precioTotal

  const tramosPasajero = idxD - idxO
  // Si viaja de inicio a fin es el 100% de la tarifa
  if (tramosPasajero === totalTramos) return precioTotal

  // Tarifa proporcional redondeada a múltiplos de 1.000 COP
  const tarifaCalculada = (precioTotal / totalTramos) * tramosPasajero
  return Math.max(5000, Math.round(tarifaCalculada / 1000) * 1000)
}

function getDisponiblesViaje() {
  if (!ventaViaje.value) return 0
  const vehiculo = obtenerVehiculoVenta()
  const cap = Number(vehiculo?.capacidad || 20)
  const ocupadosTramo = obtenerPuestosOcupadosVenta().length
  return Math.max(0, cap - ocupadosTramo)
}

function obtenerVehiculoVenta() {
  if (!ventaViaje.value) return null
  const vId = ventaViaje.value.vehiculoId || (ventaViaje.value.bus?._id || ventaViaje.value.bus)
  let veh = vId ? getVehiculo(vId) : null
  if (!veh && ventaViaje.value.bus && typeof ventaViaje.value.bus === 'object') {
    veh = ventaViaje.value.bus
  }
  if (!veh && vehiculoStore.vehiculos.length > 0) {
    veh = vehiculoStore.vehiculos[0]
  }
  return veh
}

function obtenerPuestosOcupadosVenta() {
  if (!ventaViaje.value) return []
  return ventaStore.puestosOcupadosPorViaje(
    ventaViaje.value.id || ventaViaje.value._id,
    ventaOrigen.value,
    ventaDestino.value
  )
}

function onSeleccionarAsientoModal(asiento) {
  if (!asiento) return
  ventaErrorPaso2.value = ''
  const num = Number(asiento.numero || asiento.id)
  const idx = ventaPuestosSeleccionados.value.findIndex(p => Number(p.numero || p.id) === num)
  if (idx >= 0) {
    ventaPuestosSeleccionados.value.splice(idx, 1)
  } else {
    const disp = getDisponiblesViaje()
    if (ventaPuestosSeleccionados.value.length >= disp) {
      $q.notify({
        type: 'warning',
        icon: 'block',
        message: `Solo quedan ${disp} puesto(s) disponible(s) para este tramo.`,
        position: 'top'
      })
      return
    }
    ventaPuestosSeleccionados.value.push({
      id: asiento.id || num,
      numero: num,
      piso: Number(asiento.piso || 1)
    })
  }
}

// ─── Flujo por pasos ──────────────────────────────────────────────────────────
function avanzarPaso() {
  ventaErrorPaso1.value = ''
  ventaErrorPaso2.value = ''

  if (ventaPaso.value === 1) {
    if (!ventaOrigen.value || !ventaDestino.value) {
      ventaErrorPaso1.value = 'Debe seleccionar tanto el origen como el destino del pasajero.'
      return
    }
    if (!validarTramo()) {
      return
    }
    if (getDisponiblesViaje() <= 0) {
      ventaErrorPaso1.value = 'Este viaje no tiene puestos disponibles para la venta.'
      return
    }
    ventaPaso.value = 2
    ventaPuestosSeleccionados.value = []
    return
  }

  if (ventaPaso.value === 2) {
    if (ventaPuestosSeleccionados.value.length === 0) {
      ventaErrorPaso2.value = 'Debe seleccionar al menos un asiento del mapa.'
      return
    }
    // Inicializar datos de pasajeros
    ventaPasajeros.value = ventaPuestosSeleccionados.value.map(() => ({
      nombre: '',
      documento: '',
      errorNombre: '',
      errorDocumento: ''
    }))
    ventaPaso.value = 3
  }
}

async function confirmarVenta() {
  ventaErrorPaso3.value = ''

  // Validar pasajeros
  let hayError = false
  for (let i = 0; i < ventaPasajeros.value.length; i++) {
    const p = ventaPasajeros.value[i]
    p.errorNombre = ''
    p.errorDocumento = ''
    if (!p.nombre.trim()) {
      p.errorNombre = 'El nombre es obligatorio.'
      hayError = true
    }
    if (!p.documento.trim()) {
      p.errorDocumento = 'El documento es obligatorio.'
      hayError = true
    }
  }
  if (hayError) {
    ventaErrorPaso3.value = 'Complete los datos de todos los pasajeros antes de continuar.'
    return
  }

  ventaGuardando.value = true

  try {
    const precioTrayectoria = calcularPrecioTrayectoria()
    const items = ventaPuestosSeleccionados.value.map((puesto, idx) => ({
      puestoId: puesto.id || puesto.numero,
      piso: puesto.piso || 1,
      customerName: ventaPasajeros.value[idx].nombre.trim(),
      customerDoc: ventaPasajeros.value[idx].documento.trim(),
      precio: precioTrayectoria,
      origen: ventaOrigen.value || ventaViaje.value?.origen,
      destino: ventaDestino.value || ventaViaje.value?.destino
    }))

    const resultado = await ventaStore.crearVentaMultiple({
      viajeId: ventaViaje.value.id || ventaViaje.value._id,
      vehiculoId: ventaViaje.value.vehiculoId,
      origen: ventaOrigen.value || ventaViaje.value?.origen,
      destino: ventaDestino.value || ventaViaje.value?.destino,
      precio: precioTrayectoria,
      metodoPago: ventaMetodoPago.value,
      items
    })

    await ventaStore.cargarVentas()

    modalVentaVisible.value = false

    $q.notify({
      type: 'positive',
      icon: 'check_circle',
      message: `✓ Venta confirmada: ${items.length} tiquete(s) emitidos correctamente.`,
      caption: `Trayectoria: ${ventaOrigen.value || ventaViaje.value?.origen} → ${ventaDestino.value || ventaViaje.value?.destino}`,
      position: 'top',
      timeout: 4000
    })

    // Ir al primer tiquete emitido
    const primerTiquete = resultado?.tiquetes?.[0] || resultado?.data?.[0]
    if (primerTiquete?.id) {
      setTimeout(() => {
        router.push(`/tickets/${primerTiquete.id}`)
      }, 800)
    }
  } catch (err) {
    ventaErrorPaso3.value = err.message || 'Error al procesar la venta. Intente nuevamente.'
    $q.notify({
      type: 'negative',
      icon: 'error',
      message: err.message || 'Error al emitir los tiquetes.',
      position: 'top'
    })
  } finally {
    ventaGuardando.value = false
  }
}
</script>

<style scoped>
.premium-header {
  background: linear-gradient(135deg, #0d47a1 0%, #1976d2 60%, #1565c0 100%);
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(25, 118, 210, 0.35);
  position: relative;
  overflow: hidden;
}

.kpi-mini-card {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 12px 16px;
  transition: transform 0.2s ease, background 0.2s ease;
}

.kpi-mini-card:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: translateY(-2px);
}

.btn-glow {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.btn-glow:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
}

.trip-card {
  border-radius: 14px;
  background: var(--vb-bg-surface);
  border: 1px solid var(--vb-border);
  transition: all 0.25s ease;
  height: 100%;
}

.trip-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--vb-shadow-md);
  border-color: var(--vb-primary);
}

.trip-card-header {
  background: var(--vb-bg-surface-hover);
  border-bottom: 1px solid var(--vb-border);
}

.route-icon-box {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--vb-primary-soft);
  color: var(--vb-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.bg-blue-0 {
  background: var(--vb-bg-main);
}

.btn-action-sell {
  box-shadow: 0 4px 10px rgba(25, 118, 210, 0.3);
  transition: all 0.2s ease;
}

.btn-action-sell:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(25, 118, 210, 0.45);
}

.rounded-borders-lg { border-radius: 16px; }
.rounded-borders-md { border-radius: 12px; }
.border-dashed { border: 2px dashed #cbd5e1; }
.font-mono { font-family: monospace; }

.animate-pulse {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 0.4; }
  50% { opacity: 1; }
  100% { opacity: 0.4; }
}

/* ─── Estilos del Modal de Venta ─── */
.venta-modal-header {
  background: linear-gradient(135deg, #1565c0 0%, #1976d2 100%);
}

.paso-indicator {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  color: white;
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.paso-active {
  background: white;
  color: #1565c0;
}

.paso-done {
  background: #4ade80;
  color: white;
}

.viaje-summary-box {
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  border-radius: 10px;
}

.tipo-venta-card {
  border: 2px solid #E2E8F0;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  transition: all 0.2s ease;
  background: #FAFAFA;
}

.tipo-venta-card:hover {
  border-color: #93C5FD;
  background: #EFF6FF;
  transform: translateY(-2px);
}

.tipo-venta-active {
  border-color: #2563EB !important;
  background: #EFF6FF !important;
  box-shadow: 0 4px 12px rgba(37,99,235,0.15);
}

.precio-trayectoria-box {
  background: #F0FDF4;
  border: 1px solid #BBF7D0;
  border-radius: 10px;
}

.pasajero-form-card {
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
}

.resumen-venta-box {
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  border-radius: 10px;
}

.bg-primary-soft {
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  border-radius: 8px;
}

.overflow-auto {
  overflow-y: auto;
}
</style>
