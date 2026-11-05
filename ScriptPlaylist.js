let isShuffleAtivo = false;

// 1. Mostrar Informações da Playlist (Capa e Título)
function showInformacoesPlaylist() {
    const urlParams = new URLSearchParams(window.location.search);
    let idPl = urlParams.get('id');

    if (!idPl) {
        idPl = 'pl0'; // ID padrão caso nenhum seja passado na URL
    }

    fetch('Json/Playlist.json')
        .then(resposta => {
            if (!resposta.ok) throw new Error("Erro na leitura de Playlist.json");
            return resposta.json();
        })
        .then(playlists => {
            const playlist = playlists.find(p => p.cod_playlist === idPl);

            if (playlist) {
                document.getElementById('capa-playlist-img').src = playlist.caminho_logo_pl;
                document.getElementById('nome-playlist-texto').textContent = playlist.nome_playlist;
            }
        })
        .catch(erro => console.error("Erro ao carregar a playlist:", erro));
}

// 2. Listar as Músicas da Playlist na Tabela (Na ordem declarada no JSON)
function showMusicasPlaylist() {
    const urlParams = new URLSearchParams(window.location.search);
    let idPl = urlParams.get('id') || 'pl0';

    Promise.all([
        fetch('Json/Playlist.json').then(res => res.json()),
        fetch('Json/Musica.json').then(res => res.json()),
        fetch('Json/Artista.json').then(res => res.json()),
        fetch('Json/Album.json').then(res => res.json())
    ])
    .then(([playlists, musicas, artistas, albuns]) => {
        const playlist = playlists.find(p => p.cod_playlist === idPl);
        if (!playlist) return;

        const tracklistBody = document.getElementById('tracklist-playlist-body');
        if (!tracklistBody) return;

        tracklistBody.innerHTML = ''; // Limpa a tabela antes de popular

        // Mapeia os IDs exatamente na ordem em que aparecem no array "cod_musica" do Playlist.json
        const musicasDaPlaylist = playlist.cod_musica.map(cod => {
            return musicas.find(m => m.cod_musica === cod);
        }).filter(m => m !== undefined); // Remove valores nulos caso uma música tenha sido apagada do Musica.json

        musicasDaPlaylist.forEach((musica, index) => {
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
    .catch(erro => console.error("Erro ao carregar as músicas da playlist:", erro));
}

// 3. Configurar Botões de Reprodução e Aleatório
function setupBotoesPlaylist() {
    const shuffleBtn = document.getElementById('shuffle-playlist-btn');
    const shuffleIcon = document.getElementById('shuffle-icon');
    const playBtn = document.getElementById('play-playlist-btn');

    if (shuffleBtn) {
        shuffleBtn.addEventListener('click', () => {
            isShuffleAtivo = !isShuffleAtivo;
            // Destaca o botão com verde se estiver aleatório, branco se padrão
            shuffleIcon.style.fill = isShuffleAtivo ? '#1db954' : '#ffffff'; 
        });
    }

    if (playBtn) {
        playBtn.addEventListener('click', playPlaylist);
    }
}

// 4. Lógica de Tocar as Músicas (Play / Global)
function playPlaylist() {
    const urlParams = new URLSearchParams(window.location.search);
    let idPl = urlParams.get('id') || 'pl0';

    Promise.all([
        fetch('Json/Playlist.json').then(res => res.json()),
        fetch('Json/Musica.json').then(res => res.json())
    ])
    .then(([playlists, musicas]) => {
        const playlist = playlists.find(p => p.cod_playlist === idPl);
        if (!playlist) return;

        // Pega as músicas na ordem padrão da array
        let musicasDaPlaylist = playlist.cod_musica.map(cod => {
            return musicas.find(m => m.cod_musica === cod);
        }).filter(m => m !== undefined);
                
        if (musicasDaPlaylist.length === 0) return;

        // Se o botão aleatório estiver ativado, embaralha a lista sem repetir
        if (isShuffleAtivo) {
            for (let i = musicasDaPlaylist.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [musicasDaPlaylist[i], musicasDaPlaylist[j]] = [musicasDaPlaylist[j], musicasDaPlaylist[i]];
            }
        }

        // Cria a lista apenas com os caminhos de áudio
        const listaCaminhosDeAudio = musicasDaPlaylist.map(m => m.caminho_arquivo);

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
    .catch(erro => console.error("Erro ao reproduzir a playlist:", erro));
}

// 5. Inicialização (Executado ao carregar a página)
document.addEventListener('DOMContentLoaded', () => {
    showInformacoesPlaylist();
    showMusicasPlaylist(); 
    setupBotoesPlaylist(); 
});