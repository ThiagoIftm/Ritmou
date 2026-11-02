// ScriptGenero.js

let isShuffleAtivo = false;

// 1. Mostrar Informações do Gênero (Capa e Título)
function showInformacoesGenero() {
    const urlParams = new URLSearchParams(window.location.search);
    let idGen = urlParams.get('id');

    if (!idGen) {
        idGen = 'g0'; // ID padrão caso nenhum seja passado
    }

    fetch('Json/Genero.json')
        .then(resposta => {
            if (!resposta.ok) throw new Error("Erro na leitura de Genero.json");
            return resposta.json();
        })
        .then(generos => {
            const genero = generos.find(g => g.cod_gen === idGen);

            if (genero) {
                document.getElementById('capa-genero-img').src = genero.caminho_logo;
                document.getElementById('nome-genero-texto').textContent = genero.nome_gen;
            }
        })
        .catch(erro => console.error("Erro ao carregar o gênero:", erro));
}

// 2. Listar as Músicas do Gênero na Tabela (Ordenado por reproduções)
function showMusicasGenero() {
    const urlParams = new URLSearchParams(window.location.search);
    let idGen = urlParams.get('id') || 'g0';

    Promise.all([
        fetch('Json/Musica.json').then(res => res.json()),
        fetch('Json/Artista.json').then(res => res.json()),
        fetch('Json/Album.json').then(res => res.json())
    ])
    .then(([musicas, artistas, albuns]) => {
        // Filtra pelo gênero da página e ordena por quantidade de reproduções (decrescente)
        const musicasDoGenero = musicas
            .filter(m => m.cod_genero === idGen)
            .sort((a, b) => (b.reproducoes_musica || 0) - (a.reproducoes_musica || 0));

        const tracklistBody = document.getElementById('tracklist-genero-body');
        if (!tracklistBody) return;

        tracklistBody.innerHTML = ''; // Garante que a tabela inicie limpa

        musicasDoGenero.forEach((musica, index) => {
            // Relacionar Artistas e criar links
            let linksArtistas = "Desconhecido";
            if (Array.isArray(musica.cod_artista)) {
                linksArtistas = musica.cod_artista.map(idArt => {
                    const artista = artistas.find(a => a.cod_artista === idArt);
                    const nome = artista ? artista.nome_artista : "Desconhecido";
                    return `<a href="PainelArtista.html?id=${idArt}" class="track-artist" onclick="event.stopPropagation()">${nome}</a>`;
                }).join(", ");
            }

            // Relacionar Álbum e criar link (se houver)
            let linkAlbum = `<span class="track-album" style="color: #cbd5e1;">Single</span>`;
            if (musica.cod_album) {
                const album = albuns.find(a => a.cod_album === musica.cod_album);
                if (album) {
                    linkAlbum = `<a href="InformacoesAlbum.html?id=${album.cod_album}" class="album-link" onclick="event.stopPropagation()">${album.nome_album}</a>`;
                }
            }

            // Montar a linha da tabela e injetar no HTML
            const trackHTML = `
                <tr class="track-row" onclick="window.location.href='MusicaDetalhe.html?id=${musica.cod_musica}'">
                  <td class="track-index">${index + 1}</td>
                  <td>
                    <div class="track-title-cell">
                      <img src="${musica.caminho_logo}" alt="Capa Faixa" class="track-thumb">
                      <div class="track-details">
                        <a href="MusicaDetalhe.html?id=${musica.cod_musica}" class="track-name" onclick="event.stopPropagation()">${musica.nome_musc}</a>
                        <div>${linksArtistas}</div>
                      </div>
                    </div>
                  </td>
                  <td class="track-time">${musica.duracao_musica}</td>
                  <td class="track-album">${linkAlbum}</td>
                </tr>
            `;
            tracklistBody.insertAdjacentHTML('beforeend', trackHTML);
        });
    })
    .catch(erro => console.error("Erro ao carregar as músicas do gênero:", erro));
}

// 3. Configurar Botões de Reprodução e Aleatório
function setupBotoesGenero() {
    const shuffleBtn = document.getElementById('shuffle-genero-btn');
    const shuffleIcon = document.getElementById('shuffle-icon');
    const playBtn = document.getElementById('play-genero-btn');

    if (shuffleBtn) {
        shuffleBtn.addEventListener('click', () => {
            isShuffleAtivo = !isShuffleAtivo;
            // Destaca o botão com verde se estiver aleatório, branco se padrão
            shuffleIcon.style.fill = isShuffleAtivo ? '#1db954' : '#ffffff'; 
        });
    }

    if (playBtn) {
        playBtn.addEventListener('click', playGeneroPlaylist);
    }
}

// 4. Lógica de Tocar as Músicas (Play Playlist)
function playGeneroPlaylist() {
    const urlParams = new URLSearchParams(window.location.search);
    let idGen = urlParams.get('id') || 'g0';

    fetch('Json/Musica.json')
        .then(res => res.json())
        .then(musicas => {
            // Pega todas as músicas do gênero e ordena por reproduções (decrescente)
            let musicasDoGenero = musicas
                .filter(m => m.cod_genero === idGen)
                .sort((a, b) => (b.reproducoes_musica || 0) - (a.reproducoes_musica || 0));
                
            if (musicasDoGenero.length === 0) return;

            // Se o botão aleatório estiver ativado, embaralha a lista sem repetir
            if (isShuffleAtivo) {
                // Algoritmo Fisher-Yates para embaralhar o Array
                for (let i = musicasDoGenero.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [musicasDoGenero[i], musicasDoGenero[j]] = [musicasDoGenero[j], musicasDoGenero[i]];
                }
            }

            // Cria a lista apenas com os caminhos de áudio
            const listaCaminhosDeAudio = musicasDoGenero.map(m => m.caminho_arquivo);

            // Conexão com ScriptMusicaGlobal.js via LocalStorage
            localStorage.setItem('playlistAtual', JSON.stringify(listaCaminhosDeAudio));
            localStorage.setItem('playlistIndexAtual', '0');

            // Dispara a reprodução ou notifica o script global
            if (typeof tocarMusicaGlobal === 'function') {
                tocarMusicaGlobal(listaCaminhosDeAudio[0]);
            } else {
                window.dispatchEvent(new Event('novaPlaylistCarregada'));
            }
        })
        .catch(erro => console.error("Erro ao carregar a playlist do gênero:", erro));
}

// 5. Inicialização (Executado ao carregar a página)
document.addEventListener('DOMContentLoaded', () => {
    showInformacoesGenero();
    showMusicasGenero(); 
    setupBotoesGenero(); 
});