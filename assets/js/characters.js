// RPG MASTER ULTRA - GERENCIAMENTO DE PERSONAGENS

let characters = [];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    loadCharacters();
    setupEventListeners();
});

function setupEventListeners() {
    // Botão adicionar personagem
    const addCharacterBtn = document.getElementById('add-character');
    if (addCharacterBtn) {
        addCharacterBtn.addEventListener('click', openCharacterModal);
    }
    
    // Formulário de personagem
    const characterForm = document.getElementById('character-form');
    if (characterForm) {
        characterForm.addEventListener('submit', saveCharacter);
    }
    
    // Fechar modal
    const closeModalBtns = document.querySelectorAll('.close-modal');
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            document.getElementById('character-modal').style.display = 'none';
        });
    });
    
    // Busca e filtros (se existirem na página)
    const searchInput = document.getElementById('search-characters');
    if (searchInput) {
        searchInput.addEventListener('input', filterCharacters);
    }
    
    const filterClass = document.getElementById('filter-class');
    if (filterClass) {
        filterClass.addEventListener('change', filterCharacters);
    }
    
    const filterLevel = document.getElementById('filter-level');
    if (filterLevel) {
        filterLevel.addEventListener('change', filterCharacters);
    }
    
    // Botão salvar rápido (se existir)
    const quickSaveBtn = document.getElementById('quick-save');
    if (quickSaveBtn) {
        quickSaveBtn.addEventListener('click', function() {
            saveCharacters();
            showNotification('Personagens salvos com sucesso!');
        });
    }
    
    // Botão importar (se existir)
    const importCharacterBtn = document.getElementById('import-character');
    if (importCharacterBtn) {
        importCharacterBtn.addEventListener('click', importCharacters);
    }
}

function loadCharacters() {
    characters = loadFromLocalStorage('rpgCharacters') || [];
    renderCharacters();
    updateCharacterCount();
}

function saveCharacters() {
    if (saveToLocalStorage('rpgCharacters', characters)) {
        updateCharacterCount();
        return true;
    }
    return false;
}

function renderCharacters(filteredCharacters = null) {
    const characterList = document.getElementById('character-list');
    if (!characterList) return;
    
    const charsToRender = filteredCharacters || characters;
    
    if (charsToRender.length === 0) {
        characterList.innerHTML = `
            <div class="dashboard-card" style="grid-column: 1 / -1;">
                <div class="card-header">
                    <h3>Nenhum Personagem Encontrado</h3>
                    <div class="card-icon">
                        <i class="fas fa-users"></i>
                    </div>
                </div>
                <div class="card-content">
                    <p>${filteredCharacters ? 'Nenhum personagem corresponde aos filtros aplicados.' : 'Nenhum personagem cadastrado. Clique em "Novo Personagem" para começar.'}</p>
                    <button class="btn" style="margin-top: 1rem;" onclick="openCharacterModal()">
                        <i class="fas fa-plus"></i>
                        Criar Primeiro Personagem
                    </button>
                </div>
            </div>
        `;
        return;
    }
    
    characterList.innerHTML = charsToRender.map((character, index) => {
        const hpPercent = (character.hp / character.maxHp) * 100;
        const originalIndex = characters.findIndex(c => c.id === character.id);
        
        return `
            <div class="character-card">
                <div class="character-header">
                    <div>
                        <div class="character-name">${character.name}</div>
                        <div class="character-class">${character.race || ''} ${character.class || ''}</div>
                    </div>
                    <div class="character-level">Nv. ${character.level}</div>
                </div>
                <div class="character-body">
                    <div class="character-stats">
                        <div class="stat">
                            <span>PV:</span>
                            <span class="stat-value">${character.hp}/${character.maxHp}</span>
                        </div>
                        <div class="stat">
                            <span>CA:</span>
                            <span class="stat-value">${character.ac}</span>
                        </div>
                        <div class="stat">
                            <span>Desl:</span>
                            <span class="stat-value">${character.speed || '30'}ft</span>
                        </div>
                    </div>
                    <div class="resource-bars">
                        <div class="resource-bar">
                            <div class="resource-label">
                                <span>Pontos de Vida</span>
                                <span>${character.hp}/${character.maxHp}</span>
                            </div>
                            <div class="bar-container">
                                <div class="bar-fill health-bar" style="width: ${hpPercent}%"></div>
                            </div>
                        </div>
                    </div>
                    ${character.description ? `<div style="margin: 1rem 0; padding: 0.8rem; background: rgba(0,0,0,0.3); border-radius: 6px; font-size: 0.9rem; border-left: 3px solid var(--bronze);">${character.description}</div>` : ''}
                    <div class="character-actions">
                        <button class="action-btn" onclick="editCharacter(${originalIndex})">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="action-btn" onclick="rollInitiativeForCharacter(${originalIndex})">
                            <i class="fas fa-dice"></i> Iniciativa
                        </button>
                        <button class="action-btn" onclick="deleteCharacter(${originalIndex})">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function updateCharacterCount() {
    const charCountBadge = document.getElementById('char-count');
    if (charCountBadge) {
        charCountBadge.textContent = characters.length;
    }
}

function openCharacterModal(character = null) {
    const modal = document.getElementById('character-modal');
    const title = document.getElementById('modal-character-title');
    const form = document.getElementById('character-form');
    
    if (character) {
        title.textContent = 'Editar Personagem';
        document.getElementById('character-id').value = character.index;
        document.getElementById('character-name').value = character.name;
        document.getElementById('character-class').value = character.class || '';
        document.getElementById('character-race').value = character.race || '';
        document.getElementById('character-level').value = character.level;
        document.getElementById('character-hp').value = character.hp;
        document.getElementById('character-max-hp').value = character.maxHp;
        document.getElementById('character-ac').value = character.ac;
        document.getElementById('character-speed').value = character.speed || '30';
        document.getElementById('character-description').value = character.description || '';
    } else {
        title.textContent = 'Adicionar Personagem';
        form.reset();
        document.getElementById('character-id').value = '';
        document.getElementById('character-level').value = '1';
        document.getElementById('character-hp').value = '10';
        document.getElementById('character-max-hp').value = '10';
        document.getElementById('character-ac').value = '10';
        document.getElementById('character-speed').value = '30';
    }
    
    modal.style.display = 'flex';
}

function closeCharacterModal() {
    const modal = document.getElementById('character-modal');
    modal.style.display = 'none';
}

function saveCharacter(e) {
    e.preventDefault();
    
    const characterId = document.getElementById('character-id').value;
    const characterData = {
        id: characterId || Date.now().toString(),
        name: document.getElementById('character-name').value,
        class: document.getElementById('character-class').value,
        race: document.getElementById('character-race').value,
        level: parseInt(document.getElementById('character-level').value),
        hp: parseInt(document.getElementById('character-hp').value),
        maxHp: parseInt(document.getElementById('character-max-hp').value),
        ac: parseInt(document.getElementById('character-ac').value),
        speed: parseInt(document.getElementById('character-speed').value),
        description: document.getElementById('character-description').value,
        createdAt: characterId ? characters.find(c => c.id === characterId)?.createdAt || new Date().toISOString() : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Validação básica
    if (!characterData.name || !characterData.level) {
        showNotification('Nome e nível são obrigatórios!', 'error');
        return;
    }
    
    if (characterId) {
        // Editar personagem existente
        const index = characters.findIndex(c => c.id === characterId);
        if (index !== -1) {
            characters[index] = characterData;
            showNotification('Personagem atualizado com sucesso!');
        }
    } else {
        // Adicionar novo personagem
        characters.push(characterData);
        showNotification('Personagem criado com sucesso!');
    }
    
    if (saveCharacters()) {
        renderCharacters();
        closeCharacterModal();
    }
}

function editCharacter(index) {
    if (index >= 0 && index < characters.length) {
        const character = characters[index];
        character.index = index;
        openCharacterModal(character);
    }
}

function deleteCharacter(index) {
    if (index >= 0 && index < characters.length) {
        const characterName = characters[index].name;
        if (confirm(`Tem certeza que deseja excluir o personagem "${characterName}"?`)) {
            characters.splice(index, 1);
            if (saveCharacters()) {
                renderCharacters();
                showNotification('Personagem excluído com sucesso!');
            }
        }
    }
}

function rollInitiativeForCharacter(index) {
    if (index >= 0 && index < characters.length) {
        const character = characters[index];
        const initiativeRoll = Math.floor(Math.random() * 20) + 1;
        
        // Salvar na iniciativa
        let initiativeList = loadFromLocalStorage('rpgInitiative') || [];
        initiativeList.push({
            name: character.name,
            initiative: initiativeRoll,
            isPlayer: true,
            characterId: character.id
        });
        
        saveToLocalStorage('rpgInitiative', initiativeList);
        
        showNotification(`${character.name} rolou ${initiativeRoll} para iniciativa!`);
        
        // Se não estiver na página de iniciativa, perguntar se quer ir
        if (!window.location.pathname.includes('iniciativa.html')) {
            setTimeout(() => {
                if (confirm(`${character.name} rolou ${initiativeRoll} para iniciativa! Deseja ir para a página de iniciativa?`)) {
                    window.location.href = 'iniciativa.html';
                }
            }, 500);
        }
    }
}

function filterCharacters() {
    const searchTerm = document.getElementById('search-characters').value.toLowerCase();
    const classFilter = document.getElementById('filter-class').value;
    const levelFilter = document.getElementById('filter-level').value;
    
    let filtered = characters.filter(character => {
        const matchesSearch = character.name.toLowerCase().includes(searchTerm) ||
                            (character.class && character.class.toLowerCase().includes(searchTerm)) ||
                            (character.race && character.race.toLowerCase().includes(searchTerm));
        
        const matchesClass = !classFilter || character.class === classFilter;
        
        const matchesLevel = !levelFilter || (
            levelFilter === '1-5' && character.level >= 1 && character.level <= 5 ||
            levelFilter === '6-10' && character.level >= 6 && character.level <= 10 ||
            levelFilter === '11-15' && character.level >= 11 && character.level <= 15 ||
            levelFilter === '16-20' && character.level >= 16 && character.level <= 20
        );
        
        return matchesSearch && matchesClass && matchesLevel;
    });
    
    renderCharacters(filtered);
}

// Exportar/Importar personagens
function exportCharacters() {
    exportData(characters, 'rpg-characters.json');
}

function importCharacters() {
    importData(data => {
        if (Array.isArray(data)) {
            characters = data;
            if (saveCharacters()) {
                renderCharacters();
                showNotification('Personagens importados com sucesso!');
            }
        } else {
            showNotification('Formato de arquivo inválido!', 'error');
        }
    });
}