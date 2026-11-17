function showBannerArtista() {
    const urlParams = new URLSearchParams(window.location.search);
    const idArtista = urlParams.get('id');

    fetch('Json/Artista.json')
        .then(resposta => resposta.json())
        .then(artistas => {
            const artistaEncontrado = artistas.find(a => a.cod_artista === idArtista);
            
            if (artistaEncontrado && artistaEncontrado.caminho_banner_ar) {
                const sectionBanner = document.getElementById('artist-hero-section');
                
                sectionBanner.style.backgroundImage = `linear-gradient(to top, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.1) 60%), url('${artistaEncontrado.caminho_banner_ar}')`;
                
                document.getElementById('nome-artista-texto').textContent = artistaEncontrado.nome_artista;
            }
        })
        .catch(erro => console.error("Erro ao carregar o banner do artista:", erro));
}

document.addEventListener('DOMContentLoaded', showBannerArtista);








function showPopularesArtista() {
    const urlParams = new URLSearchParams(window.location.search);
    const idArtista = urlParams.get('id');

    Promise.all([
        fetch('Json/Musica.json').then(res => res.json()),
        fetch('Json/Artista.json').then(res => res.json())
    ])
    .then(([musicas, artistas]) => {
        const musicasDoArtista = musicas.filter(m => m.cod_artista.includes(idArtista));

        musicasDoArtista.sort((a, b) => b.reproducoes_musica - a.reproducoes_musica);

        const top5Musicas = musicasDoArtista.slice(0, 5);

        const containerPopulares = document.getElementById('populares-container');
        if (!containerPopulares) return;
        
        containerPopulares.innerHTML = ''; 

        top5Musicas.forEach((musica, index) => {
            
            const nomesDosArtistas = musica.cod_artista.map(codigo => {
                const artistaEncontrado = artistas.find(a => a.cod_artista === codigo);
                return artistaEncontrado ? artistaEncontrado.nome_artista : 'Artista Desconhecido';
            }).join(', '); 

            const reproducoesFormatadas = musica.reproducoes_musica.toLocaleString('pt-BR');

            const trackHTML = `
                <a href="MusicaDetalhe.html?id=${musica.cod_musica}" class="track-row">
                    <span class="track-num">${index + 1}</span>
                    <img src="${musica.caminho_logo}" alt="Capa ${musica.nome_musc}" class="track-img-icon">
                    <div class="track-info">
                        <span class="track-title">${musica.nome_musc}</span>
                        <span class="track-artist">${nomesDosArtistas}</span>
                    </div>
                    <span class="track-duration">${musica.duracao_musica}</span>
                    <span class="track-plays">${reproducoesFormatadas}</span>
                </a>
            `;
            containerPopulares.innerHTML += trackHTML;
        });
    })
    .catch(erro => console.error("Erro ao carregar músicas populares:", erro));
}

document.addEventListener('DOMContentLoaded', showPopularesArtista);







function showAlbunsArtista() {
    const urlParams = new URLSearchParams(window.location.search);
    const idArtista = urlParams.get('id');

    fetch('Json/Album.json')
        .then(resposta => resposta.json())
        .then(albuns => {
            const albunsDoArtista = albuns.filter(album => album.cod_artista.includes(idArtista));

            const max4Albuns = albunsDoArtista.slice(0, 4);

            const containerAlbuns = document.getElementById('albums-container');
            if (!containerAlbuns) return;

            containerAlbuns.innerHTML = ''; 

            albunsDoArtista.forEach(album => {
                const albumHTML = `
                    <a href="InformacoesAlbum.html?id=${album.cod_album}" class="album-card">
                        <img src="${album.caminho_capa}" alt="Capa de ${album.nome_album}" class="album-cover-img">
                        <span class="album-name">${album.nome_album}</span>
                    </a>
                `;
                containerAlbuns.innerHTML += albumHTML;
            });
        })
        .catch(erro => console.error("Erro ao carregar os álbuns:", erro));
}

document.addEventListener('DOMContentLoaded', showAlbunsArtista);