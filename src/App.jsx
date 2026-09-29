import { useState, useEffect } from 'react'
import { PawPrint, Calendar, Heart, AlertTriangle, MapPin, X, Send, Menu } from 'lucide-react'
import logoNevado from './assets/Logo_Nevado.png'
import imagenHero from './assets/Hero.jpg'

// URL del backend: en local viene de .env; en Netlify, de sus variables de entorno
const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// POST JSON al backend; si no responde 2xx lanza un error con el mensaje del servidor
async function enviarAlBackend(ruta, cuerpo) {
  const res = await fetch(`${API}${ruta}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo),
  })
  if (!res.ok) {
    const datos = await res.json().catch(() => ({}))
    throw new Error(datos.mensaje || 'No se pudo enviar la información. Intenta de nuevo.')
  }
  return res.json()
}

// ─── VALORES POR DEFECTO (se reemplazan con el contenido publicado desde el panel)

const HERO_INICIAL = {
  badge: 'Fundación de Rescate Animal',
  titulo_inicio: 'Dale una ',
  titulo_acento: 'segunda oportunidad',
  titulo_fin: ' a quien lo necesita.',
  descripcion: 'Trabajamos incansablemente para brindar atención médica, resguardo y familias amorosas a la fauna vulnerable en La Grita - Táchira.',
  imagen_url: null,
  imagen_frontal_url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
}

// Valores por defecto de las secciones editables desde el panel (Contenido Web)
const ESTADISTICAS_INICIALES = [
  { valor: '+850', etiqueta: 'Rescates Exitosos' },
  { valor: '+420', etiqueta: 'Familias Encontradas' },
  { valor: '24/7', etiqueta: 'Atención Continua' },
]

const CONTACTO_INICIAL = {
  descripcion: 'Protegiendo la vida animal y gestionando rescates a través de la plataforma SISCVI.',
  direccion: 'La Grita, Municipio Jáuregui, Edo. Táchira',
  telefono: '0414-7599094',
  email: 'soporte@sisvic.org.ve',
  horario: 'Lunes a Sábado: 8:00 AM — 5:00 PM',
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function calcularEdad(fechaNac) {
  if (!fechaNac) return 'Edad desconocida'
  const nac = new Date(fechaNac + 'T00:00:00')
  const hoy = new Date()
  const meses = (hoy.getFullYear() - nac.getFullYear()) * 12 + (hoy.getMonth() - nac.getMonth())
  if (meses < 1) return 'Recién nacido'
  if (meses < 12) return `${meses} ${meses === 1 ? 'mes' : 'meses'}`
  const años = Math.floor(meses / 12)
  return `${años} ${años === 1 ? 'año' : 'años'}`
}

function formatearFecha(fechaISO) {
  if (!fechaISO) return ''
  const [año, mes, dia] = fechaISO.split('-')
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  return `${parseInt(dia)} de ${meses[parseInt(mes) - 1]}, ${año}`
}

const eInputPub = (dm) =>
  `w-full border p-3.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2D6A4F] transition-all ${dm ? 'bg-[#1a1e22] border-slate-700 text-white placeholder-slate-400' : 'bg-white border-gray-200 text-[#212529] placeholder-gray-400 shadow-sm'
  }`

// ─── BADGE DE DISPONIBILIDAD ──────────────────────────────────────────────────

function BadgeDisponibilidad({ estado }) {
  if (estado === 'DISPONIBLE') return (
    <span className="inline-flex items-center gap-1.5 bg-emerald-500/90 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm tracking-wide uppercase">
      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
      Disponible
    </span>
  )
  if (estado === 'EN PROCESO') return (
    <span className="inline-flex items-center gap-1.5 bg-amber-500/90 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm tracking-wide uppercase">
      <span className="w-1.5 h-1.5 rounded-full bg-white" />
      En Proceso
    </span>
  )
  return null
}

// ─── NAVBAR PÚBLICA ───────────────────────────────────────────────────────────

function NavbarPublica({ dm, toggleDm }) {
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false)
  const enlaces = ['Inicio', 'Adopciones', 'Jornadas', 'Voluntariado', 'Seguimiento', 'Denuncias']

  const botonDm = (
    <button onClick={toggleDm}
      className={`p-2.5 rounded-full border transition-all hover:scale-110 shrink-0 ${dm ? 'border-[#D4AC4E]/30 bg-[#212529] text-[#D4AC4E]' : 'border-[#2D6A4F]/20 bg-white/40 text-[#2D6A4F]'
        }`}
      title={dm ? 'Modo claro' : 'Modo oscuro'}
    >
      {dm
        ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
      }
    </button>
  )

  return (
    <nav className={`fixed w-full top-0 z-50 backdrop-blur-lg border-b transition-colors duration-300 ${dm ? 'bg-[#121416]/70 border-white/5' : 'bg-[#FFEFD1]/50 border-[#2D6A4F]/10'
      }`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-2 flex justify-between items-center">
        <img src={logoNevado} alt="Logo Misión Nevado" className="h-12 md:h-16 lg:h-20 object-contain drop-shadow-sm" />

        {/* ── Desktop: enlaces centrados ── */}
        <div className={`hidden md:flex gap-0.5 font-semibold text-sm ${dm ? 'text-slate-200' : 'text-[#212529]'}`}>
          {enlaces.map(enlace => (
            <a key={enlace} href={`#${enlace.toLowerCase()}`}
              className={`px-4 py-2 rounded-full transition-all ${dm ? 'hover:bg-white/10' : 'hover:bg-[#2D6A4F]/10'}`}>
              {enlace}
            </a>
          ))}
        </div>

        {/* ── Desktop: toggle modo ── */}
        <div className="hidden md:flex">{botonDm}</div>

        {/* ── Móvil: toggle modo + hamburguesa ── */}
        <div className="flex md:hidden items-center gap-2">
          {botonDm}
          <button
            onClick={() => setMenuMovilAbierto(v => !v)}
            className={`p-2.5 rounded-full border transition-all ${dm ? 'border-white/10 bg-white/5 text-white' : 'border-[#2D6A4F]/20 bg-white/40 text-[#2D6A4F]'
              }`}
            aria-label="Menú"
          >
            {menuMovilAbierto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Menú desplegable móvil ── */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuMovilAbierto ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
        <div className={`px-4 pb-4 pt-2 flex flex-col gap-1 border-t ${dm ? 'bg-[#121416]/95 border-white/5' : 'bg-[#FFEFD1]/95 border-[#2D6A4F]/10'
          }`}>
          {enlaces.map(enlace => (
            <a key={enlace}
              href={`#${enlace.toLowerCase()}`}
              onClick={() => setMenuMovilAbierto(false)}
              className={`px-4 py-3 rounded-xl font-semibold text-sm transition-all ${dm
                ? 'text-slate-200 hover:bg-white/10'
                : 'text-[#212529] hover:bg-[#2D6A4F]/10'
                }`}
            >
              {enlace}
            </a>
          ))}
        </div>
      </div>
    </nav>
  )
}

// ─── TARJETA DE ADOPCIÓN ──────────────────────────────────────────────────────

// Fotos de Cloudinary: se piden a un ancho razonable, en formato y calidad automáticos
// (sin recortar). Cualquier otra URL se usa tal cual.
const optimizarFoto = (url) =>
  typeof url === 'string' && url.includes('res.cloudinary.com') && url.includes('/upload/')
    ? url.replace('/upload/', '/upload/w_700,c_limit,f_auto,q_auto/')
    : url

function TarjetaAdopcion({ dm, paciente, onSolicitar }) {
  const disponible = paciente.ADOPCI_ST === 'DISPONIBLE'
  const edad = calcularEdad(paciente.ADOPCI_FN)

  return (
    <div className={`rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden backdrop-blur-md ${dm ? 'bg-[#1a1e22]/90 border border-white/8' : 'bg-white/90 border border-slate-200'
      }`}>
      {/* Imagen — alto fijo igual en todas las tarjetas; la foto se ve completa
          (sin recortes) sobre un fondo difuminado de la misma imagen */}
      <div className="relative h-64 overflow-hidden group bg-gray-100">
        <img src={optimizarFoto(paciente.ADOPCI_FT)} alt="" aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-70" />
        <img src={optimizarFoto(paciente.ADOPCI_FT)} alt={paciente.ADOPCI_NO}
          className="relative w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute top-3 left-3"><BadgeDisponibilidad estado={paciente.ADOPCI_ST} /></div>
        <div className="absolute top-3 right-3">
          <span className="bg-[#D4AC4E] text-[#212529] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
            {paciente.ADOPCI_ES === 'Canino' ? '🐕 Perro' : '🐱 Gato'}
          </span>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className={`text-xl font-black mb-0.5 ${dm ? 'text-white' : 'text-gray-900'}`}>{paciente.ADOPCI_NO}</h3>
        <p className={`text-xs font-medium mb-3 ${dm ? 'text-slate-400' : 'text-gray-500'}`}>
          {paciente.ADOPCI_RA} · {paciente.ADOPCI_CO}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {[edad, paciente.ADOPCI_SE, paciente.ADOPCI_PE ? `${paciente.ADOPCI_PE} kg` : null].filter(Boolean).map(etq => (
            <span key={etq} className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${dm ? 'bg-white/8 text-slate-300 border-white/10' : 'bg-gray-50 text-gray-700 border-gray-200'
              }`}>
              {etq}
            </span>
          ))}
        </div>

        <p className={`text-sm leading-relaxed line-clamp-3 mb-4 flex-grow ${dm ? 'text-slate-400' : 'text-gray-600'}`}>
          {paciente.ADOPCI_DE}
        </p>

        <button
          onClick={() => disponible && onSolicitar(paciente)}
          disabled={!disponible}
          className={`w-full py-3 rounded-xl font-bold text-sm flex justify-center items-center gap-2 transition-all ${disponible
            ? 'bg-[#D4AC4E] text-[#212529] hover:bg-[#c49b3d] hover:shadow-md cursor-pointer'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
        >
          <PawPrint className="w-4 h-4" />
          {disponible ? 'Quiero Adoptarlo' : 'En Proceso de Adopción'}
        </button>
      </div>
    </div>
  )
}

// ─── MODAL DE ADOPCIÓN ────────────────────────────────────────────────────────

function ModalAdopcion({ dm, paciente, onCerrar, onEnviada }) {
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [datos, setDatos] = useState({ nombre: '', email: '', telefono: '', mensaje: '' })

  const cambiar = ({ target: { name, value } }) => setDatos(p => ({ ...p, [name]: value }))

  const enviar = async (e) => {
    e.preventDefault()
    setEnviando(true)
    try {
      await enviarAlBackend('/adopciones/solicitudes', { ADOPCI_ID: paciente.ADOPCI_ID, ...datos })
      setEnviado(true)
      onEnviada?.(paciente.ADOPCI_ID)
    } catch (err) { alert(err.message) }
    finally { setEnviando(false) }
  }

  const cardBg = dm ? 'bg-[#1e2226] border-white/10' : 'bg-white border-gray-200'
  const eI = eInputPub(dm)

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`${cardBg} rounded-2xl max-w-md w-full relative shadow-2xl border`}>
        <button onClick={onCerrar}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <X className="w-4 h-4" />
        </button>

        <div className="p-6">
          {enviado ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-[#2D6A4F]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-[#2D6A4F]" />
              </div>
              <h3 className={`text-2xl font-black mb-2 ${dm ? 'text-white' : 'text-[#2D6A4F]'}`}>¡Solicitud Enviada!</h3>
              <p className={`text-sm leading-relaxed mb-6 ${dm ? 'text-slate-300' : 'text-gray-600'}`}>
                Recibimos tu solicitud para adoptar a <strong>{paciente.ADOPCI_NO}</strong>.
                Nuestro equipo se comunicará contigo muy pronto. ¡Gracias por abrir tu corazón!
              </p>
              <button onClick={onCerrar}
                className="w-full bg-[#2D6A4F] text-white py-3.5 rounded-xl font-bold hover:opacity-90 transition-all">
                Volver a la Cartelera
              </button>
            </div>
          ) : (
            <>
              {/* Cabecera con info del paciente */}
              <div className="flex items-center gap-4 mb-5">
                <img src={paciente.ADOPCI_FT} alt={paciente.ADOPCI_NO}
                  className="w-16 h-16 rounded-xl object-cover border-2 border-[#D4AC4E]/40 shrink-0" />
                <div>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${dm ? 'text-slate-400' : 'text-gray-400'}`}>
                    Solicitud de adopción
                  </p>
                  <h3 className={`text-lg font-black ${dm ? 'text-white' : 'text-gray-900'}`}>{paciente.ADOPCI_NO}</h3>
                  <p className={`text-xs ${dm ? 'text-slate-400' : 'text-gray-500'}`}>
                    {paciente.ADOPCI_ES} · {paciente.ADOPCI_RA} · {paciente.ADOPCI_SE}
                  </p>
                </div>
              </div>

              <form onSubmit={enviar} className="space-y-3">
                <input type="text" name="nombre" placeholder="Tu nombre completo" required value={datos.nombre} onChange={cambiar} className={eI} />
                <input type="email" name="email" placeholder="Correo electrónico" required value={datos.email} onChange={cambiar} className={eI} />
                <input type="tel" name="telefono" placeholder="Teléfono de contacto" required value={datos.telefono} onChange={cambiar} className={eI} />
                <textarea name="mensaje" rows={3}
                  placeholder="Cuéntanos por qué quieres adoptar a este paciente (opcional)"
                  value={datos.mensaje} onChange={cambiar}
                  className={eI + ' resize-none'} />
                <button type="submit" disabled={enviando}
                  className="w-full bg-[#2D6A4F] text-white py-3.5 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  <Send className="w-4 h-4" />
                  {enviando ? 'Enviando...' : 'Enviar Solicitud'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── TARJETA DE JORNADA ───────────────────────────────────────────────────────

function TarjetaJornada({ dm, jornada }) {
  return (
    <div className={`rounded-2xl p-7 border flex flex-col sm:flex-row gap-6 items-start transition-all hover:shadow-lg ${dm ? 'bg-[#1a1e22]/90 border-white/8' : 'bg-white/80 border-slate-200 shadow-sm'
      }`}>
      <div className="w-16 h-16 bg-[#D4AC4E] rounded-2xl flex items-center justify-center shrink-0 shadow-sm rotate-3">
        <Calendar className="w-7 h-7 text-[#212529]" />
      </div>
      <div>
        <h3 className={`text-lg font-bold mb-2 ${dm ? 'text-white' : 'text-[#212529]'}`}>{jornada.JORNAD_NO}</h3>
        <div className="flex flex-col gap-1.5 mb-3">
          <p className="text-[#D4AC4E] font-bold text-sm flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatearFecha(jornada.JORNAD_FE)}
          </p>
          <p className={`text-sm font-medium flex items-center gap-1.5 ${dm ? 'text-slate-300' : 'text-slate-700'}`}>
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            {jornada.SECTOR_NO}
          </p>
        </div>
        <p className={`text-sm leading-relaxed ${dm ? 'text-slate-400' : 'text-gray-600'}`}>{jornada.JORNAD_DE}</p>
      </div>
    </div>
  )
}

// ─── SECCIÓN REGISTRO (VOLUNTARIO / PROTECCIONISTA) ───────────────────────────

function SeccionRegistro({ dm }) {
  const [tipoActivo, setTipoActivo] = useState(null)
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const eI = eInputPub(dm)
  const eL = `block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${dm ? 'text-slate-400' : 'text-slate-500'}`
  const h4 = `text-base font-bold border-b pb-3 mb-5 ${dm ? 'border-white/10 text-white' : 'border-slate-200 text-[#212529]'}`

  const handleToggle = (tipo) => {
    setTipoActivo(prev => prev === tipo ? null : tipo)
    setEnviado(false)
  }

  const enviar = async (e) => {
    e.preventDefault()
    setEnviando(true)
    const datos = Object.fromEntries(new FormData(e.target))
    const endpoint = tipoActivo === 'Voluntario' ? '/voluntarios' : '/proteccionistas'
    try {
      await enviarAlBackend(endpoint, datos)
      setEnviado(true)
    } catch (err) { alert(err.message) }
    finally { setEnviando(false) }
  }

  const cardBg = `rounded-3xl border-t-8 border-t-[#D4AC4E] border p-8 md:p-10 ${dm ? 'bg-[#1a1e22]/90 border-white/8' : 'bg-white/80 border-slate-200 shadow-sm'
    }`

  return (
    <section className={`py-12 md:py-24 border-t transition-colors duration-300 ${dm ? 'border-white/5' : 'border-slate-200/60'}`} id="voluntariado">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-8 md:mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D4AC4E]/40 bg-[#D4AC4E]/10 text-[#D4AC4E] text-xs font-bold mb-4">
            Uniendo Esfuerzos
          </span>
          <h2 className={`text-2xl sm:text-4xl font-extrabold mb-4 ${dm ? 'text-white' : 'text-[#212529]'}`}>Portal de Registro Oficial</h2>
          <p className={`max-w-2xl mx-auto text-lg ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
            Únete a nuestra red de apoyo solidario. Haz clic en el perfil que mejor te describa para iniciar tu postulación.
          </p>
        </div>

        {/* Botones de selección */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          {['Proteccionista', 'Voluntario'].map(tipo => (
            <button key={tipo} type="button" onClick={() => handleToggle(tipo)}
              className={`px-8 py-4 rounded-2xl font-bold border transition-all duration-300 hover:scale-[1.02] ${tipoActivo === tipo
                ? 'bg-[#D4AC4E] text-[#212529] border-[#D4AC4E] ring-4 ring-[#D4AC4E]/20'
                : dm ? 'border-slate-700 text-slate-300 hover:border-slate-500' : 'border-slate-300 text-slate-600 hover:border-slate-400'
                }`}>
              Soy {tipo}
            </button>
          ))}
        </div>

        {/* Formulario desplegable */}
        <div className={`overflow-hidden transition-all duration-500 ${tipoActivo ? 'max-h-[4000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className={`max-w-4xl mx-auto mt-2 ${cardBg}`}>
            {enviado ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-[#D4AC4E]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-[#D4AC4E]" />
                </div>
                <h3 className={`text-2xl font-black mb-2 ${dm ? 'text-white' : 'text-[#2D6A4F]'}`}>¡Registro Exitoso!</h3>
                <p className={`text-sm mb-6 ${dm ? 'text-slate-300' : 'text-gray-600'}`}>
                  Gracias por postularte como {tipoActivo}. Nuestro equipo evaluará tu perfil y se comunicará contigo en breve.
                </p>
                <button onClick={() => setEnviado(false)}
                  className="bg-[#D4AC4E] text-[#212529] px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition-all">
                  Registrar otra postulación
                </button>
              </div>
            ) : (
              <form onSubmit={enviar} className="space-y-8">

                {tipoActivo === 'Voluntario' && (
                  <>
                    <div>
                      <h4 className={h4}>Datos Personales y Contacto</h4>
                      <div className="grid md:grid-cols-2 gap-5">
                        <div><label className={eL}>Nombres Completos</label><input name="VOLUN_NO" placeholder="Ej: Ana María Pérez" required className={eI} /></div>
                        <div><label className={eL}>Cédula de Identidad</label><input name="VOLUN_CI" placeholder="V-12345678" required className={eI} /></div>
                        <div><label className={eL}>Teléfono Principal</label><input name="VOLUN_TP" placeholder="0414-1234567" required className={eI} /></div>
                        <div><label className={eL}>Teléfono Secundario</label><input name="VOLUN_TS" placeholder="0277-1234567" className={eI} /></div>
                        <div className="md:col-span-2"><label className={eL}>Correo Electrónico (opcional)</label><input type="email" name="VOLUN_EM" placeholder="usuario@correo.com" className={eI} /></div>
                        <div className="md:col-span-2"><label className={eL}>Organización Social</label><input name="VOLUN_OS" placeholder="Ej: Fundación Huellas" className={eI} /></div>
                      </div>
                    </div>
                    <div>
                      <h4 className={h4}>Ubicación</h4>
                      <div className="grid md:grid-cols-2 gap-5">
                        <div><label className={eL}>Estado / Municipio</label><input name="VOLUN_ES" placeholder="Táchira / Jáuregui" required className={eI} /></div>
                        <div><label className={eL}>Parroquia</label><input name="VOLUN_PA" placeholder="La Grita" required className={eI} /></div>
                        <div><label className={eL}>Nombre de la Comuna</label><input name="VOLUN_CO" placeholder="Ej: Comuna El Sol" className={eI} /></div>
                        <div><label className={eL}>Consejo Comunal</label><input name="VOLUN_CC" placeholder="Ej: Consejo Las Flores" className={eI} /></div>
                        <div className="md:col-span-2"><label className={eL}>Dirección Exacta</label><input name="VOLUN_DI" placeholder="Calle 3, Casa #15" required className={eI} /></div>
                      </div>
                    </div>
                    <div>
                      <h4 className={h4}>Redes Sociales</h4>
                      <div className="grid md:grid-cols-2 gap-5">
                        <div><label className={eL}>Instagram</label><input name="VOLUN_IG" placeholder="@usuario" className={eI} /></div>
                        <div><label className={eL}>TikTok</label><input name="VOLUN_TK" placeholder="@usuario" className={eI} /></div>
                        <div><label className={eL}>Facebook</label><input name="VOLUN_FB" placeholder="Perfil o página" className={eI} /></div>
                        <div><label className={eL}>X (Twitter)</label><input name="VOLUN_TW" placeholder="@usuario" className={eI} /></div>
                      </div>
                    </div>
                  </>
                )}

                {tipoActivo === 'Proteccionista' && (
                  <>
                    <div>
                      <h4 className={h4}>Ubicación</h4>
                      <div className="grid md:grid-cols-2 gap-5">
                        <div><label className={eL}>Estado / Municipio</label><input name="PRTEC_ES" placeholder="Táchira / Jáuregui" required className={eI} /></div>
                        <div><label className={eL}>Parroquia</label><input name="PRTEC_PA" placeholder="La Grita" required className={eI} /></div>
                        <div><label className={eL}>Nombre de la Comuna</label><input name="PRTEC_CO" placeholder="Ej: Comuna El Sol" className={eI} /></div>
                        <div><label className={eL}>Consejo Comunal</label><input name="PRTEC_CC" placeholder="Ej: Consejo Las Flores" className={eI} /></div>
                      </div>
                    </div>
                    <div>
                      <h4 className={h4}>Datos del Responsable</h4>
                      <div className="grid md:grid-cols-3 gap-5">
                        <div><label className={eL}>Nombres Completos</label><input name="PRTEC_NO" placeholder="Ana María Pérez" required className={eI} /></div>
                        <div><label className={eL}>Cédula</label><input name="PRTEC_CI" placeholder="V-12345678" required className={eI} /></div>
                        <div><label className={eL}>Teléfono</label><input name="PRTEC_TP" placeholder="0414-1234567" required className={eI} /></div>
                        <div className="md:col-span-3"><label className={eL}>Correo Electrónico (opcional)</label><input type="email" name="PRTEC_EM" placeholder="usuario@correo.com" className={eI} /></div>
                      </div>
                    </div>
                    <div>
                      <h4 className={h4}>Datos de la Organización</h4>
                      <div className="grid md:grid-cols-2 gap-5">
                        <div>
                          <label className={eL}>Tipo de Organización</label>
                          <select name="PRTEC_TI" required className={eI}>
                            <option value="Independiente">Independiente</option>
                            <option value="Fundación">Fundación</option>
                          </select>
                        </div>
                        <div><label className={eL}>Nombre Oficial</label><input name="PRTEC_ON" placeholder="Ej: Fundación Huellas" className={eI} /></div>
                        <div><label className={eL}>RIF</label><input name="PRTEC_RF" placeholder="J-12345678-9" className={eI} /></div>
                        <div><label className={eL}>Dirección</label><input name="PRTEC_DI" placeholder="Av. Principal, Local 5" required className={eI} /></div>
                      </div>
                    </div>
                    <div>
                      <h4 className={h4}>Animales que Protege</h4>
                      <div className="grid md:grid-cols-3 gap-5">
                        <div><label className={eL}>Caninos</label><input type="number" min="0" name="PRTEC_CA" placeholder="0" required className={eI} /></div>
                        <div><label className={eL}>Felinos</label><input type="number" min="0" name="PRTEC_CF" placeholder="0" required className={eI} /></div>
                        <div><label className={eL}>Otras Especies</label><input type="number" min="0" name="PRTEC_CX" placeholder="0" required className={eI} /></div>
                      </div>
                    </div>
                    <div>
                      <h4 className={h4}>Redes Sociales</h4>
                      <div className="grid md:grid-cols-2 gap-5">
                        <div><label className={eL}>Instagram</label><input name="PRTEC_IG" placeholder="@usuario" className={eI} /></div>
                        <div><label className={eL}>TikTok</label><input name="PRTEC_TK" placeholder="@usuario" className={eI} /></div>
                        <div><label className={eL}>Facebook</label><input name="PRTEC_FB" placeholder="Perfil o página" className={eI} /></div>
                        <div><label className={eL}>X (Twitter)</label><input name="PRTEC_TW" placeholder="@usuario" className={eI} /></div>
                      </div>
                    </div>
                  </>
                )}

                <button type="submit" disabled={enviando}
                  className="w-full bg-[#D4AC4E] text-[#212529] py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50">
                  <Send className="w-5 h-5" />
                  {enviando ? 'Enviando...' : 'Enviar Postulación Oficial'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── SECCIÓN SEGUIMIENTO ──────────────────────────────────────────────────────

function SeccionSeguimiento({ dm }) {
  const [email, setEmail] = useState('')
  const [resultado, setResultado] = useState(null)
  const [buscado, setBuscado] = useState(false)
  const [buscando, setBuscando] = useState(false)

  const buscar = async (e) => {
    e.preventDefault()
    setBuscando(true)
    setBuscado(false)
    try {
      // Acepta cédula o correo; el backend devuelve todos los trámites de la persona
      const res = await fetch(`${API}/seguimiento?email=${encodeURIComponent(email.trim())}`)
      if (res.ok) { const datos = await res.json(); setResultado(datos.tramites?.length ? datos.tramites : null) }
      else setResultado(null)
    } catch { setResultado(null) }
    finally { setBuscado(true); setBuscando(false) }
  }

  const BADGE_ESTADO = {
    'Aprobado': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Completado': 'bg-sky-100     text-sky-700     border-sky-200',
    'En espera': 'bg-amber-100   text-amber-700   border-amber-200',
    'Pendiente': 'bg-amber-100   text-amber-700   border-amber-200',
  }

  const cardBg = `p-8 rounded-3xl border ${dm ? 'bg-[#1a1e22]/90 border-white/8' : 'bg-white/80 border-slate-200 shadow-sm'}`

  return (
    <section className={`py-12 md:py-24 border-t transition-colors duration-300 ${dm ? 'border-white/5 bg-[#121416]/30' : 'border-slate-200/60 bg-white/50'}`} id="seguimiento">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <div className="text-center mb-8 md:mb-10">
          <h2 className={`text-2xl sm:text-4xl font-extrabold mb-4 ${dm ? 'text-white' : 'text-[#212529]'}`}>Consulta de Seguimiento</h2>
          <p className={`text-lg ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
            Verifica el estado de tu gestión o colaboración ingresando tu cédula o correo electrónico.
          </p>
        </div>

        <div className={cardBg}>
          <form onSubmit={buscar} className="flex flex-col md:flex-row gap-3">
            <input type="text" placeholder="Ej: V-12345678 o usuario@correo.com"
              value={email} onChange={e => setEmail(e.target.value)} required
              className={eInputPub(dm) + ' flex-1'} />
            <button type="submit" disabled={buscando}
              className="bg-[#2D6A4F] text-white px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {buscando ? 'Buscando...' : 'Consultar Estado'}
            </button>
          </form>

          {buscado && resultado && resultado.map((tramite, i) => (
            <div key={i} className={`mt-6 p-5 rounded-2xl border ${dm ? 'bg-[#121416] border-white/8' : 'bg-white border-gray-100 shadow-sm'}`}>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${dm ? 'text-slate-400' : 'text-gray-400'}`}>Trámite encontrado</p>
                  <h4 className={`text-lg font-bold ${dm ? 'text-white' : 'text-gray-900'}`}>{tramite.tipo}</h4>
                  <p className={`text-sm mt-0.5 ${dm ? 'text-slate-400' : 'text-gray-500'}`}>
                    Fecha de registro: <span className="font-medium">{tramite.fecha}</span>
                  </p>
                </div>
                <span className={`text-xs font-bold px-4 py-2 rounded-full border shrink-0 ${BADGE_ESTADO[tramite.estado] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                  {tramite.estado}
                </span>
              </div>
            </div>
          ))}

          {buscado && !resultado && (
            <div className={`mt-6 p-5 rounded-2xl border ${dm ? 'bg-[#121416] border-white/8' : 'bg-white border-gray-100 shadow-sm'}`}>
              <div className="text-center py-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${dm ? 'bg-slate-800' : 'bg-gray-100'}`}>
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className={`font-medium ${dm ? 'text-slate-300' : 'text-gray-700'}`}>
                  No encontramos ningún trámite para "{email}"
                </p>
                <p className={`text-sm mt-1 ${dm ? 'text-slate-500' : 'text-gray-400'}`}>
                  Verifica la cédula o el correo e intenta nuevamente.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── SECCIÓN DENUNCIAS ────────────────────────────────────────────────────────

function SeccionDenuncias({ dm }) {
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [anonimo, setAnonimo] = useState(false)
  const [sectores, setSectores] = useState([])

  // Sectores reales de la base de datos (TM_SECTOR)
  useEffect(() => {
    fetch(`${API}/catalogos/sectores`)
      .then(res => (res.ok ? res.json() : { registros: [] }))
      .then(datos => setSectores(datos.registros ?? []))
      .catch(() => setSectores([]))
  }, [])

  const eI = eInputPub(dm)
  const eL = `block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${dm ? 'text-slate-400' : 'text-slate-500'}`

  const enviar = async (e) => {
    e.preventDefault()
    setEnviando(true)
    const datos = Object.fromEntries(new FormData(e.target))
    try {
      await enviarAlBackend('/denuncias', datos)
      setEnviado(true)
    } catch (err) { alert(err.message) }
    finally { setEnviando(false) }
  }

  const cardBg = `max-w-3xl mx-auto p-8 md:p-10 rounded-3xl border-t-8 border-t-[#E76F51] border ${dm ? 'bg-[#1a1e22]/90 border-white/8' : 'bg-white/80 border-slate-200 shadow-sm'
    }`

  return (
    <section className={`py-12 md:py-24 border-t transition-colors duration-300 ${dm ? 'border-white/5' : 'border-slate-200/60'}`} id="denuncias">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#E76F51]/30 bg-[#E76F51]/10 text-[#E76F51] text-xs font-bold mb-4">
            <AlertTriangle className="w-3.5 h-3.5" /> Atención a la Comunidad
          </span>
          <h2 className={`text-2xl sm:text-4xl font-extrabold mb-4 ${dm ? 'text-white' : 'text-[#212529]'}`}>Recepción de Denuncias</h2>
          <p className={`max-w-2xl mx-auto text-lg ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
            Reporta casos de maltrato, abandono o situaciones de riesgo animal.
            Tu denuncia es fundamental para accionar nuestros equipos de rescate.
          </p>
        </div>

        <div className={cardBg}>
          {enviado ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#E76F51]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#E76F51]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-[#E76F51] mb-2">¡Denuncia Recibida!</h3>
              <p className={`text-sm leading-relaxed mb-6 ${dm ? 'text-slate-300' : 'text-gray-600'}`}>
                Registramos tu reporte exitosamente. Nuestro equipo evaluará la situación a la brevedad.
                Gracias por ser la voz de quienes no la tienen.
              </p>
              <button onClick={() => setEnviado(false)}
                className="w-full bg-[#E76F51] text-white py-3.5 rounded-xl font-bold hover:opacity-90 transition-all">
                Registrar otro reporte
              </button>
            </div>
          ) : (
            <form onSubmit={enviar} className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={eL}>Cédula del Denunciante</label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                    <input type="checkbox" checked={anonimo} onChange={e => setAnonimo(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[#E76F51] focus:ring-[#E76F51] cursor-pointer" />
                    <span className={dm ? 'text-slate-300' : 'text-slate-600'}>Reporte Anónimo</span>
                  </label>
                </div>
                <input type="text" name="PERSON_ID" disabled={anonimo}
                  placeholder={anonimo ? 'Reporte anónimo' : 'Ej: V-12345678'}
                  className={eI + (anonimo ? ' opacity-40 cursor-not-allowed' : '')} />
              </div>

              <div>
                <label className={eL}>Correo para recibir novedades (opcional)</label>
                <input type="email" name="DENUNC_EM" placeholder="usuario@correo.com" className={eI} />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={eL}>Sector o Comunidad</label>
                  <select name="SECTOR_ID" required className={eI}>
                    <option value="">Seleccione un sector...</option>
                    {sectores.map(s => (
                      <option key={s.sector_id} value={s.sector_id}>{s.sector_no}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={eL}>Fecha del Reporte</label>
                  <input type="date" name="DENUNC_FE" required
                    defaultValue={new Date().toISOString().slice(0, 10)} className={eI} />
                </div>
              </div>

              <div>
                <label className={eL}>Motivo y Detalles de la Denuncia</label>
                <textarea name="DENUNC_MO" rows={4} required
                  placeholder="Describe detalladamente la situación (animales involucrados, dirección exacta, estado físico, etc.)"
                  className={eI + ' resize-none'} />
              </div>

              <button type="submit" disabled={enviando}
                className="w-full bg-[#E76F51] text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50">
                <Send className="w-5 h-5" />
                {enviando ? 'Enviando...' : 'Procesar Denuncia Oficial'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── PIE DE PÁGINA ────────────────────────────────────────────────────────────

function PiePublico({ dm, contacto = CONTACTO_INICIAL }) {
  const tLink = dm ? 'text-slate-400 hover:text-[#D4AC4E]' : 'text-[#212529]/60 hover:text-[#2D6A4F]'
  const tHead = dm ? 'text-[#D4AC4E]' : 'text-[#2D6A4F]'
  const tBody = dm ? 'text-slate-400' : 'text-[#212529]/70'
  const iconBg = dm
    ? 'bg-white/10 text-[#D4AC4E] hover:bg-[#D4AC4E] hover:text-[#121416]'
    : 'bg-[#2D6A4F]/10 text-[#2D6A4F] hover:bg-[#2D6A4F] hover:text-white'

  const ICONOS_REDES = {
    Facebook: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
    Instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
    Twitter: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z',
  }

  return (
    <footer className={`relative pt-16 pb-8 border-t backdrop-blur-xl transition-colors ${dm ? 'bg-[#121416]/40 border-white/5' : 'bg-white/40 border-white/60 shadow-[0_-15px_40px_-15px_rgba(0,0,0,0.03)]'
      }`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 mb-10">

        <div className="flex flex-col gap-4">
          <img src={logoNevado} alt="Logo Misión Nevado" className="h-14 object-contain w-fit drop-shadow-sm" />
          <p className={`text-sm leading-relaxed ${tBody}`}>
            {contacto.descripcion}
          </p>
        </div>

        <div>
          <h4 className={`font-bold mb-5 ${tHead}`}>Accesos Rápidos</h4>
          <ul className={`text-sm flex flex-col gap-2.5 ${tBody}`}>
            {[['inicio', 'Volver al Inicio'], ['adopciones', 'Cartelera de Adopciones'], ['seguimiento', 'Seguimiento de Trámites'], ['denuncias', 'Reportar Denuncia']].map(([href, label]) => (
              <li key={href}><a href={`#${href}`} className={`font-medium transition-colors ${tLink}`}>{label}</a></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className={`font-bold mb-5 ${tHead}`}>Sede y Contacto</h4>
          <ul className={`text-sm flex flex-col gap-3.5 ${tBody}`}>
            <li className="font-medium">📍 {contacto.direccion}</li>
            <li className="font-medium">📞 {contacto.telefono}</li>
            <li className="font-medium">✉️ {contacto.email}</li>
          </ul>
        </div>

        <div>
          <h4 className={`font-bold mb-5 ${tHead}`}>Redes Sociales</h4>
          <div className="flex gap-3 mb-5">
            {Object.entries(ICONOS_REDES).map(([nombre, ruta]) => (
              <a key={nombre} href="#" title={nombre}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${iconBg}`}>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d={ruta} /></svg>
              </a>
            ))}
          </div>
          <p className={`text-sm font-medium ${tBody}`}>
            Horario de Sede Central:<br />{contacto.horario}
          </p>
        </div>
      </div>

      <div className={`text-center text-xs font-medium tracking-wide ${dm ? 'text-slate-500' : 'text-[#212529]/40'}`}>
        Plataforma Pública SISCVI — Misión Nevado
        © 2026 ING JULIETH ANDRADE RAMIREZ — UNEFA NUCLEO TACHIRA.
      </div>
    </footer>
  )
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export default function App() {
  const [dm, setDm] = useState(false)
  const [hero, setHero] = useState(HERO_INICIAL)
  const [estadisticas, setEstadisticas] = useState(ESTADISTICAS_INICIALES)
  const [contacto, setContacto] = useState(CONTACTO_INICIAL)
  const [pacientes, setPacientes] = useState([])
  const [jornadas, setJornadas] = useState([])
  const [pacienteModal, setPacienteModal] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargarHero = async () => {
      try {
        const res = await fetch(`${API}/contenido-web`)
        if (res.ok) {
          const datos = await res.json()
          if (datos.hero) {
            // Solo se aceptan imágenes con URL completa; si no, se conservan las actuales
            const { imagen_url, imagen_frontal_url, ...textos } = datos.hero
            const esUrl = (u) => typeof u === 'string' && /^https?:\/\//.test(u)
            setHero(prev => ({
              ...prev,
              ...textos,
              ...(esUrl(imagen_url) && { imagen_url }),
              ...(esUrl(imagen_frontal_url) && { imagen_frontal_url }),
            }))
          }
          if (datos.estadisticas?.length) setEstadisticas(datos.estadisticas)
          if (datos.contacto) setContacto(prev => ({ ...prev, ...datos.contacto }))
        }
      } catch { /* usa los valores iniciales */ }
    }

    const cargarPacientes = async () => {
      try {
        const res = await fetch(`${API}/adopciones?visibles=1`)
        if (res.ok) {
          const datos = await res.json()
          const lista = datos.pacientes ?? datos.registros ?? []
          setPacientes(lista)
        }
      } catch { /* sin conexión: se muestra el mensaje de "no hay pacientes" */ }
      finally { setCargando(false) }
    }

    const cargarJornadas = async () => {
      try {
        const res = await fetch(`${API}/jornadas?visibles=1`)
        if (res.ok) {
          const datos = await res.json()
          const lista = datos.jornadas ?? []
          setJornadas(lista)
        }
      } catch { /* sin conexión: se muestra el mensaje de "no hay jornadas" */ }
    }

    const cargarTodo = () => { cargarHero(); cargarPacientes(); cargarJornadas() }
    cargarTodo()

    // Lo que se cambie desde el panel aparece sin recargar: se vuelve a consultar
    // cada 30 s y cada vez que el visitante regresa a la pestaña.
    const intervalo = setInterval(cargarTodo, 30000)
    const alVolver = () => { if (document.visibilityState === 'visible') cargarTodo() }
    document.addEventListener('visibilitychange', alVolver)
    return () => {
      clearInterval(intervalo)
      document.removeEventListener('visibilitychange', alVolver)
    }
  }, [])

  // Título del hero con los espacios correctos entre sus tres partes (evita "vidaanimalen")
  const tituloHero = (() => {
    const ini = (hero.titulo_inicio ?? '').trim()
    const acc = (hero.titulo_acento ?? '').trim()
    const fin = (hero.titulo_fin ?? '').trim()
    return {
      antes: ini && (acc || fin) ? `${ini} ` : ini,
      acento: acc,
      despues: fin && (ini || acc) && !/^[.,;:!?)]/.test(fin) ? ` ${fin}` : fin,
    }
  })()

  const fondoHero = hero.imagen_url || imagenHero
  const imagenFrente = hero.imagen_frontal_url

  const pacientesVisibles = pacientes.filter(p => p.ADOPCI_ST !== 'ADOPTADO')

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${dm ? 'bg-[#121416] text-[#F8F9FA]' : 'bg-[#FFEFD1] text-[#212529]'}`}>

      <NavbarPublica dm={dm} toggleDm={() => setDm(v => !v)} />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <header className="relative pt-28 pb-10 md:pt-40 md:pb-20 lg:pt-44 lg:pb-28 overflow-hidden" id="inicio">
        <div className="absolute inset-0 z-0">
          <img src={fondoHero} alt="Fondo Hero" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#2D6A4F]/85" />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10 text-white">
          <div className="text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/30 bg-white/10 backdrop-blur-md text-[#D4AC4E] text-xs font-bold mb-6 md:mb-8 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AC4E] animate-pulse" />
              {hero.badge}
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold mb-5 md:mb-6 leading-[1.1] tracking-tight drop-shadow-md">
              {tituloHero.antes}
              <span className="text-[#D4AC4E]">{tituloHero.acento}</span>
              {tituloHero.despues}
            </h1>
            <p className="text-lg opacity-90 mb-8 max-w-lg font-medium leading-relaxed">
              {hero.descripcion}
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#adopciones" className="bg-[#D4AC4E] text-[#212529] px-8 py-3.5 rounded-full font-bold shadow-lg hover:opacity-90 transition-all">
                🐾 Quiero Adoptar
              </a>
              <a href="#denuncias" className="bg-transparent border-2 border-[#E76F51] text-white px-8 py-3.5 rounded-full font-bold hover:bg-[#E76F51]/20 transition-all flex items-center gap-2">
                <span className="text-[#E76F51]">⚠</span> Reportar Denuncia
              </a>
            </div>
          </div>

          <div className="relative hidden lg:flex justify-center">
            {imagenFrente ? (
              <img src={imagenFrente} alt="Mascota rescatada"
                className="rounded-[2.5rem] shadow-2xl object-cover h-[420px] w-full max-w-sm border-[10px] border-white/10 hover:scale-[1.02] transition-transform duration-500" />
            ) : (
              <div className="h-[420px] w-full max-w-sm rounded-[2.5rem] border-[10px] border-dashed border-white/20 bg-white/5 flex items-center justify-center">
                <PawPrint className="w-16 h-16 text-white/20" />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── BANNER IMPACTO ────────────────────────────────────────────────────── */}
      <section className="bg-[#D4AC4E] py-10 md:py-12 border-b-8 border-[#2D6A4F]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-[#212529]/10">
          {estadisticas.map(({ valor, etiqueta }) => (
            <div key={etiqueta} className="py-4">
              <h3 className="text-4xl font-black text-[#212529]">{valor}</h3>
              <p className="text-[#2D6A4F] font-bold uppercase tracking-wider mt-1 text-sm">{etiqueta}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CARTELERA DE ADOPCIÓN ─────────────────────────────────────────────── */}
      <main className="py-12 md:py-24 max-w-7xl mx-auto px-4 md:px-6" id="adopciones">
        <div className="text-center mb-10 md:mb-14">
          <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold mb-4 ${dm ? 'border-white/10 bg-white/5 text-[#D4AC4E]' : 'border-[#2D6A4F]/20 bg-white text-[#2D6A4F]'
            }`}>
            <PawPrint className="w-3.5 h-3.5" /> Buscando Familia
          </span>
          <h2 className={`text-2xl sm:text-4xl font-extrabold mb-4 ${dm ? 'text-white' : 'text-[#212529]'}`}>Cartelera de Adopción</h2>
          <p className={`max-w-2xl mx-auto text-lg ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
            Conoce a nuestros pacientes rescatados que ya están listos para llenar de alegría y amor tu hogar.
          </p>
        </div>

        {cargando ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-[#2D6A4F]/20 border-t-[#2D6A4F] rounded-full animate-spin" />
          </div>
        ) : pacientesVisibles.length === 0 ? (
          <div className={`text-center py-16 rounded-2xl border ${dm ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-white/60 border-slate-200 text-gray-400'}`}>
            <PawPrint className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-lg">No hay pacientes disponibles en este momento.</p>
            <p className="text-sm mt-1">¡Vuelve pronto!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
            {pacientesVisibles.map(p => (
              <TarjetaAdopcion key={p.ADOPCI_ID} dm={dm} paciente={p} onSolicitar={setPacienteModal} />
            ))}
          </div>
        )}
      </main>

      {/* ── JORNADAS PROGRAMADAS ─────────────────────────────────────────────── */}
      <section className={`py-12 md:py-24 border-t transition-colors ${dm ? 'border-white/5 bg-[#121416]/30' : 'border-slate-200/60 bg-white/50'}`} id="jornadas">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10 md:mb-14">
            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold mb-4 ${dm ? 'border-white/10 bg-white/5 text-[#D4AC4E]' : 'border-[#2D6A4F]/20 bg-white text-[#2D6A4F]'
              }`}>
              <Calendar className="w-3.5 h-3.5" /> Calendario de Eventos
            </span>
            <h2 className={`text-2xl sm:text-4xl font-extrabold mb-4 ${dm ? 'text-white' : 'text-[#212529]'}`}>Jornadas Programadas</h2>
            <p className={`max-w-2xl mx-auto text-lg ${dm ? 'text-slate-300' : 'text-slate-600'}`}>
              Próximos operativos médicos y eventos de bienestar animal en nuestra comunidad. ¡Te esperamos!
            </p>
          </div>

          {jornadas.length === 0 ? (
            <div className={`text-center py-16 rounded-2xl border ${dm ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-white/60 border-slate-200 text-gray-400'}`}>
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No hay jornadas programadas próximamente.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-7">
              {jornadas.map(j => <TarjetaJornada key={j.JORNAD_ID} dm={dm} jornada={j} />)}
            </div>
          )}
        </div>
      </section>

      <SeccionRegistro dm={dm} />
      <SeccionSeguimiento dm={dm} />
      <SeccionDenuncias dm={dm} />
      <PiePublico dm={dm} contacto={contacto} />

      {pacienteModal && (
        <ModalAdopcion dm={dm} paciente={pacienteModal} onCerrar={() => setPacienteModal(null)}
          onEnviada={(id) => setPacientes(prev => prev.map(p => (p.ADOPCI_ID === id ? { ...p, ADOPCI_ST: 'EN PROCESO' } : p)))} />
      )}
    </div>
  )
}
