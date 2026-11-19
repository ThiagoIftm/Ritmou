const reprodutorAudio = new Audio();

const barraProgresso = document.getElementById('minimal-progress');
const labelTempoAtual = document.getElementById('umb-tempo-atual');
const labelTempoTotal = document.getElementById('umb-tempo-total');

const volumeSlider = document.getElementById('umb-volume-slider');
const btnMute = document.getElementById('umb-btn-mute');

const svgPlay = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'; 
const svgPause = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M8 19h3V5H8v14zm5-14v14h3V5h-3z"/></svg>';
const svgVolume = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';
const svgMute = '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>';

function formatarTempo(segundos) {
    if (isNaN(segundos)) return "0:00";
    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    return `${min}:${seg.toString().padStart(2, '0')}`;
}

function alternarPlayPause() {
    if (!reprodutorAudio.src || reprodutorAudio.src === window.location.href) return; 

    if (reprodutorAudio.paused) {
        reprodutorAudio.play()
            .then(() => atualizarIconesPlay(true))
            .catch(erro => console.error("Erro ao dar play:", erro));
    } else {
        reprodutorAudio.pause();
        atualizarIconesPlay(false);
    }
}

function atualizarIconesPlay(tocando) {
    localStorage.setItem('musicaTocando', tocando);
    const botoesPlayPause = document.querySelectorAll('.play-pause-btn, #umb-btn-play, .play-song-btn');
    botoesPlayPause.forEach(btn => {
        btn.innerHTML = tocando ? svgPause : svgPlay;
    });
}

document.querySelectorAll('.play-pause-btn, #umb-btn-play').forEach(btn => {
    btn.addEventListener('click', alternarPlayPause);
});

function tocarMusicaGlobal(caminhoAudio) {
    reprodutorAudio.src = caminhoAudio;
    reprodutorAudio.play()
        .then(() => {
            atualizarIconesPlay(true);
            localStorage.setItem('musicaAtual', caminhoAudio);
            atualizarDadosMenuLateral();
        })
        .catch(erro => {
            console.error("Autoplay bloqueado pelo navegador:", erro);
            atualizarIconesPlay(false);
        });
}


function tocarProximaMusica() {
    let playlist = JSON.parse(localStorage.getItem('playlistAtual') || '[]');
    let index = parseInt(localStorage.getItem('playlistIndexAtual') || '0');

    if (playlist.length > 0 && index < playlist.length - 1) {
        index++;
        localStorage.setItem('playlistIndexAtual', index.toString());
        tocarMusicaGlobal(playlist[index]);
    }
}

function tocarMusicaAnterior() {
    let playlist = JSON.parse(localStorage.getItem('playlistAtual') || '[]');
    let index = parseInt(localStorage.getItem('playlistIndexAtual') || '0');

    if (playlist.length > 0 && index > 0 && reprodutorAudio.currentTime <= 3) {
        index--;
        localStorage.setItem('playlistIndexAtual', index.toString());
        tocarMusicaGlobal(playlist[index]);
    } else {
        reprodutorAudio.currentTime = 0; 
    }
}

document.querySelectorAll('.next-btn, #umb-btn-next').forEach(btn => btn.addEventListener('click', tocarProximaMusica));
document.querySelectorAll('.prev-btn, #umb-btn-prev').forEach(btn => btn.addEventListener('click', tocarMusicaAnterior));
reprodutorAudio.addEventListener('ended', tocarProximaMusica);


function atualizarDadosMenuLateral() {
    const musicaSalva = localStorage.getItem('musicaAtual');
    if (!musicaSalva) return;

    const musicaSalvaDecodificada = decodeURIComponent(musicaSalva);

    fetch('Json/Musica.json')
        .then(resposta => resposta.json())
        .then(musicas => {
            const musicaTocando = musicas.find(m => musicaSalvaDecodificada.includes(m.caminho_arquivo));
            if (!musicaTocando) return;

            const urlMusica = `MusicaDetalhe.html?id=${musicaTocando.cod_musica}`;
            
            const umbCapa = document.getElementById('umb-capa');
            const umbNomeMusica = document.getElementById('umb-nome-musica');
            if (umbCapa) { umbCapa.src = musicaTocando.caminho_logo; umbCapa.style.display = 'block'; }
            if (umbNomeMusica) { umbNomeMusica.textContent = musicaTocando.nome_musc; umbNomeMusica.href = urlMusica; }

            const menuImgCapa = document.getElementById('menu-img-capa'); 
            const menuNomeMusica = document.getElementById('menu-nome-musica'); 
            
            const menuLinkCapa = document.getElementById('menu-link-capa');
            const menuLinkMusica = document.getElementById('menu-link-musica');

            if (menuImgCapa) menuImgCapa.src = musicaTocando.caminho_logo;
            if (menuNomeMusica) menuNomeMusica.textContent = musicaTocando.nome_musc;
            
            if (menuLinkCapa) menuLinkCapa.href = urlMusica;
            if (menuLinkMusica) menuLinkMusica.href = urlMusica;

            if (musicaTocando.cod_artista && musicaTocando.cod_artista.length > 0) {
                const idPrimeiroArtista = musicaTocando.cod_artista[0];

                fetch('Json/Artista.json')
                    .then(resposta => resposta.json())
                    .then(artistas => {
                        const artistaEncontrado = artistas.find(a => a.cod_artista === idPrimeiroArtista);
                        if (!artistaEncontrado) return;

                        const urlArtista = `PainelArtista.html?id=${artistaEncontrado.cod_artista}`;

                        const umbNomeArtista = document.getElementById('umb-nome-artista');
                        if (umbNomeArtista) { umbNomeArtista.textContent = artistaEncontrado.nome_artista; umbNomeArtista.href = urlArtista; }

                        // Atualiza Sidebar: Imagem, Texto e LINK do Artista
                        const menuImgArtista = document.getElementById('menu-img-artista'); 
                        const menuNomeArtistaSub = document.getElementById('menu-nome-artista-sub'); 
                        const menuLinkArtistaSub = document.getElementById('menu-link-artista-sub');
                        
                        if (menuImgArtista) menuImgArtista.src = artistaEncontrado.caminho_foto; 
                        if (menuNomeArtistaSub) menuNomeArtistaSub.textContent = artistaEncontrado.nome_artista;
                        
                        // Atualizando o href do Artista
                        if (menuLinkArtistaSub) menuLinkArtistaSub.href = urlArtista;
                    })
                    .catch(erro => console.error("Erro ao carregar Artista:", erro));
            }
        })
        .catch(erro => console.error("Erro ao carregar Musica:", erro));
}


reprodutorAudio.addEventListener('play', () => {
    if (reprodutorAudio.src && reprodutorAudio.src !== window.location.href) {
        localStorage.setItem('musicaAtual', reprodutorAudio.src);
        atualizarDadosMenuLateral();
        atualizarIconesPlay(true);
    }
});

reprodutorAudio.addEventListener('pause', () => {
    atualizarIconesPlay(false);
});

reprodutorAudio.addEventListener('timeupdate', () => {
    localStorage.setItem('tempoMusica', reprodutorAudio.currentTime);
    if (labelTempoAtual) labelTempoAtual.textContent = formatarTempo(reprodutorAudio.currentTime);
    
    if (barraProgresso && !isNaN(reprodutorAudio.duration)) {
        barraProgresso.max = reprodutorAudio.duration;
        barraProgresso.value = reprodutorAudio.currentTime;
        if (labelTempoTotal) labelTempoTotal.textContent = formatarTempo(reprodutorAudio.duration);
    }
});

if (barraProgresso) barraProgresso.addEventListener('input', () => { reprodutorAudio.currentTime = barraProgresso.value; });

if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
        reprodutorAudio.volume = e.target.value;
        reprodutorAudio.muted = false;
        if (btnMute) btnMute.innerHTML = svgVolume;
    });
}

if (btnMute) {
    btnMute.addEventListener('click', () => {
        reprodutorAudio.muted = !reprodutorAudio.muted;
        btnMute.innerHTML = reprodutorAudio.muted ? svgMute : svgVolume;
        if (volumeSlider) volumeSlider.value = reprodutorAudio.muted ? 0 : reprodutorAudio.volume;
    });
}

let cacheMusicas = [];
let cacheArtistas = [];

async function carregarDadosPesquisa() {
    try {
        const resMus = await fetch('Json/Musica.json');
        cacheMusicas = await resMus.json();
        
        const resArt = await fetch('Json/Artista.json');
        cacheArtistas = await resArt.json();
    } catch (erro) {
        console.error("Erro ao carregar JSONs para pesquisa:", erro);
    }
}

function configurarPesquisa() {
    const searchInput = document.querySelector('.search-input');
    const searchRow = document.querySelector('.search-row');
    
    if (!searchInput || !searchRow) return;

    searchRow.style.position = 'relative';

    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'search-results-dropdown';
    searchRow.appendChild(resultsContainer);

    searchInput.addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase().trim();
        
        if (termo.length === 0) {
            resultsContainer.style.display = 'none';
            return;
        }

        const resultados = cacheMusicas.filter(m => m.nome_musc.toLowerCase().includes(termo));
        
        if (resultados.length === 0) {
            resultsContainer.style.display = 'none';
            return;
        }

        renderizarResultadosPesquisa(resultados, resultsContainer);
    });

    document.addEventListener('click', (e) => {
        if (!searchRow.contains(e.target)) {
            resultsContainer.style.display = 'none';
        }
    });

    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim().length > 0 && resultsContainer.innerHTML !== '') {
            resultsContainer.style.display = 'flex';
        }
    });
}

function renderizarResultadosPesquisa(musicas, container) {
    container.innerHTML = '';
    
    musicas.slice(0, 5).forEach(musica => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        
        let nomeArtista = 'Artista Desconhecido';
        let idArtista = '';
        if (musica.cod_artista && musica.cod_artista.length > 0) {
            const artista = cacheArtistas.find(a => a.cod_artista === musica.cod_artista[0]);
            if (artista) {
                nomeArtista = artista.nome_artista;
                idArtista = artista.cod_artista;
            }
        }

        item.innerHTML = `
            <img src="${musica.caminho_logo}" alt="Capa" class="search-result-img" onclick="window.location.href='MusicaDetalhe.html?id=${musica.cod_musica}'">
            <div class="search-result-info">
                <a href="MusicaDetalhe.html?id=${musica.cod_musica}" class="search-result-title">${musica.nome_musc}</a>
                <a href="PainelArtista.html?id=${idArtista}" class="search-result-artist">${nomeArtista}</a>
            </div>
            <button class="search-play-btn" title="Ouvir" onclick="tocarMusicaGlobal('${musica.caminho_arquivo}')">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </button>
        `;
        container.appendChild(item);
    });
    
    container.style.display = 'flex';
}

function carregarEstadoMusica() {
    const musicaSalva = localStorage.getItem('musicaAtual');
    const tempoSalvo = localStorage.getItem('tempoMusica');
    const volumeSalvo = localStorage.getItem('volumeMusica');
    const estavaTocando = localStorage.getItem('musicaTocando') === 'true';

    if (volumeSalvo !== null) {
        reprodutorAudio.volume = parseFloat(volumeSalvo);
        if (volumeSlider) volumeSlider.value = volumeSalvo;
    }

    if (musicaSalva) {
        reprodutorAudio.src = musicaSalva;
        atualizarDadosMenuLateral();
        
        if (tempoSalvo) reprodutorAudio.currentTime = parseFloat(tempoSalvo);

        if (estavaTocando) {
            reprodutorAudio.play().then(() => {
                atualizarIconesPlay(true);
            }).catch(erro => {
                console.warn("Autoplay bloqueado.");
                atualizarIconesPlay(false);
            });
        }
    }
}

function salvarEstadoMusica() {
    if (reprodutorAudio.src) {
        localStorage.setItem('musicaAtual', reprodutorAudio.src);
        localStorage.setItem('tempoMusica', reprodutorAudio.currentTime);
        localStorage.setItem('musicaTocando', !reprodutorAudio.paused);
        localStorage.setItem('volumeMusica', reprodutorAudio.volume);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    carregarEstadoMusica();
    
    carregarDadosPesquisa().then(() => {
        configurarPesquisa();
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const sidebarPlaylistList = document.querySelector('#sidebarLeft .playlist-list');
    
    if (sidebarPlaylistList) {
        // Puxa as playlists salvas
        const playlistsUser = JSON.parse(sessionStorage.getItem('ritmou_playlists_user')) || [];
        
        playlistsUser.forEach(pl => {
            const a = document.createElement('a');
            a.href = `Playlist.html?id=${pl.id}`;
            a.className = 'playlist-item';
            a.innerHTML = `
                <img src="${pl.capa}" alt="${pl.nome}" class="playlist-thumb">
                <span class="playlist-name">${pl.nome}</span>
            `;
            sidebarPlaylistList.appendChild(a);
        });
    }
});

window.addEventListener('beforeunload', salvarEstadoMusica);