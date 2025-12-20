/**
 * Tournament Manager
 * Frontend logic for tournament bracket management and tracking
 */

class TournamentManager {
  constructor(apiClient) {
    this.api = apiClient;
  }

  /**
   * Initialize tournament creation form
   * @param {string} formId
   */
  initializeCreateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleCreateTournament(form);
    });
  }

  /**
   * Handle tournament creation
   * @param {HTMLFormElement} form
   */
  async handleCreateTournament(form) {
    const formData = new FormData(form);
    const currentUser = this.api.getCurrentUser();

    const participantIds = formData.get('participantIds')
      ? formData.get('participantIds').split(',').map(id => id.trim())
      : [];

    const tournamentData = {
      clubId: formData.get('clubId'),
      name: formData.get('name'),
      description: formData.get('description'),
      type: formData.get('type') || 'elimination',
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      participantIds: participantIds,
      createdBy: currentUser.id
    };

    // Validate
    const errors = this.validateTournamentData(tournamentData);
    if (errors.length > 0) {
      this.showErrors(errors);
      return;
    }

    try {
      const result = await this.api.createTournament(tournamentData);
      
      if (result.success) {
        this.showSuccess('Tournament created successfully!');
        
        // Redirect to tournament page
        setTimeout(() => {
          window.location.href = `tournament.html?id=${result.data.id}`;
        }, 1000);
      } else {
        this.showErrors([result.error]);
      }
    } catch (error) {
      this.showErrors(['Failed to create tournament: ' + error.message]);
    }
  }

  /**
   * Validate tournament data
   * @param {Object} tournamentData
   * @returns {Array<string>}
   */
  validateTournamentData(tournamentData) {
    const errors = [];

    if (!tournamentData.clubId) {
      errors.push('Club ID is required');
    }
    if (!tournamentData.name || tournamentData.name.trim().length === 0) {
      errors.push('Tournament name is required');
    }
    if (!tournamentData.startDate) {
      errors.push('Start date is required');
    }
    if (tournamentData.participantIds.length < 2) {
      errors.push('At least 2 participants are required');
    }

    return errors;
  }

  /**
   * Load and display tournament details
   * @param {string} tournamentId
   * @param {string} containerId
   */
  async loadTournamentDetails(tournamentId, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
      const result = await this.api.getTournamentById(tournamentId);
      
      if (result.success) {
        this.renderTournamentDetails(result.data, container);
      } else {
        container.innerHTML = `<p class="text-red-400">Error: ${result.error}</p>`;
      }
    } catch (error) {
      container.innerHTML = `<p class="text-red-400">Failed to load tournament details</p>`;
    }
  }

  /**
   * Render tournament details
   * @param {Object} tournament
   * @param {HTMLElement} container
   */
  renderTournamentDetails(tournament, container) {
    const startDate = new Date(tournament.startDate).toLocaleDateString();
    const endDate = tournament.endDate ? new Date(tournament.endDate).toLocaleDateString() : 'TBD';

    container.innerHTML = `
      <div class="card p-6">
        <h2 class="text-3xl font-extrabold">${tournament.name}</h2>
        <p class="text-sm opacity-80 mt-2">${tournament.type === 'elimination' ? 'Single Elimination' : 'Round Robin'}</p>
        
        <div class="mt-4">
          <p class="text-lg"><strong>Status:</strong> ${this.getStatusBadge(tournament.status)}</p>
          <p class="text-lg mt-2"><strong>Dates:</strong> ${startDate} - ${endDate}</p>
          <p class="text-lg mt-2"><strong>Participants:</strong> ${tournament.participantIds.length}</p>
        </div>

        ${tournament.description ? `
          <div class="mt-4">
            <h3 class="text-xl font-bold">Description</h3>
            <p class="opacity-90 mt-2">${tournament.description}</p>
          </div>
        ` : ''}

        ${tournament.winnerId ? `
          <div class="mt-4 p-4 bg-yellow-400 text-black rounded-xl">
            <p class="text-xl font-bold">🏆 Winner: User ${tournament.winnerId}</p>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Get status badge HTML
   * @param {string} status
   * @returns {string}
   */
  getStatusBadge(status) {
    const badges = {
      'upcoming': '<span class="bg-blue-400 text-black px-3 py-1 rounded-lg font-bold text-sm">Upcoming</span>',
      'in-progress': '<span class="bg-green-400 text-black px-3 py-1 rounded-lg font-bold text-sm">In Progress</span>',
      'completed': '<span class="bg-yellow-400 text-black px-3 py-1 rounded-lg font-bold text-sm">Completed</span>'
    };
    return badges[status] || status;
  }

  /**
   * Render elimination bracket
   * @param {string} tournamentId
   * @param {string} containerId
   */
  async renderBracket(tournamentId, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
      const result = await this.api.getTournamentById(tournamentId);
      
      if (!result.success) {
        container.innerHTML = `<p class="text-red-400">Error: ${result.error}</p>`;
        return;
      }

      const tournament = result.data;
      
      if (tournament.type !== 'elimination' || !tournament.bracket) {
        container.innerHTML = '<p class="opacity-70">No bracket available</p>';
        return;
      }

      this.renderEliminationBracket(tournament.bracket, container);
    } catch (error) {
      container.innerHTML = `<p class="text-red-400">Failed to render bracket</p>`;
    }
  }

  /**
   * Render elimination bracket structure
   * @param {Object} bracket
   * @param {HTMLElement} container
   */
  renderEliminationBracket(bracket, container) {
    container.innerHTML = '<div class="overflow-x-auto pb-4"></div>';
    const scrollContainer = container.querySelector('.overflow-x-auto');

    let html = '<div class="flex space-x-8 min-w-max">';

    bracket.rounds.forEach((round, roundIndex) => {
      html += `
        <div class="flex flex-col justify-around space-y-4">
          <h3 class="text-xl font-bold text-center mb-4">
            ${roundIndex === bracket.rounds.length - 1 ? 'Finals' : `Round ${roundIndex + 1}`}
          </h3>
      `;

      round.forEach((match, matchIndex) => {
        html += `
          <div class="card p-4 w-64">
            <p class="text-sm opacity-70 mb-2">Match ${matchIndex + 1}</p>
            
            <div class="flex items-center justify-between mb-2 ${match.winner === match.participant1 ? 'bg-green-400/20 rounded p-2' : ''}">
              <span class="font-bold">${match.participant1 || 'TBD'}</span>
              <span>${match.score.participant1}</span>
            </div>
            
            <div class="flex items-center justify-between ${match.winner === match.participant2 ? 'bg-green-400/20 rounded p-2' : ''}">
              <span class="font-bold">${match.participant2 || 'TBD'}</span>
              <span>${match.score.participant2}</span>
            </div>

            ${match.participant1 && match.participant2 && !match.winner ? `
              <button onclick="tournamentManager.openMatchScoreModal('${match.matchId}')" 
                      class="mt-3 w-full bg-[var(--psycho-blue)] text-black font-bold py-2 rounded-lg">
                Enter Score
              </button>
            ` : ''}
          </div>
        `;
      });

      html += '</div>';
    });

    html += '</div>';
    scrollContainer.innerHTML = html;
  }

  /**
   * Render round-robin standings
   * @param {string} tournamentId
   * @param {string} containerId
   */
  async renderStandings(tournamentId, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
      const result = await this.api.getTournamentById(tournamentId);
      
      if (!result.success) {
        container.innerHTML = `<p class="text-red-400">Error: ${result.error}</p>`;
        return;
      }

      const tournament = result.data;
      
      if (tournament.type !== 'round-robin') {
        container.innerHTML = '<p class="opacity-70">Standings only available for round-robin tournaments</p>';
        return;
      }

      this.renderRoundRobinStandings(tournament.standings, container);
    } catch (error) {
      container.innerHTML = `<p class="text-red-400">Failed to render standings</p>`;
    }
  }

  /**
   * Render round-robin standings table
   * @param {Array} standings
   * @param {HTMLElement} container
   */
  renderRoundRobinStandings(standings, container) {
    if (!standings || standings.length === 0) {
      container.innerHTML = '<p class="opacity-70">No standings available yet</p>';
      return;
    }

    let html = `
      <div class="card p-4">
        <h3 class="text-2xl font-bold mb-4">Standings</h3>
        <table class="w-full">
          <thead>
            <tr class="border-b border-white/20">
              <th class="text-left py-2">Rank</th>
              <th class="text-left py-2">Participant</th>
              <th class="text-center py-2">Wins</th>
              <th class="text-center py-2">Losses</th>
              <th class="text-center py-2">Points</th>
            </tr>
          </thead>
          <tbody>
    `;

    standings.forEach((standing, index) => {
      html += `
        <tr class="border-b border-white/10">
          <td class="py-3">${index + 1}</td>
          <td class="py-3 font-bold">${standing.participantId}</td>
          <td class="py-3 text-center">${standing.wins}</td>
          <td class="py-3 text-center">${standing.losses}</td>
          <td class="py-3 text-center font-bold">${standing.points}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = html;
  }

  /**
   * Open modal to enter match score
   * @param {string} matchId
   */
  openMatchScoreModal(matchId) {
    // This would open a modal in a real implementation
    const participant1Score = prompt('Enter score for Participant 1:');
    const participant2Score = prompt('Enter score for Participant 2:');
    
    if (participant1Score !== null && participant2Score !== null) {
      this.submitMatchScore(matchId, {
        participant1: parseInt(participant1Score),
        participant2: parseInt(participant2Score)
      });
    }
  }

  /**
   * Submit match score
   * @param {string} matchId
   * @param {Object} score
   */
  async submitMatchScore(matchId, score) {
    // Determine winner
    const winnerId = score.participant1 > score.participant2 ? 'participant1' : 'participant2';
    
    const tournamentId = new URLSearchParams(window.location.search).get('id');
    
    try {
      // This would call the API in a real implementation
      this.showSuccess('Match score recorded!');
      setTimeout(() => location.reload(), 1000);
    } catch (error) {
      this.showErrors(['Failed to submit score: ' + error.message]);
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
  const tournamentManager = new TournamentManager(apiClient);
}
