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
            closeCharacterModal();
        });
    });

    // Fechar modal clicando fora
    const modal = document.getElementById('character-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeCharacterModal();
            }
        });
    }

    // Event listeners para filtros
    setupFilterListeners();
}

function setupFilterListeners() {
    const searchInput = document.getElementById('search-characters');
    const filterClass = document.getElementById('filter-class');
    const filterLevel = document.getElementById('filter-level');

    if (searchInput) {
        searchInput.addEventListener('input', filterCharacters);
    }
    if (filterClass) {
        filterClass.addEventListener('change', filterCharacters);
    }
    if (filterLevel) {
        filterLevel.addEventListener('change', filterCharacters);
    }
}

function closeCharacterModal() {
    const modal = document.getElementById('character-modal');
    if (modal) {
        modal.style.display = 'none';
    }
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
                const safeDescription = character.description ? character.description.replace(/`/g, '\\`') : '';
                
                return `
                    <div class="character-card">
                        <div class="character-header">
                            <div>
                                <div class="character-name">${escapeHtml(character.name)}</div>
                                <div class="character-class">${escapeHtml(character.race || '')} ${escapeHtml(character.class || '')}</div>
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
                            ${character.description ? `<div class="character-description">${escapeHtml(character.description)}</div>` : ''}
                            <div class="character-actions">
                                <button class="action-btn" onclick="editCharacter(${index})">
                                    <i class="fas fa-edit"></i> Editar
                                </button>
                                <button class="action-btn" onclick="rollInitiativeForCharacter(${index})">
                                    <i class="fas fa-dice"></i> Iniciativa
                                </button>
                                <button class="action-btn danger" onclick="deleteCharacter(${index})">
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
                                <div class="character-name">${escapeHtml(character.name)}</div>
                                <div class="character-class">${escapeHtml(character.race || '')} ${escapeHtml(character.class || '')}</div>
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
    
    if (!modal || !title) {
        console.error('Modal ou título não encontrado!');
        return;
    }
    
    if (character) {
        title.textContent = 'Editar Personagem';
        document.getElementById('character-id').value = character.index;
        document.getElementById('character-name').value = character.name || '';
        document.getElementById('character-class').value = character.class || '';
        document.getElementById('character-race').value = character.race || '';
        document.getElementById('character-level').value = character.level || '1';
        document.getElementById('character-hp').value = character.hp || '10';
        document.getElementById('character-max-hp').value = character.maxHp || '10';
        document.getElementById('character-ac').value = character.ac || '10';
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
    if (!characterData.name.trim()) {
        showNotification('Nome é obrigatório!', 'error');
        return;
    }
    
    if (characterData.hp > characterData.maxHp) {
        showNotification('PV atual não pode ser maior que PV máximo!', 'error');
        return;
    }
    
    let success = false;
    
    if (characterId) {
        // Editar personagem existente
        const index = parseInt(characterId);
        if (index >= 0 && index < characters.length) {
            // Preservar a data de criação original
            characterData.createdAt = characters[index].createdAt;
            characters[index] = characterData;
            console.log('Personagem editado:', characterData);
            showNotification('Personagem atualizado com sucesso!');
            success = true;
        }
    } else {
        // Adicionar novo personagem
        characters.push(characterData);
        console.log('Novo personagem adicionado:', characterData);
        showNotification('Personagem criado com sucesso!');
        success = true;
    }
    
    if (success && saveCharacters()) {
        renderCharacters();
        closeCharacterModal();
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

// Filtros
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

// Função de notificação
function showNotification(message, type = 'success') {
    // Verificar se já existe um container de notificações
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
    }
    
    // Criar notificação
    const notification = document.createElement('div');
    notification.style.cssText = `
        background: ${type === 'error' ? '#d32f2f' : '#388e3c'};
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        font-weight: 500;
        transition: all 0.3s ease;
        transform: translateX(100%);
        opacity: 0;
    `;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    // Animação de entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    }, 10);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Função auxiliar para evitar XSS
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Resetar filtros
function resetFilters() {
    const searchInput = document.getElementById('search-characters');
    const filterClass = document.getElementById('filter-class');
    const filterLevel = document.getElementById('filter-level');
    
    if (searchInput) searchInput.value = '';
    if (filterClass) filterClass.value = '';
    if (filterLevel) filterLevel.value = '';
    
    renderCharacters();
}

// Exportar personagens
function exportCharacters() {
    const dataStr = JSON.stringify(characters, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rpg-characters-backup.json';
    link.click();
    
    URL.revokeObjectURL(url);
    showNotification('Personagens exportados com sucesso!');
}

// Importar personagens
function importCharacters(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (Array.isArray(imported)) {
                if (confirm(`Deseja importar ${imported.length} personagem(ns)? Isso substituirá seus personagens atuais.`)) {
                    characters = imported;
                    saveCharacters();
                    renderCharacters();
                    showNotification(`${imported.length} personagem(ns) importado(s) com sucesso!`);
                }
            } else {
                showNotification('Arquivo inválido!', 'error');
            }
        } catch (error) {
            showNotification('Erro ao importar arquivo!', 'error');
            console.error('Erro na importação:', error);
        }
    };
    reader.readAsText(file);
    
    // Resetar input
    event.target.value = '';
}