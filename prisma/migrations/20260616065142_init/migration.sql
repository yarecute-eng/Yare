-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "contrasenaHash" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'VENDEDOR',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "avatar" TEXT,
    "tema" TEXT NOT NULL DEFAULT 'auto',
    "densidad" TEXT NOT NULL DEFAULT 'comodo',
    "onboardingCompletado" BOOLEAN NOT NULL DEFAULT false,
    "metaMensual" REAL,
    "comision" REAL,
    "slugAgenda" TEXT,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "telefonoInternacional" TEXT,
    "correo" TEXT,
    "origen" TEXT,
    "canalUtm" TEXT,
    "etapa" TEXT NOT NULL DEFAULT 'NUEVO',
    "estado" TEXT NOT NULL DEFAULT 'ACTIVO',
    "temperatura" TEXT NOT NULL DEFAULT 'TIBIO',
    "valorEstimado" REAL,
    "objecionPrincipal" TEXT,
    "motivoPerdida" TEXT,
    "notas" TEXT,
    "proximaAccion" TEXT,
    "proximaAccionFecha" DATETIME,
    "ultimoContacto" DATETIME,
    "formaPago" TEXT,
    "zona" TEXT,
    "ultimaCompra" DATETIME,
    "productoInteres" TEXT,
    "tallas" TEXT,
    "empresa" TEXT,
    "giroEmpresa" TEXT,
    "cargo" TEXT,
    "rfc" TEXT,
    "sitioweb" TEXT,
    "direccionEmpresa" TEXT,
    "tamanoEmpresa" TEXT,
    "notasEmpresa" TEXT,
    "vendedorId" TEXT NOT NULL,
    "eliminadoEn" DATETIME,
    "archivadoEn" DATETIME,
    "ganadoEn" DATETIME,
    "perdidoEn" DATETIME,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    CONSTRAINT "Cliente_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "monto" REAL NOT NULL,
    "montoTotal" REAL,
    "metodo" TEXT NOT NULL DEFAULT 'EFECTIVO',
    "estatus" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "concepto" TEXT,
    "fechaPago" DATETIME,
    "fechaVencimiento" DATETIME,
    "folio" TEXT NOT NULL,
    "notas" TEXT,
    "eliminadoEn" DATETIME,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    CONSTRAINT "Pago_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Cita" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "vendedorId" TEXT NOT NULL,
    "titulo" TEXT,
    "fecha" DATETIME NOT NULL,
    "duracion" INTEGER NOT NULL DEFAULT 30,
    "googleEventId" TEXT,
    "googleMeetLink" TEXT,
    "notas" TEXT,
    "confirmada" BOOLEAN NOT NULL DEFAULT false,
    "cancelada" BOOLEAN NOT NULL DEFAULT false,
    "eliminadoEn" DATETIME,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    CONSTRAINT "Cita_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Cita_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ArchivoCliente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "etiqueta" TEXT NOT NULL DEFAULT 'Otro',
    "tipo" TEXT NOT NULL,
    "tamano" INTEGER NOT NULL,
    "datos" TEXT,
    "url" TEXT,
    "subidoPorId" TEXT NOT NULL,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ArchivoCliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ArchivoCliente_subidoPorId_fkey" FOREIGN KEY ("subidoPorId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EventoCliente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "autorNombre" TEXT NOT NULL,
    "autorId" TEXT,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaEditable" DATETIME,
    "metadatos" TEXT,
    CONSTRAINT "EventoCliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Etiqueta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#a78bdb',
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ClienteEtiqueta" (
    "clienteId" TEXT NOT NULL,
    "etiquetaId" TEXT NOT NULL,

    PRIMARY KEY ("clienteId", "etiquetaId"),
    CONSTRAINT "ClienteEtiqueta_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClienteEtiqueta_etiquetaId_fkey" FOREIGN KEY ("etiquetaId") REFERENCES "Etiqueta" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClienteFavorito" (
    "usuarioId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("usuarioId", "clienteId"),
    CONSTRAINT "ClienteFavorito_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClienteFavorito_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Recordatorio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "clienteId" TEXT,
    "titulo" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL,
    "completado" BOOLEAN NOT NULL DEFAULT false,
    "pospuesto" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Recordatorio_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Recordatorio_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PlantillaMensaje" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'whatsapp',
    "etapa" TEXT,
    "objecion" TEXT,
    "categoria" TEXT,
    "asunto" TEXT,
    "cuerpo" TEXT NOT NULL,
    "favorita" BOOLEAN NOT NULL DEFAULT false,
    "esGlobal" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" DATETIME NOT NULL,
    CONSTRAINT "PlantillaMensaje_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RegistroAuditoria" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT,
    "usuarioNombre" TEXT,
    "accion" TEXT NOT NULL,
    "entidad" TEXT NOT NULL,
    "entidadId" TEXT,
    "detalle" TEXT,
    "ip" TEXT,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RegistroAuditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConfiguracionNegocio" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "nombre" TEXT NOT NULL DEFAULT 'Princessitas Ceremonias',
    "logoUrl" TEXT,
    "colorMarca" TEXT NOT NULL DEFAULT '#a78bdb',
    "moneda" TEXT NOT NULL DEFAULT 'MXN',
    "simboloMoneda" TEXT NOT NULL DEFAULT '$',
    "husoHorario" TEXT NOT NULL DEFAULT 'America/Mexico_City',
    "horarioInicio" TEXT NOT NULL DEFAULT '10:00',
    "horarioFin" TEXT NOT NULL DEFAULT '18:00',
    "duracionCita" INTEGER NOT NULL DEFAULT 30,
    "mensajeWhatsapp" TEXT NOT NULL DEFAULT 'Hola {nombre}, gracias por tu interés. ¿Te parece si agendamos una llamada para platicarte cómo te puedo ayudar?',
    "metaMensual" REAL NOT NULL DEFAULT 10,
    "comisionGlobal" REAL,
    "umbralEstancamiento" INTEGER NOT NULL DEFAULT 7,
    "metodoPago" TEXT NOT NULL DEFAULT 'TRANSFERENCIA,TARJETA,LIGA_DE_PAGO,DEPOSITO_ANTICIPO,EFECTIVO',
    "motivosPerdida" TEXT NOT NULL DEFAULT 'Precio,Se fue con la competencia,No contestó,No era buen momento,No calificaba,Otro',
    "whatsappNegocio" TEXT,
    "actualizadoEn" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "VistaGuardada" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "seccion" TEXT NOT NULL,
    "filtros" TEXT NOT NULL,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VistaGuardada_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IntentoFormulario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "datos" TEXT NOT NULL,
    "origen" TEXT,
    "procesado" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_slugAgenda_key" ON "Usuario"("slugAgenda");

-- CreateIndex
CREATE INDEX "Usuario_correo_idx" ON "Usuario"("correo");

-- CreateIndex
CREATE INDEX "Usuario_rol_idx" ON "Usuario"("rol");

-- CreateIndex
CREATE INDEX "Cliente_nombre_idx" ON "Cliente"("nombre");

-- CreateIndex
CREATE INDEX "Cliente_telefono_idx" ON "Cliente"("telefono");

-- CreateIndex
CREATE INDEX "Cliente_correo_idx" ON "Cliente"("correo");

-- CreateIndex
CREATE INDEX "Cliente_empresa_idx" ON "Cliente"("empresa");

-- CreateIndex
CREATE INDEX "Cliente_etapa_idx" ON "Cliente"("etapa");

-- CreateIndex
CREATE INDEX "Cliente_estado_idx" ON "Cliente"("estado");

-- CreateIndex
CREATE INDEX "Cliente_vendedorId_idx" ON "Cliente"("vendedorId");

-- CreateIndex
CREATE INDEX "Cliente_eliminadoEn_idx" ON "Cliente"("eliminadoEn");

-- CreateIndex
CREATE INDEX "Cliente_proximaAccionFecha_idx" ON "Cliente"("proximaAccionFecha");

-- CreateIndex
CREATE INDEX "Pago_clienteId_idx" ON "Pago"("clienteId");

-- CreateIndex
CREATE INDEX "Pago_estatus_idx" ON "Pago"("estatus");

-- CreateIndex
CREATE INDEX "Pago_eliminadoEn_idx" ON "Pago"("eliminadoEn");

-- CreateIndex
CREATE INDEX "Cita_clienteId_idx" ON "Cita"("clienteId");

-- CreateIndex
CREATE INDEX "Cita_vendedorId_idx" ON "Cita"("vendedorId");

-- CreateIndex
CREATE INDEX "Cita_fecha_idx" ON "Cita"("fecha");

-- CreateIndex
CREATE INDEX "Cita_eliminadoEn_idx" ON "Cita"("eliminadoEn");

-- CreateIndex
CREATE INDEX "ArchivoCliente_clienteId_idx" ON "ArchivoCliente"("clienteId");

-- CreateIndex
CREATE INDEX "EventoCliente_clienteId_idx" ON "EventoCliente"("clienteId");

-- CreateIndex
CREATE INDEX "EventoCliente_fecha_idx" ON "EventoCliente"("fecha");

-- CreateIndex
CREATE UNIQUE INDEX "Etiqueta_nombre_key" ON "Etiqueta"("nombre");

-- CreateIndex
CREATE INDEX "Recordatorio_usuarioId_idx" ON "Recordatorio"("usuarioId");

-- CreateIndex
CREATE INDEX "Recordatorio_fecha_idx" ON "Recordatorio"("fecha");

-- CreateIndex
CREATE INDEX "PlantillaMensaje_usuarioId_idx" ON "PlantillaMensaje"("usuarioId");

-- CreateIndex
CREATE INDEX "RegistroAuditoria_usuarioId_idx" ON "RegistroAuditoria"("usuarioId");

-- CreateIndex
CREATE INDEX "RegistroAuditoria_fecha_idx" ON "RegistroAuditoria"("fecha");

-- CreateIndex
CREATE INDEX "RegistroAuditoria_entidad_idx" ON "RegistroAuditoria"("entidad");

-- CreateIndex
CREATE INDEX "VistaGuardada_usuarioId_idx" ON "VistaGuardada"("usuarioId");
