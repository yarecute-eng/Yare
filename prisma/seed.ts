import { PrismaClient } from "@prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import bcrypt from "bcryptjs"

const dbUrl = process.env.DATABASE_URL ?? "file:./prisma/dev.db"
const adapter = new PrismaBetterSqlite3({ url: dbUrl })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Verificar si ya hay datos reales
  const usuarioExistente = await prisma.usuario.count()
  if (usuarioExistente > 0) {
    console.log("⚠️  Ya hay datos en la base. No se siembra para no pisar información real.")
    console.log("   Si quieres el seed de muestra, primero vacía la base y vuelve a correr.")
    return
  }

  console.log("🌱 Sembrando datos de muestra...")

  // Crear configuración del negocio
  await prisma.configuracionNegocio.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      nombre: "Princessitas Ceremonias",
      colorMarca: "#a78bdb",
      moneda: "MXN",
      simboloMoneda: "$",
      husoHorario: "America/Mexico_City",
      horarioInicio: "10:00",
      horarioFin: "18:00",
      duracionCita: 30,
      metaMensual: 10,
      whatsappNegocio: "5213312345678",
    },
  })

  // Crear usuarios
  const hashAdmin = await bcrypt.hash("Admin2026!", 12)
  const hashVendedor = await bcrypt.hash("Vendedor2026!", 12)

  const admin = await prisma.usuario.create({
    data: {
      nombre: "María García (Admin)",
      correo: "admin@princessitas.mx",
      contrasenaHash: hashAdmin,
      rol: "ADMIN",
      slugAgenda: "maria",
      metaMensual: 10,
    },
  })

  const vendedor = await prisma.usuario.create({
    data: {
      nombre: "Ana López",
      correo: "ana@princessitas.mx",
      contrasenaHash: hashVendedor,
      rol: "VENDEDOR",
      slugAgenda: "ana",
      metaMensual: 5,
    },
  })

  // Crear etiquetas
  const etiquetas = await Promise.all([
    prisma.etiqueta.create({ data: { nombre: "VIP", color: "#f59e0b" } }),
    prisma.etiqueta.create({ data: { nombre: "Referido", color: "#10b981" } }),
    prisma.etiqueta.create({ data: { nombre: "Pagó anticipo", color: "#3b82f6" } }),
    prisma.etiqueta.create({ data: { nombre: "Primera comunión", color: "#a78bdb" } }),
    prisma.etiqueta.create({ data: { nombre: "Bautizo", color: "#ec4899" } }),
  ])

  const ahora = new Date()
  const hace = (dias: number) => new Date(ahora.getTime() - dias * 86400000)
  const en = (dias: number) => new Date(ahora.getTime() + dias * 86400000)

  // Clientes de muestra
  const clientesData = [
    {
      nombre: "Valeria Martínez Ruiz",
      telefono: "3312345001",
      telefonoInternacional: "523312345001",
      correo: "valeria.martinez@gmail.com",
      origen: "Instagram",
      etapa: "CLIENTE_NUEVO",
      estado: "ACTIVO",
      temperatura: "CALIENTE",
      valorEstimado: 4500,
      objecionPrincipal: "Lo voy a pensar",
      notas: "Busca vestido de primera comunión talla 10, color marfil o blanco.",
      proximaAccion: "Confirmar medidas y enviar cotización",
      proximaAccionFecha: en(2),
      ultimoContacto: hace(1),
      productoInteres: "Vestido primera comunión",
      tallas: "Talla 10",
      vendedorId: admin.id,
      creadoEn: hace(5),
    },
    {
      nombre: "Sofía Hernández Torres",
      telefono: "3398765002",
      telefonoInternacional: "523398765002",
      correo: "sofia.hernandez@hotmail.com",
      origen: "Facebook",
      etapa: "PROPUESTA_ENVIADA",
      estado: "ACTIVO",
      temperatura: "CALIENTE",
      valorEstimado: 8500,
      objecionPrincipal: "Tengo que consultarlo con mi pareja/socio",
      notas: "Quiere 2 vestidos de fiesta para niña de 5 y 8 años.",
      proximaAccion: "Llamar para dar seguimiento a propuesta",
      proximaAccionFecha: hace(1), // VENCIDA
      ultimoContacto: hace(4),
      productoInteres: "Vestido fiesta niña",
      tallas: "Talla 4, Talla 8",
      vendedorId: vendedor.id,
      creadoEn: hace(10),
    },
    {
      nombre: "Carmen López Jiménez",
      telefono: "3387654003",
      telefonoInternacional: "523387654003",
      correo: "carmen.lopez@yahoo.com",
      origen: "Recomendado",
      etapa: "VIP_MAYORISTA",
      estado: "ACTIVO",
      temperatura: "CALIENTE",
      valorEstimado: 35000,
      objecionPrincipal: null,
      notas: "Dueña de boutique en Zapopan. Compra para reventa.",
      proximaAccion: "Enviar catálogo nuevo temporada",
      proximaAccionFecha: en(5),
      ultimoContacto: hace(2),
      empresa: "Boutique Encanto Zapopan",
      giroEmpresa: "Ropa infantil / Boutique",
      cargo: "Propietaria",
      productoInteres: "Mayoreo vestidos y ropones",
      vendedorId: admin.id,
      creadoEn: hace(120),
    },
    {
      nombre: "Daniela Flores Gutiérrez",
      telefono: "3376543004",
      telefonoInternacional: "523376543004",
      correo: "daniela.flores@gmail.com",
      origen: "Landing",
      etapa: "NUEVO",
      estado: "ACTIVO",
      temperatura: "TIBIO",
      valorEstimado: 3500,
      objecionPrincipal: "Ya tengo otro proveedor",
      notas: "Llegó por la página. Busca ropón de bautizo niño.",
      proximaAccion: "Primer contacto — llamar o escribir por WhatsApp",
      proximaAccionFecha: hace(2), // VENCIDA - lead frío por demora
      ultimoContacto: null,
      productoInteres: "Ropón bautizo niño",
      vendedorId: vendedor.id,
      creadoEn: hace(3),
    },
    {
      nombre: "Alejandra Ramírez Vega",
      telefono: "3365432005",
      telefonoInternacional: "523365432005",
      correo: "alejandra.ramirez@gmail.com",
      origen: "Instagram",
      etapa: "CONTACTADO",
      estado: "ACTIVO",
      temperatura: "TIBIO",
      valorEstimado: 6000,
      objecionPrincipal: "Lo voy a pensar",
      notas: "Quiere traje completo de niño para primera comunión.",
      proximaAccion: "Enviar fotos de opciones de trajes",
      proximaAccionFecha: en(1),
      ultimoContacto: hace(2),
      productoInteres: "Traje niño primera comunión",
      vendedorId: admin.id,
      creadoEn: hace(7),
    },
    {
      nombre: "Gabriela Moreno Castillo",
      telefono: "3354321006",
      telefonoInternacional: "523354321006",
      correo: "gabriela.moreno@outlook.com",
      origen: "WhatsApp",
      etapa: "CLIENTE_RECURRENTE",
      estado: "ACTIVO",
      temperatura: "CALIENTE",
      valorEstimado: 7500,
      objecionPrincipal: null,
      notas: "Cliente desde hace 2 años. Ya compró 3 veces. Ahora busca vestido para comunión de sobrina.",
      proximaAccion: "Agendar cita para medición",
      proximaAccionFecha: en(3),
      ultimoContacto: hace(1),
      productoInteres: "Vestido primera comunión",
      vendedorId: admin.id,
      creadoEn: hace(240),
    },
    {
      nombre: "Patricia Sánchez Medina",
      telefono: "3343210007",
      telefonoInternacional: "523343210007",
      correo: "patricia.sanchez@gmail.com",
      origen: "Facebook",
      etapa: "PERDIDO",
      estado: "PERDIDO",
      temperatura: "FRIO",
      valorEstimado: 4000,
      objecionPrincipal: "Ya tengo otro proveedor",
      motivoPerdida: "Se fue con la competencia",
      notas: "Fue con otra tienda. Dijo que les ofrecieron precio más bajo.",
      proximaAccion: null,
      proximaAccionFecha: null,
      ultimoContacto: hace(30),
      productoInteres: "Vestido fiesta niña",
      vendedorId: vendedor.id,
      perdidoEn: hace(30),
      creadoEn: hace(45),
    },
    {
      nombre: "Luisa Mendoza Reyes",
      telefono: "3332109008",
      telefonoInternacional: "523332109008",
      correo: "luisa.mendoza@gmail.com",
      origen: "Recomendado",
      etapa: "CLIENTE_NUEVO",
      estado: "GANADO",
      temperatura: "CALIENTE",
      valorEstimado: 5500,
      objecionPrincipal: null,
      notas: "Compró ropón de bautizo niña + accesorios. Muy contenta.",
      proximaAccion: "Pedir reseña y referido",
      proximaAccionFecha: en(7),
      ultimoContacto: hace(3),
      productoInteres: "Ropón bautizo niña + accesorios",
      vendedorId: admin.id,
      ganadoEn: hace(3),
      creadoEn: hace(20),
    },
    {
      nombre: "Elena Castro Vargas",
      telefono: "3321098009",
      telefonoInternacional: "523321098009",
      correo: "elena.castro@gmail.com",
      origen: "Instagram",
      etapa: "CLIENTE_DE_TEMPORADAS",
      estado: "ACTIVO",
      temperatura: "TIBIO",
      valorEstimado: 12000,
      objecionPrincipal: null,
      notas: "Compra cada temporada de fiestas. Tiene 4 sobrinas.",
      proximaAccion: "Contactar para temporada navideña",
      proximaAccionFecha: en(45),
      ultimoContacto: hace(60),
      productoInteres: "Vestidos fiesta temporada",
      vendedorId: admin.id,
      creadoEn: hace(365),
    },
    {
      nombre: "Rosa Jiménez Peña",
      telefono: "3310987010",
      telefonoInternacional: "523310987010",
      correo: "rosa.jimenez@gmail.com",
      origen: "Agenda Ana",
      etapa: "NUEVO",
      estado: "ARCHIVADO",
      temperatura: "FRIO",
      valorEstimado: 2500,
      objecionPrincipal: "Lo voy a pensar",
      notas: "Agendó cita pero no se presentó. Se archiva por ahora.",
      proximaAccion: null,
      proximaAccionFecha: null,
      ultimoContacto: hace(15),
      productoInteres: "Vestido primera comunión",
      vendedorId: vendedor.id,
      archivadoEn: hace(14),
      creadoEn: hace(20),
    },
  ]

  const clientes: any[] = []
  for (const c of clientesData) {
    const cliente = await prisma.cliente.create({ data: c as any })
    clientes.push(cliente)
  }

  // Asignar etiquetas
  await prisma.clienteEtiqueta.createMany({
    data: [
      { clienteId: clientes[0].id, etiquetaId: etiquetas[3].id }, // Primera comunión
      { clienteId: clientes[2].id, etiquetaId: etiquetas[0].id }, // VIP
      { clienteId: clientes[5].id, etiquetaId: etiquetas[1].id }, // Referido
      { clienteId: clientes[7].id, etiquetaId: etiquetas[2].id }, // Pagó anticipo
      { clienteId: clientes[3].id, etiquetaId: etiquetas[4].id }, // Bautizo
    ],
  })

  // Crear citas
  await prisma.cita.createMany({
    data: [
      {
        clienteId: clientes[0].id,
        vendedorId: admin.id,
        titulo: "Medición vestido Valeria",
        fecha: en(2),
        duracion: 30,
        confirmada: true,
      },
      {
        clienteId: clientes[4].id,
        vendedorId: admin.id,
        titulo: "Mostrar trajes de niño",
        fecha: en(1),
        duracion: 30,
      },
      {
        clienteId: clientes[5].id,
        vendedorId: admin.id,
        titulo: "Cita medición comunión",
        fecha: en(3),
        duracion: 30,
      },
      {
        clienteId: clientes[1].id,
        vendedorId: vendedor.id,
        titulo: "Seguimiento propuesta Sofía",
        fecha: hace(5),
        duracion: 30,
        confirmada: true,
      },
    ],
  })

  // Crear pagos históricos (últimos 6 meses)
  const pagosHistoricos = [
    // Hace 5 meses
    { clienteId: clientes[2].id, monto: 12000, metodo: "TRANSFERENCIA", estatus: "PAGADO", fechaPago: hace(150), concepto: "Pedido mayoreo enero" },
    { clienteId: clientes[8].id, monto: 3500, metodo: "EFECTIVO", estatus: "PAGADO", fechaPago: hace(140), concepto: "Vestidos fiesta temporada" },
    // Hace 4 meses
    { clienteId: clientes[2].id, monto: 18000, metodo: "TRANSFERENCIA", estatus: "PAGADO", fechaPago: hace(120), concepto: "Pedido mayoreo febrero" },
    { clienteId: clientes[5].id, monto: 4200, metodo: "TARJETA", estatus: "PAGADO", fechaPago: hace(110), concepto: "Ropón bautizo" },
    // Hace 3 meses
    { clienteId: clientes[2].id, monto: 15000, metodo: "TRANSFERENCIA", estatus: "PAGADO", fechaPago: hace(90), concepto: "Pedido mayoreo marzo" },
    { clienteId: clientes[8].id, monto: 4800, metodo: "EFECTIVO", estatus: "PAGADO", fechaPago: hace(85), concepto: "Vestidos Semana Santa" },
    // Hace 2 meses
    { clienteId: clientes[2].id, monto: 22000, metodo: "TRANSFERENCIA", estatus: "PAGADO", fechaPago: hace(60), concepto: "Pedido mayoreo abril" },
    { clienteId: clientes[5].id, monto: 5500, metodo: "LIGA_DE_PAGO", estatus: "PAGADO", fechaPago: hace(55), concepto: "Primera comunión" },
    // Hace 1 mes
    { clienteId: clientes[2].id, monto: 25000, metodo: "TRANSFERENCIA", estatus: "PAGADO", fechaPago: hace(30), concepto: "Pedido mayoreo mayo" },
    { clienteId: clientes[8].id, monto: 6000, metodo: "EFECTIVO", estatus: "PAGADO", fechaPago: hace(28), concepto: "Vestidos fin de año escolar" },
    // Este mes
    { clienteId: clientes[7].id, monto: 3000, metodo: "DEPOSITO_ANTICIPO", estatus: "PAGADO", fechaPago: hace(3), concepto: "Anticipo ropón bautizo - Luisa", montoTotal: 5500 },
    { clienteId: clientes[7].id, monto: 2500, metodo: "TRANSFERENCIA", estatus: "PAGADO", fechaPago: hace(1), concepto: "Saldo ropón bautizo - Luisa" },
    // Pagos pendientes y vencidos
    { clienteId: clientes[1].id, monto: 4250, metodo: "LIGA_DE_PAGO", estatus: "VENCIDO", fechaVencimiento: hace(3), concepto: "Adelanto pedido Sofía" },
    { clienteId: clientes[4].id, monto: 1500, metodo: "DEPOSITO_ANTICIPO", estatus: "PENDIENTE", fechaVencimiento: en(5), concepto: "Anticipo traje Alejandra" },
    { clienteId: clientes[0].id, monto: 4500, metodo: "EFECTIVO", estatus: "PENDIENTE", fechaVencimiento: en(10), concepto: "Vestido primera comunión Valeria" },
  ]

  for (const p of pagosHistoricos) {
    await prisma.pago.create({ data: p as any })
  }

  // Crear eventos en línea de tiempo
  await prisma.eventoCliente.createMany({
    data: [
      {
        clienteId: clientes[0].id,
        tipo: "CREACION",
        descripcion: "Cliente creado desde Instagram",
        autorNombre: "María García (Admin)",
        autorId: admin.id,
        fecha: hace(5),
      },
      {
        clienteId: clientes[0].id,
        tipo: "NOTA",
        descripcion: "Busca vestido blanco o marfil talla 10 para primera comunión el 15 de julio",
        autorNombre: "María García (Admin)",
        autorId: admin.id,
        fecha: hace(4),
      },
      {
        clienteId: clientes[0].id,
        tipo: "CITA",
        descripcion: "Cita agendada para medición",
        autorNombre: "María García (Admin)",
        autorId: admin.id,
        fecha: hace(3),
      },
      {
        clienteId: clientes[2].id,
        tipo: "CREACION",
        descripcion: "Cliente VIP Mayorista creado por recomendación",
        autorNombre: "María García (Admin)",
        autorId: admin.id,
        fecha: hace(120),
      },
      {
        clienteId: clientes[7].id,
        tipo: "CAMBIO_ESTADO",
        descripcion: "Marcada como GANADA 🎉 — Compró ropón de bautizo + accesorios $5,500",
        autorNombre: "María García (Admin)",
        autorId: admin.id,
        fecha: hace(3),
      },
      {
        clienteId: clientes[6].id,
        tipo: "CAMBIO_ESTADO",
        descripcion: "Marcada como PERDIDA — Motivo: Se fue con la competencia",
        autorNombre: "Ana López",
        autorId: vendedor.id,
        fecha: hace(30),
      },
    ],
  })

  // Crear recordatorios
  await prisma.recordatorio.createMany({
    data: [
      {
        usuarioId: admin.id,
        clienteId: clientes[0].id,
        titulo: "Confirmar cita con Valeria para medición",
        fecha: en(1),
      },
      {
        usuarioId: vendedor.id,
        clienteId: clientes[1].id,
        titulo: "Llamar a Sofía para seguimiento de propuesta — objeción: pareja",
        fecha: hace(1), // vencido
      },
      {
        usuarioId: admin.id,
        clienteId: clientes[7].id,
        titulo: "Pedir reseña a Luisa en Google o Facebook",
        fecha: en(5),
      },
    ],
  })

  // Plantillas de mensajes del sistema
  await prisma.plantillaMensaje.createMany({
    data: [
      {
        usuarioId: admin.id,
        nombre: "Saludo inicial (Nuevo lead)",
        tipo: "whatsapp",
        etapa: "NUEVO",
        categoria: "seguimiento",
        cuerpo: "Hola {nombre}, gracias por tu interés en Princessitas Ceremonias 👑 ¿Te parece si platicamos un momento para contarte cómo podemos ayudarte con {productoInteres}? ¿Cuándo tienes un momento libre?",
        esGlobal: true,
      },
      {
        usuarioId: admin.id,
        nombre: "Manejo de objeción — 'Lo voy a pensar'",
        tipo: "whatsapp",
        etapa: "PROPUESTA_ENVIADA",
        objecion: "Lo voy a pensar",
        categoria: "objecion",
        cuerpo: "Hola {nombre}, entiendo perfectamente que quieras pensarlo bien 😊 Solo quería comentarte que los vestidos de esa temporada tienen disponibilidad limitada y normalmente se apartan con anticipación. ¿Te gustaría que separáramos el tuyo con un anticipo pequeño para asegurar la talla?",
        esGlobal: true,
      },
      {
        usuarioId: admin.id,
        nombre: "Manejo de objeción — 'Tengo que consultarlo'",
        tipo: "whatsapp",
        etapa: "PROPUESTA_ENVIADA",
        objecion: "Tengo que consultarlo con mi pareja/socio",
        categoria: "objecion",
        cuerpo: "Con mucho gusto, {nombre} 😊 ¿Quieres que te mande un resumen por escrito con fotos para que lo puedan ver juntos? Así tienen todo a la mano cuando lo platiquen.",
        esGlobal: true,
      },
      {
        usuarioId: admin.id,
        nombre: "Reactivar cliente frío",
        tipo: "whatsapp",
        etapa: "CONTACTADO",
        categoria: "seguimiento",
        cuerpo: "Hola {nombre}, ¿cómo estás? Te escribo porque recibimos modelos nuevos que creo que te van a encantar para el evento. ¿Te puedo mandar algunas fotos para que los veas?",
        esGlobal: true,
      },
      {
        usuarioId: admin.id,
        nombre: "Cierre con urgencia — disponibilidad limitada",
        tipo: "whatsapp",
        etapa: "PROPUESTA_ENVIADA",
        categoria: "cierre",
        cuerpo: "Hola {nombre}, te escribo porque el modelo que viste tiene solo 2 piezas en talla {tallas}. Esta semana tenemos algunas clientes preguntando por él. ¿Lo dejamos apartado hoy con un anticipo para que sea tuyo?",
        esGlobal: true,
      },
      {
        usuarioId: admin.id,
        nombre: "Pedir referido (post-venta)",
        tipo: "whatsapp",
        etapa: "CLIENTE_NUEVO",
        categoria: "cierre",
        cuerpo: "Hola {nombre}, espero que todo haya salido hermoso en el evento 💜 Me encantaría pedirte un pequeño favor: si conoces a alguien más que esté buscando vestidos o ropones, me ayudaría mucho si nos recomiendas. ¡Para ti hay un descuento especial en tu próxima compra!",
        esGlobal: true,
      },
      {
        usuarioId: admin.id,
        nombre: "Cobrar pago vencido",
        tipo: "whatsapp",
        etapa: "CLIENTE_NUEVO",
        categoria: "seguimiento",
        cuerpo: "Hola {nombre}, te escribo para recordarte el pago pendiente de ${valor}. ¿Cuándo te viene bien realizarlo? Puedes hacerlo por transferencia, con tarjeta o en efectivo cuando vengas a recoger.",
        esGlobal: true,
      },
    ],
  })

  console.log("✅ Datos de muestra creados exitosamente.")
  console.log("")
  console.log("👑 DATOS DE ACCESO:")
  console.log("   Admin:    admin@princessitas.mx  /  Admin2026!")
  console.log("   Vendedor: ana@princessitas.mx    /  Vendedor2026!")
  console.log("")
  console.log("🌐 Corre 'npm run dev' y abre http://localhost:3000")
}

main()
  .catch((e) => {
    console.error("❌ Error en el seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
