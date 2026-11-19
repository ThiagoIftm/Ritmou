let cacheCriarMusicas = [];
let cacheCriarArtistas = [];
let musicasAdicionadas = [];

// 1. Carrega os dados reais dos JSONs
async function carregarDadosParaPlaylist() {
    try {
        const resMus = await fetch('Json/Musica.json');
        cacheCriarMusicas = await resMus.json();
        
        const resArt = await fetch('Json/Artista.json');
        cacheCriarArtistas = await resArt.json();
    } catch (erro) {
        console.error("Erro ao carregar JSONs para criação da playlist:", erro);
    }
}
carregarDadosParaPlaylist();

const searchInput = document.getElementById('songSearchInput');
const searchResults = document.getElementById('searchResults');
const addedSongsList = document.getElementById('addedSongsList');
const addedCount = document.getElementById('addedCount');

// 2. Pesquisa com a mesma interface global
searchInput.addEventListener('input', (e) => {
    const termo = e.target.value.toLowerCase().trim();
    searchResults.innerHTML = '';

    if (termo.length === 0) return;

    // Filtra músicas que dão match no nome e ainda não foram adicionadas
    const resultados = cacheCriarMusicas.filter(musica => 
        musica.nome_musc.toLowerCase().includes(termo) &&
        !musicasAdicionadas.some(adicionada => adicionada.cod_musica === musica.cod_musica)
    );

    resultados.slice(0, 5).forEach(musica => {
        let nomeArtista = 'Artista Desconhecido';
        if (musica.cod_artista && musica.cod_artista.length > 0) {
            const artista = cacheCriarArtistas.find(a => a.cod_artista === musica.cod_artista[0]);
            if (artista) nomeArtista = artista.nome_artista;
        }

        const item = document.createElement('div');
        // Reutilizando as classes CSS do seu menu global
        item.className = 'search-result-item'; 
        item.style.cursor = 'default';
        item.style.marginBottom = '5px';

        item.innerHTML = `
            <img src="${musica.caminho_logo}" alt="Capa" class="search-result-img">
            <div class="search-result-info">
                <span class="search-result-title">${musica.nome_musc}</span>
                <span class="search-result-artist">${nomeArtista}</span>
            </div>
            <button class="action-btn btn-add" onclick="adicionarMusica('${musica.cod_musica}')" title="Adicionar" style="margin-left:auto;">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
            </button>
        `;
        searchResults.appendChild(item);
    });
});

// 3. Gerenciamento das Músicas Adicionadas
function adicionarMusica(cod_musica) {
    const musica = cacheCriarMusicas.find(m => m.cod_musica === cod_musica);
    if (musica) {
        musicasAdicionadas.push(musica);
        searchInput.value = '';
        searchResults.innerHTML = '';
        atualizarListaAdicionadas();
    }
}

function removerMusica(cod_musica) {
    musicasAdicionadas = musicasAdicionadas.filter(m => m.cod_musica !== cod_musica);
    atualizarListaAdicionadas();
}

function atualizarListaAdicionadas() {
    addedCount.textContent = musicasAdicionadas.length;
    addedSongsList.innerHTML = '';

    if (musicasAdicionadas.length === 0) {
        addedSongsList.innerHTML = '<p style="color: #cbd5e1; font-size: 14px; text-align: center; margin: 20px 0;">Sua playlist está vazia. Adicione músicas acima!</p>';
        return;
    }

    musicasAdicionadas.forEach(musica => {
        let nomeArtista = 'Artista Desconhecido';
        if (musica.cod_artista && musica.cod_artista.length > 0) {
            const artista = cacheCriarArtistas.find(a => a.cod_artista === musica.cod_artista[0]);
            if (artista) nomeArtista = artista.nome_artista;
        }

        const item = document.createElement('div');
        item.className = 'song-item'; 
        item.innerHTML = `
            <img src="${musica.caminho_logo}" alt="Capa" class="song-item-cover">
            <div class="song-item-info">
                <p class="song-item-title">${musica.nome_musc}</p>
                <p class="song-item-artist">${nomeArtista}</p>
            </div>
            <button class="action-btn btn-remove" onclick="removerMusica('${musica.cod_musica}')" title="Remover">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 13H5v-2h14v2z"/></svg>
            </button>
        `;
        addedSongsList.appendChild(item);
    });
}

// 4. Salvar Playlist no Storage
function salvarPlaylist() {
    const nome = document.getElementById('inputPlaylistName').value.trim();

    if (!nome) {
        alert("Por favor, dê um nome para sua playlist.");
        return;
    }
    if (musicasAdicionadas.length === 0) {
        alert("Adicione pelo menos uma música para salvar.");
        return;
    }

    const novaPlaylist = {
        id: 'pl_user_' + new Date().getTime(),
        nome: nome,
        capa: musicasAdicionadas[0].caminho_logo, // Capa é a 1ª música
        musicas: musicasAdicionadas
    };

    // Nota: Usando sessionStorage como solicitado para apagar quando o navegador fechar.
    // Se quiser que fique para sempre, troque 'sessionStorage' por 'localStorage'.
    const playlistsSalvas = JSON.parse(sessionStorage.getItem('ritmou_playlists_user')) || [];
    playlistsSalvas.push(novaPlaylist);
    sessionStorage.setItem('ritmou_playlists_user', JSON.stringify(playlistsSalvas));

    const msg = document.getElementById('successMessage');
    if(msg) msg.style.display = 'inline-block';
    
    setTimeout(() => { window.location.href = 'Biblioteca.html'; }, 1500);
}