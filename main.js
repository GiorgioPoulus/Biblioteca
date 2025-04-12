// main.js completo con limpieza total del DOM al entrar en detalle

document.addEventListener('DOMContentLoaded', () => {
  const apiKey = 'KGnX90YV1udc6Y0UCwGgkoweBlB13uCg';

  let librosActuales = [];
  let paginaActual = 1;
  const librosPorPagina = 5;
  let busquedaTitulo = '';
  let busquedaAutor = '';
  let ordenActual = 'titulo-asc';

  const fetchLists = async () => {
    const listContainer = document.getElementById('list-container');
    const loader = document.getElementById('loader');

    try {
      const response = await fetch(`https://api.nytimes.com/svc/books/v3/lists/names.json?api-key=${apiKey}`);
      const data = await response.json();

      if (!data.results) throw new Error('No se recibieron resultados.');

      setTimeout(() => {
        loader.classList.remove('visible');
        loader.classList.add('invisible');

        listContainer.classList.remove('invisible');
        listContainer.classList.add('visible');

        listContainer.innerHTML = '';

        data.results.forEach((list) => {
          const article = document.createElement('article');
          article.className = 'list';
          article.innerHTML = `
            <header>
              <h2>${list.display_name}</h2>
            </header>
            <section>
              <p><strong>Libro más antiguo incorporado:</strong> ${list.oldest_published_date}</p>
              <p><strong>Libro incorporado más reciente:</strong> ${list.newest_published_date}</p>
              <p><strong>Frecuencia de actualización:</strong> ${list.updated}</p>
            </section>
            <footer>
              <button class="link-button" onclick="verLista('${list.list_name_encoded}')">
                Ver lista de libros
              </button>
            </footer>
          `;
          listContainer.appendChild(article);
        });
      }, 4500);
    } catch (error) {
      loader.textContent = `Error al cargar: ${error.message}`;
    }
  };

  const verLista = async (listNameEncoded) => {
    try {
      const response = await fetch(`https://api.nytimes.com/svc/books/v3/lists/current/${listNameEncoded}.json?api-key=${apiKey}`);
      const data = await response.json();
      if (!data.results || !data.results.books) throw new Error('No se encontraron libros para esta lista.');

      librosActuales = data.results.books;
      paginaActual = 1;

      // 💣 Limpiar todo el body
      document.body.innerHTML = '';

      // ✨ Crear header y contenedor
      const header = document.createElement('header');
      header.innerHTML = `<h1 class="typing-effect">Lista: ${data.results.display_name}</h1>`;

      const detalle = document.createElement('section');
      detalle.id = 'detalle-container';
      detalle.className = 'fade-in visible';

      document.body.appendChild(header);
      document.body.appendChild(detalle);

      mostrarControlesYLibros();
    } catch (error) {
      document.body.innerHTML = `<p>Error al cargar los libros: ${error.message}</p>`;
    }
  };

  const mostrarControlesYLibros = () => {
    const detalleContainer = document.getElementById('detalle-container');
    let html = `
      <button class="link-button" onclick="location.reload()">← Volver</button>
      <div style="margin: 20px 0;">
        <input type="text" placeholder="Buscar por título" oninput="actualizarBusqueda(this.value, 'titulo')">
        <input type="text" placeholder="Buscar por autor" oninput="actualizarBusqueda(this.value, 'autor')">
        <select onchange="actualizarOrden(this.value)">
          <option value="titulo-asc">Título A-Z</option>
          <option value="titulo-desc">Título Z-A</option>
          <option value="autor-asc">Autor A-Z</option>
          <option value="autor-desc">Autor Z-A</option>
        </select>
      </div>
    `;
    html += renderizarLibros();
    detalleContainer.innerHTML = html;
  };

  const actualizarBusqueda = (valor, campo) => {
    if (campo === 'titulo') busquedaTitulo = valor.toLowerCase();
    if (campo === 'autor') busquedaAutor = valor.toLowerCase();
    paginaActual = 1;
    mostrarControlesYLibros();
  };

  const actualizarOrden = (valor) => {
    ordenActual = valor;
    mostrarControlesYLibros();
  };

  const renderizarLibros = () => {
    let filtrados = librosActuales.filter(libro =>
      libro.title.toLowerCase().includes(busquedaTitulo) &&
      libro.author.toLowerCase().includes(busquedaAutor)
    );

    if (ordenActual === 'titulo-asc') filtrados.sort((a, b) => a.title.localeCompare(b.title));
    if (ordenActual === 'titulo-desc') filtrados.sort((a, b) => b.title.localeCompare(a.title));
    if (ordenActual === 'autor-asc') filtrados.sort((a, b) => a.author.localeCompare(b.author));
    if (ordenActual === 'autor-desc') filtrados.sort((a, b) => b.author.localeCompare(a.author));

    const totalPaginas = Math.ceil(filtrados.length / librosPorPagina);
    const inicio = (paginaActual - 1) * librosPorPagina;
    const fin = inicio + librosPorPagina;
    const visibles = filtrados.slice(inicio, fin);

    let html = visibles.map((book, index) => `
      <article class="list">
        <header>
          <h2>#${inicio + index + 1} ${book.title}</h2>
        </header>
        <section>
          <img src="${book.book_image}" alt="Carátula de ${book.title}" style="max-width: 120px; float: right; margin-left: 15px;">
          <p><strong>Autor:</strong> ${book.author}</p>
          <p><strong>Semanas en lista:</strong> ${book.weeks_on_list}</p>
          <p>${book.description || 'Sin descripción disponible.'}</p>
        </section>
        <footer>
          <a href="${book.amazon_product_url}" class="link-button" target="_blank" rel="noopener noreferrer">Comprar en Amazon</a>
        </footer>
      </article>
    `).join('');

    html += `
      <div style="text-align:center; margin-top: 20px;">
        <button class="link-button" onclick="cambiarPagina(${paginaActual - 1})" ${paginaActual === 1 ? 'disabled' : ''}>Anterior</button>
        <span style="margin: 0 10px;">Página ${paginaActual} de ${totalPaginas}</span>
        <button class="link-button" onclick="cambiarPagina(${paginaActual + 1})" ${paginaActual === totalPaginas ? 'disabled' : ''}>Siguiente</button>
      </div>
    `;

    return html;
  };

  const cambiarPagina = (nuevaPagina) => {
    paginaActual = nuevaPagina;
    mostrarControlesYLibros();
  };

  fetchLists();

  window.verLista = verLista;
  window.actualizarBusqueda = actualizarBusqueda;
  window.actualizarOrden = actualizarOrden;
  window.cambiarPagina = cambiarPagina;
});
