/**
 * API Client
 * Handles all API communication for the Sports Psycho application
 * 
 * This client uses localStorage for data persistence in the current implementation.
 * In production, this would make HTTP requests to a backend server.
 */

class APIClient {
  constructor() {
    this.baseURL = '/api'; // Would be actual API URL in production
    this.initializeStorage();
  }

  /**
   * Initialize localStorage with default data if needed
   */
  initializeStorage() {
    if (typeof localStorage === 'undefined') return;

    if (!localStorage.getItem('clubs')) {
      localStorage.setItem('clubs', JSON.stringify([]));
    }
    if (!localStorage.getItem('events')) {
      localStorage.setItem('events', JSON.stringify([]));
    }
    if (!localStorage.getItem('tournaments')) {
      localStorage.setItem('tournaments', JSON.stringify([]));
    }
    if (!localStorage.getItem('invitations')) {
      localStorage.setItem('invitations', JSON.stringify([]));
    }
    if (!localStorage.getItem('currentUser')) {
      // Default user for demo purposes
      localStorage.setItem('currentUser', JSON.stringify({
        id: 'user_' + Date.now(),
        name: 'Demo User',
        email: 'demo@sportspsycho.com'
      }));
    }
  }

  /**
   * Get current user
   * @returns {Object} Current user data
   */
  getCurrentUser() {
    if (typeof localStorage === 'undefined') return null;
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  /**
   * Simulate API request delay (for realistic UX)
   * @param {number} ms - Milliseconds to delay
   */
  async delay(ms = 100) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ==================== CLUB API ====================

  /**
   * Create a new club
   * @param {Object} clubData
   * @returns {Promise<Object>}
   */
  async createClub(clubData) {
    await this.delay();
    
    const clubs = JSON.parse(localStorage.getItem('clubs') || '[]');
    const newClub = {
      id: 'club_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      ...clubData,
      memberIds: [clubData.ownerId],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    clubs.push(newClub);
    localStorage.setItem('clubs', JSON.stringify(clubs));
    
    return { success: true, data: newClub };
  }

  /**
   * Get all clubs with optional filters
   * @param {Object} filters
   * @returns {Promise<Object>}
   */
  async getClubs(filters = {}) {
    await this.delay();
    
    let clubs = JSON.parse(localStorage.getItem('clubs') || '[]');
    
    if (filters.privacy) {
      clubs = clubs.filter(c => c.privacy === filters.privacy);
    }
    if (filters.sport) {
      clubs = clubs.filter(c => c.sport === filters.sport);
    }
    if (filters.state) {
      clubs = clubs.filter(c => c.state === filters.state);
    }
    if (filters.city) {
      clubs = clubs.filter(c => c.city === filters.city);
    }
    
    return { success: true, data: clubs };
  }

  /**
   * Get club by ID
   * @param {string} clubId
   * @returns {Promise<Object>}
   */
  async getClubById(clubId) {
    await this.delay();
    
    const clubs = JSON.parse(localStorage.getItem('clubs') || '[]');
    const club = clubs.find(c => c.id === clubId);
    
    if (!club) {
      return { success: false, error: 'Club not found' };
    }
    
    return { success: true, data: club };
  }

  /**
   * Update club
   * @param {string} clubId
   * @param {Object} updateData
   * @returns {Promise<Object>}
   */
  async updateClub(clubId, updateData) {
    await this.delay();
    
    const clubs = JSON.parse(localStorage.getItem('clubs') || '[]');
    const index = clubs.findIndex(c => c.id === clubId);
    
    if (index === -1) {
      return { success: false, error: 'Club not found' };
    }
    
    clubs[index] = {
      ...clubs[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('clubs', JSON.stringify(clubs));
    return { success: true, data: clubs[index] };
  }

  /**
   * Delete club
   * @param {string} clubId
   * @returns {Promise<Object>}
   */
  async deleteClub(clubId) {
    await this.delay();
    
    const clubs = JSON.parse(localStorage.getItem('clubs') || '[]');
    const filtered = clubs.filter(c => c.id !== clubId);
    
    localStorage.setItem('clubs', JSON.stringify(filtered));
    return { success: true };
  }

  /**
   * Add member to club
   * @param {string} clubId
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async addClubMember(clubId, userId) {
    await this.delay();
    
    const clubs = JSON.parse(localStorage.getItem('clubs') || '[]');
    const club = clubs.find(c => c.id === clubId);
    
    if (!club) {
      return { success: false, error: 'Club not found' };
    }
    
    if (!club.memberIds.includes(userId)) {
      club.memberIds.push(userId);
      club.updatedAt = new Date().toISOString();
      localStorage.setItem('clubs', JSON.stringify(clubs));
    }
    
    return { success: true, data: club };
  }

  /**
   * Remove member from club
   * @param {string} clubId
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async removeClubMember(clubId, userId) {
    await this.delay();
    
    const clubs = JSON.parse(localStorage.getItem('clubs') || '[]');
    const club = clubs.find(c => c.id === clubId);
    
    if (!club) {
      return { success: false, error: 'Club not found' };
    }
    
    club.memberIds = club.memberIds.filter(id => id !== userId);
    club.updatedAt = new Date().toISOString();
    localStorage.setItem('clubs', JSON.stringify(clubs));
    
    return { success: true, data: club };
  }

  // ==================== EVENT API ====================

  /**
   * Create a new event
   * @param {Object} eventData
   * @returns {Promise<Object>}
   */
  async createEvent(eventData) {
    await this.delay();
    
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const newEvent = {
      id: 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      ...eventData,
      participantIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    events.push(newEvent);
    localStorage.setItem('events', JSON.stringify(events));
    
    return { success: true, data: newEvent };
  }

  /**
   * Get all events with optional filters
   * @param {Object} filters
   * @returns {Promise<Object>}
   */
  async getEvents(filters = {}) {
    await this.delay();
    
    let events = JSON.parse(localStorage.getItem('events') || '[]');
    
    if (filters.clubId) {
      events = events.filter(e => e.clubId === filters.clubId);
    }
    if (filters.startDate) {
      events = events.filter(e => new Date(e.dateTime) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      events = events.filter(e => new Date(e.dateTime) <= new Date(filters.endDate));
    }
    
    return { success: true, data: events };
  }

  /**
   * Get event by ID
   * @param {string} eventId
   * @returns {Promise<Object>}
   */
  async getEventById(eventId) {
    await this.delay();
    
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const event = events.find(e => e.id === eventId);
    
    if (!event) {
      return { success: false, error: 'Event not found' };
    }
    
    return { success: true, data: event };
  }

  /**
   * Update event
   * @param {string} eventId
   * @param {Object} updateData
   * @returns {Promise<Object>}
   */
  async updateEvent(eventId, updateData) {
    await this.delay();
    
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const index = events.findIndex(e => e.id === eventId);
    
    if (index === -1) {
      return { success: false, error: 'Event not found' };
    }
    
    events[index] = {
      ...events[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('events', JSON.stringify(events));
    return { success: true, data: events[index] };
  }

  /**
   * Delete event
   * @param {string} eventId
   * @returns {Promise<Object>}
   */
  async deleteEvent(eventId) {
    await this.delay();
    
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const filtered = events.filter(e => e.id !== eventId);
    
    localStorage.setItem('events', JSON.stringify(filtered));
    return { success: true };
  }

  /**
   * Add participant to event
   * @param {string} eventId
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async addEventParticipant(eventId, userId) {
    await this.delay();
    
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const event = events.find(e => e.id === eventId);
    
    if (!event) {
      return { success: false, error: 'Event not found' };
    }
    
    if (event.participantIds.length >= event.maxParticipants) {
      return { success: false, error: 'Event is full' };
    }
    
    if (!event.participantIds.includes(userId)) {
      event.participantIds.push(userId);
      event.updatedAt = new Date().toISOString();
      localStorage.setItem('events', JSON.stringify(events));
    }
    
    return { success: true, data: event };
  }

  /**
   * Remove participant from event
   * @param {string} eventId
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async removeEventParticipant(eventId, userId) {
    await this.delay();
    
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const event = events.find(e => e.id === eventId);
    
    if (!event) {
      return { success: false, error: 'Event not found' };
    }
    
    event.participantIds = event.participantIds.filter(id => id !== userId);
    event.updatedAt = new Date().toISOString();
    localStorage.setItem('events', JSON.stringify(events));
    
    return { success: true, data: event };
  }

  // ==================== TOURNAMENT API ====================

  /**
   * Create a new tournament
   * @param {Object} tournamentData
   * @returns {Promise<Object>}
   */
  async createTournament(tournamentData) {
    await this.delay();
    
    const tournaments = JSON.parse(localStorage.getItem('tournaments') || '[]');
    const newTournament = {
      id: 'tournament_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      ...tournamentData,
      matches: [],
      bracket: null,
      standings: [],
      winnerId: null,
      status: 'upcoming',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    tournaments.push(newTournament);
    localStorage.setItem('tournaments', JSON.stringify(tournaments));
    
    return { success: true, data: newTournament };
  }

  /**
   * Get all tournaments with optional filters
   * @param {Object} filters
   * @returns {Promise<Object>}
   */
  async getTournaments(filters = {}) {
    await this.delay();
    
    let tournaments = JSON.parse(localStorage.getItem('tournaments') || '[]');
    
    if (filters.clubId) {
      tournaments = tournaments.filter(t => t.clubId === filters.clubId);
    }
    if (filters.status) {
      tournaments = tournaments.filter(t => t.status === filters.status);
    }
    if (filters.type) {
      tournaments = tournaments.filter(t => t.type === filters.type);
    }
    
    return { success: true, data: tournaments };
  }

  /**
   * Get tournament by ID
   * @param {string} tournamentId
   * @returns {Promise<Object>}
   */
  async getTournamentById(tournamentId) {
    await this.delay();
    
    const tournaments = JSON.parse(localStorage.getItem('tournaments') || '[]');
    const tournament = tournaments.find(t => t.id === tournamentId);
    
    if (!tournament) {
      return { success: false, error: 'Tournament not found' };
    }
    
    return { success: true, data: tournament };
  }

  /**
   * Update tournament
   * @param {string} tournamentId
   * @param {Object} updateData
   * @returns {Promise<Object>}
   */
  async updateTournament(tournamentId, updateData) {
    await this.delay();
    
    const tournaments = JSON.parse(localStorage.getItem('tournaments') || '[]');
    const index = tournaments.findIndex(t => t.id === tournamentId);
    
    if (index === -1) {
      return { success: false, error: 'Tournament not found' };
    }
    
    tournaments[index] = {
      ...tournaments[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('tournaments', JSON.stringify(tournaments));
    return { success: true, data: tournaments[index] };
  }

  /**
   * Delete tournament
   * @param {string} tournamentId
   * @returns {Promise<Object>}
   */
  async deleteTournament(tournamentId) {
    await this.delay();
    
    const tournaments = JSON.parse(localStorage.getItem('tournaments') || '[]');
    const filtered = tournaments.filter(t => t.id !== tournamentId);
    
    localStorage.setItem('tournaments', JSON.stringify(filtered));
    return { success: true };
  }

  // ==================== INVITATION API ====================

  /**
   * Send club invitation
   * @param {Object} invitationData
   * @returns {Promise<Object>}
   */
  async sendInvitation(invitationData) {
    await this.delay();
    
    const invitations = JSON.parse(localStorage.getItem('invitations') || '[]');
    const newInvitation = {
      id: 'invitation_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      ...invitationData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    invitations.push(newInvitation);
    localStorage.setItem('invitations', JSON.stringify(invitations));
    
    return { success: true, data: newInvitation };
  }

  /**
   * Get invitations for a user
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async getUserInvitations(userId) {
    await this.delay();
    
    const invitations = JSON.parse(localStorage.getItem('invitations') || '[]');
    const userInvitations = invitations.filter(i => i.recipientUserId === userId);
    
    return { success: true, data: userInvitations };
  }

  /**
   * Accept invitation
   * @param {string} invitationId
   * @returns {Promise<Object>}
   */
  async acceptInvitation(invitationId) {
    await this.delay();
    
    const invitations = JSON.parse(localStorage.getItem('invitations') || '[]');
    const invitation = invitations.find(i => i.id === invitationId);
    
    if (!invitation) {
      return { success: false, error: 'Invitation not found' };
    }
    
    invitation.status = 'accepted';
    localStorage.setItem('invitations', JSON.stringify(invitations));
    
    // Add user to club
    await this.addClubMember(invitation.clubId, invitation.recipientUserId);
    
    return { success: true, data: invitation };
  }

  /**
   * Decline invitation
   * @param {string} invitationId
   * @returns {Promise<Object>}
   */
  async declineInvitation(invitationId) {
    await this.delay();
    
    const invitations = JSON.parse(localStorage.getItem('invitations') || '[]');
    const invitation = invitations.find(i => i.id === invitationId);
    
    if (!invitation) {
      return { success: false, error: 'Invitation not found' };
    }
    
    invitation.status = 'declined';
    localStorage.setItem('invitations', JSON.stringify(invitations));
    
    return { success: true, data: invitation };
  }
}

// Create global instance
const apiClient = new APIClient();
