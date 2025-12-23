/**
 * Tournament Controller
 * Handles CRUD operations for tournaments
 */

class TournamentController {
  constructor() {
    this.tournaments = [];
    this.loadFromStorage();
  }

  /**
   * Load tournaments from localStorage
   */
  loadFromStorage() {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('tournaments');
      if (stored) {
        this.tournaments = JSON.parse(stored);
      }
    }
  }

  /**
   * Save tournaments to localStorage
   */
  saveToStorage() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('tournaments', JSON.stringify(this.tournaments));
    }
  }

  /**
   * Create a new tournament
   * @param {Object} tournamentData
   * @returns {Object} { success: boolean, data?: Object, error?: string }
   */
  createTournament(tournamentData) {
    try {
      const tournament = new Tournament(tournamentData);
      
      const validation = tournament.validate();
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Generate bracket or schedule based on type
      if (tournament.type === 'elimination') {
        tournament.generateEliminationBracket();
      } else if (tournament.type === 'round-robin') {
        tournament.generateRoundRobinSchedule();
      }

      this.tournaments.push(tournament.toJSON());
      this.saveToStorage();

      return {
        success: true,
        data: tournament.toJSON()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get tournament by ID
   * @param {string} tournamentId
   * @returns {Object} { success: boolean, data?: Object, error?: string }
   */
  getTournamentById(tournamentId) {
    const tournament = this.tournaments.find(t => t.id === tournamentId);
    
    if (!tournament) {
      return {
        success: false,
        error: 'Tournament not found'
      };
    }

    return {
      success: true,
      data: tournament
    };
  }

  /**
   * Get all tournaments
   * @param {Object} filters - Optional filters (clubId, status, type)
   * @returns {Object} { success: boolean, data: Array }
   */
  getAllTournaments(filters = {}) {
    let filteredTournaments = [...this.tournaments];

    if (filters.clubId) {
      filteredTournaments = filteredTournaments.filter(t => t.clubId === filters.clubId);
    }

    if (filters.status) {
      filteredTournaments = filteredTournaments.filter(t => t.status === filters.status);
    }

    if (filters.type) {
      filteredTournaments = filteredTournaments.filter(t => t.type === filters.type);
    }

    return {
      success: true,
      data: filteredTournaments
    };
  }

  /**
   * Update tournament
   * @param {string} tournamentId
   * @param {Object} updateData
   * @returns {Object} { success: boolean, data?: Object, error?: string }
   */
  updateTournament(tournamentId, updateData) {
    const index = this.tournaments.findIndex(t => t.id === tournamentId);
    
    if (index === -1) {
      return {
        success: false,
        error: 'Tournament not found'
      };
    }

    const updatedTournament = {
      ...this.tournaments[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    const tournament = new Tournament(updatedTournament);
    const validation = tournament.validate();
    
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.join(', ')
      };
    }

    this.tournaments[index] = tournament.toJSON();
    this.saveToStorage();

    return {
      success: true,
      data: tournament.toJSON()
    };
  }

  /**
   * Delete tournament
   * @param {string} tournamentId
   * @returns {Object} { success: boolean, error?: string }
   */
  deleteTournament(tournamentId) {
    const index = this.tournaments.findIndex(t => t.id === tournamentId);
    
    if (index === -1) {
      return {
        success: false,
        error: 'Tournament not found'
      };
    }

    this.tournaments.splice(index, 1);
    this.saveToStorage();

    return {
      success: true
    };
  }

  /**
   * Update match result
   * @param {string} tournamentId
   * @param {string} matchId
   * @param {string} winnerId
   * @param {Object} score
   * @returns {Object} { success: boolean, data?: Object, error?: string }
   */
  updateMatchResult(tournamentId, matchId, winnerId, score) {
    const tournamentData = this.tournaments.find(t => t.id === tournamentId);
    
    if (!tournamentData) {
      return {
        success: false,
        error: 'Tournament not found'
      };
    }

    const tournament = new Tournament(tournamentData);
    const updated = tournament.updateMatchResult(matchId, winnerId, score);
    
    if (!updated) {
      return {
        success: false,
        error: 'Match not found or invalid update'
      };
    }

    // Update in storage
    const index = this.tournaments.findIndex(t => t.id === tournamentId);
    this.tournaments[index] = tournament.toJSON();
    this.saveToStorage();

    return {
      success: true,
      data: tournament.toJSON()
    };
  }

  /**
   * Start tournament (change status to in-progress)
   * @param {string} tournamentId
   * @returns {Object} { success: boolean, data?: Object, error?: string }
   */
  startTournament(tournamentId) {
    const tournament = this.tournaments.find(t => t.id === tournamentId);
    
    if (!tournament) {
      return {
        success: false,
        error: 'Tournament not found'
      };
    }

    if (tournament.status !== 'upcoming') {
      return {
        success: false,
        error: 'Tournament has already started or completed'
      };
    }

    tournament.status = 'in-progress';
    tournament.updatedAt = new Date().toISOString();
    this.saveToStorage();

    return {
      success: true,
      data: tournament
    };
  }

  /**
   * Get tournament bracket
   * @param {string} tournamentId
   * @returns {Object} { success: boolean, data?: Object, error?: string }
   */
  getBracket(tournamentId) {
    const tournament = this.tournaments.find(t => t.id === tournamentId);
    
    if (!tournament) {
      return {
        success: false,
        error: 'Tournament not found'
      };
    }

    if (tournament.type !== 'elimination') {
      return {
        success: false,
        error: 'Only elimination tournaments have brackets'
      };
    }

    return {
      success: true,
      data: tournament.bracket
    };
  }

  /**
   * Get tournament standings
   * @param {string} tournamentId
   * @returns {Object} { success: boolean, data?: Array, error?: string }
   */
  getStandings(tournamentId) {
    const tournament = this.tournaments.find(t => t.id === tournamentId);
    
    if (!tournament) {
      return {
        success: false,
        error: 'Tournament not found'
      };
    }

    if (tournament.type !== 'round-robin') {
      return {
        success: false,
        error: 'Only round-robin tournaments have standings'
      };
    }

    return {
      success: true,
      data: tournament.standings
    };
  }
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TournamentController;
}
