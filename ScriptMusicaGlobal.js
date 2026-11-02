// ==========================================
// INICIALIZAÇÃO DO PLAYER GLOBAL
// ==========================================
const reprodutorAudio = new Audio();

const btnPlayPause = document.querySelector('.play-pause-btn');
const btnNext = document.querySelector('.next-btn');
const btnPrev = document.querySelector('.prev-btn');
const barraProgresso = document.getElementById('minimal-progress');
const iconePlayPause = btnPlayPause ? btnPlayPause.querySelector('svg') : null;

const svgPlay = '<path d="M8 5v14l11-7z"/>'; 
const svgPause = '<path d="M8 19h3V5H8v14zm5-14v14h3V5h-3z"/>';

// ==========================================
// FUNÇÃO EXPORTADA (Chamada pelo ScriptGenero)
// ==========================================
function tocarMusicaGlobal(caminhoAudio) {
    reprodutorAudio.src = caminhoAudio;
    reprodutorAudio.play()
        .then(() => {
            atualizarIcone(true);
            localStorage.setItem('musicaTocando', 'true');
            localStorage.setItem('musicaAtual', caminhoAudio);
            atualizarDadosMenuLateral();
        })
        .catch(erro => {
            console.error("Erro ao tocar a música (autoplay bloqueado?):", erro);
            atualizarIcone(false);
        });
}

// ==========================================
// LÓGICA DE PLAYLIST (Próxima / Anterior)
// ==========================================
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

    if (playlist.length > 0 && index > 0) {
        index--;
        localStorage.setItem('playlistIndexAtual', index.toString());
        tocarMusicaGlobal(playlist[index]);
    } else if (reprodutorAudio.currentTime > 3) {
        // Se já passou de 3 segundos, o botão de voltar apenas reinicia a música atual
        reprodutorAudio.currentTime = 0;
    }
}

// Quando a música acabar, toca a próxima da playlist automaticamente
reprodutorAudio.addEventListener('ended', tocarProximaMusica);

// ==========================================
// ATUALIZAR INFORMAÇÕES VISUAIS
// ==========================================
function atualizarDadosMenuLateral() {
    const musicaSalva = localStorage.getItem('musicaAtual');
    if (!musicaSalva) return;

    const musicaSalvaDecodificada = decodeURI(musicaSalva);

    fetch('Json/Musica.json')
        .then(resposta => resposta.json())
        .then(musicas => {
            const musicaTocando = musicas.find(m => musicaSalvaDecodificada.includes(m.caminho_arquivo));
            
            if (!musicaTocando) {
                console.warn("Música não encontrada no JSON correspondente ao localStorage:", musicaSalvaDecodificada);
                return;
            }

            const urlMusica = `MusicaDetalhe.html?id=${musicaTocando.cod_musica}`;
            
            const menuLinkCapa = document.getElementById('menu-link-capa');
            const menuImgCapa = document.getElementById('menu-img-capa');
            const menuLinkMusica = document.getElementById('menu-link-musica');
            const menuNomeMusica = document.getElementById('menu-nome-musica');

            if (menuLinkCapa) menuLinkCapa.href = urlMusica;
            if (menuImgCapa) menuImgCapa.src = musicaTocando.caminho_logo;
            if (menuLinkMusica) menuLinkMusica.href = urlMusica;
            if (menuNomeMusica) menuNomeMusica.textContent = musicaTocando.nome_musc;

            if (musicaTocando.cod_artista && musicaTocando.cod_artista.length > 0) {
                const idPrimeiroArtista = musicaTocando.cod_artista[0];

                fetch('Json/Artista.json')
                    .then(resposta => resposta.json())
                    .then(artistas => {
                        const artistaEncontrado = artistas.find(a => a.cod_artista === idPrimeiroArtista);
                        if (!artistaEncontrado) return;

                        const urlArtista = `PainelArtista.html?id=${artistaEncontrado.cod_artista}`;

                        const menuLinkArtistaSub = document.getElementById('menu-link-artista-sub');
                        const menuNomeArtistaSub = document.getElementById('menu-nome-artista-sub');
                        const menuLinkArtistaMini = document.getElementById('menu-link-artista-mini');
                        const menuImgArtista = document.getElementById('menu-img-artista');
                        const menuLinkArtistaCard = document.getElementById('menu-link-artista-card');
                        const menuNomeArtistaCard = document.getElementById('menu-nome-artista-card');

                        if (menuLinkArtistaSub) menuLinkArtistaSub.href = urlArtista;
                        if (menuNomeArtistaSub) menuNomeArtistaSub.textContent = artistaEncontrado.nome_artista;
                        if (menuLinkArtistaMini) menuLinkArtistaMini.href = urlArtista;
                        if (menuImgArtista) menuImgArtista.src = artistaEncontrado.caminho_logo_ar;
                        if (menuLinkArtistaCard) menuLinkArtistaCard.href = urlArtista;
                        if (menuNomeArtistaCard) menuNomeArtistaCard.textContent = artistaEncontrado.nome_artista;
                    })
                    .catch(erro => console.error("Erro ao carregar Artista no Menu:", erro));
            }
        })
        .catch(erro => console.error("Erro ao carregar Musica no Menu:", erro));
}

// ==========================================
// SALVAR E CARREGAR ESTADO (LocalStorage)
// ==========================================
function carregarEstadoMusica() {
    const musicaSalva = localStorage.getItem('musicaAtual');
    const tempoSalvo = localStorage.getItem('tempoMusica');
    const estavaTocando = localStorage.getItem('musicaTocando') === 'true';

    if (musicaSalva) {
        reprodutorAudio.src = musicaSalva;
        atualizarDadosMenuLateral();
        
        if (tempoSalvo) {
            reprodutorAudio.currentTime = parseFloat(tempoSalvo);
        }

        if (estavaTocando) {
            reprodutorAudio.play().then(() => {
                atualizarIcone(true);
            }).catch(erro => {
                console.warn("Autoplay bloqueado pelo navegador.", erro);
                atualizarIcone(false);
            });
        }
    }
}

function salvarEstadoMusica() {
    if (reprodutorAudio.src) {
        localStorage.setItem('musicaAtual', reprodutorAudio.src);
        localStorage.setItem('tempoMusica', reprodutorAudio.currentTime);
        localStorage.setItem('musicaTocando', !reprodutorAudio.paused);
    }
}

// ==========================================
// EVENT LISTENERS E CONTROLES DE INTERFACE
// ==========================================
reprodutorAudio.addEventListener('timeupdate', () => {
    localStorage.setItem('tempoMusica', reprodutorAudio.currentTime);
    
    if (barraProgresso && !isNaN(reprodutorAudio.duration)) {
        barraProgresso.max = Math.floor(reprodutorAudio.duration);
        barraProgresso.value = Math.floor(reprodutorAudio.currentTime);
    }
});

reprodutorAudio.addEventListener('play', atualizarDadosMenuLateral);

if (btnPlayPause) {
    btnPlayPause.addEventListener('click', () => {
        if (!reprodutorAudio.src || reprodutorAudio.src === window.location.href) return; 

        if (reprodutorAudio.paused) {
            reprodutorAudio.play();
            atualizarIcone(true);
            localStorage.setItem('musicaTocando', 'true');
        } else {
            reprodutorAudio.pause();
            atualizarIcone(false);
            localStorage.setItem('musicaTocando', 'false');
        }
    });
}

// Mapeamento dos botões Próximo / Anterior
if (btnNext) btnNext.addEventListener('click', tocarProximaMusica);
if (btnPrev) btnPrev.addEventListener('click', tocarMusicaAnterior);

if (barraProgresso) {
    barraProgresso.addEventListener('input', () => {
        reprodutorAudio.currentTime = barraProgresso.value;
    });
}

function atualizarIcone(tocando) {
    if (iconePlayPause) iconePlayPause.innerHTML = tocando ? svgPause : svgPlay;
}

// Inicializações de página
document.addEventListener('DOMContentLoaded', carregarEstadoMusica);
window.addEventListener('beforeunload', salvarEstadoMusica);