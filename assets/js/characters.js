// RPG MASTER ULTRA - GERENCIAMENTO DE PERSONAGENS (VERSÃO CORRIGIDA)

let characters = [];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    console.log('Carregando sistema de personagens...');
    loadCharacters();
    setupEventListeners();
});

function setupEventListeners() {
    console.log('Configurando event listeners...');
    
    // Botão adicionar personagem
    const addCharacterBtn = document.getElementById('add-character');
    if (addCharacterBtn) {
        addCharacterBtn.addEventListener('click', function() {
            console.log('Botão adicionar clicado');
            openCharacterModal();
        });
    }

    // Botão adicionar do dashboard
    const addCharacterDashBtn = document.getElementById('add-character-dash');
    if (addCharacterDashBtn) {
        addCharacterDashBtn.addEventListener('click', function() {
            console.log('Botão adicionar do dashboard clicado');
            openCharacterModal();
        });
    }
    
    // Formulário de personagem
    const characterForm = document.getElementById('character-form');
    if (characterForm) {
        characterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Formulário submetido');
            saveCharacter();
        });
    }
    
    // Fechar modal
    const closeModalBtns = document.querySelectorAll('.close-modal');
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            console.log('Fechando modal');
            document.getElementById('character-modal').style.display = 'none';
        });
    });
}

function loadCharacters() {
    const saved = localStorage.getItem('rpgCharacters');
    console.log('Dados salvos no localStorage:', saved);
    
    if (saved) {
        try {
            characters = JSON.parse(saved);
            console.log('Personagens carregados:', characters);
        } catch (e) {
            console.error('Erro ao carregar personagens:', e);
            characters = [];
        }
    } else {
        characters = [];
    }
    
    renderCharacters();
    updateCharacterCount();
}

function saveCharacters() {
    try {
        localStorage.setItem('rpgCharacters', JSON.stringify(characters));
        console.log('Personagens salvos:', characters);
        updateCharacterCount();
        return true;
    } catch (e) {
        console.error('Erro ao salvar personagens:', e);
        showNotification('Erro ao salvar personagens!', 'error');
        return false;
    }
}

function renderCharacters(filteredCharacters = null) {
    const characterList = document.getElementById('character-list');
    const dashboardCharacters = document.getElementById('dashboard-characters');
    
    const charsToRender = filteredCharacters || characters;
    console.log('Renderizando personagens:', charsToRender);
    
    // Renderizar na página de personagens
    if (characterList) {
        if (charsToRender.length === 0) {
            characterList.innerHTML = `
                <div class="dashboard-card" style="grid-column: 1 / -1;">
                    <div class="card-header">
                        <h3>Nenhum Personagem</h3>
                        <div class="card-icon">
                            <i class="fas fa-users"></i>
                        </div>
                    </div>
                    <div class="card-content">
                        <p>Nenhum personagem cadastrado. Clique em "Novo Personagem" para começar.</p>
                        <button class="btn" style="margin-top: 1rem;" onclick="openCharacterModal()">
                            <i class="fas fa-plus"></i>
                            Criar Primeiro Personagem
                        </button>
                    </div>
                </div>
            `;
        } else {
            characterList.innerHTML = charsToRender.map((character, index) => {
                const hpPercent = (character.hp / character.maxHp) * 100;
                
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
                                <button class="action-btn" onclick="editCharacter(${index})">
                                    <i class="fas fa-edit"></i> Editar
                                </button>
                                <button class="action-btn" onclick="rollInitiativeForCharacter(${index})">
                                    <i class="fas fa-dice"></i> Iniciativa
                                </button>
                                <button class="action-btn" onclick="deleteCharacter(${index})">
                                    <i class="fas fa-trash"></i> Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
    
    // Renderizar no dashboard (apenas 3 primeiros)
    if (dashboardCharacters) {
        const charsToShow = charsToRender.slice(0, 3);
        if (charsToShow.length === 0) {
            dashboardCharacters.innerHTML = `
                <div class="dashboard-card" style="grid-column: 1 / -1;">
                    <div class="card-header">
                        <h3>Nenhum Personagem</h3>
                        <div class="card-icon">
                            <i class="fas fa-users"></i>
                        </div>
                    </div>
                    <div class="card-content">
                        <p>Nenhum personagem cadastrado.</p>
                    </div>
                </div>
            `;
        } else {
            dashboardCharacters.innerHTML = charsToShow.map(character => {
                const hpPercent = (character.hp / character.maxHp) * 100;
                
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
                            <div class="character-actions">
                                <button class="action-btn" onclick="location.href='personagens.html'">
                                    <i class="fas fa-edit"></i> Ver Detalhes
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
}

function updateCharacterCount() {
    const charCountBadge = document.getElementById('char-count');
    if (charCountBadge) {
        charCountBadge.textContent = characters.length;
        console.log('Contador atualizado:', characters.length);
    }
}

function openCharacterModal(character = null) {
    console.log('Abrindo modal para:', character);
    
    const modal = document.getElementById('character-modal');
    const title = document.getElementById('modal-character-title');
    
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
        document.getElementById('character-id').value = '';
        document.getElementById('character-name').value = '';
        document.getElementById('character-class').value = '';
        document.getElementById('character-race').value = '';
        document.getElementById('character-level').value = '1';
        document.getElementById('character-hp').value = '10';
        document.getElementById('character-max-hp').value = '10';
        document.getElementById('character-ac').value = '10';
        document.getElementById('character-speed').value = '30';
        document.getElementById('character-description').value = '';
    }
    
    modal.style.display = 'flex';
}

function saveCharacter() {
    console.log('Iniciando salvamento do personagem...');
    
    const characterId = document.getElementById('character-id').value;
    const characterData = {
        id: characterId || 'char_' + Date.now(),
        name: document.getElementById('character-name').value,
        class: document.getElementById('character-class').value,
        race: document.getElementById('character-race').value,
        level: parseInt(document.getElementById('character-level').value) || 1,
        hp: parseInt(document.getElementById('character-hp').value) || 10,
        maxHp: parseInt(document.getElementById('character-max-hp').value) || 10,
        ac: parseInt(document.getElementById('character-ac').value) || 10,
        speed: parseInt(document.getElementById('character-speed').value) || 30,
        description: document.getElementById('character-description').value,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    console.log('Dados do personagem:', characterData);
    
    // Validação básica
    if (!characterData.name) {
        showNotification('Nome é obrigatório!', 'error');
        return;
    }
    
    if (characterId) {
        // Editar personagem existente
        const index = characters.findIndex(c => c.id === characterId);
        if (index !== -1) {
            characters[index] = characterData;
            console.log('Personagem editado:', characterData);
            showNotification('Personagem atualizado com sucesso!');
        }
    } else {
        // Adicionar novo personagem
        characters.push(characterData);
        console.log('Novo personagem adicionado:', characterData);
        showNotification('Personagem criado com sucesso!');
    }
    
    if (saveCharacters()) {
        renderCharacters();
        document.getElementById('character-modal').style.display = 'none';
    }
}

// Funções globais para os botões
function editCharacter(index) {
    console.log('Editando personagem índice:', index);
    if (index >= 0 && index < characters.length) {
        const character = characters[index];
        character.index = index;
        openCharacterModal(character);
    }
}

function deleteCharacter(index) {
    console.log('Excluindo personagem índice:', index);
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
    console.log('Rolando iniciativa para personagem:', index);
    if (index >= 0 && index < characters.length) {
        const character = characters[index];
        const initiativeRoll = Math.floor(Math.random() * 20) + 1;
        
        // Salvar na iniciativa
        let initiativeList = JSON.parse(localStorage.getItem('rpgInitiative')) || [];
        initiativeList.push({
            name: character.name,
            initiative: initiativeRoll,
            isPlayer: true,
            characterId: character.id
        });
        
        localStorage.setItem('rpgInitiative', JSON.stringify(initiativeList));
        
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

// Filtros (se existirem na página)
function filterCharacters() {
    const searchInput = document.getElementById('search-characters');
    const filterClass = document.getElementById('filter-class');
    const filterLevel = document.getElementById('filter-level');
    
    if (!searchInput && !filterClass && !filterLevel) return;
    
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const classFilter = filterClass ? filterClass.value : '';
    const levelFilter = filterLevel ? filterLevel.value : '';
    
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