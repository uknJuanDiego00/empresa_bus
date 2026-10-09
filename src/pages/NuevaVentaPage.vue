<template>
  <q-page class="q-pa-md">
    <div class="q-mx-auto" style="max-width: 1350px;">
      <!-- CABECERA -->
      <div class="row items-center justify-between q-mb-md">
        <div>
          <div class="text-h5 text-weight-bold text-dark q-mb-xs">Nueva Venta de Tiquete</div>
          <div class="text-caption text-grey-7">Flujo guiado para emisión y liquidación de tiquetes</div>
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
        class="vb-card overflow-hidden shadow-1"
      >
        <!-- PASO 1: SELECCIONAR VIAJE -->
        <q-step
          :name="1"
          title="Viaje"
          icon="route"
          :done="paso > 1"
          class="q-pa-md"
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
                  {{ viajesFiltrados().length }} rutas disponibles
                </span>
                <q-btn
                  v-if="filtrosActivos()"
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
                    :color="mostrarFiltros || filtrosAvanzadosActivosCount() > 0 ? 'primary' : 'grey-7'"
                    @click="mostrarFiltros = !mostrarFiltros"
                    class="q-mr-xs"
                  >
                    <q-badge v-if="filtrosAvanzadosActivosCount() > 0" color="primary" floating rounded>
                      {{ filtrosAvanzadosActivosCount() }}
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
                      :options="origenesDisponibles()"
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
                      :options="destinosDisponibles()"
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
                      :options="empresasDisponibles()"
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
          <div v-if="viajesFiltrados().length === 0" class="empty-state-box q-my-md">
            <div class="empty-state-icon">
              <q-icon name="route" size="28px" />
            </div>
            <div class="empty-state-title">No se encontraron viajes disponibles</div>
            <div class="empty-state-desc" v-if="busquedaViaje || filtrosActivos()">
              No hay viajes que coincidan con los filtros aplicados.
            </div>
            <div class="empty-state-desc" v-else>
              Todos los viajes están completos o finalizados. Programe un nuevo viaje para continuar.
            </div>
            <div class="row q-gutter-sm justify-center q-mt-sm">
              <q-btn
                v-if="busquedaViaje || filtrosActivos()"
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
              v-for="viaje in viajesFiltrados()"
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

                  <!-- Paradas intermedias de la ruta si las tiene -->
                  <div v-if="viaje.paradasIntermedias && viaje.paradasIntermedias.length > 0" class="text-caption text-grey-7 q-mb-xs">
                    <q-icon name="alt_route" size="13px" color="primary" class="q-mr-xs" />
                    <span>Vía: {{ viaje.paradasIntermedias.join(' • ') }}</span>
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
                      label="Configurar Paradas y Continuar"
                      @click.stop="cambiarPaso(2)"
                      no-caps
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- CONFIGURACIÓN DE PARADAS Y TRAYECTO DE LA RUTA -->
          <div v-if="viajeSeleccionado" class="q-mt-lg">
            <q-card flat bordered class="vb-card shadow-1 rounded-borders q-pa-md">
              <div class="row items-center justify-between q-mb-sm">
                <div class="row items-center q-gutter-x-sm">
                  <q-icon name="alt_route" size="22px" color="primary" />
                  <div>
                    <div class="text-subtitle2 text-weight-bold" style="color: var(--vb-text-primary);">
                      Ruta Autorizada y Selección de Paradas del Pasajero
                    </div>
                    <div class="text-caption" style="color: var(--vb-text-secondary);">
                      Bus {{ vehiculoDelViaje()?.placa || 'Asignado' }} • Código: {{ viajeSeleccionado.codigo }}
                    </div>
                  </div>
                </div>
                <q-badge v-if="precioTrayecto" color="primary" class="text-caption text-weight-bold q-px-sm">
                  Tarifa trayecto: ${{ Number(precioTrayecto).toLocaleString('es-CO') }}
                </q-badge>
              </div>

              <!-- Secuencia Ordenada de la Ruta del Bus: Origen -> Paradas -> Destino -->
              <div class="bg-blue-1 text-primary q-pa-sm rounded-borders q-my-sm">
                <div class="text-caption text-weight-bold q-mb-xs text-grey-8">
                  Itinerario oficial del bus (Ruta Autorizada):
                </div>
                <div class="row items-center q-gutter-xs flex-wrap">
                  <q-badge color="primary" text-color="white" class="text-weight-bold">
                    <q-icon name="trip_origin" size="12px" class="q-mr-xs" />
                    {{ viajeSeleccionado.origen }}
                  </q-badge>
                  <template v-for="(parada, pIdx) in viajeSeleccionado.paradasIntermedias || []" :key="pIdx">
                    <q-icon name="arrow_forward" size="14px" color="grey-6" />
                    <q-badge color="amber-8" text-color="white" class="text-weight-bold">
                      <q-icon name="place" size="12px" class="q-mr-xs" />
                      {{ parada }}
                    </q-badge>
                  </template>
                  <q-icon name="arrow_forward" size="14px" color="grey-6" />
                  <q-badge color="positive" text-color="white" class="text-weight-bold">
                    <q-icon name="flag" size="12px" class="q-mr-xs" />
                    {{ viajeSeleccionado.destino }}
                  </q-badge>
                </div>
              </div>

              <!-- Selección de subida y destino del pasajero (solo paradas autorizadas) -->
              <div class="row q-col-gutter-md q-mt-xs">
                <div class="col-12 col-sm-6">
                  <q-select
                    outlined dense
                    v-model="paradaSubida"
                    :options="obtenerOpcionesSubida()"
                    label="Lugar de Subida (Embarque) *"
                    @update:model-value="onParadaSubidaChange"
                  >
                    <template v-slot:prepend>
                      <q-icon name="login" size="18px" color="primary" />
                    </template>
                  </q-select>
                </div>
                <div class="col-12 col-sm-6">
                  <q-select
                    outlined dense
                    v-model="paradaBajada"
                    :options="obtenerOpcionesBajada()"
                    label="Lugar de Bajada (Destino del Pasajero) *"
                    @update:model-value="onParadaBajadaChange"
                  >
                    <template v-slot:prepend>
                      <q-icon name="logout" size="18px" color="positive" />
                    </template>
                  </q-select>
                </div>
              </div>

              <!-- Alerta de Tarifa o Distancia del Tramo Seleccionado -->
              <div v-if="errorTarifa" class="q-mt-sm">
                <q-banner dense rounded class="bg-red-1 text-negative">
                  <template v-slot:avatar><q-icon name="warning" /></template>
                  {{ errorTarifa }}
                </q-banner>
              </div>
              <div v-else-if="infoTramo" class="q-mt-sm bg-grey-1 q-pa-sm rounded-borders row items-center justify-between text-caption">
                <div class="row items-center q-gutter-x-sm">
                  <span class="text-grey-7">Trayecto seleccionado:</span>
                  <strong>{{ paradaSubida }} → {{ paradaBajada }}</strong>
                  <span class="text-primary text-weight-bold">({{ infoTramo.distanciaTexto }} • {{ infoTramo.duracionTexto }})</span>
                </div>
                <div class="row items-center q-gutter-x-sm">
                  <span class="text-grey-7">Precio por tiquete:</span>
                  <strong class="text-subtitle1 text-positive">${{ Number(precioTrayecto || 0).toLocaleString('es-CO') }}</strong>
                </div>
              </div>
            </q-card>
          </div>

          <!-- BARRA FLOTANTE STICKY PARA CONTINUAR SIN HACER SCROLL -->
          <div v-if="viajeSeleccionado" class="trip-selection-action-bar row items-center justify-between q-mt-lg">
            <div class="row items-center q-gutter-x-sm">
              <q-badge color="primary" class="font-mono text-weight-bold text-caption q-pa-xs">{{ viajeSeleccionado.codigo }}</q-badge>
              <div>
                <strong style="color: var(--vb-text-primary);">{{ paradaSubida || viajeSeleccionado.origen }} → {{ paradaBajada || viajeSeleccionado.destino }}</strong>
                <span class="text-caption q-ml-xs" style="color: var(--vb-text-secondary);">
                  {{ viajeSeleccionado.fecha }} • {{ viajeSeleccionado.hora }} (${{ Number(precioTrayecto || viajeSeleccionado.precio || 0).toLocaleString('es-CO') }})
                </span>
              </div>
            </div>
            <q-btn
              color="primary"
              label="Continuar a Cliente"
              icon-right="arrow_forward"
              @click="cambiarPaso(2)"
              :disable="!!errorTarifa || !precioTrayecto"
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
                    Trayecto: {{ paradaSubida || viajeSeleccionado.origen }} <q-icon name="arrow_forward" size="12px" color="primary" /> {{ paradaBajada || viajeSeleccionado.destino }}
                    <span v-if="paradaSubida !== viajeSeleccionado.origen || paradaBajada !== viajeSeleccionado.destino" class="text-caption text-grey-7 font-normal q-ml-xs">
                      (Ruta bus: {{ viajeSeleccionado.origen }} → {{ viajeSeleccionado.destino }})
                    </span>
                  </div>
                  <div class="text-caption text-grey-6 row items-center q-gutter-x-xs">
                    <span>{{ viajeSeleccionado.fecha }} • {{ viajeSeleccionado.hora }}</span>
                    <span>•</span>
                    <span class="text-primary text-weight-medium">
                      {{ getRutaInfo(viajeSeleccionado).duracionTexto }} ({{ getRutaInfo(viajeSeleccionado).distanciaTexto }})
                    </span>
                    <span>•</span>
                    <span>Bus: {{ vehiculoDelViaje()?.placa || 'Asignado' }}</span>
                    <span>•</span>
                    <span class="text-weight-bold text-grey-8">{{ getEmpresa(viajeSeleccionado) }}</span>
                  </div>
                </div>
              </div>
              <div class="row items-center q-gutter-x-sm">
                <span class="text-weight-bold text-primary">${{ Number(precioTrayecto || viajeSeleccionado.precio || 0).toLocaleString('es-CO') }}</span>
                <q-btn flat dense size="sm" color="grey-7" label="Cambiar" @click="paso = 1" no-caps />
              </div>
            </div>

            <div class="row items-center justify-between q-mb-xs">
              <div class="text-subtitle1 text-weight-bold text-dark">
                2. Identificación del Pasajero
              </div>
              <q-btn
                outline
                dense
                color="primary"
                icon="person_add"
                label="+ Registrar Cliente"
                @click="abrirDialogoRegistro"
                no-caps
                class="q-px-sm"
              />
            </div>
            <div class="text-caption text-grey-6 q-mb-md">
              Busque al pasajero por documento de identidad, elíjalo del listado o regístrelo directamente
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
                <q-btn flat dense color="primary" label="+ Registrar Cliente" @click="abrirDialogoRegistro" no-caps class="text-weight-bold" />
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
              :options="opcionesClientes()"
              emit-value
              map-options
              label="Seleccionar de la lista de clientes() registrados"
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

        <!-- PASO 3: SELECCIONAR PUESTO(S) -->
        <q-step
          :name="3"
          title="Asientos"
          icon="event_seat"
          :done="paso > 3"
          :disable="!viajeSeleccionado || !clienteSeleccionado"
          class="q-pa-md"
        >
          <div class="row items-center justify-between q-mb-sm">
            <div>
              <div class="text-subtitle1 text-weight-bold text-dark">
                3. Selección de Asientos y Pasajeros
              </div>
              <div class="text-caption text-grey-6">
                Haga clic en uno o varios asientos disponibles (verde) del mapa
              </div>
            </div>
            <div v-if="asientosSeleccionados.length > 0" class="selected-indicator-pill">
              <q-icon name="check_circle" color="positive" size="14px" class="q-mr-xs" />
              <span class="text-caption text-weight-bold">{{ asientosSeleccionados.length }} asiento(s) seleccionado(s)</span>
            </div>
          </div>

          <div class="row q-col-gutter-md items-start justify-center">
            <!-- Mapa interactivo de asientos -->
            <div class="col-12 col-md-6 text-center">
              <SeatMap
                :puestos="vehiculoDelViaje()?.puestos || []"
                :capacidad="Number(vehiculoDelViaje()?.capacidad || 20)"
                :puestosOcupados="puestosOcupados()"
                :puestosPendientes="puestosPendientes()"
                :puestosSeleccionados="asientosSeleccionados"
                :puestoSeleccionado="puestoSeleccionado"
                :selectable="true"
                :conductor="vehiculoDelViaje()?.conductor"
                @seleccionar="onSeleccionarPuesto"
              />
            </div>

            <!-- Resumen lateral del itinerario, puestos y asignación -->
            <div class="col-12 col-md-6">
              <div class="detail-summary-card q-pa-md">
                <div class="row items-center justify-between q-mb-xs">
                  <div class="text-subtitle2 text-weight-bold text-dark">Resumen del Viaje & Tarifa</div>
                  <q-badge color="primary" class="text-weight-bold">
                    {{ asientosSeleccionados.length }} asiento(s)
                  </q-badge>
                </div>
                <q-separator class="q-mb-sm" />

                <div class="column q-gutter-y-xs text-caption q-mb-sm">
                  <div class="row justify-between">
                    <span class="text-grey-6">Ruta oficial del bus:</span>
                    <strong class="text-dark">{{ viajeSeleccionado?.origen }} → {{ viajeSeleccionado?.destino }}</strong>
                  </div>
                  <div v-if="paradaSubida || paradaBajada" class="row justify-between">
                    <span class="text-grey-6">Trayecto pasajero:</span>
                    <strong class="text-positive">{{ paradaSubida || viajeSeleccionado?.origen }} → {{ paradaBajada || viajeSeleccionado?.destino }}</strong>
                  </div>
                  <div class="row justify-between">
                    <span class="text-grey-6">Horario:</span>
                    <span>{{ viajeSeleccionado?.fecha }} a las {{ viajeSeleccionado?.hora }}</span>
                  </div>
                  <div class="row justify-between">
                    <span class="text-grey-6">Bus asignado:</span>
                    <span>{{ vehiculoDelViaje()?.placa }} ({{ vehiculoDelViaje()?.tipo }})</span>
                  </div>
                  <div class="row justify-between">
                    <span class="text-grey-6">Tarifa por asiento:</span>
                    <strong class="text-primary">${{ Number(precioTrayecto || viajeSeleccionado?.precio || 0).toLocaleString('es-CO') }}</strong>
                  </div>
                </div>

                <q-separator class="q-my-xs" />

                <!-- Lista de Asientos Seleccionados -->
                <div v-if="asientosSeleccionados.length > 0">
                  <div class="text-caption text-weight-bold text-dark q-mb-xs">
                    Pasajeros por Asiento:
                  </div>

                  <!-- Chips de asientos -->
                  <div class="row q-gutter-xs flex-wrap q-mb-sm">
                    <q-chip
                      v-for="a in asientosSeleccionados"
                      :key="a.numero"
                      dense
                      color="primary"
                      text-color="white"
                      removable
                      @remove="quitarAsiento(a)"
                    >
                      #{{ a.numero }}
                    </q-chip>
                  </div>

                  <!-- Asignación de datos -->
                  <div class="column q-gutter-y-xs q-mb-sm" style="max-height: 220px; overflow-y: auto;">
                    <div
                      v-for="(asiento, idx) in asientosSeleccionados"
                      :key="asiento.numero"
                      class="q-pa-xs bg-grey-1 rounded-borders"
                      style="border: 1px solid #e0e0e0;"
                    >
                      <div class="row items-center justify-between q-mb-xs">
                        <span class="text-weight-bold text-caption text-primary">Asiento #{{ asiento.numero }}</span>
                        <span v-if="idx === 0" class="text-caption text-grey-7">(Pasajero Titular)</span>
                        <q-btn
                          v-else
                          flat dense size="xs" color="grey-7"
                          label="Usar datos titular"
                          @click="copiarTitularAAsiento(asiento.numero)"
                          no-caps
                        />
                      </div>

                      <!-- Asiento 1: Titular -->
                      <div v-if="idx === 0" class="row items-center justify-between text-caption q-px-xs">
                        <span class="text-weight-bold">{{ clienteSeleccionado?.nombre }}</span>
                        <span class="text-grey-7">{{ clienteSeleccionado?.tipoDoc }}: {{ clienteSeleccionado?.documento }}</span>
                      </div>

                      <!-- Asientos adicionales (2 en adelante) -->
                      <div v-else class="row q-col-gutter-xs">
                        <div class="col-12 col-sm-6">
                          <q-input
                            v-model="pasajerosAsignados[asiento.numero].nombre"
                            outlined
                            dense
                            label="Nombre pasajero *"
                            placeholder="Nombre completo"
                          />
                        </div>
                        <div class="col-12 col-sm-6">
                          <q-input
                            v-model="pasajerosAsignados[asiento.numero].documento"
                            outlined
                            dense
                            label="Cédula / Documento *"
                            placeholder="Número documento"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <q-input
                    v-model="descripcionOpcional"
                    outlined
                    dense
                    type="textarea"
                    rows="2"
                    label="Nota u observación opcional"
                    placeholder="Ej. Pasajero con equipaje especial, menor de edad..."
                    class="q-mb-sm"
                  />

                  <!-- Subtotal / Total -->
                  <div class="bg-blue-1 text-primary q-pa-sm rounded-borders row items-center justify-between">
                    <div>
                      <div class="text-caption text-grey-8">{{ asientosSeleccionados.length }} tiquete(s) a ${{ viajeSeleccionado?.precio?.toLocaleString('es-CO') }}</div>
                      <div class="text-subtitle2 text-weight-bolder">Total Calculado:</div>
                    </div>
                    <div class="text-h6 text-weight-bolder">
                      ${{ calcularTotalVenta().toLocaleString('es-CO') }}
                    </div>
                  </div>
                </div>

                <div v-else class="empty-selection-hint q-pa-md text-center">
                  <q-icon name="touch_app" size="24px" color="grey-5" class="q-mb-xs block" />
                  <span class="text-caption text-grey-6">Haga clic sobre un asiento verde en el mapa para seleccionarlo.</span>
                </div>
              </div>
            </div>
          </div>

          <div class="row justify-between q-mt-md">
            <q-btn flat color="grey-8" label="Atrás" @click="paso = 2" no-caps />
            <q-btn
              color="primary"
              label="Continuar a Confirmación"
              icon-right="arrow_forward"
              :disabled="asientosSeleccionados.length === 0"
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
          :disable="!viajeSeleccionado || !clienteSeleccionado || asientosSeleccionados.length === 0"
          class="q-pa-md"
        >
          <div style="max-width: 680px;" class="q-mx-auto">
            <div class="text-center q-mb-md">
              <div class="text-h6 text-weight-bold text-dark">Resumen de Liquidación de Venta</div>
              <div class="text-caption text-grey-6">Verifique los detalles antes de emitir la venta</div>
            </div>

            <div class="invoice-summary-card q-pa-md">
              <div class="row items-center justify-between q-mb-sm">
                <span class="text-subtitle2 text-weight-bold text-dark">Detalle de la Operación</span>
                <q-badge color="grey-2" text-color="primary" class="text-weight-bold">
                  Liquidación VIABUS
                </q-badge>
              </div>

              <q-separator class="q-mb-md" />

              <div class="column q-gutter-y-sm text-body2">
                <div class="row justify-between">
                  <span class="text-grey-6">Ruta oficial del bus:</span>
                  <strong class="text-dark">{{ viajeSeleccionado?.origen }} → {{ viajeSeleccionado?.destino }}</strong>
                </div>
                <div v-if="paradaSubida || paradaBajada" class="row justify-between">
                  <span class="text-grey-6">Trayecto pasajero:</span>
                  <strong class="text-positive">{{ paradaSubida || viajeSeleccionado?.origen }} → {{ paradaBajada || viajeSeleccionado?.destino }}</strong>
                </div>
                <div class="row justify-between">
                  <span class="text-grey-6">Distancia y tiempo est.:</span>
                  <span class="text-primary text-weight-bold">
                    {{ infoTramo ? `${infoTramo.duracionTexto} • ${infoTramo.distanciaTexto}` : `${getRutaInfo(viajeSeleccionado).duracionTexto} • ${getRutaInfo(viajeSeleccionado).distanciaTexto}` }}
                  </span>
                </div>
                <div class="row justify-between">
                  <span class="text-grey-6">Fecha y hora:</span>
                  <span class="text-dark">{{ viajeSeleccionado?.fecha }} a las {{ viajeSeleccionado?.hora }}</span>
                </div>
                <div class="row justify-between">
                  <span class="text-grey-6">Empresa operadora:</span>
                  <span class="text-weight-bold text-dark">{{ getEmpresa(viajeSeleccionado) }}</span>
                </div>
                <div class="row justify-between">
                  <span class="text-grey-6">Vehículo / Placa:</span>
                  <span>{{ vehiculoDelViaje()?.tipo }} — {{ vehiculoDelViaje()?.placa }}</span>
                </div>

                <q-separator class="q-my-xs" />

                <!-- Lista de Asientos y Pasajeros -->
                <div>
                  <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">Tiquetes a emitir ({{ asientosSeleccionados.length }}):</div>
                  <div class="column q-gutter-y-xs">
                    <div
                      v-for="(asiento, idx) in asientosSeleccionados"
                      :key="asiento.numero"
                      class="row items-center justify-between q-pa-xs bg-grey-1 rounded-borders text-caption"
                    >
                      <div>
                        <q-badge color="primary" class="q-mr-xs">#{{ asiento.numero }}</q-badge>
                        <strong>{{ idx === 0 ? clienteSeleccionado?.nombre : (pasajerosAsignados[asiento.numero]?.nombre || '—') }}</strong>
                        <span class="text-grey-7 q-ml-xs">({{ idx === 0 ? clienteSeleccionado?.documento : (pasajerosAsignados[asiento.numero]?.documento || '—') }})</span>
                      </div>
                      <span class="text-weight-bold text-positive">
                        ${{ Number(precioTrayecto || viajeSeleccionado?.precio || 0).toLocaleString('es-CO') }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Método de Pago -->
                <div class="q-mt-sm">
                  <q-select
                    v-model="metodoPago"
                    :options="['Efectivo', 'Nequi', 'Daviplata', 'Tarjeta de Débito', 'Tarjeta de Crédito', 'Transferencia Bancaria']"
                    outlined
                    dense
                    label="Método de pago *"
                  >
                    <template v-slot:prepend>
                      <q-icon name="payments" color="primary" />
                    </template>
                  </q-select>
                </div>

                <div v-if="descripcionOpcional" class="q-mt-xs">
                  <span class="text-grey-6 block text-caption">Observación:</span>
                  <span class="text-grey-8 text-caption bg-grey-1 q-pa-xs rounded-borders block">{{ descripcionOpcional }}</span>
                </div>

                <q-separator class="q-my-sm" />

                <!-- Total Destacado -->
                <div class="total-row row items-center justify-between q-py-xs">
                  <div>
                    <span class="text-subtitle1 text-weight-bold text-dark">Total a Cobrar:</span>
                    <div class="text-caption text-grey-6">{{ asientosSeleccionados.length }} asiento(s) seleccionados</div>
                  </div>
                  <div class="text-h4 text-weight-bold text-primary">
                    ${{ calcularTotalVenta().toLocaleString('es-CO') }}
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

          <div class="row items-center justify-between q-mt-lg q-gutter-sm">
            <q-btn flat color="grey-8" label="Atrás" @click="paso = 3" no-caps />
            <div class="row q-gutter-sm">
              <q-btn
                color="positive"
                icon="payments"
                :loading="cargandoVenta"
                :disable="cargandoVenta"
                :label="`Confirmar y Emitir ${asientosSeleccionados.length > 1 ? (asientosSeleccionados.length + ' Tiquetes') : 'Tiquete'}`"
                @click="confirmarVenta('CONFIRMADO')"
                no-caps
                unelevated
                class="q-px-lg text-weight-bold"
              />
            </div>
          </div>
        </q-step>

        <!-- PASO 5: TIQUETE EMITIDO -->
        <q-step
          :name="5"
          title="Emitido"
          icon="receipt"
          :disable="!ventaCreada"
          class="q-pa-lg text-center"
        >
          <div style="max-width: 540px; margin: 0 auto;">
            <div class="success-icon-badge q-mb-md">
              <q-icon name="verified" size="44px" color="positive" />
            </div>
            <div>
              <div class="text-h5 text-weight-bold text-dark q-mb-xs">¡Venta y Tiquete(s) Confirmados con Éxito!</div>
              <div class="text-body2 text-grey-7 q-mb-lg">
                La venta ha sido registrada con estado <strong>CONFIRMADO</strong>.
                <div v-if="ventaCreada?.id" class="text-dark font-mono q-mt-xs">Código: <strong>{{ ventaCreada.id }}</strong></div>
              </div>
            </div>

            <div class="row q-gutter-md justify-center">
              <q-btn
                v-if="ventaCreada?.id"
                color="primary"
                icon="description"
                label="Ver e Imprimir Comprobante"
                :to="`/tickets/${ventaCreada.id}`"
                no-caps
                unelevated
                class="q-px-md text-weight-bold"
              />
              <q-btn
                outline
                color="primary"
                icon="add"
                label="Realizar Otra Venta"
                @click="reiniciar"
                no-caps
              />
              <q-btn
                flat
                color="grey-8"
                label="Ir a Ventas"
                to="/ventas"
                no-caps
              />
            </div>
          </div>
        </q-step>
      </q-stepper>
    </div>
  </q-page>

  <!-- DIÁLOGO: REGISTRAR NUEVO CLIENTE -->
  <q-dialog v-model="dialogRegistroCliente" persistent>
    <q-card style="min-width: 500px; max-width: 600px;">
      <q-card-section class="bg-primary text-white">
        <div class="row items-center no-wrap">
          <q-icon name="person_add" size="22px" class="q-mr-sm" />
          <div class="text-subtitle1 text-weight-bold">Registrar Nuevo Cliente</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup color="white" :disable="cargandoRegistro" />
        </div>
      </q-card-section>

      <q-card-section class="q-pa-lg">
        <q-banner v-if="errorRegistroCliente" class="bg-red-1 text-negative q-mb-md rounded-borders" rounded>
          <template v-slot:avatar><q-icon name="error" /></template>
          {{ errorRegistroCliente }}
        </q-banner>

        <div class="column q-gutter-sm">
          <!-- Tipo de documento -->
          <div class="row q-col-gutter-sm">
            <div class="col-5">
              <q-select
                outlined dense
                v-model="formCliente.tipoDoc"
                :options="['CC','TI','CE','PP','NIT']"
                label="Tipo de documento *"
                :error="!!erroresCliente.tipoDoc"
                :error-message="erroresCliente.tipoDoc"
              />
            </div>
            <div class="col-7">
              <q-input
                outlined dense
                v-model="formCliente.documento"
                label="Número de documento *"
                placeholder="Ej. 1020304050"
                :error="!!erroresCliente.documento"
                :error-message="erroresCliente.documento"
              />
            </div>
          </div>
          <!-- Nombre -->
          <q-input
            outlined dense
            v-model="formCliente.nombre"
            label="Nombre completo *"
            placeholder="Nombres y Apellidos"
            :error="!!erroresCliente.nombre"
            :error-message="erroresCliente.nombre"
          />
          <!-- Teléfono + Correo -->
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <q-input
                outlined dense
                v-model="formCliente.telefono"
                label="Teléfono *"
                placeholder="3101234567"
                :error="!!erroresCliente.telefono"
                :error-message="erroresCliente.telefono"
              />
            </div>
            <div class="col-6">
              <q-input
                outlined dense
                type="email"
                v-model="formCliente.correo"
                label="Correo electrónico *"
                placeholder="correo@ejemplo.com"
                :error="!!erroresCliente.correo"
                :error-message="erroresCliente.correo"
              />
            </div>
          </div>
          <!-- Dirección -->
          <q-input
            outlined dense
            v-model="formCliente.direccion"
            label="Dirección *"
            placeholder="Dirección de residencia"
            :error="!!erroresCliente.direccion"
            :error-message="erroresCliente.direccion"
          />
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat color="grey-7" label="Cancelar" v-close-popup :disable="cargandoRegistro" no-caps />
        <q-btn
          color="primary"
          icon="save"
          label="Registrar y Seleccionar"
          @click="guardarNuevoCliente"
          no-caps
          unelevated
          :loading="cargandoRegistro"
          :disabled="cargandoRegistro"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { useViajeStore } from '../stores/viajeStore'
import { useVehiculoStore } from '../stores/vehiculoStore'
import { useClienteStore } from '../stores/clienteStore'
import { useVentaStore } from '../stores/ventaStore'
import SeatMap from '../components/SeatMap.vue'
import { estimarRutaViaje, calcularTarifaTramo } from '../utils/distanceCalculator'

const $q = useQuasar()
const route = useRoute()

const viajeStore = useViajeStore()
const vehiculoStore = useVehiculoStore()
const clienteStore = useClienteStore()
const ventaStore = useVentaStore()

const paso = ref(1)
const viajeSeleccionado = ref(null)
const clienteSeleccionado = ref(null)
const puestoSeleccionado = ref(null)
const asientosSeleccionados = ref([])
const pasajerosAsignados = ref({})
const metodoPago = ref('Efectivo')
const ventaCreada = ref(null)

// Variables para selección de paradas intermedias y cálculo de tarifa
const paradaSubida = ref('')
const paradaBajada = ref('')
const precioTrayecto = ref(0)
const errorTarifa = ref('')
const infoTramo = ref(null)

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
const cargandoVenta = ref(false)

// --- Dialog: Registrar cliente inline ---
const dialogRegistroCliente = ref(false)
const cargandoRegistro = ref(false)
const errorRegistroCliente = ref('')
const formCliente = ref({ tipoDoc: 'CC', documento: '', nombre: '', telefono: '', correo: '', direccion: '' })
const erroresCliente = ref({})

function abrirDialogoRegistro() {
  formCliente.value = { tipoDoc: 'CC', documento: docBusqueda.value || '', nombre: '', telefono: '', correo: '', direccion: '' }
  erroresCliente.value = {}
  errorRegistroCliente.value = ''
  dialogRegistroCliente.value = true
}

function validarFormCliente() {
  const e = {}
  if (!formCliente.value.tipoDoc) e.tipoDoc = 'Seleccione el tipo de documento'
  if (!formCliente.value.documento?.trim()) e.documento = 'El documento es obligatorio'
  else if (clienteStore.documentoExiste(formCliente.value.documento.trim())) e.documento = 'Este documento ya está registrado'
  if (!formCliente.value.nombre?.trim()) e.nombre = 'El nombre es obligatorio'
  if (!formCliente.value.telefono?.trim()) e.telefono = 'El teléfono es obligatorio'
  if (!formCliente.value.correo?.trim()) e.correo = 'El correo es obligatorio'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formCliente.value.correo.trim())) e.correo = 'Correo inválido'
  if (!formCliente.value.direccion?.trim()) e.direccion = 'La dirección es obligatoria'
  erroresCliente.value = e
  return Object.keys(e).length === 0
}

async function guardarNuevoCliente() {
  errorRegistroCliente.value = ''
  if (!validarFormCliente()) return
  cargandoRegistro.value = true
  try {
    const nuevo = await clienteStore.registrarCliente({
      tipoDoc: formCliente.value.tipoDoc,
      documento: formCliente.value.documento.trim(),
      nombre: formCliente.value.nombre.trim().toUpperCase(),
      telefono: formCliente.value.telefono.trim(),
      correo: formCliente.value.correo.trim().toLowerCase(),
      direccion: formCliente.value.direccion.trim().toUpperCase()
    })
    dialogRegistroCliente.value = false
    // Auto-select the new client
    await clienteStore.cargarClientes()
    const clienteNuevo = clienteStore.buscarClientePorDocumento(formCliente.value.documento.trim()) || nuevo
    if (clienteNuevo) seleccionarCliente(clienteNuevo)
    clienteBuscado.value = undefined
    docBusqueda.value = ''
    $q.notify({ type: 'positive', message: `Cliente "${formCliente.value.nombre.trim().toUpperCase()}" registrado y seleccionado.`, position: 'top' })
  } catch (err) {
    errorRegistroCliente.value = err?.response?.data?.message || err?.message || 'Error al registrar el cliente. Verifique los datos.'
  } finally {
    cargandoRegistro.value = false
  }
}

function cambiarPaso(nuevoPaso) {
  if (nuevoPaso === 2) {
    if (!viajeSeleccionado.value) return
    if (errorTarifa.value || !precioTrayecto.value) {
      $q.notify({
        type: 'negative',
        message: errorTarifa.value || 'No hay tarifa disponible para este tramo seleccionado',
        position: 'top'
      })
      return
    }
  }
  if (nuevoPaso === 3 && (!viajeSeleccionado.value || !clienteSeleccionado.value)) return
  if (nuevoPaso === 4 && (!viajeSeleccionado.value || !clienteSeleccionado.value || asientosSeleccionados.value.length === 0)) return
  if (nuevoPaso === 5 && !ventaCreada.value) return
  paso.value = nuevoPaso
}

function obtenerRutaCompleta(viaje) {
  if (!viaje) return []
  const paradas = Array.isArray(viaje.paradasIntermedias) ? viaje.paradasIntermedias : []
  return [viaje.origen, ...paradas, viaje.destino]
}

function obtenerOpcionesSubida() {
  if (!viajeSeleccionado.value) return []
  const ruta = obtenerRutaCompleta(viajeSeleccionado.value)
  return ruta.slice(0, -1)
}

function obtenerOpcionesBajada() {
  if (!viajeSeleccionado.value) return []
  const ruta = obtenerRutaCompleta(viajeSeleccionado.value)
  const idxSub = ruta.indexOf(paradaSubida.value)
  if (idxSub === -1) return [viajeSeleccionado.value.destino]
  return ruta.slice(idxSub + 1)
}

function actualizarTarifaTrayecto() {
  if (!viajeSeleccionado.value) return
  errorTarifa.value = ''
  infoTramo.value = null

  const v = viajeSeleccionado.value
  const sub = paradaSubida.value || v.origen
  const baj = paradaBajada.value || v.destino

  const res = calcularTarifaTramo(v.precio, v.origen, v.destino, sub, baj)
  if (res.error) {
    errorTarifa.value = res.error
    precioTrayecto.value = null
  } else {
    precioTrayecto.value = res.precio
    infoTramo.value = {
      distanciaKm: res.distanciaKm,
      distanciaTexto: res.distanciaTexto || (res.distanciaKm ? `${res.distanciaKm} km` : '—'),
      duracionTexto: res.duracionTexto || 'Directo'
    }
  }
}

function onParadaSubidaChange(nuevaSub) {
  paradaSubida.value = nuevaSub
  const ruta = obtenerRutaCompleta(viajeSeleccionado.value)
  const idxSub = ruta.indexOf(nuevaSub)
  const idxBaj = ruta.indexOf(paradaBajada.value)
  if (idxBaj <= idxSub) {
    paradaBajada.value = ruta[idxSub + 1] || viajeSeleccionado.value.destino
  }
  actualizarTarifaTrayecto()
}

function onParadaBajadaChange(nuevaBaj) {
  paradaBajada.value = nuevaBaj
  actualizarTarifaTrayecto()
}

function clientes() {
  return clienteStore.clientes;
}
function opcionesClientes() {
  const opts = []
  for (const c of clientes()) {
    opts.push({
      label: `${c.nombre} – ${c.tipoDoc}: ${c.documento}`,
      value: c.id
    })
  }
  return opts
}

function viajesDisponibles() {
  const list = []
  for (const v of viajeStore.viajes) {
    if (v.estado !== 'Cancelado' && v.estado !== 'Finalizado' && v.estado !== 'Completo') {
      list.push(v)
    }
  }
  return list
}

function getEmpresa(viaje) {
  if (!viaje) return 'VIABUS Express'
  const vId = viaje.vehiculoId || (viaje.bus?._id || viaje.bus)
  const veh = getVehiculo(vId)
  return veh?.empresa || veh?.company || 'VIABUS Express'
}

// Opciones dinámicas de empresas para el filtro
function empresasDisponibles() {
  const set = new Set()
  for (const v of viajesDisponibles()) {
    set.add(getEmpresa(v))
  }
  for (const v of vehiculoStore.vehiculos) {
    if (v.empresa) set.add(v.empresa)
  }
  const arr = Array.from(set).sort()
  return ['Todas las empresas', ...arr]
}

// Opciones dinámicas de orígenes para el filtro
function origenesDisponibles() {
  const set = new Set()
  for (const v of viajesDisponibles()) {
    if (v.origen) set.add(v.origen)
  }
  const arr = Array.from(set).sort()
  return ['Todos los orígenes', ...arr]
}

// Opciones dinámicas de destinos para el filtro
function destinosDisponibles() {
  const set = new Set()
  for (const v of viajesDisponibles()) {
    if (v.destino) set.add(v.destino)
  }
  const arr = Array.from(set).sort()
  return ['Todos los destinos', ...arr]
}

const mostrarFiltros = ref(false)

function filtrosAvanzadosActivosCount() {
  let count = 0
  if (filtroOrigen.value !== 'Todos los orígenes') count++
  if (filtroDestino.value !== 'Todos los destinos') count++
  if (filtroEmpresa.value !== 'Todas las empresas') count++
  if (filtroHorario.value !== 'Cualquier horario') count++
  if (ordenSeleccionado.value !== 'Por defecto') count++
  return count
}

// Indicador si hay algún filtro activo
function filtrosActivos() {
  return (
    Boolean(busquedaViaje.value) ||
    filtrosAvanzadosActivosCount() > 0
  )
}

// Filtrado de viajes por origen, destino, empresa, franja horaria y texto libre
function viajesFiltrados() {
  const lista = []
  for (const v of viajesDisponibles()) {
    if (filtroOrigen.value !== 'Todos los orígenes' && v.origen !== filtroOrigen.value) continue
    if (filtroDestino.value !== 'Todos los destinos' && v.destino !== filtroDestino.value) continue
    if (filtroEmpresa.value !== 'Todas las empresas' && getEmpresa(v) !== filtroEmpresa.value) continue

    if (filtroHorario.value !== 'Cualquier horario' && v.hora) {
      const horaNum = parseInt(v.hora.split(':')[0], 10)
      if (!isNaN(horaNum)) {
        if (filtroHorario.value === 'Mañana (05:00 - 11:59)' && (horaNum < 5 || horaNum >= 12)) continue
        if (filtroHorario.value === 'Tarde (12:00 - 17:59)' && (horaNum < 12 || horaNum >= 18)) continue
        if (filtroHorario.value === 'Noche (18:00 - 23:59)' && (horaNum < 18 && horaNum >= 5)) continue
      }
    }

    if (busquedaViaje.value) {
      const term = busquedaViaje.value.toLowerCase().trim()
      const veh = getVehiculo(v.vehiculoId)
      const placa = veh?.placa?.toLowerCase() || ''
      const conductor = veh?.conductor?.toLowerCase() || ''
      const empresa = getEmpresa(v).toLowerCase()

      const match = (v.codigo && v.codigo.toLowerCase().includes(term)) ||
        (v.origen && v.origen.toLowerCase().includes(term)) ||
        (v.destino && v.destino.toLowerCase().includes(term)) ||
        (v.fecha && v.fecha.toLowerCase().includes(term)) ||
        (v.hora && v.hora.toLowerCase().includes(term)) ||
        empresa.includes(term) ||
        placa.includes(term) ||
        conductor.includes(term)

      if (!match) continue
    }

    lista.push(v)
  }

  if (ordenSeleccionado.value === 'Hora: Más temprano') {
    lista.sort((a, b) => (a.hora || '').localeCompare(b.hora || ''))
  } else if (ordenSeleccionado.value === 'Hora: Más tarde') {
    lista.sort((a, b) => (b.hora || '').localeCompare(a.hora || ''))
  } else if (ordenSeleccionado.value === 'Precio: Menor a mayor') {
    lista.sort((a, b) => Number(a.precio) - Number(b.precio))
  } else if (ordenSeleccionado.value === 'Precio: Mayor a menor') {
    lista.sort((a, b) => Number(b.precio) - Number(a.precio))
  }

  return lista
}

function limpiarBusqueda() {
  busquedaViaje.value = ''
  filtroOrigen.value = 'Todos los orígenes'
  filtroDestino.value = 'Todos los destinos'
  filtroEmpresa.value = 'Todas las empresas'
  filtroHorario.value = 'Cualquier horario'
  ordenSeleccionado.value = 'Por defecto'
}

function getRutaInfo(viaje) {
  if (!viaje) {
    return { distanciaKm: 0, distanciaTexto: '—', duracionTexto: '—', duracionMinutos: 0 }
  }
  return estimarRutaViaje(viaje.origen, viaje.destino)
}

function vehiculoDelViaje() {
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
}

function puestosOcupados() {
  return viajeSeleccionado.value ? ventaStore.puestosOcupadosPorViaje(viajeSeleccionado.value.id || viajeSeleccionado.value._id) : [];
}

function puestosPendientes() {
  return viajeSeleccionado.value ? ventaStore.puestosPendientesPorViaje(viajeSeleccionado.value.id || viajeSeleccionado.value._id) : [];
}

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
  const cambio = viajeSeleccionado.value && (viajeSeleccionado.value.id !== viaje.id && viajeSeleccionado.value._id !== viaje._id)
  viajeSeleccionado.value = viaje
  paradaSubida.value = viaje.origen
  paradaBajada.value = viaje.destino
  puestoSeleccionado.value = null
  asientosSeleccionados.value = []
  pasajerosAsignados.value = {}
  errorVenta.value = ''
  actualizarTarifaTrayecto()
  if (cambio) {
    $q.notify({
      type: 'info',
      icon: 'sync',
      message: `Viaje actualizado a ${viaje.codigo}: ${viaje.origen} → ${viaje.destino}. Tarifa configurada: $${Number(viaje.precio || 0).toLocaleString('es-CO')}. Se reinició la selección de asientos previa.`,
      position: 'top'
    })
  }
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
  if (asientosSeleccionados.value.length > 0) {
    const primerNum = asientosSeleccionados.value[0].numero
    pasajerosAsignados.value[primerNum] = {
      nombre: c.nombre,
      documento: c.documento,
      clienteId: c.id
    }
  }
}

function deseleccionarCliente() {
  clienteSeleccionado.value = null
  clienteIdSeleccionado.value = null
}

function onClienteSelectChange(id) {
  if (!id) return
  const c = clienteStore.obtenerCliente(id)
  if (c) seleccionarCliente(c)
}

function onSeleccionarPuesto(puesto) {
  if (!puesto) return
  const num = Number(puesto.numero || puesto.id)
  const idx = asientosSeleccionados.value.findIndex(a => a.numero === num)

  if (idx >= 0) {
    asientosSeleccionados.value.splice(idx, 1)
    delete pasajerosAsignados.value[num]
  } else {
    asientosSeleccionados.value.push({ id: puesto.id, numero: num })
    if (asientosSeleccionados.value.length === 1 && clienteSeleccionado.value) {
      pasajerosAsignados.value[num] = {
        nombre: clienteSeleccionado.value.nombre,
        documento: clienteSeleccionado.value.documento,
        clienteId: clienteSeleccionado.value.id
      }
    } else {
      pasajerosAsignados.value[num] = {
        nombre: '',
        documento: '',
        clienteId: null
      }
    }
  }

  if (asientosSeleccionados.value.length > 0) {
    puestoSeleccionado.value = asientosSeleccionados.value[0]
  } else {
    puestoSeleccionado.value = null
  }
}

function quitarAsiento(asiento) {
  const num = Number(asiento.numero || asiento.id)
  const idx = asientosSeleccionados.value.findIndex(a => a.numero === num)
  if (idx >= 0) {
    asientosSeleccionados.value.splice(idx, 1)
    delete pasajerosAsignados.value[num]
  }
  if (asientosSeleccionados.value.length > 0) {
    puestoSeleccionado.value = asientosSeleccionados.value[0]
  } else {
    puestoSeleccionado.value = null
  }
}

function copiarTitularAAsiento(num) {
  if (!clienteSeleccionado.value) return
  pasajerosAsignados.value[num] = {
    nombre: clienteSeleccionado.value.nombre,
    documento: clienteSeleccionado.value.documento,
    clienteId: clienteSeleccionado.value.id
  }
}

function calcularTotalVenta() {
  const cant = asientosSeleccionados.value.length || (puestoSeleccionado.value ? 1 : 0)
  const precioUnitario = Number(precioTrayecto.value || viajeSeleccionado.value?.precio || 0)
  return cant * precioUnitario
}

async function confirmarVenta(estado = 'CONFIRMADO') {
  if (cargandoVenta.value) return
  errorVenta.value = ''
  cargandoVenta.value = true
  try {
    const tripId = viajeSeleccionado.value.id || viajeSeleccionado.value._id
    const precioUnit = Number(precioTrayecto.value || viajeSeleccionado.value.precio)
    const origenFinal = paradaSubida.value || viajeSeleccionado.value.origen
    const destinoFinal = paradaBajada.value || viajeSeleccionado.value.destino
    const descConTramo = (origenFinal !== viajeSeleccionado.value.origen || destinoFinal !== viajeSeleccionado.value.destino)
      ? `Tramo: ${origenFinal} → ${destinoFinal}. ${descripcionOpcional.value}`.trim()
      : descripcionOpcional.value

    if (asientosSeleccionados.value.length > 1) {
      const items = []
      for (const a of asientosSeleccionados.value) {
        const pas = pasajerosAsignados.value[a.numero] || {}
        const nom = (a === asientosSeleccionados.value[0] ? clienteSeleccionado.value?.nombre : pas.nombre) || clienteSeleccionado.value?.nombre || ''
        const doc = (a === asientosSeleccionados.value[0] ? clienteSeleccionado.value?.documento : pas.documento) || clienteSeleccionado.value?.documento || ''

        if (!nom.trim() || !doc.trim()) {
          errorVenta.value = `Debe asignar nombre y cédula para el asiento #${a.numero}`
          cargandoVenta.value = false
          return
        }

        items.push({
          seatNumber: a.numero,
          puestoId: a.numero,
          customerName: nom.trim(),
          customerDoc: doc.trim(),
          clienteId: pas.clienteId || (a === asientosSeleccionados.value[0] ? clienteSeleccionado.value?.id : null),
          precio: precioUnit,
          origen: origenFinal,
          destino: destinoFinal
        })
      }

      const res = await ventaStore.crearVentaMultiple({
        viajeId: tripId,
        items,
        paymentMethod: metodoPago.value,
        metodoPago: metodoPago.value,
        status: estado,
        estado,
        origen: origenFinal,
        destino: destinoFinal,
        descripcion: descConTramo
      })

      const primerTkt = (res.tiquetes && res.tiquetes.length > 0) ? res.tiquetes[0] : (res.data && res.data.length > 0 ? res.data[0] : res)
      ventaCreada.value = primerTkt
      paso.value = 5
      await ventaStore.cargarVentas()
      return
    }

    // Venta individual (1 asiento)
    const numPuesto = puestoSeleccionado.value ? puestoSeleccionado.value.numero : (asientosSeleccionados.value[0]?.numero)
    const nueva = await ventaStore.crearVenta({
      viajeId: tripId,
      clienteId: clienteSeleccionado.value.id || clienteSeleccionado.value._id,
      customerName: clienteSeleccionado.value.nombre,
      customerDoc: clienteSeleccionado.value.documento,
      puestoId: numPuesto,
      precio: precioUnit,
      origen: origenFinal,
      destino: destinoFinal,
      metodoPago: metodoPago.value,
      paymentMethod: metodoPago.value,
      descripcion: descConTramo,
      estado
    })
    ventaCreada.value = nueva
    paso.value = 5
    await ventaStore.cargarVentas()
  } catch (e) {
    errorVenta.value = e.message || 'Error al procesar la venta'
  } finally {
    cargandoVenta.value = false
  }
}

function reiniciar() {
  paso.value = 1
  viajeSeleccionado.value = null
  clienteSeleccionado.value = null
  puestoSeleccionado.value = null
  asientosSeleccionados.value = []
  pasajerosAsignados.value = {}
  metodoPago.value = 'Efectivo'
  ventaCreada.value = null
  paradaSubida.value = ''
  paradaBajada.value = ''
  precioTrayecto.value = 0
  errorTarifa.value = ''
  infoTramo.value = null
  busquedaViaje.value = ''
  filtroOrigen.value = 'Todos los orígenes'
  filtroDestino.value = 'Todos los destinos'
  filtroEmpresa.value = 'Todas las empresas'
  filtroHorario.value = 'Cualquier horario'
  ordenSeleccionado.value = 'Por defecto'
  docBusqueda.value = ''
  clienteBuscado.value = undefined
  clienteIdSeleccionado.value = null
  descripcionOpcional.value = ''
  errorVenta.value = ''
  cargandoVenta.value = false
}

function verificarViajeDesdeRuta() {
  const vId = route.query.viajeId
  if (vId && viajeStore.viajes.length > 0) {
    for (const v of viajeStore.viajes) {
      if (String(v.id) === String(vId) || String(v._id) === String(vId)) {
        seleccionarViaje(v)
        if (paso.value === 1) {
          paso.value = 2
        }
        break
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
