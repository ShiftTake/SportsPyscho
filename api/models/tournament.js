/**
 * Tournament Model
 * Defines the data structure for tournaments in the application
 */

class Tournament {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.clubId = data.clubId;
    this.name = data.name;
    this.description = data.description || '';
    this.type = data.type || 'elimination'; // 'elimination' or 'round-robin'
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.participantIds = data.participantIds || [];
    this.matches = data.matches || [];
    this.bracket = data.bracket || null;
    this.standings = data.standings || [];
    this.winnerId = data.winnerId || null;
    this.status = data.status || 'upcoming'; // 'upcoming', 'in-progress', 'completed'
    this.createdBy = data.createdBy;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  generateId() {
    return 'tournament_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
  }

  /**
   * Validates tournament data
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    if (!this.clubId) {
      errors.push('Club ID is required');
    }

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Tournament name is required');
    }

    if (!this.startDate) {
      errors.push('Start date is required');
    }

    if (!['elimination', 'round-robin'].includes(this.type)) {
      errors.push('Tournament type must be elimination or round-robin');
    }

    if (!this.createdBy) {
      errors.push('Creator ID is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Generates elimination bracket structure
   * @returns {Object} Bracket structure
   */
  generateEliminationBracket() {
    const numParticipants = this.participantIds.length;
    
    // Round up to next power of 2
    const bracketSize = Math.pow(2, Math.ceil(Math.log2(numParticipants)));
    const numByes = bracketSize - numParticipants;

    const bracket = {
      rounds: [],
      size: bracketSize
    };

    // Generate first round with byes
    const firstRound = [];
    let participantIndex = 0;
    
    for (let i = 0; i < bracketSize / 2; i++) {
      const match = {
        matchId: `round1_match${i + 1}`,
        round: 1,
        participant1: participantIndex < numParticipants ? this.participantIds[participantIndex++] : null,
        participant2: participantIndex < numParticipants ? this.participantIds[participantIndex++] : null,
        winner: null,
        score: { participant1: 0, participant2: 0 }
      };
      
      // Auto-advance if bye
      if (!match.participant2) {
        match.winner = match.participant1;
      }
      
      firstRound.push(match);
    }
    
    bracket.rounds.push(firstRound);

    // Generate subsequent rounds
    let numRounds = Math.log2(bracketSize);
    for (let round = 2; round <= numRounds; round++) {
      const roundMatches = [];
      const numMatches = bracketSize / Math.pow(2, round);
      
      for (let i = 0; i < numMatches; i++) {
        roundMatches.push({
          matchId: `round${round}_match${i + 1}`,
          round: round,
          participant1: null,
          participant2: null,
          winner: null,
          score: { participant1: 0, participant2: 0 }
        });
      }
      
      bracket.rounds.push(roundMatches);
    }

    this.bracket = bracket;
    return bracket;
  }

  /**
   * Generates round-robin schedule
   * @returns {Array} Array of matches
   */
  generateRoundRobinSchedule() {
    const participants = [...this.participantIds];
    const matches = [];
    let matchNumber = 1;

    // If odd number of participants, add a "bye"
    if (participants.length % 2 !== 0) {
      participants.push(null);
    }

    const numRounds = participants.length - 1;
    const halfSize = participants.length / 2;

    for (let round = 0; round < numRounds; round++) {
      for (let i = 0; i < halfSize; i++) {
        const participant1 = participants[i];
        const participant2 = participants[participants.length - 1 - i];

        // Skip if either is a bye
        if (participant1 && participant2) {
          matches.push({
            matchId: `match${matchNumber++}`,
            round: round + 1,
            participant1: participant1,
            participant2: participant2,
            winner: null,
            score: { participant1: 0, participant2: 0 },
            completed: false
          });
        }
      }

      // Rotate participants (keep first fixed)
      participants.splice(1, 0, participants.pop());
    }

    this.matches = matches;
    return matches;
  }

  /**
   * Updates match result
   * @param {string} matchId
   * @param {string} winnerId
   * @param {Object} score
   * @returns {boolean} Success status
   */
  updateMatchResult(matchId, winnerId, score) {
    if (this.type === 'elimination' && this.bracket) {
      for (let round of this.bracket.rounds) {
        const match = round.find(m => m.matchId === matchId);
        if (match) {
          match.winner = winnerId;
          match.score = score;
          this.updatedAt = new Date().toISOString();
          
          // Update next round if not final
          this.advanceWinnerToNextRound(match);
          return true;
        }
      }
    } else if (this.type === 'round-robin') {
      const match = this.matches.find(m => m.matchId === matchId);
      if (match) {
        match.winner = winnerId;
        match.score = score;
        match.completed = true;
        this.updatedAt = new Date().toISOString();
        
        // Update standings
        this.updateStandings();
        return true;
      }
    }
    return false;
  }

  /**
   * Advances winner to next round in elimination bracket
   * @param {Object} match
   */
  advanceWinnerToNextRound(match) {
    if (!match.winner || match.round >= this.bracket.rounds.length) {
      return;
    }

    const nextRound = this.bracket.rounds[match.round];
    const matchIndex = parseInt(match.matchId.split('match')[1]) - 1;
    const nextMatchIndex = Math.floor(matchIndex / 2);
    const nextMatch = nextRound[nextMatchIndex];

    if (matchIndex % 2 === 0) {
      nextMatch.participant1 = match.winner;
    } else {
      nextMatch.participant2 = match.winner;
    }

    // Check if this is the final match
    if (match.round === this.bracket.rounds.length - 1) {
      this.winnerId = match.winner;
      this.status = 'completed';
    }
  }

  /**
   * Updates standings for round-robin tournament
   */
  updateStandings() {
    const standings = {};

    // Initialize standings
    this.participantIds.forEach(pid => {
      standings[pid] = {
        participantId: pid,
        wins: 0,
        losses: 0,
        points: 0
      };
    });

    // Calculate wins/losses/points
    this.matches.forEach(match => {
      if (match.completed && match.winner) {
        standings[match.winner].wins++;
        standings[match.winner].points += 3; // 3 points for a win

        const loserId = match.participant1 === match.winner ? match.participant2 : match.participant1;
        standings[loserId].losses++;
      }
    });

    // Sort by points, then wins
    this.standings = Object.values(standings).sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      return b.wins - a.wins;
    });

    // Set winner if all matches are complete
    const allComplete = this.matches.every(m => m.completed);
    if (allComplete && this.standings.length > 0) {
      this.winnerId = this.standings[0].participantId;
      this.status = 'completed';
    }
  }

  /**
   * Converts tournament to JSON-serializable format
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      clubId: this.clubId,
      name: this.name,
      description: this.description,
      type: this.type,
      startDate: this.startDate,
      endDate: this.endDate,
      participantIds: this.participantIds,
      matches: this.matches,
      bracket: this.bracket,
      standings: this.standings,
      winnerId: this.winnerId,
      status: this.status,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Tournament;
}
