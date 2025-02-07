const pokeApi = {}

async function convertPokeApiDetailToPokemon(pokeDetail) {
    const pokemon = new Pokemon()
    pokemon.number = pokeDetail.id
    pokemon.name = pokeDetail.name
    pokemon.species = pokeDetail.species.name
    pokemon.height = dmToFeetInchesAndMeters(pokeDetail.height)
    pokemon.weight = hgToKgAndLbs(pokeDetail.weight)
    pokemon.typedefenses = await getTypeDefenses(pokemon.name);
    
    const types = pokeDetail.types.map((typeSlot) => typeSlot.type.name)
    const [type] = types
    pokemon.types = types
    pokemon.type = type

    const abilities = pokeDetail.abilities.map((abilitySlot) => abilitySlot.ability.name)
    const [ability] = abilities
    pokemon.abilities = abilities
    pokemon.ability = ability

    pokemon.photo = pokeDetail.sprites.other.dream_world.front_default

    const statNames = ["hp", "attack", "defense", "spatk", "spdef", "speed"]
    pokemon.total = 0

    statNames.forEach((statName, index) => {
        const statValue = pokeDetail.stats[index].base_stat
        pokemon[statName] = statValue
        pokemon.total += statValue
    })

    // 🔹 Esperar a resposta da API antes de continuar
    const breedingInfo = await getBreeding(pokemon.number);

    pokemon.gender = getGenderPercentage(breedingInfo.gender_rate)
    pokemon.egggroups = breedingInfo.egg_groups
    pokemon.eggcycle = `${breedingInfo.hatch_counter} Cycles`

    pokemon.evolutions = getEvolutionsWithImages(pokemon.name)

    pokemon.moves = getPokemonMoves(pokemon.name)

    return pokemon;
}

pokeApi.getPokemonDetail = async (pokemon) => {
    const response = await fetch(pokemon.url);
    const pokeDetail = await response.json();
    return convertPokeApiDetailToPokemon(pokeDetail);
}

async function getBreeding(pokemonId) {
    const url = `https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`;

    const response = await fetch(url);
    const jsonBody = await response.json();

    return {
        egg_groups: jsonBody.egg_groups.map(group => group.name),
        hatch_counter: jsonBody.hatch_counter,
        gender_rate: jsonBody.gender_rate
    };
}

pokeApi.getPokemons = async (offset = 0, limit = 5) => {
    const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;

    const response = await fetch(url);
    const jsonBody = await response.json();
    
    const detailRequests = jsonBody.results.map(pokeApi.getPokemonDetail);
    return Promise.all(detailRequests);
}

function getGenderPercentage(genderRate) {
    const genderTable = [
        { male: 100, female: 0 },   // gender_rate: 0
        { male: 87.5, female: 12.5 }, // gender_rate: 1
        { male: 75, female: 25 },   // gender_rate: 2
        { male: 62.5, female: 37.5 }, // gender_rate: 3
        { male: 50, female: 50 },   // gender_rate: 4
        { male: 37.5, female: 62.5 }, // gender_rate: 5
        { male: 25, female: 75 },   // gender_rate: 6
        { male: 12.5, female: 87.5 }, // gender_rate: 7
        { male: 0, female: 100 }   // gender_rate: 8
    ];

    return genderRate === -1
        ? { male: 0, female: 0 }
        : genderTable[genderRate];
}

function dmToFeetInchesAndMeters(dm) {
    // Convertendo decímetros para metros
    const meters = dm / 10; 
    
    
    const inches = dm * 10 / 2.54;
    const feet = Math.floor(inches / 12);  
    const remainingInches = inches % 12;   

    // Pega a parte inteira de polegadas e converte para o formato de string
    const inchesInt = Math.floor(remainingInches);
    const inchesFraction = Math.round((remainingInches - inchesInt) * 10); 

    
    return `${feet}'${inchesInt},${inchesFraction}" (${meters.toFixed(2)} m)`;
}
function hgToKgAndLbs(hg) {
    // Converter hectogramas para quilogramas
    const kg = hg / 10; 

    // Converter quilogramas para libras
    const lbs = kg * 2.20462; 
    // Retornar o formato "lbs (kg)"
    return `${lbs.toFixed(1)} lbs (${kg.toFixed(1)} kg)`;
}

async function getTypeDefenses(pokemonName) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
    const data = await response.json();

    const types = data.types.map(t => t.type.name);
    let typeEffects = {};

    const allTypes = [
        "normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison",
        "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark",
        "steel", "fairy"
    ];
    
    allTypes.forEach(type => typeEffects[type] = 1);

    for (const type of types) {
        const typeResponse = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
        const typeData = await typeResponse.json();

        typeData.damage_relations.double_damage_from.forEach(t => typeEffects[t.name] *= 2);
        typeData.damage_relations.half_damage_from.forEach(t => typeEffects[t.name] *= 0.5);
        typeData.damage_relations.no_damage_from.forEach(t => typeEffects[t.name] *= 0);
    }

    // Descrição
    let weaknesses = [];
    let resistances = [];
    let immunities = [];

    for (const [type, multiplier] of Object.entries(typeEffects)) {
        if (multiplier === 0) {
            immunities.push(type);
        } else if (multiplier === 4) {
            weaknesses.push(`extremely weak against ${type} (4x damage)`);
        } else if (multiplier === 2) {
            weaknesses.push(`weak against ${type} (2x damage)`);
        } else if (multiplier === 0.25) {
            resistances.push(`extremely resistant to ${type} (0.25x damage)`);
        } else if (multiplier === 0.5) {
            resistances.push(`resistant to ${type} (0.5x damage)`);
        }
    }
    
    let typeText = types.length > 1 
        ? `${types.slice(0, -1).join(", ")} and ${types[types.length - 1]}`
        : types[0];
    
    let summary = `The Pokémon ${pokemonName} is a ${typeText}-type, so:<br>`;
    
    if (weaknesses.length) {
        summary += `🔴 It is ${weaknesses.join(", ")}.<br>`;
    }
    if (resistances.length) {
        summary += `🟢 It is ${resistances.join(", ")}.<br>`;
    }
    if (immunities.length) {
        summary += `⚫ It is immune to ${immunities.join(", ")}.<br>`;
    }
    

    return summary;
}

async function getEvolutionsWithImages(pokemonName) {
    try {
        // Obtendo os detalhes da espécie do Pokémon
        const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonName.toLowerCase()}`);
        const speciesData = await speciesResponse.json();

        // Obtendo a URL da cadeia evolutiva
        const evolutionUrl = speciesData.evolution_chain.url;
        const evolutionResponse = await fetch(evolutionUrl);
        const evolutionData = await evolutionResponse.json();

        // Função para percorrer a cadeia evolutiva
        async function parseEvolutionChain(chain) {
            let evolutions = [];
            let current = chain;

            while (current) {
                const name = current.species.name;
                const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
                const pokemonData = await pokemonResponse.json();
                
                evolutions.push({
                    name: name,
                    image: pokemonData.sprites.other["official-artwork"].front_default
                });

                current = current.evolves_to.length ? current.evolves_to[0] : null;
            }
            return evolutions;
        }

        // Retornando a lista de evoluções
        return await parseEvolutionChain(evolutionData.chain);

    } catch (error) {
        console.error("Erro ao buscar as evoluções:", error);
        return [];
    }
}

async function getPokemonMoves(pokemonName) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
        const pokemonData = await response.json();

        const moveDetailsPromises = pokemonData.moves.map(async moveSlot => {
            const moveResponse = await fetch(moveSlot.move.url);
            const moveData = await moveResponse.json();

            return {
                name: moveData.name.replace("-", " "), // Nome formatado
                type: moveData.type.name, // Tipo do golpe
                category: moveData.damage_class.name, // Físico, Especial ou Status
                power: moveData.power || "—", // Pode ser null para alguns golpes
                accuracy: moveData.accuracy || "—", // Pode ser null
                pp: moveData.pp // Quantidade de usos
            };
        });

        const moves = await Promise.all(moveDetailsPromises);
        return moves;
    } catch (error) {
        console.error("Erro ao buscar os movimentos:", error);
        return [];
    }
}