/**
 * Sports Sicko - Tournaments API Module
 * Provides CRUD operations for tournament management
 * Supports bracket generation, match tracking, points system, and winner determination
 * 
 * @module api/tournaments
 * @author Sports Sicko Development Team
 * @description Backend API endpoints for tournament operations
 * 
 * Mobile Integration Support: All endpoints return JSON formatted for web and mobile apps
 * Authentication: Uses JWT tokens passed in Authorization header
 */

const express = require('express');
const router = express.Router();

// In-memory storage (replace with actual database in production)
let tournaments = [];
let matches = [];

/**
 * @route POST /api/tournaments/create
 * @description Create a new tournament
 * @access Private (requires authentication)
 * @body {
 *   name: string,
 *   bracketType: 'single-elimination' | 'double-elimination' | 'round-robin',
 *   participants: number,
 *   pointsSystem: { win: number, loss: number, draw: number },
 *   matchDuration: number,
 *   startDate: string,
 *   prizePool: string,
 *   rules: string,
 *   organizerId: string
 * }
 */
router.post('/create', async (req, res) => {
  try {
    const {
      name,
      bracketType,
      participants,
      pointsSystem,
      matchDuration,
      startDate,
      prizePool,
      rules,
      organizerId
    } = req.body;

    // Validation
    if (!name || !bracketType || !participants || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate start date
    if (new Date(startDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Tournament start date must be in the future'
      });
    }

    // Validate participant count
    const validCounts = [4, 8, 16, 32, 64];
    if (!validCounts.includes(participants)) {
      return res.status(400).json({
        success: false,
        message: 'Participants must be 4, 8, 16, 32, or 64'
      });
    }

    // Generate unique tournament ID using cryptographically secure method
    const crypto = require('crypto');
    const tournamentId = `tournament_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;

    // Generate bracket structure
    const bracket = generateBracketStructure(bracketType, participants);

    // Create tournament object
    const newTournament = {
      id: tournamentId,
      name,
      bracketType,
      participants: participants,
      pointsSystem: pointsSystem || { win: 3, loss: 0, draw: 1 },
      matchDuration: matchDuration || 60,
      startDate,
      prizePool,
      rules,
      organizerId,
      bracket,
      registeredParticipants: [],
      standings: [],
      status: 'registration', // registration, active, completed, cancelled
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentRound: 1,
      totalRounds: bracket.rounds ? bracket.rounds.length : 0
    };

    // Store tournament
    tournaments.push(newTournament);

    res.status(201).json({
      success: true,
      message: 'Tournament created successfully',
      tournamentId: tournamentId,
      tournament: newTournament
    });

  } catch (error) {
    console.error('Error creating tournament:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route GET /api/tournaments/:id
 * @description Get tournament details by ID
 * @access Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tournament = tournaments.find(t => t.id === id);

    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    res.json({
      success: true,
      tournament: tournament
    });

  } catch (error) {
    console.error('Error fetching tournament:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route PUT /api/tournaments/:id
 * @description Update tournament details
 * @access Private (organizer only)
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user?.id;

    const tournamentIndex = tournaments.findIndex(t => t.id === id);
    if (tournamentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    // Verify user is organizer
    if (tournaments[tournamentIndex].organizerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only tournament organizer can update tournament'
      });
    }

    // Update tournament
    tournaments[tournamentIndex] = {
      ...tournaments[tournamentIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Tournament updated successfully',
      tournament: tournaments[tournamentIndex]
    });

  } catch (error) {
    console.error('Error updating tournament:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route POST /api/tournaments/:id/register
 * @description Register a participant for tournament
 * @access Private (requires authentication)
 * @body { participantName: string, teamMembers?: string[] }
 */
router.post('/:id/register', async (req, res) => {
  try {
    const { id } = req.params;
    const { participantName, teamMembers } = req.body;
    const userId = req.user?.id;

    const tournament = tournaments.find(t => t.id === id);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    // Check if tournament is accepting registrations
    if (tournament.status !== 'registration') {
      return res.status(400).json({
        success: false,
        message: 'Tournament is not accepting registrations'
      });
    }

    // Check if tournament is full
    if (tournament.registeredParticipants.length >= tournament.participants) {
      return res.status(400).json({
        success: false,
        message: 'Tournament is full'
      });
    }

    // Check if user already registered
    if (tournament.registeredParticipants.some(p => p.userId === userId)) {
      return res.status(400).json({
        success: false,
        message: 'Already registered for this tournament'
      });
    }

    // Register participant
    const participant = {
      userId,
      participantName,
      teamMembers: teamMembers || [],
      registeredAt: new Date().toISOString(),
      seed: tournament.registeredParticipants.length + 1
    };

    tournament.registeredParticipants.push(participant);
    tournament.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Successfully registered for tournament',
      participant: participant
    });

  } catch (error) {
    console.error('Error registering for tournament:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route POST /api/tournaments/:id/start
 * @description Start the tournament and generate matches
 * @access Private (organizer only)
 */
router.post('/:id/start', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const tournament = tournaments.find(t => t.id === id);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    // Verify user is organizer
    if (tournament.organizerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only tournament organizer can start tournament'
      });
    }

    // Check if enough participants
    if (tournament.registeredParticipants.length < 4) {
      return res.status(400).json({
        success: false,
        message: 'Minimum 4 participants required to start tournament'
      });
    }

    // Generate matches for first round
    const firstRoundMatches = generateFirstRoundMatches(tournament);
    
    // Store matches
    matches.push(...firstRoundMatches);

    // Update tournament status
    tournament.status = 'active';
    tournament.currentRound = 1;
    tournament.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Tournament started successfully',
      matches: firstRoundMatches
    });

  } catch (error) {
    console.error('Error starting tournament:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route POST /api/tournaments/:id/matches/:matchId/result
 * @description Submit match result
 * @access Private (organizer only)
 * @body { winnerId: string, score: string, stats?: object }
 */
router.post('/:id/matches/:matchId/result', async (req, res) => {
  try {
    const { id, matchId } = req.params;
    const { winnerId, score, stats } = req.body;
    const userId = req.user?.id;

    const tournament = tournaments.find(t => t.id === id);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    // Verify user is organizer
    if (tournament.organizerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only tournament organizer can submit results'
      });
    }

    const match = matches.find(m => m.id === matchId && m.tournamentId === id);
    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    // Update match result
    match.winnerId = winnerId;
    match.score = score;
    match.stats = stats;
    match.status = 'completed';
    match.completedAt = new Date().toISOString();

    // Update standings
    updateTournamentStandings(tournament, match);

    // Check if round is complete
    const roundComplete = checkRoundComplete(tournament);
    
    if (roundComplete) {
      if (tournament.currentRound < tournament.totalRounds) {
        // Generate next round matches
        const nextRoundMatches = generateNextRoundMatches(tournament);
        matches.push(...nextRoundMatches);
        tournament.currentRound++;
      } else {
        // Tournament complete - determine winner
        const winner = determineTournamentWinner(tournament);
        tournament.status = 'completed';
        tournament.winner = winner;
      }
    }

    tournament.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Match result recorded successfully',
      match: match,
      roundComplete: roundComplete,
      tournamentComplete: tournament.status === 'completed',
      winner: tournament.winner
    });

  } catch (error) {
    console.error('Error submitting match result:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route GET /api/tournaments/:id/bracket
 * @description Get tournament bracket with current state
 * @access Public
 */
router.get('/:id/bracket', async (req, res) => {
  try {
    const { id } = req.params;

    const tournament = tournaments.find(t => t.id === id);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    const tournamentMatches = matches.filter(m => m.tournamentId === id);

    res.json({
      success: true,
      bracket: tournament.bracket,
      matches: tournamentMatches,
      currentRound: tournament.currentRound
    });

  } catch (error) {
    console.error('Error fetching bracket:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route GET /api/tournaments/:id/standings
 * @description Get tournament standings
 * @access Public
 */
router.get('/:id/standings', async (req, res) => {
  try {
    const { id } = req.params;

    const tournament = tournaments.find(t => t.id === id);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: 'Tournament not found'
      });
    }

    // Calculate current standings
    const standings = calculateStandings(tournament);

    res.json({
      success: true,
      standings: standings
    });

  } catch (error) {
    console.error('Error fetching standings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * Generate bracket structure based on type and participant count
 * @param {string} bracketType - Type of bracket
 * @param {number} numParticipants - Number of participants
 * @returns {Object} Bracket structure
 */
function generateBracketStructure(bracketType, numParticipants) {
  const bracket = {
    type: bracketType,
    rounds: []
  };

  if (bracketType === 'single-elimination') {
    let roundNum = 1;
    let matchesInRound = numParticipants / 2;

    while (matchesInRound >= 1) {
      const round = {
        roundNumber: roundNum,
        roundName: matchesInRound === 1 ? 'Finals' : matchesInRound === 2 ? 'Semi-Finals' : `Round ${roundNum}`,
        matchCount: matchesInRound
      };
      bracket.rounds.push(round);
      matchesInRound = matchesInRound / 2;
      roundNum++;
    }
  } else if (bracketType === 'double-elimination') {
    // Simplified double elimination
    bracket.winners = generateBracketStructure('single-elimination', numParticipants);
    bracket.losers = generateBracketStructure('single-elimination', numParticipants / 2);
  } else if (bracketType === 'round-robin') {
    // All vs all
    const totalMatches = (numParticipants * (numParticipants - 1)) / 2;
    bracket.rounds.push({
      roundNumber: 1,
      roundName: 'Round Robin',
      matchCount: totalMatches
    });
  }

  return bracket;
}

/**
 * Generate first round matches
 * @param {Object} tournament - Tournament object
 * @returns {Array} Array of match objects
 */
function generateFirstRoundMatches(tournament) {
  const firstRoundMatches = [];
  const participants = tournament.registeredParticipants;
  const matchesInRound = participants.length / 2;

  for (let i = 0; i < matchesInRound; i++) {
    const match = {
      id: `match_${tournament.id}_R1M${i + 1}`,
      tournamentId: tournament.id,
      round: 1,
      matchNumber: i + 1,
      participant1: participants[i * 2],
      participant2: participants[i * 2 + 1],
      winnerId: null,
      score: null,
      status: 'pending', // pending, active, completed
      createdAt: new Date().toISOString()
    };
    firstRoundMatches.push(match);
  }

  return firstRoundMatches;
}

/**
 * Generate next round matches based on previous round results
 * @param {Object} tournament - Tournament object
 * @returns {Array} Array of match objects
 */
function generateNextRoundMatches(tournament) {
  const nextRoundMatches = [];
  const currentRound = tournament.currentRound;
  const previousRoundMatches = matches.filter(m => 
    m.tournamentId === tournament.id && 
    m.round === currentRound &&
    m.status === 'completed'
  );

  const matchesInNextRound = previousRoundMatches.length / 2;

  for (let i = 0; i < matchesInNextRound; i++) {
    const match1 = previousRoundMatches[i * 2];
    const match2 = previousRoundMatches[i * 2 + 1];

    const winner1 = tournament.registeredParticipants.find(p => p.userId === match1.winnerId);
    const winner2 = tournament.registeredParticipants.find(p => p.userId === match2.winnerId);

    const match = {
      id: `match_${tournament.id}_R${currentRound + 1}M${i + 1}`,
      tournamentId: tournament.id,
      round: currentRound + 1,
      matchNumber: i + 1,
      participant1: winner1,
      participant2: winner2,
      winnerId: null,
      score: null,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    nextRoundMatches.push(match);
  }

  return nextRoundMatches;
}

/**
 * Update tournament standings based on match result
 * @param {Object} tournament - Tournament object
 * @param {Object} match - Match object with result
 */
function updateTournamentStandings(tournament, match) {
  const { participant1, participant2, winnerId, score } = match;
  const pointsSystem = tournament.pointsSystem;

  // Initialize standings if not exists
  if (!tournament.standings) {
    tournament.standings = [];
  }

  // Get or create standing entries
  let standing1 = tournament.standings.find(s => s.userId === participant1.userId);
  let standing2 = tournament.standings.find(s => s.userId === participant2.userId);

  if (!standing1) {
    standing1 = { userId: participant1.userId, name: participant1.participantName, wins: 0, losses: 0, draws: 0, points: 0 };
    tournament.standings.push(standing1);
  }
  if (!standing2) {
    standing2 = { userId: participant2.userId, name: participant2.participantName, wins: 0, losses: 0, draws: 0, points: 0 };
    tournament.standings.push(standing2);
  }

  // Update standings
  if (winnerId === participant1.userId) {
    standing1.wins++;
    standing1.points += pointsSystem.win;
    standing2.losses++;
    standing2.points += pointsSystem.loss;
  } else if (winnerId === participant2.userId) {
    standing2.wins++;
    standing2.points += pointsSystem.win;
    standing1.losses++;
    standing1.points += pointsSystem.loss;
  } else if (winnerId === 'draw') {
    standing1.draws++;
    standing1.points += pointsSystem.draw;
    standing2.draws++;
    standing2.points += pointsSystem.draw;
  }

  // Sort standings by points
  tournament.standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return a.losses - b.losses;
  });
}

/**
 * Check if current round is complete
 * @param {Object} tournament - Tournament object
 * @returns {boolean} True if round is complete
 */
function checkRoundComplete(tournament) {
  const currentRoundMatches = matches.filter(m => 
    m.tournamentId === tournament.id && 
    m.round === tournament.currentRound
  );

  return currentRoundMatches.every(m => m.status === 'completed');
}

/**
 * Calculate and return current standings
 * @param {Object} tournament - Tournament object
 * @returns {Array} Sorted standings array
 */
function calculateStandings(tournament) {
  return tournament.standings || [];
}

/**
 * Determine tournament winner
 * @param {Object} tournament - Tournament object
 * @returns {Object} Winner participant object
 */
function determineTournamentWinner(tournament) {
  if (tournament.bracketType === 'single-elimination' || tournament.bracketType === 'double-elimination') {
    // Winner of final match
    const finalRound = tournament.totalRounds;
    const finalMatch = matches.find(m => 
      m.tournamentId === tournament.id && 
      m.round === finalRound &&
      m.status === 'completed'
    );
    
    if (finalMatch) {
      return tournament.registeredParticipants.find(p => p.userId === finalMatch.winnerId);
    }
  } else if (tournament.bracketType === 'round-robin') {
    // Participant with most points
    const standings = tournament.standings || [];
    return standings[0] ? tournament.registeredParticipants.find(p => p.userId === standings[0].userId) : null;
  }
  
  return null;
}

module.exports = router;
