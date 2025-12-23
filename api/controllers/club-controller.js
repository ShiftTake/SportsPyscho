/**
 * Club Controller
 * Handles CRUD operations for clubs
 */

class ClubController {
  constructor() {
    this.clubs = [];
    this.loadFromStorage();
  }

  /**
   * Load clubs from localStorage
   */
  loadFromStorage() {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('clubs');
      if (stored) {
        this.clubs = JSON.parse(stored);
      }
    }
  }

  /**
   * Save clubs to localStorage
   */
  saveToStorage() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('clubs', JSON.stringify(this.clubs));
    }
  }

  /**
   * Create a new club
   * @param {Object} clubData
   * @returns {Object} { success: boolean, data?: Object, error?: string }
   */
  createClub(clubData) {
    try {
      // Import Club model (this would be handled by module system in production)
      const club = new Club(clubData);
      
      const validation = club.validate();
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      this.clubs.push(club.toJSON());
      this.saveToStorage();

      return {
        success: true,
        data: club.toJSON()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get club by ID
   * @param {string} clubId
   * @returns {Object} { success: boolean, data?: Object, error?: string }
   */
  getClubById(clubId) {
    const club = this.clubs.find(c => c.id === clubId);
    
    if (!club) {
      return {
        success: false,
        error: 'Club not found'
      };
    }

    return {
      success: true,
      data: club
    };
  }

  /**
   * Get all clubs
   * @param {Object} filters - Optional filters (privacy, sport, state, city)
   * @returns {Object} { success: boolean, data: Array }
   */
  getAllClubs(filters = {}) {
    let filteredClubs = [...this.clubs];

    if (filters.privacy) {
      filteredClubs = filteredClubs.filter(c => c.privacy === filters.privacy);
    }

    if (filters.sport) {
      filteredClubs = filteredClubs.filter(c => c.sport === filters.sport);
    }

    if (filters.state) {
      filteredClubs = filteredClubs.filter(c => c.state === filters.state);
    }

    if (filters.city) {
      filteredClubs = filteredClubs.filter(c => c.city === filters.city);
    }

    return {
      success: true,
      data: filteredClubs
    };
  }

  /**
   * Update club
   * @param {string} clubId
   * @param {Object} updateData
   * @returns {Object} { success: boolean, data?: Object, error?: string }
   */
  updateClub(clubId, updateData) {
    const index = this.clubs.findIndex(c => c.id === clubId);
    
    if (index === -1) {
      return {
        success: false,
        error: 'Club not found'
      };
    }

    const updatedClub = {
      ...this.clubs[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    const club = new Club(updatedClub);
    const validation = club.validate();
    
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.join(', ')
      };
    }

    this.clubs[index] = club.toJSON();
    this.saveToStorage();

    return {
      success: true,
      data: club.toJSON()
    };
  }

  /**
   * Delete club
   * @param {string} clubId
   * @returns {Object} { success: boolean, error?: string }
   */
  deleteClub(clubId) {
    const index = this.clubs.findIndex(c => c.id === clubId);
    
    if (index === -1) {
      return {
        success: false,
        error: 'Club not found'
      };
    }

    this.clubs.splice(index, 1);
    this.saveToStorage();

    return {
      success: true
    };
  }

  /**
   * Add member to club
   * @param {string} clubId
   * @param {string} userId
   * @returns {Object} { success: boolean, data?: Object, error?: string }
   */
  addMember(clubId, userId) {
    const club = this.clubs.find(c => c.id === clubId);
    
    if (!club) {
      return {
        success: false,
        error: 'Club not found'
      };
    }

    if (club.memberIds.includes(userId)) {
      return {
        success: false,
        error: 'User is already a member'
      };
    }

    club.memberIds.push(userId);
    club.updatedAt = new Date().toISOString();
    this.saveToStorage();

    return {
      success: true,
      data: club
    };
  }

  /**
   * Remove member from club
   * @param {string} clubId
   * @param {string} userId
   * @returns {Object} { success: boolean, data?: Object, error?: string }
   */
  removeMember(clubId, userId) {
    const club = this.clubs.find(c => c.id === clubId);
    
    if (!club) {
      return {
        success: false,
        error: 'Club not found'
      };
    }

    const index = club.memberIds.indexOf(userId);
    if (index === -1) {
      return {
        success: false,
        error: 'User is not a member'
      };
    }

    club.memberIds.splice(index, 1);
    club.updatedAt = new Date().toISOString();
    this.saveToStorage();

    return {
      success: true,
      data: club
    };
  }

  /**
   * Get clubs by user membership
   * @param {string} userId
   * @returns {Object} { success: boolean, data: Array }
   */
  getClubsByUser(userId) {
    const userClubs = this.clubs.filter(c => 
      c.memberIds.includes(userId) || c.ownerId === userId
    );

    return {
      success: true,
      data: userClubs
    };
  }
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClubController;
}
