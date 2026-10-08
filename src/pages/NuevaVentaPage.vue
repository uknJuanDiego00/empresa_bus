<template>
  <q-page class="q-pa-lg">
    <div class="q-mx-auto" style="max-width: 1100px;">
      <!-- CABECERA -->
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <div class="text-h4 text-weight-bold text-dark q-mb-xs">Nueva Venta de Tiquete</div>
          <div class="text-subtitle2 text-grey-7">Flujo guiado paso a paso para emisión y facturación</div>
        </div>
        <q-btn flat color="grey-8" icon="arrow_back" label="Volver a Ventas" to="/ventas" no-caps />
      </div>

      <!-- STEPPER GUIDED WORKFLOW -->
      <q-stepper
        :model-value="paso"
        @update:model-value="cambiarPaso"
        ref="stepper"
        color="primary"
        animated
        flat
        header-nav
        class="vb-card overflow-hidden"
      >
        <!-- PASO 1: SELECCIONAR VIAJE -->
        <q-step
          :name="1"
          title="Viaje"
          icon="route"
          :done="paso > 1"
          class="q-pa-lg"
        >
          <div class="row items-center justify-between q-mb-md">
            <div>
              <div class="text-subtitle1 text-weight-bold" style="color: var(--vb-text-primary);">
                1. Seleccione el Viaje Programado
              </div>
              <div class="text-caption" style="color: var(--vb-text-secondary);">
                Elija la ruta y horario para el cual desea emitir o reservar el tiquete
              </div>
            </div>

            <!-- BOTÓN INMEDIATO AL SELECCIONAR: NO REQUIERE SCROLL -->
            <div v-if="viajeSeleccionado" class="row items-center q-gutter-x-sm">
              <div class="selected-indicator-pill">
                <q-icon name="check_circle" color="positive" size="14px" class="q-mr-xs" />
                <span class="text-caption text-weight-bold">{{ viajeSeleccionado.codigo }}: {{ viajeSeleccionado.origen }} → {{ viajeSeleccionado.destino }}</span>
              </div>
              <q-btn
                color="primary"
                icon-right="arrow_forward"
                label="Continuar a Cliente"
                @click="paso = 2"
                no-caps
                unelevated
                class="text-weight-bold q-px-md"
              />
            </div>
          </div>

          <!-- CENTRO DE BÚSQUEDA Y FILTRADO INTEGRADO -->
          <div class="search-filter-hub q-mb-md">
            <div class="row items-center justify-between q-mb-sm">
              <div class="row items-center q-gutter-x-xs text-caption text-weight-bold" style="color: var(--vb-text-primary);">
                <q-icon name="route" color="primary" size="18px" />
                <span>Buscador de Rutas y Horarios</span>
              </div>
              <div class="row items-center q-gutter-x-xs">
                <span class="text-caption" style="color: var(--vb-text-secondary);">
                  {{ viajesFiltrados.length }} rutas disponibles
                </span>
                <q-btn
                  v-if="filtrosActivos"
                  flat
                  dense
                  color="negative"
                  icon="clear_all"
                  label="Limpiar Filtros"
                  size="sm"
                  @click="limpiarBusqueda"
                  no-caps
                  class="q-ml-sm"
                />
              </div>
            </div>

            <!-- Fila Principal: Buscador Textual Global con Hamburguesa al lado de la Lupa -->
            <div>
              <q-input
                v-model="busquedaViaje"
                outlined
                dense
                placeholder="Escriba destino, origen, empresa, hora (ej. 08:00), placa o código..."
                clearable
                class="search-field-unified"
              >
                <!-- Menú hamburguesa pegado a la lupa para desplegar filtros -->
                <template v-slot:prepend>
                  <q-btn
                    flat
                    round
                    dense
                    icon="menu"
                    :color="mostrarFiltros || filtrosAvanzadosActivosCount > 0 ? 'primary' : 'grey-7'"
                    @click="mostrarFiltros = !mostrarFiltros"
                    class="q-mr-xs"
                  >
                    <q-badge v-if="filtrosAvanzadosActivosCount > 0" color="primary" floating rounded>
                      {{ filtrosAvanzadosActivosCount }}
                    </q-badge>
                    <q-tooltip>{{ mostrarFiltros ? 'Cerrar filtros' : 'Abrir filtros de origen, destino, empresa y horario' }}</q-tooltip>
                  </q-btn>
                  <q-icon name="search" color="primary" />
                </template>
              </q-input>
            </div>

            <!-- Menú Desplegable de Filtros: Ciudad de Origen, Ciudad de Destino, Empresa, Horario y Orden -->
            <q-slide-transition>
              <div v-show="mostrarFiltros" class="q-pt-sm">
                <div class="row q-col-gutter-sm items-center">
                  <!-- Ciudad de Origen -->
                  <div class="col-12 col-sm-6 col-md-3">
                    <q-select
                      outlined
                      dense
                      v-model="filtroOrigen"
                      :options="origenesDisponibles"
                      label="Ciudad de Origen"
                      class="search-field-unified"
                    >
                      <template v-slot:prepend>
                        <q-icon name="trip_origin" size="16px" color="primary" />
                      </template>
                    </q-select>
                  </div>

                  <!-- Ciudad de Destino -->
                  <div class="col-12 col-sm-6 col-md-3">
                    <q-select
                      outlined
                      dense
                      v-model="filtroDestino"
                      :options="destinosDisponibles"
                      label="Ciudad de Destino"
                      class="search-field-unified"
                    >
                      <template v-slot:prepend>
                        <q-icon name="place" size="16px" color="primary" />
                      </template>
                    </q-select>
                  </div>

                  <!-- Empresa -->
                  <div class="col-12 col-sm-6 col-md-2">
                    <q-select
                      outlined
                      dense
                      v-model="filtroEmpresa"
                      :options="empresasDisponibles"
                      label="Empresa"
                      class="search-field-unified"
                    >
                      <template v-slot:prepend>
                        <q-icon name="business" size="16px" color="primary" />
                      </template>
                    </q-select>
                  </div>

                  <!-- Horario de Salida -->
                  <div class="col-12 col-sm-6 col-md-2">
                    <q-select
                      outlined
                      dense
                      v-model="filtroHorario"
                      :options="['Cualquier horario', 'Mañana (05:00 - 11:59)', 'Tarde (12:00 - 17:59)', 'Noche (18:00 - 23:59)']"
                      label="Horario de Salida"
                      class="search-field-unified"
                    >
                      <template v-slot:prepend>
                        <q-icon name="schedule" size="16px" color="primary" />
                      </template>
                    </q-select>
                  </div>

                  <!-- Ordenar por -->
                  <div class="col-12 col-sm-6 col-md-2">
                    <q-select
                      outlined
                      dense
                      v-model="ordenSeleccionado"
                      :options="['Por defecto', 'Hora: Más temprano', 'Hora: Más tarde', 'Precio: Menor a mayor', 'Precio: Mayor a menor']"
                      label="Ordenar por"
                      class="search-field-unified"
                    >
                      <template v-slot:prepend>
                        <q-icon name="sort" size="16px" color="primary" />
                      </template>
                    </q-select>
                  </div>
                </div>
              </div>
            </q-slide-transition>
          </div>

          <!-- ESTADO SIN VIAJES -->
          <div v-if="viajesFiltrados.length === 0" class="empty-state-box q-my-md">
            <div class="empty-state-icon">
              <q-icon name="route" size="28px" />
            </div>
            <div class="empty-state-title">No se encontraron viajes disponibles</div>
            <div class="empty-state-desc" v-if="busquedaViaje || filtrosActivos">
              No hay viajes que coincidan con los filtros aplicados.
            </div>
            <div class="empty-state-desc" v-else>
              Todos los viajes están completos o finalizados. Programe un nuevo viaje para continuar.
            </div>
            <div class="row q-gutter-sm justify-center q-mt-sm">
              <q-btn
                v-if="busquedaViaje || filtrosActivos"
                outline
                color="primary"
                label="Limpiar Filtros"
                icon="clear_all"
                @click="limpiarBusqueda"
                no-caps
              />
              <q-btn
                v-else
                color="primary"
                unelevated
                icon="add"
                label="Programar Viaje"
                to="/viajes/crear"
                no-caps
              />
            </div>
          </div>

          <!-- LISTADO DE TARJETAS DE VIAJES -->
          <div v-else class="row q-col-gutter-md">
            <div
              v-for="viaje in viajesFiltrados"
              :key="viaje.id"
              class="col-12 col-md-6 col-lg-4"
            >
              <q-card
                flat
                class="trip-select-card cursor-pointer"
                :class="{ 'trip-select-active': viajeSeleccionado?.id === viaje.id }"
                @click="seleccionarViaje(viaje)"
              >
                <q-card-section class="q-pa-md">
                  <!-- Cabecera de tarjeta con código, empresa y precio -->
                  <div class="row items-center justify-between q-mb-xs">
                    <div class="row items-center q-gutter-x-xs">
                      <span class="trip-code-pill">{{ viaje.codigo }}</span>
                      <q-badge color="grey-2" text-color="dark" class="text-weight-bold">
                        <q-icon name="business" size="12px" color="primary" class="q-mr-xs" />
                        {{ getEmpresa(viaje) }}
                      </q-badge>
                    </div>
                    <span class="text-h6 text-weight-bold text-primary">
                      ${{ viaje.precio.toLocaleString('es-CO') }}
                    </span>
                  </div>

                  <!-- Origen y Destino -->
                  <div class="row items-center q-gutter-x-xs q-my-sm">
                    <span class="text-weight-bold text-subtitle2" style="color: var(--vb-text-primary);">{{ viaje.origen }}</span>
                    <q-icon name="arrow_forward" size="14px" color="grey-5" />
                    <span class="text-weight-bold text-subtitle2" style="color: var(--vb-text-primary);">{{ viaje.destino }}</span>
                  </div>

                  <!-- Estimación Vial (Duración y Distancia tipo Google Maps) -->
                  <div class="route-metrics-bar row items-center justify-between q-py-xs q-px-sm rounded-borders q-my-xs text-caption">
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

                  <!-- Fecha, Hora y Vehículo -->
                  <div class="row q-gutter-x-md text-caption text-grey-7 q-my-xs">
                    <span class="row items-center"><q-icon name="event" size="14px" color="grey-6" class="q-mr-xs" />{{ viaje.fecha }}</span>
                    <span class="row items-center"><q-icon name="schedule" size="14px" color="primary" class="q-mr-xs" /><strong class="text-primary">{{ viaje.hora }}</strong></span>
                  </div>

                  <!-- Vehículo y Puestos Disponibles -->
                  <div class="row items-center justify-between q-mt-sm pt-top-border">
                    <div class="row items-center q-gutter-x-xs text-caption text-grey-8">
                      <q-icon name="directions_bus" size="14px" color="grey-6" />
                      <span>{{ getVehiculo(viaje.vehiculoId)?.placa || 'Bus' }}</span>
                    </div>
                    <div class="row items-center q-gutter-x-xs">
                      <q-badge color="grey-2" text-color="positive" class="text-weight-bold">
                        {{ getDisponibles(viaje) }} disponibles
                      </q-badge>
                    </div>
                  </div>

                  <!-- Botón Directo en la Tarjeta si está Seleccionada -->
                  <div v-if="viajeSeleccionado?.id === viaje.id" class="q-mt-sm">
                    <q-btn
                      color="primary"
                      class="full-width text-weight-bold"
                      unelevated
                      size="sm"
                      icon-right="arrow_forward"
                      label="Continuar con este viaje"
                      @click.stop="paso = 2"
                      no-caps
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- BARRA FLOTANTE STICKY PARA CONTINUAR SIN HACER SCROLL -->
          <div v-if="viajeSeleccionado" class="trip-selection-action-bar row items-center justify-between q-mt-lg">
            <div class="row items-center q-gutter-x-sm">
              <q-badge color="primary" class="font-mono text-weight-bold text-caption q-pa-xs">{{ viajeSeleccionado.codigo }}</q-badge>
              <div>
                <strong style="color: var(--vb-text-primary);">{{ viajeSeleccionado.origen }} → {{ viajeSeleccionado.destino }}</strong>
                <span class="text-caption q-ml-xs" style="color: var(--vb-text-secondary);">
                  {{ viajeSeleccionado.fecha }} • {{ viajeSeleccionado.hora }} (${{ viajeSeleccionado.precio?.toLocaleString('es-CO') }})
                </span>
              </div>
            </div>
            <q-btn
              color="primary"
              label="Continuar a Cliente"
              icon-right="arrow_forward"
              @click="paso = 2"
              no-caps
              unelevated
              class="q-px-lg text-weight-bold shadow-1"
            />
          </div>
        </q-step>

        <!-- PASO 2: SELECCIONAR CLIENTE -->
        <q-step
          :name="2"
          title="Cliente"
          icon="person"
          :done="paso > 2"
          :disable="!viajeSeleccionado"
          class="q-pa-lg"
        >
          <div style="max-width: 680px;" class="q-mx-auto">
            <!-- Banner Resumen del Viaje Escogido (con Distancia y Duración) -->
            <div v-if="viajeSeleccionado" class="selected-trip-banner row items-center justify-between q-pa-sm q-mb-lg">
              <div class="row items-center q-gutter-x-sm">
                <div class="banner-icon-box">
                  <q-icon name="route" size="16px" color="white" />
                </div>
                <div>
                  <div class="text-weight-bold text-dark text-body2">
                    {{ viajeSeleccionado.origen }} <q-icon name="arrow_forward" size="12px" color="primary" /> {{ viajeSeleccionado.destino }}
                  </div>
                  <div class="text-caption text-grey-6 row items-center q-gutter-x-xs">
                    <span>{{ viajeSeleccionado.fecha }} • {{ viajeSeleccionado.hora }}</span>
                    <span>•</span>
                    <span class="text-primary text-weight-medium">
                      {{ getRutaInfo(viajeSeleccionado).duracionTexto }} ({{ getRutaInfo(viajeSeleccionado).distanciaTexto }})
                    </span>
                    <span>•</span>
                    <span>Bus: {{ vehiculoDelViaje?.placa || 'Asignado' }}</span>
                    <span>•</span>
                    <span class="text-weight-bold text-grey-8">{{ getEmpresa(viajeSeleccionado) }}</span>
                  </div>
                </div>
              </div>
              <div class="row items-center q-gutter-x-sm">
                <span class="text-weight-bold text-primary">${{ viajeSeleccionado.precio?.toLocaleString('es-CO') }}</span>
                <q-btn flat dense size="sm" color="grey-7" label="Cambiar" @click="paso = 1" no-caps />
              </div>
            </div>

            <div class="text-subtitle1 text-weight-bold text-dark q-mb-xs">
              2. Identificación del Pasajero
            </div>
            <div class="text-caption text-grey-6 q-mb-md">
              Busque al pasajero por documento de identidad o elíjalo del listado
            </div>

            <!-- Búsqueda por documento -->
            <div class="row q-col-gutter-sm items-center q-mb-md">
              <div class="col-8">
                <q-input
                  outlined
                  dense
                  v-model="docBusqueda"
                  placeholder="Ingrese número de documento..."
                  label="Documento del pasajero"
                  @keyup.enter="buscarCliente"
                >
                  <template v-slot:prepend>
                    <q-icon name="badge" color="primary" />
                  </template>
                </q-input>
              </div>
              <div class="col-4">
                <q-btn
                  outline
                  color="primary"
                  icon="search"
                  label="Buscar"
                  class="full-width"
                  @click="buscarCliente"
                  no-caps
                />
              </div>
            </div>

            <!-- Resultado de búsqueda directa -->
            <div v-if="clienteBuscado !== undefined" class="q-mb-md">
              <div v-if="clienteBuscado === null" class="warning-alert-box row items-center justify-between q-pa-sm">
                <div class="row items-center q-gutter-x-sm">
                  <q-icon name="info" color="warning" size="20px" />
                  <span class="text-caption" style="color: var(--vb-text-primary);">Pasajero no registrado en el sistema.</span>
                </div>
                <q-btn flat dense color="primary" label="+ Registrar Cliente" to="/clientes/registrar" no-caps class="text-weight-bold" />
              </div>

              <div v-else class="client-result-card row items-center justify-between q-pa-md">
                <div>
                  <div class="text-weight-bold" style="color: var(--vb-text-primary);">{{ clienteBuscado.nombre }}</div>
                  <div class="text-caption" style="color: var(--vb-text-secondary);">
                    {{ clienteBuscado.tipoDoc }}: {{ clienteBuscado.documento }} • Tel: {{ clienteBuscado.telefono }}
                  </div>
                </div>
                <q-btn color="positive" icon="check" label="Seleccionar" @click="seleccionarCliente(clienteBuscado)" size="sm" no-caps unelevated />
              </div>
            </div>

            <div class="text-caption q-my-md text-center" style="color: var(--vb-text-muted);">— o seleccione directamente del registro —</div>

            <q-select
              outlined
              dense
              v-model="clienteIdSeleccionado"
              :options="opcionesClientes"
              emit-value
              map-options
              label="Seleccionar de la lista de clientes registrados"
              @update:model-value="onClienteSelectChange"
            />

            <!-- Confirmación visual de cliente seleccionado -->
            <div v-if="clienteSeleccionado" class="selected-client-box q-mt-md row items-center justify-between q-pa-sm">
              <div class="row items-center q-gutter-x-sm">
                <q-icon name="check_circle" color="positive" size="20px" />
                <div>
                  <span class="text-caption text-grey-6">Pasajero asignado:</span>
                  <div class="text-weight-bold text-dark">
                    {{ clienteSeleccionado.nombre }} ({{ clienteSeleccionado.tipoDoc }}: {{ clienteSeleccionado.documento }})
                  </div>
                </div>
              </div>
              <q-btn flat dense size="sm" color="grey-7" icon="close" @click="deseleccionarCliente" no-caps />
            </div>
          </div>

          <div class="row justify-between q-mt-xl">
            <q-btn flat color="grey-8" label="Atrás" @click="paso = 1" no-caps />
            <q-btn
              color="primary"
              label="Continuar a Puesto"
              icon-right="arrow_forward"
              :disabled="!clienteSeleccionado"
              @click="paso = 3"
              no-caps
              unelevated
              class="q-px-lg text-weight-bold"
            />
          </div>
        </q-step>

        <!-- PASO 3: SELECCIONAR PUESTO -->
        <q-step
          :name="3"
          title="Puesto"
          icon="event_seat"
          :done="paso > 3"
          :disable="!viajeSeleccionado || !clienteSeleccionado"
          class="q-pa-lg"
        >
          <div class="row items-center justify-between q-mb-md">
            <div>
              <div class="text-subtitle1 text-weight-bold text-dark">
                3. Selección de Puesto en el Vehículo
              </div>
              <div class="text-caption text-grey-6">
                Haga clic en un asiento disponible (verde) del mapa interactivo
              </div>
            </div>
            <div v-if="puestoSeleccionado" class="selected-indicator-pill">
              <q-icon name="check_circle" color="positive" size="14px" class="q-mr-xs" />
              <span class="text-caption text-weight-bold">Asiento elegido: #{{ puestoSeleccionado.numero }}</span>
            </div>
          </div>

          <div class="row q-col-gutter-xl items-start justify-center">
            <!-- Mapa interactivo de asientos -->
            <div class="col-12 col-md-6 text-center">
              <SeatMap
                :puestos="vehiculoDelViaje?.puestos || []"
                :capacidad="Number(vehiculoDelViaje?.capacidad || 20)"
                :puestosOcupados="puestosOcupados"
                :puestosPendientes="puestosPendientes"
                :puestoSeleccionado="puestoSeleccionado"
                :selectable="true"
                :conductor="vehiculoDelViaje?.conductor"
                @seleccionar="onSeleccionarPuesto"
              />
            </div>

            <!-- Resumen lateral del itinerario y puesto -->
            <div class="col-12 col-md-6">
              <div class="detail-summary-card">
                <div class="text-subtitle2 text-weight-bold text-dark q-mb-sm">Resumen de Selección</div>
                <q-separator class="q-mb-md" />

                <div class="column q-gutter-y-sm text-body2">
                  <div class="row justify-between">
                    <span class="text-grey-6">Ruta:</span>
                    <strong class="text-dark">{{ viajeSeleccionado?.origen }} → {{ viajeSeleccionado?.destino }}</strong>
                  </div>
                  <div class="row justify-between">
                    <span class="text-grey-6">Trayecto estimado:</span>
                    <span class="text-primary text-weight-bold">
                      {{ getRutaInfo(viajeSeleccionado).duracionTexto }} ({{ getRutaInfo(viajeSeleccionado).distanciaTexto }})
                    </span>
                  </div>
                  <div class="row justify-between">
                    <span class="text-grey-6">Horario:</span>
                    <span>{{ viajeSeleccionado?.fecha }} ({{ viajeSeleccionado?.hora }})</span>
                  </div>
                  <div class="row justify-between">
                    <span class="text-grey-6">Vehículo:</span>
                    <span>{{ vehiculoDelViaje?.placa }} ({{ vehiculoDelViaje?.tipo }})</span>
                  </div>
                  <div class="row justify-between">
                    <span class="text-grey-6">Pasajero:</span>
                    <strong class="text-dark">{{ clienteSeleccionado?.nombre }}</strong>
                  </div>
                  <div class="row justify-between">
                    <span class="text-grey-6">Tarifa:</span>
                    <strong class="text-primary">${{ viajeSeleccionado?.precio?.toLocaleString('es-CO') }}</strong>
                  </div>
                </div>

                <q-separator class="q-my-md" />

                <div v-if="puestoSeleccionado">
                  <div class="seat-assigned-pill row items-center justify-between q-pa-sm q-mb-md">
                    <div class="row items-center q-gutter-x-xs">
                      <q-icon name="event_seat" color="primary" size="18px" />
                      <span class="text-weight-bold text-dark">Asiento seleccionado: #{{ puestoSeleccionado.numero }}</span>
                    </div>
                    <q-btn flat dense size="xs" color="negative" icon="close" label="Quitar" @click="puestoSeleccionado = null" no-caps />
                  </div>

                  <q-input
                    v-model="descripcionOpcional"
                    outlined
                    dense
                    type="textarea"
                    rows="2"
                    label="Nota u observación opcional"
                    placeholder="Ej. Pasajero con equipaje especial, asiento de pasillo..."
                  />
                </div>
                <div v-else class="empty-selection-hint q-pa-md text-center">
                  <q-icon name="touch_app" size="24px" color="grey-5" class="q-mb-xs block" />
                  <span class="text-caption text-grey-6">Haz clic sobre un asiento verde disponible en el mapa del bus para asignarlo.</span>
                </div>
              </div>
            </div>
          </div>

          <div class="row justify-between q-mt-xl">
            <q-btn flat color="grey-8" label="Atrás" @click="paso = 2" no-caps />
            <q-btn
              color="primary"
              label="Continuar a Confirmación"
              icon-right="arrow_forward"
              :disabled="!puestoSeleccionado"
              @click="paso = 4"
              no-caps
              unelevated
              class="q-px-lg text-weight-bold"
            />
          </div>
        </q-step>

        <!-- PASO 4: CONFIRMAR INFORMACIÓN -->
        <q-step
          :name="4"
          title="Confirmar"
          icon="check_circle"
          :done="paso > 4"
          :disable="!viajeSeleccionado || !clienteSeleccionado || !puestoSeleccionado"
          class="q-pa-lg"
        >
          <div style="max-width: 580px;" class="q-mx-auto">
            <div class="text-center q-mb-lg">
              <div class="text-h6 text-weight-bold text-dark">Resumen de Liquidación de Tiquete</div>
              <div class="text-caption text-grey-6">Verifique la información antes de emitir la venta</div>
            </div>

            <div class="invoice-summary-card q-pa-lg">
              <div class="row items-center justify-between q-mb-md">
                <span class="text-subtitle2 text-weight-bold text-dark">Detalle de la Operación</span>
                <q-badge color="grey-2" text-color="primary" class="text-weight-bold">
                  Liquidación VIABUS
                </q-badge>
              </div>

              <q-separator class="q-mb-md" />

              <div class="column q-gutter-y-sm text-body2">
                <div class="row justify-between">
                  <span class="text-grey-6">Ruta de viaje:</span>
                  <strong class="text-dark">{{ viajeSeleccionado?.origen }} → {{ viajeSeleccionado?.destino }}</strong>
                </div>
                <div class="row justify-between">
                  <span class="text-grey-6">Distancia y tiempo est.:</span>
                  <span class="text-primary text-weight-bold">
                    {{ getRutaInfo(viajeSeleccionado).duracionTexto }} • {{ getRutaInfo(viajeSeleccionado).distanciaTexto }}
                  </span>
                </div>
                <div class="row justify-between">
                  <span class="text-grey-6">Fecha y hora:</span>
                  <span class="text-dark">{{ viajeSeleccionado?.fecha }} a las {{ viajeSeleccionado?.hora }}</span>
                </div>
                <div class="row justify-between">
                  <span class="text-grey-6">Pasajero titular:</span>
                  <strong class="text-dark">{{ clienteSeleccionado?.nombre }}</strong>
                </div>
                <div class="row justify-between">
                  <span class="text-grey-6">Documento:</span>
                  <span class="font-mono text-grey-8">{{ clienteSeleccionado?.tipoDoc }}: {{ clienteSeleccionado?.documento }}</span>
                </div>
                <div class="row justify-between">
                  <span class="text-grey-6">Empresa operadora:</span>
                  <span class="text-weight-bold text-dark">{{ getEmpresa(viajeSeleccionado) }}</span>
                </div>
                <div class="row justify-between">
                  <span class="text-grey-6">Vehículo / Placa:</span>
                  <span>{{ vehiculoDelViaje?.tipo }} — {{ vehiculoDelViaje?.placa }}</span>
                </div>
                <div class="row justify-between items-center">
                  <span class="text-grey-6">Puesto asignado:</span>
                  <span class="seat-badge-confirm">Puesto #{{ puestoSeleccionado?.numero }}</span>
                </div>

                <div v-if="descripcionOpcional" class="q-mt-xs">
                  <span class="text-grey-6 block text-caption">Observación:</span>
                  <span class="text-grey-8 text-caption bg-grey-1 q-pa-xs rounded-borders block">{{ descripcionOpcional }}</span>
                </div>

                <q-separator class="q-my-md" />

                <!-- Total Destacado -->
                <div class="total-row row items-center justify-between q-py-sm">
                  <div>
                    <span class="text-subtitle1 text-weight-bold text-dark">Total a Cobrar:</span>
                    <div class="text-caption text-grey-6">Tarifa de tiquete único</div>
                  </div>
                  <div class="text-h4 text-weight-bold text-primary">
                    ${{ viajeSeleccionado?.precio?.toLocaleString('es-CO') }}
                  </div>
                </div>
              </div>

              <div v-if="errorVenta" class="q-mt-md">
                <q-banner class="bg-red-1 text-negative rounded-borders" rounded>
                  {{ errorVenta }}
                </q-banner>
              </div>
            </div>
          </div>

          <div class="row items-center justify-between q-mt-xl q-gutter-sm">
            <q-btn flat color="grey-8" label="Atrás" @click="paso = 3" no-caps />
            <div class="row q-gutter-sm">
              <!-- Botón Reservar / Dejar en Pendiente -->
              <q-btn
                color="warning"
                text-color="dark"
                icon="hourglass_top"
                label="Dejar en Pendiente (Reserva)"
                @click="confirmarVenta('Pendiente')"
                no-caps
                unelevated
                class="text-weight-bold q-px-md"
              />
              <!-- Botón Pago Confirmado -->
              <q-btn
                color="positive"
                icon="payments"
                label="Confirmar y Emitir Tiquete"
                @click="confirmarVenta('Pagado')"
                no-caps
                unelevated
                class="q-px-xl text-weight-bold"
              />
            </div>
          </div>
        </q-step>

        <!-- PASO 5: TIQUETE EMITIDO / RESERVA REGISTRADA -->
        <q-step
          :name="5"
          :title="ventaCreada?.estado === 'Pendiente' ? 'Reserva' : 'Emitido'"
          :icon="ventaCreada?.estado === 'Pendiente' ? 'hourglass_top' : 'receipt'"
          :disable="!ventaCreada"
          class="q-pa-xl text-center"
        >
          <div style="max-width: 540px; margin: 0 auto;">
            <div v-if="ventaCreada?.estado === 'Pendiente'" class="success-icon-badge bg-amber-1 q-mb-md">
              <q-icon name="hourglass_top" size="44px" color="warning" />
            </div>
            <div v-else class="success-icon-badge q-mb-md">
              <q-icon name="verified" size="44px" color="positive" />
            </div>

            <div v-if="ventaCreada?.estado === 'Pendiente'">
              <div class="text-h5 text-weight-bold text-dark q-mb-xs">¡Puesto Reservado en Estado Pendiente!</div>
              <div class="text-body2 text-grey-7 q-mb-lg">
                El puesto <strong class="text-primary">#{{ ventaCreada?.puestoId }}</strong> ha sido reservado como <strong>Pendiente</strong>. Queda bloqueado en color amarillo en el mapa hasta que se confirme el pago. Código de reserva:
                <strong class="text-dark font-mono block q-mt-xs">{{ ventaCreada?.id }}</strong>
              </div>
            </div>
            <div v-else>
              <div class="text-h5 text-weight-bold text-dark q-mb-xs">¡Venta y Tiquete Confirmados con Éxito!</div>
              <div class="text-body2 text-grey-7 q-mb-lg">
                El tiquete ha sido emitido y el asiento registrado como Pagado. Código:
                <strong class="text-dark font-mono block q-mt-xs">{{ ventaCreada?.id }}</strong>
              </div>
            </div>

            <div class="row q-gutter-md justify-center">
              <q-btn
                color="primary"
                icon="description"
                label="Ver e Imprimir Comprobante"
                :to="`/tickets/${ventaCreada?.id}`"
                no-caps
                unelevated
                class="q-px-md text-weight-bold"
              />
              <q-btn
                outline
                color="grey-8"
                icon="add_shopping_cart"
                label="Realizar Otra Operación"
                @click="reiniciar"
                no-caps
              />
              <q-btn
                flat
                color="grey-7"
                label="Ir a Listado de Ventas"
                to="/ventas"
                no-caps
              />
            </div>
          </div>
        </q-step>
      </q-stepper>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useViajeStore } from '../stores/viajeStore'
import { useVehiculoStore } from '../stores/vehiculoStore'
import { useClienteStore } from '../stores/clienteStore'
import { useVentaStore } from '../stores/ventaStore'
import SeatMap from '../components/SeatMap.vue'
import { estimarRutaViaje } from '../utils/distanceCalculator'

const route = useRoute()

const viajeStore = useViajeStore()
const vehiculoStore = useVehiculoStore()
const clienteStore = useClienteStore()
const ventaStore = useVentaStore()

const paso = ref(1)
const viajeSeleccionado = ref(null)
const clienteSeleccionado = ref(null)
const puestoSeleccionado = ref(null)
const ventaCreada = ref(null)

const busquedaViaje = ref('')
const filtroOrigen = ref('Todos los orígenes')
const filtroDestino = ref('Todos los destinos')
const filtroEmpresa = ref('Todas las empresas')
const filtroHorario = ref('Cualquier horario')
const ordenSeleccionado = ref('Por defecto')

const docBusqueda = ref('')
const clienteBuscado = ref(undefined)
const clienteIdSeleccionado = ref(null)
const descripcionOpcional = ref('')
const errorVenta = ref('')

function cambiarPaso(nuevoPaso) {
  if (nuevoPaso === 2 && !viajeSeleccionado.value) return
  if (nuevoPaso === 3 && (!viajeSeleccionado.value || !clienteSeleccionado.value)) return
  if (nuevoPaso === 4 && (!viajeSeleccionado.value || !clienteSeleccionado.value || !puestoSeleccionado.value)) return
  if (nuevoPaso === 5 && !ventaCreada.value) return
  paso.value = nuevoPaso
}

const clientes = computed(() => clienteStore.clientes)
const opcionesClientes = computed(() =>
  clientes.value.map(c => ({
    label: `${c.nombre} – ${c.tipoDoc}: ${c.documento}`,
    value: c.id
  }))
)

const viajesDisponibles = computed(() =>
  viajeStore.viajes.filter(v => v.estado !== 'Cancelado' && v.estado !== 'Finalizado' && v.estado !== 'Completo')
)

function getEmpresa(viaje) {
  if (!viaje) return 'VIABUS Express'
  const vId = viaje.vehiculoId || (viaje.bus?._id || viaje.bus)
  const veh = getVehiculo(vId)
  return veh?.empresa || veh?.company || 'VIABUS Express'
}

// Opciones dinámicas de empresas para el filtro
const empresasDisponibles = computed(() => {
  const set = new Set()
  viajesDisponibles.value.forEach(v => {
    set.add(getEmpresa(v))
  })
  vehiculoStore.vehiculos.forEach(v => {
    if (v.empresa) set.add(v.empresa)
  })
  const arr = Array.from(set).sort()
  return ['Todas las empresas', ...arr]
})

// Opciones dinámicas de orígenes para el filtro
const origenesDisponibles = computed(() => {
  const set = new Set()
  viajesDisponibles.value.forEach(v => {
    if (v.origen) set.add(v.origen)
  })
  const arr = Array.from(set).sort()
  return ['Todos los orígenes', ...arr]
})

// Opciones dinámicas de destinos para el filtro
const destinosDisponibles = computed(() => {
  const set = new Set()
  viajesDisponibles.value.forEach(v => {
    if (v.destino) set.add(v.destino)
  })
  const arr = Array.from(set).sort()
  return ['Todos los destinos', ...arr]
})

const mostrarFiltros = ref(false)

const filtrosAvanzadosActivosCount = computed(() => {
  let count = 0
  if (filtroOrigen.value !== 'Todos los orígenes') count++
  if (filtroDestino.value !== 'Todos los destinos') count++
  if (filtroEmpresa.value !== 'Todas las empresas') count++
  if (filtroHorario.value !== 'Cualquier horario') count++
  if (ordenSeleccionado.value !== 'Por defecto') count++
  return count
})

// Indicador si hay algún filtro activo
const filtrosActivos = computed(() => {
  return (
    Boolean(busquedaViaje.value) ||
    filtrosAvanzadosActivosCount.value > 0
  )
})

// Filtrado de viajes por origen, destino, empresa, franja horaria y texto libre
const viajesFiltrados = computed(() => {
  let lista = viajesDisponibles.value.filter(v => {
    // 1. Filtro por Ciudad de Origen
    if (filtroOrigen.value !== 'Todos los orígenes') {
      if (v.origen !== filtroOrigen.value) return false
    }

    // 2. Filtro por Ciudad de Destino
    if (filtroDestino.value !== 'Todos los destinos') {
      if (v.destino !== filtroDestino.value) return false
    }

    // 3. Filtro por Empresa
    if (filtroEmpresa.value !== 'Todas las empresas') {
      if (getEmpresa(v) !== filtroEmpresa.value) return false
    }

    // 4. Filtro por Franja Horaria de Salida
    if (filtroHorario.value !== 'Cualquier horario' && v.hora) {
      const horaNum = parseInt(v.hora.split(':')[0], 10)
      if (!isNaN(horaNum)) {
        if (filtroHorario.value === 'Mañana (05:00 - 11:59)' && (horaNum < 5 || horaNum >= 12)) return false
        if (filtroHorario.value === 'Tarde (12:00 - 17:59)' && (horaNum < 12 || horaNum >= 18)) return false
        if (filtroHorario.value === 'Noche (18:00 - 23:59)' && (horaNum < 18 && horaNum >= 5)) return false
      }
    }

    // 5. Búsqueda de texto libre (busca en empresa, destino, origen, fecha, hora, código, placa o conductor)
    if (!busquedaViaje.value) return true
    const term = busquedaViaje.value.toLowerCase().trim()
    const veh = getVehiculo(v.vehiculoId)
    const placa = veh?.placa?.toLowerCase() || ''
    const conductor = veh?.conductor?.toLowerCase() || ''
    const empresa = getEmpresa(v).toLowerCase()

    return (
      (v.codigo && v.codigo.toLowerCase().includes(term)) ||
      (v.origen && v.origen.toLowerCase().includes(term)) ||
      (v.destino && v.destino.toLowerCase().includes(term)) ||
      (v.fecha && v.fecha.toLowerCase().includes(term)) ||
      (v.hora && v.hora.toLowerCase().includes(term)) ||
      empresa.includes(term) ||
      placa.includes(term) ||
      conductor.includes(term)
    )
  })

  // 6. Ordenamiento seleccionado
  if (ordenSeleccionado.value === 'Hora: Más temprano') {
    lista = [...lista].sort((a, b) => (a.hora || '').localeCompare(b.hora || ''))
  } else if (ordenSeleccionado.value === 'Hora: Más tarde') {
    lista = [...lista].sort((a, b) => (b.hora || '').localeCompare(a.hora || ''))
  } else if (ordenSeleccionado.value === 'Precio: Menor a mayor') {
    lista = [...lista].sort((a, b) => Number(a.precio) - Number(b.precio))
  } else if (ordenSeleccionado.value === 'Precio: Mayor a menor') {
    lista = [...lista].sort((a, b) => Number(b.precio) - Number(a.precio))
  }

  return lista
})

function limpiarBusqueda() {
  busquedaViaje.value = ''
  filtroOrigen.value = 'Todos los orígenes'
  filtroDestino.value = 'Todos los destinos'
  filtroEmpresa.value = 'Todas las empresas'
  filtroHorario.value = 'Cualquier horario'
  ordenSeleccionado.value = 'Por defecto'
}

// Obtener estimación de distancia y duración en bus (tipo Google Maps)
function getRutaInfo(viaje) {
  if (!viaje) {
    return { distanciaKm: 0, distanciaTexto: '—', duracionTexto: '—', duracionMinutos: 0 }
  }
  return estimarRutaViaje(viaje.origen, viaje.destino)
}

const vehiculoDelViaje = computed(() => {
  if (!viajeSeleccionado.value) return null
  const vId = viajeSeleccionado.value.vehiculoId || (viajeSeleccionado.value.bus ? (viajeSeleccionado.value.bus._id || viajeSeleccionado.value.bus) : null)
  let veh = vId ? vehiculoStore.obtenerVehiculo(vId) : null
  if (!veh && viajeSeleccionado.value.bus && typeof viajeSeleccionado.value.bus === 'object') {
    veh = viajeSeleccionado.value.bus
  }
  if (!veh && vehiculoStore.vehiculos.length > 0) {
    veh = vehiculoStore.vehiculos[0]
  }
  return veh
})

const puestosOcupados = computed(() =>
  viajeSeleccionado.value ? ventaStore.puestosOcupadosPorViaje(viajeSeleccionado.value.id || viajeSeleccionado.value._id) : []
)

const puestosPendientes = computed(() =>
  viajeSeleccionado.value ? ventaStore.puestosPendientesPorViaje(viajeSeleccionado.value.id || viajeSeleccionado.value._id) : []
)

function getVehiculo(id) {
  return vehiculoStore.obtenerVehiculo(id)
}

function getOcupados(viaje) {
  return ventaStore.puestosOcupadosPorViaje(viaje.id).length
}

function getDisponibles(viaje) {
  const v = getVehiculo(viaje.vehiculoId)
  return v ? v.capacidad - getOcupados(viaje) : 0
}

function seleccionarViaje(viaje) {
  viajeSeleccionado.value = viaje
  puestoSeleccionado.value = null
}

function buscarCliente() {
  const doc = docBusqueda.value?.trim()
  if (!doc) {
    clienteBuscado.value = undefined
    return
  }
  clienteBuscado.value = clienteStore.buscarClientePorDocumento(doc) || null
}

function seleccionarCliente(c) {
  clienteSeleccionado.value = c
  clienteIdSeleccionado.value = c.id
  clienteBuscado.value = undefined
  docBusqueda.value = ''
}

function deseleccionarCliente() {
  clienteSeleccionado.value = null
  clienteIdSeleccionado.value = null
}

function onClienteSelectChange(id) {
  if (!id) return
  clienteSeleccionado.value = clienteStore.obtenerCliente(id)
}

function onSeleccionarPuesto(puesto) {
  puestoSeleccionado.value = puesto
}

async function confirmarVenta(estado = 'Pagado') {
  errorVenta.value = ''
  try {
    const nueva = await ventaStore.crearVenta({
      viajeId: viajeSeleccionado.value.id || viajeSeleccionado.value._id,
      clienteId: clienteSeleccionado.value.id || clienteSeleccionado.value._id,
      puestoId: puestoSeleccionado.value.numero,
      precio: viajeSeleccionado.value.precio,
      descripcion: descripcionOpcional.value,
      estado
    })
    ventaCreada.value = nueva
    paso.value = 5
  } catch (e) {
    errorVenta.value = e.message
  }
}

function reiniciar() {
  paso.value = 1
  viajeSeleccionado.value = null
  clienteSeleccionado.value = null
  puestoSeleccionado.value = null
  ventaCreada.value = null
  busquedaViaje.value = ''
  filtroEmpresa.value = 'Todas las empresas'
  filtroDestino.value = 'Todos los destinos'
  filtroHorario.value = 'Cualquier horario'
  ordenSeleccionado.value = 'Por defecto'
  docBusqueda.value = ''
  clienteBuscado.value = undefined
  clienteIdSeleccionado.value = null
  descripcionOpcional.value = ''
  errorVenta.value = ''
}

function verificarViajeDesdeRuta() {
  const vId = route.query.viajeId
  if (vId && viajeStore.viajes.length > 0) {
    const vEncontrado = viajeStore.viajes.find(v => String(v.id) === String(vId) || String(v._id) === String(vId))
    if (vEncontrado) {
      seleccionarViaje(vEncontrado)
      if (paso.value === 1) {
        paso.value = 2
      }
    }
  }
}

onMounted(async () => {
  await Promise.allSettled([
    viajeStore.cargarViajes(),
    vehiculoStore.cargarVehiculos(),
    clienteStore.cargarClientes(),
    ventaStore.cargarVentas()
  ])
  verificarViajeDesdeRuta()
})

watch(() => route.query.viajeId, () => {
  verificarViajeDesdeRuta()
})

watch(() => viajeStore.viajes, () => {
  if (route.query.viajeId && !viajeSeleccionado.value) {
    verificarViajeDesdeRuta()
  }
})
</script>

<style scoped>
.trip-select-card {
  background: var(--vb-bg-surface);
  border: 1px solid var(--vb-border);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.trip-select-card:hover {
  border-color: var(--vb-primary);
  transform: translateY(-2px);
  box-shadow: var(--vb-shadow-md);
}

.trip-select-active {
  border: 2px solid var(--vb-primary) !important;
  background-color: var(--vb-primary-soft) !important;
}

.trip-code-pill {
  font-family: monospace;
  font-size: 11px;
  font-weight: 700;
  background: var(--vb-bg-main);
  color: var(--vb-text-primary);
  border: 1px solid var(--vb-border);
  padding: 2px 6px;
  border-radius: 4px;
}

.route-metrics-bar {
  background: var(--vb-bg-main);
  border: 1px solid var(--vb-border-light);
}

.pt-top-border {
  border-top: 1px solid var(--vb-border-light);
  padding-top: 8px;
}

.selected-indicator-pill {
  background: var(--vb-pine-soft);
  color: var(--vb-pine);
  border: 1px solid var(--vb-border);
  padding: 4px 10px;
  border-radius: 20px;
  display: flex;
  align-items: center;
}

.selected-trip-banner {
  background: var(--vb-bg-surface);
  border: 1px solid var(--vb-border);
  border-radius: 10px;
}

.banner-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--vb-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.warning-alert-box {
  background: var(--vb-warning-soft);
  border: 1px solid var(--vb-warning);
  border-radius: 8px;
}

.client-result-card {
  background: var(--vb-bg-surface);
  border: 1px solid var(--vb-border);
  border-radius: 8px;
}

.selected-client-box {
  background: var(--vb-pine-soft);
  border: 1px solid var(--vb-border);
  border-radius: 8px;
}

.detail-summary-card {
  background: var(--vb-bg-surface);
  border: 1px solid var(--vb-border);
  border-radius: 12px;
  padding: 20px;
}

.seat-assigned-pill {
  background: var(--vb-primary-soft);
  border: 1px solid var(--vb-border);
  border-radius: 8px;
}

.empty-selection-hint {
  background: var(--vb-bg-surface);
  border: 1px dashed var(--vb-border);
  border-radius: 8px;
}

.invoice-summary-card {
  background: var(--vb-bg-surface);
  border: 1px solid var(--vb-border);
  border-radius: 14px;
  box-shadow: var(--vb-shadow-md);
}

.seat-badge-confirm {
  background: #FEF3C7;
  color: #92400E;
  border: 1px solid #FDE68A;
  font-weight: 700;
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 6px;
}

.total-row {
  border-top: 1px solid #E4E4E7;
  border-bottom: 1px solid #E4E4E7;
}

.success-icon-badge {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: #ECFDF5;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.font-mono {
  font-family: monospace;
}
</style>
