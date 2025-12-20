/**
 * API Routes Documentation
 * 
 * This file documents all available API endpoints for the Sports Psycho application.
 * These routes would be implemented in a backend server (Node.js/Express, Python/Flask, etc.)
 * 
 * For the current implementation, we're using client-side controllers with localStorage.
 * In production, these would be actual HTTP endpoints.
 */

const API_ROUTES = {
  
  // ==================== CLUB ROUTES ====================
  
  clubs: {
    /**
     * Create a new club
     * POST /api/clubs
     * Body: { name, sport, privacy, state, city, description, ownerId, imageUrl }
     * Response: { success, data: Club }
     */
    create: 'POST /api/clubs',
    
    /**
     * Get all clubs (with optional filters)
     * GET /api/clubs?privacy=public&sport=pickleball&state=TX&city=Austin
     * Response: { success, data: Club[] }
     */
    getAll: 'GET /api/clubs',
    
    /**
     * Get club by ID
     * GET /api/clubs/:clubId
     * Response: { success, data: Club }
     */
    getById: 'GET /api/clubs/:clubId',
    
    /**
     * Update club
     * PUT /api/clubs/:clubId
     * Body: { name?, sport?, privacy?, state?, city?, description?, imageUrl? }
     * Response: { success, data: Club }
     */
    update: 'PUT /api/clubs/:clubId',
    
    /**
     * Delete club
     * DELETE /api/clubs/:clubId
     * Response: { success }
     */
    delete: 'DELETE /api/clubs/:clubId',
    
    /**
     * Get clubs by user
     * GET /api/clubs/user/:userId
     * Response: { success, data: Club[] }
     */
    getByUser: 'GET /api/clubs/user/:userId',
    
    /**
     * Add member to club
     * POST /api/clubs/:clubId/members
     * Body: { userId }
     * Response: { success, data: Club }
     */
    addMember: 'POST /api/clubs/:clubId/members',
    
    /**
     * Remove member from club
     * DELETE /api/clubs/:clubId/members/:userId
     * Response: { success, data: Club }
     */
    removeMember: 'DELETE /api/clubs/:clubId/members/:userId',
  },

  // ==================== EVENT ROUTES ====================
  
  events: {
    /**
     * Create a new event
     * POST /api/events
     * Body: { clubId, name, description, dateTime, location, maxParticipants, recurrence, recurrenceEndDate, createdBy }
     * Response: { success, data: Event }
     */
    create: 'POST /api/events',
    
    /**
     * Get all events (with optional filters)
     * GET /api/events?clubId=xxx&startDate=2024-01-01&endDate=2024-12-31&recurrence=weekly
     * Response: { success, data: Event[] }
     */
    getAll: 'GET /api/events',
    
    /**
     * Get event by ID
     * GET /api/events/:eventId
     * Response: { success, data: Event }
     */
    getById: 'GET /api/events/:eventId',
    
    /**
     * Update event
     * PUT /api/events/:eventId
     * Body: { name?, description?, dateTime?, location?, maxParticipants?, recurrence? }
     * Response: { success, data: Event }
     */
    update: 'PUT /api/events/:eventId',
    
    /**
     * Delete event
     * DELETE /api/events/:eventId
     * Response: { success }
     */
    delete: 'DELETE /api/events/:eventId',
    
    /**
     * Get events by user
     * GET /api/events/user/:userId
     * Response: { success, data: Event[] }
     */
    getByUser: 'GET /api/events/user/:userId',
    
    /**
     * Add participant to event
     * POST /api/events/:eventId/participants
     * Body: { userId }
     * Response: { success, data: Event }
     */
    addParticipant: 'POST /api/events/:eventId/participants',
    
    /**
     * Remove participant from event
     * DELETE /api/events/:eventId/participants/:userId
     * Response: { success, data: Event }
     */
    removeParticipant: 'DELETE /api/events/:eventId/participants/:userId',
    
    /**
     * Generate recurring events
     * POST /api/events/:eventId/generate-recurring
     * Response: { success, data: Event[] }
     */
    generateRecurring: 'POST /api/events/:eventId/generate-recurring',
  },

  // ==================== TOURNAMENT ROUTES ====================
  
  tournaments: {
    /**
     * Create a new tournament
     * POST /api/tournaments
     * Body: { clubId, name, description, type, startDate, endDate, participantIds, createdBy }
     * Response: { success, data: Tournament }
     */
    create: 'POST /api/tournaments',
    
    /**
     * Get all tournaments (with optional filters)
     * GET /api/tournaments?clubId=xxx&status=upcoming&type=elimination
     * Response: { success, data: Tournament[] }
     */
    getAll: 'GET /api/tournaments',
    
    /**
     * Get tournament by ID
     * GET /api/tournaments/:tournamentId
     * Response: { success, data: Tournament }
     */
    getById: 'GET /api/tournaments/:tournamentId',
    
    /**
     * Update tournament
     * PUT /api/tournaments/:tournamentId
     * Body: { name?, description?, startDate?, endDate? }
     * Response: { success, data: Tournament }
     */
    update: 'PUT /api/tournaments/:tournamentId',
    
    /**
     * Delete tournament
     * DELETE /api/tournaments/:tournamentId
     * Response: { success }
     */
    delete: 'DELETE /api/tournaments/:tournamentId',
    
    /**
     * Start tournament
     * POST /api/tournaments/:tournamentId/start
     * Response: { success, data: Tournament }
     */
    start: 'POST /api/tournaments/:tournamentId/start',
    
    /**
     * Update match result
     * PUT /api/tournaments/:tournamentId/matches/:matchId
     * Body: { winnerId, score: { participant1, participant2 } }
     * Response: { success, data: Tournament }
     */
    updateMatch: 'PUT /api/tournaments/:tournamentId/matches/:matchId',
    
    /**
     * Get tournament bracket (elimination only)
     * GET /api/tournaments/:tournamentId/bracket
     * Response: { success, data: Bracket }
     */
    getBracket: 'GET /api/tournaments/:tournamentId/bracket',
    
    /**
     * Get tournament standings (round-robin only)
     * GET /api/tournaments/:tournamentId/standings
     * Response: { success, data: Standing[] }
     */
    getStandings: 'GET /api/tournaments/:tournamentId/standings',
  },

  // ==================== MEMBER INVITATION ROUTES ====================
  
  invitations: {
    /**
     * Send club invitation
     * POST /api/invitations
     * Body: { clubId, recipientUserId, senderUserId }
     * Response: { success, data: Invitation }
     */
    send: 'POST /api/invitations',
    
    /**
     * Get invitations for user
     * GET /api/invitations/user/:userId
     * Response: { success, data: Invitation[] }
     */
    getByUser: 'GET /api/invitations/user/:userId',
    
    /**
     * Accept invitation
     * POST /api/invitations/:invitationId/accept
     * Response: { success, data: { invitation, club } }
     */
    accept: 'POST /api/invitations/:invitationId/accept',
    
    /**
     * Decline invitation
     * POST /api/invitations/:invitationId/decline
     * Response: { success }
     */
    decline: 'POST /api/invitations/:invitationId/decline',
  }
};

// Example implementation with Express.js:
/*
const express = require('express');
const router = express.Router();
const ClubController = require('./controllers/club-controller');
const EventController = require('./controllers/event-controller');
const TournamentController = require('./controllers/tournament-controller');

const clubController = new ClubController();
const eventController = new EventController();
const tournamentController = new TournamentController();

// Club routes
router.post('/clubs', (req, res) => {
  const result = clubController.createClub(req.body);
  res.json(result);
});

router.get('/clubs', (req, res) => {
  const result = clubController.getAllClubs(req.query);
  res.json(result);
});

// ... more routes

module.exports = router;
*/

if (typeof module !== 'undefined' && module.exports) {
  module.exports = API_ROUTES;
}
