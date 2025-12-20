/**
 * Event Manager
 * Frontend logic for event scheduling and management
 */

class EventManager {
  constructor(apiClient) {
    this.api = apiClient;
  }

  /**
   * Initialize event creation form
   * @param {string} formId
   */
  initializeCreateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleCreateEvent(form);
    });

    // Setup recurrence visibility toggle
    const recurrenceSelect = form.querySelector('[name="recurrence"]');
    if (recurrenceSelect) {
      recurrenceSelect.addEventListener('change', (e) => {
        this.toggleRecurrenceOptions(e.target.value);
      });
    }
  }

  /**
   * Toggle recurrence options visibility
   * @param {string} recurrenceType
   */
  toggleRecurrenceOptions(recurrenceType) {
    const recurrenceOptions = document.getElementById('recurrence-options');
    if (!recurrenceOptions) return;

    if (recurrenceType !== 'one-time') {
      recurrenceOptions.classList.remove('hidden');
    } else {
      recurrenceOptions.classList.add('hidden');
    }
  }

  /**
   * Handle event creation
   * @param {HTMLFormElement} form
   */
  async handleCreateEvent(form) {
    const formData = new FormData(form);
    const currentUser = this.api.getCurrentUser();

    const eventData = {
      clubId: formData.get('clubId'),
      name: formData.get('name'),
      description: formData.get('description'),
      dateTime: formData.get('dateTime'),
      location: formData.get('location'),
      maxParticipants: parseInt(formData.get('maxParticipants')),
      recurrence: formData.get('recurrence') || 'one-time',
      recurrenceEndDate: formData.get('recurrenceEndDate') || null,
      createdBy: currentUser.id
    };

    // Validate
    const errors = this.validateEventData(eventData);
    if (errors.length > 0) {
      this.showErrors(errors);
      return;
    }

    try {
      const result = await this.api.createEvent(eventData);
      
      if (result.success) {
        this.showSuccess('Event created successfully!');
        
        // Redirect to event page or club page
        setTimeout(() => {
          window.location.href = `event.html?id=${result.data.id}`;
        }, 1000);
      } else {
        this.showErrors([result.error]);
      }
    } catch (error) {
      this.showErrors(['Failed to create event: ' + error.message]);
    }
  }

  /**
   * Validate event data
   * @param {Object} eventData
   * @returns {Array<string>}
   */
  validateEventData(eventData) {
    const errors = [];

    if (!eventData.clubId) {
      errors.push('Club ID is required');
    }
    if (!eventData.name || eventData.name.trim().length === 0) {
      errors.push('Event name is required');
    }
    if (!eventData.dateTime) {
      errors.push('Date and time are required');
    }
    if (!eventData.location) {
      errors.push('Location is required');
    }
    if (!eventData.maxParticipants || eventData.maxParticipants < 1) {
      errors.push('Maximum participants must be at least 1');
    }

    return errors;
  }

  /**
   * Load and display event details
   * @param {string} eventId
   * @param {string} containerId
   */
  async loadEventDetails(eventId, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
      const result = await this.api.getEventById(eventId);
      
      if (result.success) {
        this.renderEventDetails(result.data, container);
      } else {
        container.innerHTML = `<p class="text-red-400">Error: ${result.error}</p>`;
      }
    } catch (error) {
      container.innerHTML = `<p class="text-red-400">Failed to load event details</p>`;
    }
  }

  /**
   * Render event details
   * @param {Object} event
   * @param {HTMLElement} container
   */
  renderEventDetails(event, container) {
    const date = new Date(event.dateTime);
    const formattedDate = date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
    const formattedTime = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });

    container.innerHTML = `
      <h2 class="text-3xl font-extrabold">${event.name}</h2>
      
      <div class="mt-4 flex items-center space-x-4">
        <span class="text-2xl">📅</span>
        <p class="text-lg font-bold">${formattedDate}, ${formattedTime}</p>
      </div>

      <div class="mt-3 flex items-center space-x-4">
        <span class="text-2xl">📍</span>
        <p class="text-lg font-bold">${event.location}</p>
      </div>

      <div class="mt-3 flex items-center space-x-4">
        <span class="text-2xl">👥</span>
        <p class="text-lg font-bold">${event.participantIds.length} / ${event.maxParticipants} participants</p>
      </div>

      ${event.description ? `
        <div class="card p-4 mt-6">
          <h3 class="text-xl font-bold mb-2">About</h3>
          <p class="opacity-90">${event.description}</p>
        </div>
      ` : ''}
    `;
  }

  /**
   * Load events list
   * @param {Object} filters
   * @param {string} containerId
   */
  async loadEventsList(filters, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
      const result = await this.api.getEvents(filters);
      
      if (result.success) {
        this.renderEventsList(result.data, container);
      } else {
        container.innerHTML = `<p class="text-red-400">Error loading events</p>`;
      }
    } catch (error) {
      container.innerHTML = `<p class="text-red-400">Failed to load events</p>`;
    }
  }

  /**
   * Render events list
   * @param {Array} events
   * @param {HTMLElement} container
   */
  renderEventsList(events, container) {
    if (events.length === 0) {
      container.innerHTML = '<p class="opacity-70">No events found</p>';
      return;
    }

    // Sort by date
    events.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

    container.innerHTML = events.map(event => {
      const date = new Date(event.dateTime);
      const formattedDate = date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
      const formattedTime = date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      });

      return `
        <div class="card p-4 flex justify-between items-center">
          <div>
            <p class="font-extrabold text-lg">${event.name}</p>
            <p class="text-sm opacity-80">${formattedDate} • ${formattedTime}</p>
            <p class="text-sm opacity-80">📍 ${event.location}</p>
          </div>
          <button onclick="window.location.href='event.html?id=${event.id}'" 
                  class="bg-[var(--psycho-blue)] text-black font-bold px-4 py-2 rounded-xl">
            View
          </button>
        </div>
      `;
    }).join('');
  }

  /**
   * Join event
   * @param {string} eventId
   */
  async joinEvent(eventId) {
    const currentUser = this.api.getCurrentUser();
    
    try {
      const result = await this.api.addEventParticipant(eventId, currentUser.id);
      
      if (result.success) {
        this.showSuccess('Successfully joined event!');
        setTimeout(() => location.reload(), 1000);
      } else {
        this.showErrors([result.error]);
      }
    } catch (error) {
      this.showErrors(['Failed to join event: ' + error.message]);
    }
  }

  /**
   * Leave event
   * @param {string} eventId
   */
  async leaveEvent(eventId) {
    const currentUser = this.api.getCurrentUser();
    
    try {
      const result = await this.api.removeEventParticipant(eventId, currentUser.id);
      
      if (result.success) {
        this.showSuccess('Successfully left event');
        setTimeout(() => location.reload(), 1000);
      } else {
        this.showErrors([result.error]);
      }
    } catch (error) {
      this.showErrors(['Failed to leave event: ' + error.message]);
    }
  }

  /**
   * Show error messages
   * @param {Array<string>} errors
   */
  showErrors(errors) {
    const errorContainer = document.getElementById('error-container') || this.createErrorContainer();
    errorContainer.innerHTML = `
      <div class="bg-red-500 text-white p-4 rounded-xl mb-4">
        ${errors.map(err => `<p>• ${err}</p>`).join('')}
      </div>
    `;
    setTimeout(() => errorContainer.innerHTML = '', 5000);
  }

  /**
   * Show success message
   * @param {string} message
   */
  showSuccess(message) {
    const errorContainer = document.getElementById('error-container') || this.createErrorContainer();
    errorContainer.innerHTML = `
      <div class="bg-green-500 text-white p-4 rounded-xl mb-4">
        ${message}
      </div>
    `;
    setTimeout(() => errorContainer.innerHTML = '', 3000);
  }

  /**
   * Create error container if it doesn't exist
   * @returns {HTMLElement}
   */
  createErrorContainer() {
    const container = document.createElement('div');
    container.id = 'error-container';
    container.className = 'fixed top-20 left-4 right-4 z-50';
    document.body.appendChild(container);
    return container;
  }
}

// Initialize global instance
if (typeof apiClient !== 'undefined') {
  const eventManager = new EventManager(apiClient);
}
