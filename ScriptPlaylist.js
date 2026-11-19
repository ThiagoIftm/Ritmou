let isShuffleAtivo = false;

// 1. Função auxiliar para buscar a playlist de onde ela estiver (User Session ou JSON Padrão)
async function getPlaylist(idPl) {
    // Primeiro verifica as playlists criadas pelo usuário
    const playlistsUser = JSON.parse(sessionStorage.getItem('ritmou_playlists_user')) || [];
    const playlistUser = playlistsUser.find(pl => pl.id === idPl);
    
    if (playlistUser) {
        return {
            cod_playlist: playlistUser.id,
            nome_playlist: playlistUser.nome,
            caminho_logo_pl: playlistUser.capa,
            // Extrai apenas os códigos para manter compatibilidade com o formato do JSON
            cod_musica: playlistUser.musicas.map(m => m.cod_musica) 
        };
    }

    // Se não achou na sessão, busca no JSON do sistema
    try {
        const res = await fetch('Json/Playlist.json');
        const playlistsSystem = await res.json();
        return playlistsSystem.find(p => p.cod_playlist === idPl);
    } catch (erro) {
        console.error("Erro ao ler Playlist.json:", erro);
        return null;
    }
}

// 2. Função principal para carregar as informações e músicas
async function carregarPaginaPlaylist() {
    const urlParams = new URLSearchParams(window.location.search);
    let idPl = urlParams.get('id') || 'pl0';

    const playlist = await getPlaylist(idPl);

    if (!playlist) {
        document.getElementById('nome-playlist-texto').textContent = 'Playlist não encontrada';
        return;
    }

    // Informações Base (Capa e Nome)
    document.getElementById('capa-playlist-img').src = playlist.caminho_logo_pl || 'Imagens/default-placeholder.png';
    document.getElementById('nome-playlist-texto').textContent = playlist.nome_playlist;

    // Busca dependências para montar a lista
    try {
        const [musicas, artistas, albuns] = await Promise.all([
            fetch('Json/Musica.json').then(res => res.json()),
            fetch('Json/Artista.json').then(res => res.json()),
            fetch('Json/Album.json').then(res => res.json()).catch(() => []) // catch se não houver Album.json
        ]);

        const tracklistBody = document.getElementById('tracklist-playlist-body');
        if (!tracklistBody) return;
        tracklistBody.innerHTML = ''; 

        const musicasDaPlaylist = (playlist.cod_musica || []).map(cod => {
            return musicas.find(m => m.cod_musica === cod);
        }).filter(m => m !== undefined);

        if (musicasDaPlaylist.length === 0) {
            tracklistBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 30px; color: #cbd5e1;">Esta playlist está vazia.</td></tr>';
        }

        musicasDaPlaylist.forEach((musica, index) => {
            let linksArtistas = "Desconhecido";
            if (Array.isArray(musica.cod_artista)) {
                linksArtistas = musica.cod_artista.map(idArt => {
                    const artista = artistas.find(a => a.cod_artista === idArt);
                    const nome = artista ? artista.nome_artista : "Desconhecido";
                    return `<a href="PainelArtista.html?id=${idArt}" class="track-artist" onclick="event.stopPropagation()">${nome}</a>`;
                }).join(", ");
            }

            let linkAlbum = `<span class="track-album" style="color: #cbd5e1;">Single</span>`;
            if (musica.cod_album) {
                const album = albuns.find(a => a.cod_album === musica.cod_album);
                if (album) {
                    linkAlbum = `<a href="InformacoesAlbum.html?id=${album.cod_album}" class="album-link" onclick="event.stopPropagation()">${album.nome_album}</a>`;
                }
            }

            const trackHTML = `
                <tr class="track-row" onclick="tocarMusicaDaLista('${musica.caminho_arquivo}')">
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
                  <td class="track-time">${musica.duracao_musica || '--:--'}</td>
                  <td class="track-album">${linkAlbum}</td>
                </tr>
            `;
            tracklistBody.insertAdjacentHTML('beforeend', trackHTML);
        });
        
        // Configura os botões passando os dados atuais
        setupBotoesPlaylist(playlist, musicas);
        
    } catch (erro) {
        console.error("Erro ao carregar as músicas da playlist:", erro);
    }
}

// 3. Configuração dos Botões (Shuffle e Play Geral)
function setupBotoesPlaylist(playlist, musicasTodas) {
    const shuffleBtn = document.getElementById('shuffle-playlist-btn');
    const playBtn = document.getElementById('play-playlist-btn');

    if (shuffleBtn) {
        // Clona e substitui para remover event listeners duplicados (caso atualize a página)
        const novoShuffle = shuffleBtn.cloneNode(true);
        shuffleBtn.parentNode.replaceChild(novoShuffle, shuffleBtn);
        
        novoShuffle.addEventListener('click', () => {
            isShuffleAtivo = !isShuffleAtivo;
            novoShuffle.querySelector('.shuffle-icon').style.fill = isShuffleAtivo ? '#1db954' : '#ffffff'; 
        });
    }

    if (playBtn) {
        const novoPlay = playBtn.cloneNode(true);
        playBtn.parentNode.replaceChild(novoPlay, playBtn);
        
        novoPlay.addEventListener('click', () => playPlaylist(playlist, musicasTodas));
    }
}

// 4. Tocar a Playlist Inteira (Baseado no botão principal)
function playPlaylist(playlist, musicasTodas) {
    let musicasDaPlaylist = (playlist.cod_musica || []).map(cod => {
        return musicasTodas.find(m => m.cod_musica === cod);
    }).filter(m => m !== undefined);
            
    if (musicasDaPlaylist.length === 0) return;

    if (isShuffleAtivo) {
        for (let i = musicasDaPlaylist.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [musicasDaPlaylist[i], musicasDaPlaylist[j]] = [musicasDaPlaylist[j], musicasDaPlaylist[i]];
        }
    }

    const listaCaminhosDeAudio = musicasDaPlaylist.map(m => m.caminho_arquivo);

    localStorage.setItem('playlistAtual', JSON.stringify(listaCaminhosDeAudio));
    localStorage.setItem('playlistIndexAtual', '0');

    if (typeof tocarMusicaGlobal === 'function') {
        tocarMusicaGlobal(listaCaminhosDeAudio[0]);
    } else {
        window.dispatchEvent(new Event('novaPlaylistCarregada'));
    }
}

// 5. Tocar música ao clicar diretamente na linha (TR) da tabela
function tocarMusicaDaLista(caminhoArquivo) {
    if (typeof tocarMusicaGlobal === 'function') {
        tocarMusicaGlobal(caminhoArquivo);
    }
}

// 6. Start Inicial
document.addEventListener('DOMContentLoaded', () => {
    carregarPaginaPlaylist();
});