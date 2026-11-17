
document.addEventListener('DOMContentLoaded', () => {
    carregarDadosDoAlbum();
    showMusicasAlbum();
});

function carregarDadosDoAlbum() {
    if (!document.getElementById('nome-album-texto')) return;

    const urlParams = new URLSearchParams(window.location.search);
    let idAlbum = urlParams.get('id');

    if (!idAlbum) {
        idAlbum = 'a1';
    }

    fetch('Json/Album.json')
        .then(resposta => {
            if (!resposta.ok) throw new Error("Erro na leitura de Album.json");
            return resposta.json();
        })
        .then(albuns => {
            const album = albuns.find(a => a.cod_album === idAlbum);

            if (album) {
                document.getElementById('nome-album-texto').textContent = album.nome_album;
                document.getElementById('capa-album-img').src = album.caminho_capa;

                fetch('Json/Artista.json')
                    .then(resposta => {
                        if (!resposta.ok) throw new Error("Erro na leitura de Artista.json");
                        return resposta.json();
                    })
                    .then(artistas => {
                        const artista = artistas.find(ar => ar.cod_artista === album.cod_artista);

                        if (artista) {
                            const elementoNomeArtista = document.getElementById('nome-artista-texto');
                            elementoNomeArtista.innerHTML = `<a href="PainelArtista.html?id=${artista.cod_artista}" style="color: inherit; text-decoration: none;">${artista.nome_artista}</a>`;
                            
                            document.getElementById('foto-artista-img').src = artista.caminho_logo_ar;
                        }
                    })
                    .catch(erro => console.error("Erro ao carregar o artista:", erro));
            }
        })
        .catch(erro => console.error("Erro ao carregar o álbum:", erro));
}

function showMusicasAlbum() {
    
    if (!document.getElementById('nome-album-texto')) return;

    const urlParams = new URLSearchParams(window.location.search);
    let idAlbum = urlParams.get('id');

    if (!idAlbum) {
        idAlbum = 'a1';
    }

    Promise.all([
        fetch('Json/Musica.json').then(res => res.json()),
        fetch('Json/Artista.json').then(res => res.json())
    ])
    .then(([musicas, artistas]) => {
        const musicasDoAlbum = musicas.filter(m => m.cod_album === idAlbum);
        const tracklistBody = document.querySelector('.tracklist-body');

        if (tracklistBody) {
            tracklistBody.innerHTML = ''; 

            musicasDoAlbum.forEach((musica, index) => {
                let nomesArtistas = "Artista Desconhecido";
                
                if (Array.isArray(musica.cod_artista)) {
                    nomesArtistas = musica.cod_artista.map(id => {
                        const art = artistas.find(a => a.cod_artista === id);
                        return art ? art.nome_artista : "Desconhecido";
                    }).join(", ");
                }

                const trackHTML = `
                    <a href="MusicaDetalhe.html?id=${musica.cod_musica}" class="track-row">
                      <img src="${musica.caminho_logo}" alt="Capa Faixa" class="track-img-icon">
                      <span class="track-num">${index + 1}</span>
                      <div class="track-info">
                        <span class="track-title">${musica.nome_musc}</span>
                        <span class="track-artist">${nomesArtistas}</span>
                      </div>
                      <span class="track-duration">${musica.duracao_musica}</span>
                    </a>
                `;
                tracklistBody.insertAdjacentHTML('beforeend', trackHTML);
            });
        }
    })
    .catch(erro => console.error("Erro ao carregar as músicas e artistas:", erro));
}