document.addEventListener('DOMContentLoaded', () => {
    const pokemonList = document.getElementById('pokemonList');
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');
    const maleSymbol = '<span style="color: purple;">♂</span>';
    const femaleSymbol = '<span style="color: red;">♀</span>';

    // Adiciona o evento de clique ao elemento pai
    pokemonList.addEventListener('click', async (event) => {
        const listItem = event.target.closest('.pokemon');

        if (listItem) {
            const pokemonName = listItem.querySelector('.name')?.textContent.trim();
            const pokemon = pokemonsArray.find(pokemon => pokemon.name.toLowerCase() === pokemonName.toLowerCase());
            if (pokemon) {
                if (pokemon.evolutions instanceof Promise) {
                    pokemon.evolutions = await pokemon.evolutions;
                }
                if(pokemon.moves instanceof Promise){
                    pokemon.moves = await pokemon.moves
                }
                const newHtml = convertPokemonToInitial(pokemon);
                modalContent.innerHTML = newHtml;
                modal.style.display = 'block';
                console.log(pokemon);

                // Adiciona o evento de clique ao botão de fechar dentro do modal
                const closeButton = modalContent.querySelector('#close');
                closeButton.addEventListener('click', () => {
                    modal.style.display = 'none';
                });

                // Adiciona eventos à navbar dentro do modal
                const navLinks = modalContent.querySelectorAll(".nav-link");
                navLinks.forEach(link => {
                    link.addEventListener("click", (e) => {
                        e.preventDefault();
                        // Gerencia as classes 'active'
                        navLinks.forEach(nav => nav.classList.remove("active"));
                        const details = modalContent.querySelectorAll(".card-body");
                        details.forEach(content => content.classList.remove("active"));

                        link.classList.add("active");
                        const targetId = link.getAttribute("data-target");
                        document.getElementById(targetId).classList.add("active");
                    });

                });
            } else {
                alert('Pokémon não encontrado!');
            }
        }
    });

    // Fecha o modal ao clicar fora dele
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Função para criar o conteúdo do modal
    function convertPokemonToInitial(pokemon) {

        function progressColor(pokemonProgress) {

            return pokemonProgress <= 59 ? "red" :
                pokemonProgress >= 60 && pokemonProgress <= 89 ? "yellow" :
                    pokemonProgress >= 90 && pokemonProgress <= 109 ? "green" : "blue";
        }

        return `
                <div class= "modal-button ${pokemon.type}">
                    <button type="button" id="close" class="close">&larr;</button>
                    <button type="button" id="love" class="love">&#10084;</button>
                </div>
            <div class="modal-initial ${pokemon.type}">
                <span class="number">#${pokemon.number}</span>
                <span class="name">${pokemon.name}</span>

                <div class="detail">
                    <ol class="types">
                        ${pokemon.types.map((type) => `<li class="type ${type}">${type}</li>`).join('')}
                    </ol>
                    <img class="initial-img" src="${pokemon.photo}" alt="${pokemon.name}">
                </div>

                <!-- Details -->
                <div class="modal-detail">
                    <!-- Navbar -->
                    <div class="card text-center">
                        <div class="card-header">
                            <ul class="nav nav-tabs card-header-tabs">
                                <li class="nav-item">
                                    <a class="nav-link active" data-target="about" aria-current="true"
                                        href="#">About</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" data-target="base-stats" href="#">Base Stats</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" data-target="evolution" href="#">Evolution</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" data-target="moves" href="#">Moves</a>
                                </li>
                            </ul>
                        </div>
                        <div id="about" class="card-body">
                            <table>
                                <tbody>
                                    <tr>
                                        <th scope="row">Species</th>

                                        <td>${pokemon.species}</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">Height</th>

                                        <td>${pokemon.height}</td>

                                    </tr>
                                    <tr>
                                        <th scope="row">Weigth</th>

                                        <td>${pokemon.weight}</td>

                                    </tr>
                                    <tr>
                                        <th scope="row">Abilities</th>

                                        <td> ${pokemon.abilities.map((ability) => `${ability}`).join(', ')}</td>

                                    </tr>
                                </tbody>
                            </table>
                            <br>
                            <h5>Breeding</h5>

                            <table>
                                <tbody>
                                    <tr>
                                        <th scope="row">Gender</th>
                                        <td>${maleSymbol} ${pokemon.gender.male}%  ${femaleSymbol} ${pokemon.gender.female}%</td>
                                        
                                    </tr>
                                    <tr>
                                        <th scope="row">Egg Groups</th>
                                        <td>${pokemon.egggroups.map((egggroup) => `${egggroup}`).join(', ')}</td>
                                    </tr>
                                    <tr>
                                        <th scope="row">Egg Cycle</th>
                                        <td>${pokemon.eggcycle}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div id="base-stats" class="card-body">
                            <table>
                                <tbody>
                                    <tr>
                                        <th>HP</th>
                                        <td>${pokemon.hp}</td>
                                        <td><progress value="${pokemon.hp}" max="255"  class="progress ${progressColor(pokemon.hp)}"></progress></td>
                                    </tr>
                                    <tr>
                                        <th >Attack</th>
                                        <td>${pokemon.attack}</td>
                                        <td><progress value="${pokemon.attack}" max="255"  class="progress ${progressColor(pokemon.attack)}"></progress></td>
                                    </tr>
                                    <tr>
                                        <th>Defense</th>
                                        <td>${pokemon.defense}</td>
                                        <td><progress value="${pokemon.defense}" max="250"  class="progress ${progressColor(pokemon.defense)}"></progress></td>
                                    </tr>
                                    <tr>
                                        <th>Sp. Atk.</th>
                                        <td>${pokemon.spatk}</td>
                                        <td><progress value="${pokemon.spatk}" max="194"  class="progress ${progressColor(pokemon.spatk)}"></progress></td>
                                    </tr>
                                    <tr>
                                        <th>Sp. Def.</th>
                                        <td>${pokemon.spdef}</td>
                                        <td><progress value="${pokemon.spdef}" max="250"  class="progress ${progressColor(pokemon.spdef)}"></progress></td>
                                    </tr>
                                    <tr>
                                        <th >Speed</th>
                                        <td>${pokemon.speed}</td>
                                        <td><progress value="${pokemon.speed}" max="200"  class="progress ${progressColor(pokemon.speed)}"></progress></td>
                                    </tr>
                                    <tr>
                                        <th>Total</th>
                                        <td>${pokemon.total}</td>
                                        <td>
                                        <progress value="${pokemon.total}" max="800"  class="progress ${pokemon.total < 400 ? "red" :
                pokemon.total >= 400 && pokemon.total <= 499 ? "yellow" :
                    pokemon.total >= 500 && pokemon.total <= 599 ? "green" :
                        "blue"}">
                                        </progress></td>
                                    </tr>
                                </tbody>
                            </table>
                            <br>
                            <h3 class:"typedefenses">Type defenses</h3>
                            <p  class:"typedefenses">${pokemon.typedefenses}</p>
                        </div>
                        <div id="evolution" class="card-body">
                            <table>
                            <thead>
                                <tr>
                                    <th scope="col">Name</th>
                                    <th scope="col">Image</th>
                                    
                                </tr>
                            </thead>
                                
                                <tbody>
                                    ${pokemon.evolutions.map(evolution => `
                                        <tr>
                                            <td style="border: 1px solid #ccc">${evolution.name}</td>
                                            <td style="border: 1px solid #ccc"><img src="${evolution.image}" alt="${evolution.name}"></td>
                                        </tr>
                                    `).join('')}
                                    
                                </tbody>
                            </table>
                        </div>
                        <div  id="moves" class="card-body">
                            <table>
                            <thead>
                                <tr>
                                    <th scope="col">Name</th>
                                    <th scope="col">Type</th>
                                    <th scope="col">Category</th>
                                    
                                </tr>
                            </thead>
                                
                                <tbody>
                                    ${pokemon.moves.map(move => `
                                        <tr>
                                            <td style="border: 1px solid #ccc">${move.name}</td>
                                            <td style="border: 1px solid #ccc">${move.type}</td>
                                            <td style="border: 1px solid #ccc">${move.category}</td>
                                            
                                        </tr>
                                    `).join('')}
                                    
                                </tbody>
                            </table>
                            </p>
                        </div>
                    </div>


                </div>
            </div>
        `;
    }
});
