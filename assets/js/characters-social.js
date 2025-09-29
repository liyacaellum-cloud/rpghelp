// characters-social.js
class SocialCharacters {
    constructor() {
        this.characters = JSON.parse(localStorage.getItem('rpgCharacters')) || [];
        this.currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    }

    // Salvar personagem com dono
    saveCharacter(characterData) {
        if (!this.currentUser) {
            auth.showNotification('Faça login para criar personagens!', 'error');
            return false;
        }

        characterData.userId = this.currentUser.id;
        characterData.username = this.currentUser.username;
        characterData.userAvatar = this.currentUser.profile.avatar;

        if (characterData.id) {
            // Editar
            const index = this.characters.findIndex(c => c.id === characterData.id);
            if (index !== -1) {
                this.characters[index] = characterData;
            }
        } else {
            // Novo
            characterData.id = 'char_' + Date.now();
            characterData.createdAt = new Date().toISOString();
            this.characters.push(characterData);
        }

        characterData.updatedAt = new Date().toISOString();
        localStorage.setItem('rpgCharacters', JSON.stringify(this.characters));
        return true;
    }

    // Pegar personagens do usuário atual
    getMyCharacters() {
        if (!this.currentUser) return [];
        return this.characters.filter(c => c.userId === this.currentUser.id);
    }

    // Pegar todos os personagens (para comunidade)
    getAllCharacters() {
        return this.characters;
    }

    // Deletar personagem (apenas dono ou admin)
    deleteCharacter(characterId) {
        const character = this.characters.find(c => c.id === characterId);
        if (!character) return false;

        if (character.userId === this.currentUser.id || this.currentUser.isAdmin) {
            this.characters = this.characters.filter(c => c.id !== characterId);
            localStorage.setItem('rpgCharacters', JSON.stringify(this.characters));
            return true;
        } else {
            auth.showNotification('Você só pode excluir seus próprios personagens!', 'error');
            return false;
        }
    }
}

const socialChars = new SocialCharacters();