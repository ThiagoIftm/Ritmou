function showBannerArtista() {
    const urlParams = new URLSearchParams(window.location.search);
    const idArtista = urlParams.get('id'); // Ex: ?id=ar0

    fetch('Json/Artista.json')
        .then(resposta => resposta.json())
        .then(artistas => {
            const artistaEncontrado = artistas.find(a => a.cod_artista === idArtista);
            
            if (artistaEncontrado && artistaEncontrado.caminho_banner_ar) {
                const sectionBanner = document.getElementById('artist-hero-section');
                
                // Aplica o gradiente e a URL da imagem do JSON simultaneamente
                sectionBanner.style.backgroundImage = `linear-gradient(to top, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.1) 60%), url('${artistaEncontrado.caminho_banner_ar}')`;
                
                // Opcional: já aproveita para preencher o nome do artista
                document.getElementById('nome-artista-texto').textContent = artistaEncontrado.nome_artista;
            }
        })
        .catch(erro => console.error("Erro ao carregar o banner do artista:", erro));
}

// Executa a função no carregamento da página
document.addEventListener('DOMContentLoaded', showBannerArtista);






////////////////////////////////////////////////////////////////////////////////////////////////////////////////






function showPopularesArtista() {
    const urlParams = new URLSearchParams(window.location.search);
    const idArtista = urlParams.get('id');

    // Lê os dois arquivos JSON simultaneamente
    Promise.all([
        fetch('Json/Musica.json').then(res => res.json()),
        fetch('Json/Artista.json').then(res => res.json())
    ])
    .then(([musicas, artistas]) => {
        // 1. Filtra apenas as músicas onde o artista participa
        const musicasDoArtista = musicas.filter(m => m.cod_artista.includes(idArtista));

        // 2. Ordena as músicas por número de reproduções (da maior para a menor)
        musicasDoArtista.sort((a, b) => b.reproducoes_musica - a.reproducoes_musica);

        // 3. Pega apenas as 5 primeiras
        const top5Musicas = musicasDoArtista.slice(0, 5);

        const containerPopulares = document.getElementById('populares-container');
        if (!containerPopulares) return;
        
        containerPopulares.innerHTML = ''; // Limpa antes de preencher

        // 4. Monta o HTML de cada música
        top5Musicas.forEach((musica, index) => {
            // Converte os códigos "arX" nos nomes reais usando o Artista.json
            const nomesDosArtistas = musica.cod_artista.map(codigo => {
                const artistaEncontrado = artistas.find(a => a.cod_artista === codigo);
                return artistaEncontrado ? artistaEncontrado.nome_artista : 'Artista Desconhecido';
            }).join(', '); // Une os nomes com vírgula

            // Formata o número de reproduções com pontos (ex: 407.500.924)
            const reproducoesFormatadas = musica.reproducoes_musica.toLocaleString('pt-BR');

            // Cria a linha da música com o link dinâmico MusicaDetalhe.html?id=mX
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

// Adiciona a função ao carregamento da página
document.addEventListener('DOMContentLoaded', showPopularesArtista);







////////////////////////////////////////////////////////////////////////////////////////////////////////////////







function showAlbunsArtista() {
    const urlParams = new URLSearchParams(window.location.search);
    const idArtista = urlParams.get('id');

    fetch('Json/Album.json')
        .then(resposta => resposta.json())
        .then(albuns => {
            // Filtra apenas os álbuns onde o código do artista atual está presente
            const albunsDoArtista = albuns.filter(album => album.cod_artista.includes(idArtista));

            // Limita a um máximo de 4 álbuns
            const max4Albuns = albunsDoArtista.slice(0, 4);

            const containerAlbuns = document.getElementById('albums-container');
            if (!containerAlbuns) return;

            containerAlbuns.innerHTML = ''; // Limpa antes de preencher

            // Constrói a caixa de cada álbum e adiciona na tela
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

// Adiciona o evento para carregar automaticamente ao abrir a página
document.addEventListener('DOMContentLoaded', showAlbunsArtista);