/**
 * Event Controller
 * Handles CRUD operations for events
 */

class EventController {
  constructor() {
    this.events = [];
    this.loadFromStorage();
  }

  /**
   * Load events from localStorage
   */
  loadFromStorage() {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('events');
      if (stored) {
        this.events = JSON.parse(stored);
      }
    }
  }

  /**
   * Save events to localStorage
   */
  saveToStorage() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('events', JSON.stringify(this.events));
    }
  }

  /**
   * Create a new event
   * @param {Object} eventData
   * @returns {Object} { success: boolean, data?: Object, error?: string }
   */
  createEvent(eventData) {
    try {
      const event = new Event(eventData);
      
      const validation = event.validate();
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      this.events.push(event.toJSON());
      this.saveToStorage();

      return {
        success: true,
        data: event.toJSON()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get event by ID
   * @param {string} eventId
   * @returns {Object} { success: boolean, data?: Object, error?: string }
   */
  getEventById(eventId) {
    const event = this.events.find(e => e.id === eventId);
    
    if (!event) {
      return {
        success: false,
        error: 'Event not found'
      };
    }

    return {
      success: true,
      data: event
    };
  }

  /**
   * Get all events
   * @param {Object} filters - Optional filters (clubId, date range, etc.)
   * @returns {Object} { success: boolean, data: Array }
   */
  getAllEvents(filters = {}) {
    let filteredEvents = [...this.events];

    if (filters.clubId) {
      filteredEvents = filteredEvents.filter(e => e.clubId === filters.clubId);
    }

    if (filters.startDate) {
      filteredEvents = filteredEvents.filter(e => 
        new Date(e.dateTime) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filteredEvents = filteredEvents.filter(e => 
        new Date(e.dateTime) <= new Date(filters.endDate)
      );
    }

    if (filters.recurrence) {
      filteredEvents = filteredEvents.filter(e => e.recurrence === filters.recurrence);
    }

    return {
      success: true,
      data: filteredEvents
    };
  }

  /**
   * Update event
   * @param {string} eventId
   * @param {Object} updateData
   * @returns {Object} { success: boolean, data?: Object, error?: string }
   */
  updateEvent(eventId, updateData) {
    const index = this.events.findIndex(e => e.id === eventId);
    
    if (index === -1) {
      return {
        success: false,
        error: 'Event not found'
      };
    }

    const updatedEvent = {
      ...this.events[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    const event = new Event(updatedEvent);
    const validation = event.validate();
    
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.join(', ')
      };
    }

    this.events[index] = event.toJSON();
    this.saveToStorage();

    return {
      success: true,
      data: event.toJSON()
    };
  }

  /**
   * Delete event
   * @param {string} eventId
   * @returns {Object} { success: boolean, error?: string }
   */
  deleteEvent(eventId) {
    const index = this.events.findIndex(e => e.id === eventId);
    
    if (index === -1) {
      return {
        success: false,
        error: 'Event not found'
      };
    }

    this.events.splice(index, 1);
    this.saveToStorage();

    return {
      success: true
    };
  }

  /**
   * Add participant to event
   * @param {string} eventId
   * @param {string} userId
   * @returns {Object} { success: boolean, data?: Object, error?: string }
   */
  addParticipant(eventId, userId) {
    const eventData = this.events.find(e => e.id === eventId);
    
    if (!eventData) {
      return {
        success: false,
        error: 'Event not found'
      };
    }

    const event = new Event(eventData);
    const added = event.addParticipant(userId);
    
    if (!added) {
      return {
        success: false,
        error: event.isFull() ? 'Event is full' : 'User is already a participant'
      };
    }

    // Update in storage
    const index = this.events.findIndex(e => e.id === eventId);
    this.events[index] = event.toJSON();
    this.saveToStorage();

    return {
      success: true,
      data: event.toJSON()
    };
  }

  /**
   * Remove participant from event
   * @param {string} eventId
   * @param {string} userId
   * @returns {Object} { success: boolean, data?: Object, error?: string }
   */
  removeParticipant(eventId, userId) {
    const eventData = this.events.find(e => e.id === eventId);
    
    if (!eventData) {
      return {
        success: false,
        error: 'Event not found'
      };
    }

    const event = new Event(eventData);
    const removed = event.removeParticipant(userId);
    
    if (!removed) {
      return {
        success: false,
        error: 'User is not a participant'
      };
    }

    // Update in storage
    const index = this.events.findIndex(e => e.id === eventId);
    this.events[index] = event.toJSON();
    this.saveToStorage();

    return {
      success: true,
      data: event.toJSON()
    };
  }

  /**
   * Get events by user participation
   * @param {string} userId
   * @returns {Object} { success: boolean, data: Array }
   */
  getEventsByUser(userId) {
    const userEvents = this.events.filter(e => 
      e.participantIds.includes(userId) || e.createdBy === userId
    );

    return {
      success: true,
      data: userEvents
    };
  }

  /**
   * Generate recurring events
   * @param {string} eventId
   * @returns {Object} { success: boolean, data?: Array, error?: string }
   */
  generateRecurringEvents(eventId) {
    const baseEvent = this.events.find(e => e.id === eventId);
    
    if (!baseEvent) {
      return {
        success: false,
        error: 'Event not found'
      };
    }

    if (baseEvent.recurrence === 'one-time') {
      return {
        success: false,
        error: 'Event is not recurring'
      };
    }

    const generatedEvents = [];
    const startDate = new Date(baseEvent.dateTime);
    const endDate = baseEvent.recurrenceEndDate ? new Date(baseEvent.recurrenceEndDate) : new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000); // Default 90 days

    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const newEventData = {
        ...baseEvent,
        id: undefined, // Generate new ID
        dateTime: currentDate.toISOString(),
        participantIds: [],
        createdAt: undefined
      };

      const newEvent = new Event(newEventData);
      generatedEvents.push(newEvent.toJSON());
      this.events.push(newEvent.toJSON());

      // Increment date based on recurrence type
      switch (baseEvent.recurrence) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
        default:
          currentDate = new Date(endDate.getTime() + 1); // Exit loop
      }
    }

    this.saveToStorage();

    return {
      success: true,
      data: generatedEvents
    };
  }
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EventController;
}
