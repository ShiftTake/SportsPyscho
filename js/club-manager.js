/**
 * Club Manager
 * Frontend logic for club management
 */

class ClubManager {
  constructor(apiClient) {
    this.api = apiClient;
  }

  /**
   * Initialize club creation form
   * @param {string} formId - ID of the form element
   */
  initializeCreateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleCreateClub(form);
    });
  }

  /**
   * Handle club creation
   * @param {HTMLFormElement} form
   */
  async handleCreateClub(form) {
    const formData = new FormData(form);
    const currentUser = this.api.getCurrentUser();

    const clubData = {
      name: formData.get('name'),
      sport: formData.get('sport'),
      privacy: formData.get('privacy') || 'public',
      state: formData.get('state'),
      city: formData.get('city'),
      description: formData.get('description'),
      ownerId: currentUser.id,
      imageUrl: formData.get('imageUrl') || ''
    };

    // Validate
    const errors = this.validateClubData(clubData);
    if (errors.length > 0) {
      this.showErrors(errors);
      return;
    }

    try {
      const result = await this.api.createClub(clubData);
      
      if (result.success) {
        this.showSuccess('Club created successfully!');
        
        // Send invitations if any
        const inviteUserIds = formData.get('inviteUserIds');
        if (inviteUserIds) {
          await this.sendInvitations(result.data.id, inviteUserIds.split(','));
        }
        
        // Redirect to club page
        setTimeout(() => {
          window.location.href = `club.html?id=${result.data.id}`;
        }, 1000);
      } else {
        this.showErrors([result.error]);
      }
    } catch (error) {
      this.showErrors(['Failed to create club: ' + error.message]);
    }
  }

  /**
   * Validate club data
   * @param {Object} clubData
   * @returns {Array<string>} Array of error messages
   */
  validateClubData(clubData) {
    const errors = [];

    if (!clubData.name || clubData.name.trim().length === 0) {
      errors.push('Club name is required');
    }
    if (!clubData.sport) {
      errors.push('Sport selection is required');
    }
    if (!clubData.state) {
      errors.push('State is required');
    }
    if (!clubData.city) {
      errors.push('City is required');
    }

    return errors;
  }

  /**
   * Send invitations to multiple users
   * @param {string} clubId
   * @param {Array<string>} userIds
   */
  async sendInvitations(clubId, userIds) {
    const currentUser = this.api.getCurrentUser();
    
    for (const userId of userIds) {
      if (userId.trim()) {
        await this.api.sendInvitation({
          clubId: clubId,
          recipientUserId: userId.trim(),
          senderUserId: currentUser.id
        });
      }
    }
  }

  /**
   * Load and display club details
   * @param {string} clubId
   * @param {string} containerId
   */
  async loadClubDetails(clubId, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
      const result = await this.api.getClubById(clubId);
      
      if (result.success) {
        this.renderClubDetails(result.data, container);
      } else {
        container.innerHTML = `<p class="text-red-400">Error: ${result.error}</p>`;
      }
    } catch (error) {
      container.innerHTML = `<p class="text-red-400">Failed to load club details</p>`;
    }
  }

  /**
   * Render club details
   * @param {Object} club
   * @param {HTMLElement} container
   */
  renderClubDetails(club, container) {
    container.innerHTML = `
      <div class="card p-4">
        <h2 class="text-3xl font-extrabold">${club.name}</h2>
        <p class="opacity-80 text-sm">${club.privacy} • ${club.memberIds.length} Members</p>
        <p class="mt-4">${club.description || 'No description'}</p>
        <p class="mt-2 text-sm opacity-80">📍 ${club.city}, ${club.state}</p>
        <p class="text-sm opacity-80">⛳ ${club.sport}</p>
      </div>
    `;
  }

  /**
   * Load clubs list
   * @param {Object} filters
   * @param {string} containerId
   */
  async loadClubsList(filters, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
      const result = await this.api.getClubs(filters);
      
      if (result.success) {
        this.renderClubsList(result.data, container);
      } else {
        container.innerHTML = `<p class="text-red-400">Error loading clubs</p>`;
      }
    } catch (error) {
      container.innerHTML = `<p class="text-red-400">Failed to load clubs</p>`;
    }
  }

  /**
   * Render clubs list
   * @param {Array} clubs
   * @param {HTMLElement} container
   */
  renderClubsList(clubs, container) {
    if (clubs.length === 0) {
      container.innerHTML = '<p class="opacity-70">No clubs found</p>';
      return;
    }

    container.innerHTML = clubs.map(club => `
      <div class="card p-4 flex items-center justify-between">
        <div class="flex items-center">
          <div class="w-14 h-14 rounded-xl mr-4 border border-white bg-white/10"></div>
          <div>
            <p class="font-bold text-lg">${club.name}</p>
            <p class="text-sm opacity-80">${club.city}, ${club.state} • ${club.memberIds.length} members</p>
          </div>
        </div>
        <button onclick="window.location.href='club.html?id=${club.id}'" 
                class="bg-[var(--psycho-yellow)] text-black px-4 py-2 rounded-xl font-bold">
          View
        </button>
      </div>
    `).join('');
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
  const clubManager = new ClubManager(apiClient);
}
