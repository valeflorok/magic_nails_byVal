document.addEventListener('DOMContentLoaded', () => {

  // 1. MENÚ SÁNDWICH (abre y cierra con la clase "activo")
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('nav');
  const iconoMenu = menuToggle.querySelector('i');

  function alternarMenu(abrir) {
    nav.classList.toggle('activo', abrir);
    iconoMenu.className = abrir ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
    menuToggle.setAttribute('aria-expanded', abrir);
  }

  menuToggle.addEventListener('click', () => alternarMenu(!nav.classList.contains('activo')));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => alternarMenu(false)));

  // 2. MODO OSCURO (se guarda en localStorage para recordarlo)
  const botonTema = document.getElementById('theme-toggle');
  const iconoTema = botonTema.querySelector('i');

  function aplicarTema(oscuro) {
    document.body.classList.toggle('modo-oscuro', oscuro);
    iconoTema.className = oscuro ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    localStorage.setItem('tema', oscuro ? 'oscuro' : 'claro');
  }

  aplicarTema(localStorage.getItem('tema') === 'oscuro');
  botonTema.addEventListener('click', () => aplicarTema(!document.body.classList.contains('modo-oscuro')));

  // 3. SERVICIOS (array de objetos: acá se editan textos, precios y fotos)
  const servicios = [
    { nombre: 'Semipermanente', desc: 'Color y brillo duraderos para el día a día.', precio: 12000, img: 'serv-semi.jpg', icono: 'fa-hand-sparkles' },
    { nombre: 'Soft Gel', desc: 'Uñas más largas y resistentes, con acabado natural.', precio: 20000, img: 'serv-softgel.jpg', icono: 'fa-wand-magic-sparkles' },
    { nombre: 'Esculpidas en gel', desc: 'Largo, forma y diseño a tu gusto.', precio: 25000, img: 'serv-esculpidas.jpg', icono: 'fa-gem' },
    { nombre: 'Decoración', desc: 'Dibujos, piedras y detalles para personalizar tus uñas.', precio: 5000, img: 'serv-art.jpg', icono: 'fa-palette' }
  ];

  const listaServicios = document.getElementById('lista-servicios');
  const selectServicio = document.getElementById('servicio');

  // Foto con ícono de respaldo: si la imagen no existe, se saca y queda el ícono
  const foto = (archivo, icono, alt) =>
    `<div class="foto"><i class="fa-solid ${icono}"></i><img src="img/${archivo}" alt="${alt}" loading="lazy" onerror="this.remove()"></div>`;

  // Con un solo array armamos las tarjetas Y las opciones del formulario
  servicios.forEach(s => {
    listaServicios.innerHTML += `
      <article class="servicio">
        ${foto(s.img, s.icono, s.nombre)}
        <div class="servicio-info">
          <h3>${s.nombre}</h3>
          <p>${s.desc}</p>
          <div class="meta">
            <span class="precio">$${s.precio.toLocaleString('es-AR')}</span>
            <a class="mini" href="#reservar" data-servicio="${s.nombre}">Reservar</a>
          </div>
        </div>
      </article>`;
    selectServicio.innerHTML += `<option value="${s.nombre}">${s.nombre}</option>`;
  });

  // Al tocar "Reservar" en una tarjeta, el servicio queda elegido en el formulario
  listaServicios.addEventListener('click', e => {
    const boton = e.target.closest('[data-servicio]');
    if (boton) selectServicio.value = boton.dataset.servicio;
  });

  // 4. TURNOS (se guardan en localStorage como texto JSON)
  const form = document.getElementById('form-turno');
  const listaTurnos = document.getElementById('lista-turnos');
  let turnos = JSON.parse(localStorage.getItem('turnos')) || [];

  form.fecha.min = new Date().toLocaleDateString('en-CA'); // no permite fechas pasadas

  // Horarios fijos: cada turno dura 2 horas
  const horarios = ['10:00', '12:00', '14:00', '16:00', '18:00'];
  const selectHora = document.getElementById('hora');

  // Arma el desplegable y bloquea los horarios que ya tienen turno ese día
  function actualizarHoras() {
    const ocupadas = turnos.filter(t => t.fecha === form.fecha.value).map(t => t.hora);
    selectHora.innerHTML = '<option value="" disabled selected>Elegí un horario</option>';
    horarios.forEach(h => {
      const ocupado = ocupadas.includes(h);
      selectHora.innerHTML += `<option value="${h}" ${ocupado ? 'disabled' : ''}>${h} hs${ocupado ? ' (ocupado)' : ''}</option>`;
    });
  }
  form.fecha.addEventListener('change', actualizarHoras);

  function mostrarTurnos() {
    turnos.sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
    listaTurnos.innerHTML = turnos.length ? '' : '<p class="vacio">Todavía no tenés turnos reservados.</p>';

    turnos.forEach((t, i) => {
      listaTurnos.innerHTML += `
        <div class="turno">
          <div>
            <strong>${t.nombre}</strong><br>${t.servicio}<br>
            <small>${t.fecha.split('-').reverse().join('/')} · ${t.hora} hs</small>
          </div>
          <button data-i="${i}" aria-label="Cancelar turno"><i class="fa-solid fa-trash"></i></button>
        </div>`;
    });

    localStorage.setItem('turnos', JSON.stringify(turnos));
    actualizarHoras();
  }

  form.addEventListener('submit', e => {
    e.preventDefault(); // evita que la página se recargue
    // No se atiende los domingos (getDay() devuelve 0 para domingo)
    if (new Date(form.fecha.value + 'T00:00').getDay() === 0) {
      alert('Los domingos no atendemos. Elegí de lunes a sábado.');
      return;
    }

    const nuevo = {
      nombre: form.nombre.value.trim(),
      servicio: form.servicio.value,
      fecha: form.fecha.value,
      hora: form.hora.value
    };

    if (turnos.some(t => t.fecha === nuevo.fecha && t.hora === nuevo.hora)) {
      alert('Ese horario ya está ocupado. Elegí otro.');
      return;
    }

    turnos.push(nuevo);
    form.reset();
    mostrarTurnos();
    location.hash = '#turnos';
  });

  // Cancelar: un solo listener para todos los botones (delegación de eventos)
  listaTurnos.addEventListener('click', e => {
    const boton = e.target.closest('button');
    if (!boton) return;
    turnos.splice(boton.dataset.i, 1);
    mostrarTurnos();
  });

  mostrarTurnos();

  // 5. PWA: registra el service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
  }
});
