/**
 * Event Model
 * Defines the data structure for events in the application
 */

class Event {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.clubId = data.clubId;
    this.name = data.name;
    this.description = data.description || '';
    this.dateTime = data.dateTime;
    this.location = data.location;
    this.maxParticipants = data.maxParticipants;
    this.participantIds = data.participantIds || [];
    this.recurrence = data.recurrence || 'one-time'; // 'one-time', 'daily', 'weekly', 'monthly', 'tournament'
    this.recurrenceEndDate = data.recurrenceEndDate || null;
    this.tournamentId = data.tournamentId || null;
    this.createdBy = data.createdBy;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  generateId() {
    return 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Validates event data
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    if (!this.clubId) {
      errors.push('Club ID is required');
    }

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Event name is required');
    }

    if (!this.dateTime) {
      errors.push('Date and time are required');
    }

    if (!this.location || this.location.trim().length === 0) {
      errors.push('Location is required');
    }

    if (!this.maxParticipants || this.maxParticipants < 1) {
      errors.push('Maximum participants must be at least 1');
    }

    if (!['one-time', 'daily', 'weekly', 'monthly', 'tournament'].includes(this.recurrence)) {
      errors.push('Invalid recurrence type');
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
   * Checks if event is full
   * @returns {boolean}
   */
  isFull() {
    return this.participantIds.length >= this.maxParticipants;
  }

  /**
   * Adds a participant to the event
   * @param {string} userId
   * @returns {boolean} Success status
   */
  addParticipant(userId) {
    if (this.isFull()) {
      return false;
    }
    if (!this.participantIds.includes(userId)) {
      this.participantIds.push(userId);
      this.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  /**
   * Removes a participant from the event
   * @param {string} userId
   * @returns {boolean} Success status
   */
  removeParticipant(userId) {
    const index = this.participantIds.indexOf(userId);
    if (index > -1) {
      this.participantIds.splice(index, 1);
      this.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  /**
   * Converts event to JSON-serializable format
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      clubId: this.clubId,
      name: this.name,
      description: this.description,
      dateTime: this.dateTime,
      location: this.location,
      maxParticipants: this.maxParticipants,
      participantIds: this.participantIds,
      recurrence: this.recurrence,
      recurrenceEndDate: this.recurrenceEndDate,
      tournamentId: this.tournamentId,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Event;
}
