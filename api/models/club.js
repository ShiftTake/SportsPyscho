/**
 * Club Model
 * Defines the data structure for clubs in the application
 */

class Club {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.name = data.name;
    this.sport = data.sport;
    this.privacy = data.privacy || 'public'; // 'public' or 'private'
    this.state = data.state;
    this.city = data.city;
    this.description = data.description;
    this.ownerId = data.ownerId;
    this.memberIds = data.memberIds || [];
    this.imageUrl = data.imageUrl || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  generateId() {
    return 'club_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
  }

  /**
   * Validates club data
   * @returns {Object} { valid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Club name is required');
    }

    if (!this.sport || this.sport.trim().length === 0) {
      errors.push('Sport selection is required');
    }

    if (!this.state || this.state.trim().length === 0) {
      errors.push('State is required');
    }

    if (!this.city || this.city.trim().length === 0) {
      errors.push('City is required');
    }

    if (!['public', 'private'].includes(this.privacy)) {
      errors.push('Privacy must be either public or private');
    }

    if (!this.ownerId) {
      errors.push('Owner ID is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Converts club to JSON-serializable format
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      sport: this.sport,
      privacy: this.privacy,
      state: this.state,
      city: this.city,
      description: this.description,
      ownerId: this.ownerId,
      memberIds: this.memberIds,
      imageUrl: this.imageUrl,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Club;
}
