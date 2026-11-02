function carregarPaginaMusica() {
    const urlParams = new URLSearchParams(window.location.search);
    const idMusica = urlParams.get('id');

    if (!idMusica) return;

    fetch('Json/Musica.json')
        .then(resposta => resposta.json())
        .then(musicas => {
            const musicaEncontrada = musicas.find(m => m.cod_musica === idMusica);
            
            if (!musicaEncontrada) return;

            document.getElementById('nome-musica-titulo').textContent = musicaEncontrada.nome_musc;
            document.getElementById('imagem-capa-musica').src = musicaEncontrada.caminho_logo;

            if (musicaEncontrada.letra_musica) {
                const letraFormatada = musicaEncontrada.letra_musica.replace(/\n/g, '<br>');
                document.getElementById('letra-musica-texto').innerHTML = letraFormatada;
            }

            const btnPlay = document.querySelector('.play-song-btn'); 
            const iconePath = document.querySelector('.play-song-icon path');
            
            const svgPlay = "M8 5v14l11-7z";
            const svgPause = "M6 19h4V5H6v14zm8-14v14h4V5h-4z";
            
            if (btnPlay && musicaEncontrada.caminho_arquivo) {
                const musicaSalva = localStorage.getItem('musicaAtual');
                const tocando = localStorage.getItem('musicaTocando') === 'true';
                const musicaSalvaDecodificada = musicaSalva ? decodeURI(musicaSalva) : null;
                
                if (musicaSalvaDecodificada && musicaSalvaDecodificada.includes(musicaEncontrada.caminho_arquivo)) {
                    if (tocando) {
                        iconePath.setAttribute('d', svgPause);
                    }
                }

                btnPlay.addEventListener('click', () => {
                    const srcAtual = reprodutorAudio.src ? decodeURI(reprodutorAudio.src) : "";

                    if (srcAtual.endsWith(musicaEncontrada.caminho_arquivo) || (musicaSalvaDecodificada && musicaSalvaDecodificada.includes(musicaEncontrada.caminho_arquivo))) {
                        if (reprodutorAudio.paused) {
                            reprodutorAudio.play();
                            iconePath.setAttribute('d', svgPause);
                            localStorage.setItem('musicaTocando', 'true');
                        } else {
                            reprodutorAudio.pause();
                            iconePath.setAttribute('d', svgPlay);
                            localStorage.setItem('musicaTocando', 'false');
                        }
                    } else {
                        reprodutorAudio.src = musicaEncontrada.caminho_arquivo;
                        reprodutorAudio.play();
                        iconePath.setAttribute('d', svgPause);
                        
                        localStorage.setItem('musicaAtual', musicaEncontrada.caminho_arquivo);
                        localStorage.setItem('musicaTocando', 'true');
                        localStorage.setItem('sidebarNome', musicaEncontrada.nome_musc);
                        localStorage.setItem('sidebarCapa', musicaEncontrada.caminho_logo);
                    }
                });

                reprodutorAudio.addEventListener('ended', () => {
                    iconePath.setAttribute('d', svgPlay);
                    localStorage.setItem('musicaTocando', 'false');
                });
            }

            if (musicaEncontrada.cod_artista && musicaEncontrada.cod_artista.length > 0) {
                fetch('Json/Artista.json')
                    .then(resposta => resposta.json())
                    .then(artistas => {
                        const idPrimeiroArtista = musicaEncontrada.cod_artista[0];
                        const primeiroArtista = artistas.find(a => a.cod_artista === idPrimeiroArtista);

                        if (primeiroArtista) {
                            const imgPequena = document.getElementById('imagem-pequena-artista');
                            const elementoNome = document.getElementById('nome-artista-texto');
                            
                            if (imgPequena) imgPequena.src = primeiroArtista.caminho_logo_ar;
                            if (elementoNome) {
                                elementoNome.textContent = primeiroArtista.nome_artista;
                                elementoNome.href = `PainelArtista.html?id=${primeiroArtista.cod_artista}`;
                            }
                            
                            if (btnPlay) {
                                btnPlay.addEventListener('click', () => {
                                    localStorage.setItem('sidebarArtista', primeiroArtista.nome_artista);
                                });
                            }
                        }

                        const containerArtistas = document.getElementById('artists-container');
                        if (containerArtistas) {
                            containerArtistas.innerHTML = ''; 
                            musicaEncontrada.cod_artista.forEach(codigo => {
                                const artistaEncontrado = artistas.find(a => a.cod_artista === codigo);
                                if (artistaEncontrado) {
                                    const cardHTML = `
                                        <div class="artist-item-card">
                                          <img src="${artistaEncontrado.caminho_logo_ar}" alt="${artistaEncontrado.nome_artista}" class="artist-item-avatar">
                                          <div class="artist-item-info">
                                            <span class="artist-item-label">Artista(s)</span>
                                            <a href="PainelArtista.html?id=${artistaEncontrado.cod_artista}" class="artist-item-name">${artistaEncontrado.nome_artista}</a>
                                          </div>
                                        </div>
                                    `;
                                    containerArtistas.insertAdjacentHTML('beforeend', cardHTML);
                                }
                            });
                        }
                    })
                    .catch(erro => console.error("Erro ao carregar os artistas:", erro));
            }

            if (musicaEncontrada.cod_album) {
                fetch('Json/Album.json')
                    .then(resposta => resposta.json())
                    .then(albuns => {
                        const albumEncontrado = albuns.find(a => a.cod_album === musicaEncontrada.cod_album);
                        const containerAlbum = document.getElementById('album-container');

                        if (albumEncontrado && containerAlbum) {
                            containerAlbum.innerHTML = `
                                <div class="artist-item-card">
                                  <img src="${albumEncontrado.caminho_capa}" alt="${albumEncontrado.nome_album}" class="artist-item-avatar" style="border-radius: 6px;">
                                  <div class="artist-item-info">
                                    <span class="artist-item-label">Álbum</span>
                                    <a href="InformacoesAlbum.html?id=${albumEncontrado.cod_album}" class="artist-item-name">${albumEncontrado.nome_album}</a>
                                  </div>
                                </div>
                            `;
                        }
                    })
                    .catch(erro => console.error("Erro ao carregar o álbum da música:", erro));
            }
        })
        .catch(erro => console.error("Erro ao carregar a música:", erro));
}

document.addEventListener('DOMContentLoaded', carregarPaginaMusica);