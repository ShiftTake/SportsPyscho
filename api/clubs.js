/**
 * Sports Psycho - Club API Module
 * Provides CRUD operations for club management
 * Supports public/private clubs, member invitations, and search functionality
 * 
 * @module api/clubs
 * @author Sports Psycho Development Team
 * @description Backend API endpoints for club operations
 * 
 * Mobile Integration Support: All endpoints return JSON formatted for web and mobile apps
 * Authentication: Uses JWT tokens passed in Authorization header
 */

const express = require('express');
const router = express.Router();

// In-memory storage (replace with actual database in production)
let clubs = [];
let clubMembers = [];

/**
 * @route POST /api/clubs/create
 * @description Create a new club
 * @access Private (requires authentication)
 * @body {
 *   name: string,
 *   sport: string,
 *   state: string,
 *   city: string,
 *   location: string,
 *   description: string,
 *   visibility: 'public' | 'private',
 *   inviteMembers: string[],
 *   ownerId: string
 * }
 */
router.post('/create', async (req, res) => {
  try {
    const {
      name,
      sport,
      state,
      city,
      location,
      description,
      visibility,
      inviteMembers,
      ownerId
    } = req.body;

    // Validation
    if (!name || !sport || !state || !city) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, sport, state, city'
      });
    }

    // Generate unique club ID using cryptographically secure method
    const crypto = require('crypto');
    const clubId = `club_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;

    // Create club object
    const newClub = {
      id: clubId,
      name,
      sport,
      state,
      city,
      location,
      description,
      visibility: visibility || 'public',
      ownerId,
      members: [ownerId], // Owner is automatically a member
      memberCount: 1,
      events: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active'
    };

    // Store club
    clubs.push(newClub);

    // Send invitations to specified members
    if (inviteMembers && inviteMembers.length > 0) {
      await sendClubInvitations(clubId, inviteMembers, ownerId);
    }

    res.status(201).json({
      success: true,
      message: 'Club created successfully',
      clubId: clubId,
      club: newClub
    });

  } catch (error) {
    console.error('Error creating club:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route GET /api/clubs/:id
 * @description Get club details by ID
 * @access Public for public clubs, Private for private clubs
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const club = clubs.find(c => c.id === id);

    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Check if club is private and user has access
    if (club.visibility === 'private') {
      const userId = req.user?.id; // Assuming user info is attached by auth middleware
      if (!club.members.includes(userId) && club.ownerId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to private club'
        });
      }
    }

    res.json({
      success: true,
      club: club
    });

  } catch (error) {
    console.error('Error fetching club:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route PUT /api/clubs/:id
 * @description Update club details
 * @access Private (owner only)
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user?.id;

    const clubIndex = clubs.findIndex(c => c.id === id);
    if (clubIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Verify user is owner
    if (clubs[clubIndex].ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only club owner can update club details'
      });
    }

    // Update club
    clubs[clubIndex] = {
      ...clubs[clubIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Club updated successfully',
      club: clubs[clubIndex]
    });

  } catch (error) {
    console.error('Error updating club:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route DELETE /api/clubs/:id
 * @description Delete a club
 * @access Private (owner only)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const clubIndex = clubs.findIndex(c => c.id === id);
    if (clubIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Verify user is owner
    if (clubs[clubIndex].ownerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only club owner can delete the club'
      });
    }

    // Remove club
    clubs.splice(clubIndex, 1);

    res.json({
      success: true,
      message: 'Club deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting club:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route GET /api/clubs/search
 * @description Search clubs by various criteria
 * @query {
 *   sport?: string,
 *   state?: string,
 *   city?: string,
 *   visibility?: 'public' | 'private',
 *   searchTerm?: string
 * }
 */
router.get('/search', async (req, res) => {
  try {
    const { sport, state, city, visibility, searchTerm } = req.query;

    // Start with public clubs only, unless explicitly searching for private clubs
    let filteredClubs = clubs.filter(club => 
      visibility === 'private' ? club.visibility === 'private' : club.visibility === 'public'
    );

    if (sport) {
      filteredClubs = filteredClubs.filter(c => c.sport.toLowerCase() === sport.toLowerCase());
    }

    if (state) {
      filteredClubs = filteredClubs.filter(c => c.state === state);
    }

    if (city) {
      filteredClubs = filteredClubs.filter(c => c.city.toLowerCase().includes(city.toLowerCase()));
    }

    if (searchTerm) {
      filteredClubs = filteredClubs.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    res.json({
      success: true,
      count: filteredClubs.length,
      clubs: filteredClubs
    });

  } catch (error) {
    console.error('Error searching clubs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route POST /api/clubs/:id/join
 * @description Join a club
 * @access Private (requires authentication)
 */
router.post('/:id/join', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const club = clubs.find(c => c.id === id);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Check if already a member
    if (club.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Already a member of this club'
      });
    }

    // For private clubs, check if user has invitation
    if (club.visibility === 'private') {
      // Check invitations (implement invitation system)
      const hasInvitation = await checkInvitation(userId, id);
      if (!hasInvitation) {
        return res.status(403).json({
          success: false,
          message: 'Private club - invitation required'
        });
      }
    }

    // Add member
    club.members.push(userId);
    club.memberCount++;
    club.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Successfully joined club',
      club: club
    });

  } catch (error) {
    console.error('Error joining club:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route POST /api/clubs/:id/leave
 * @description Leave a club
 * @access Private (requires authentication)
 */
router.post('/:id/leave', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const club = clubs.find(c => c.id === id);
    if (!club) {
      return res.status(404).json({
        success: false,
        message: 'Club not found'
      });
    }

    // Owner cannot leave their own club
    if (club.ownerId === userId) {
      return res.status(400).json({
        success: false,
        message: 'Club owner cannot leave. Transfer ownership or delete club instead.'
      });
    }

    // Remove member
    club.members = club.members.filter(m => m !== userId);
    club.memberCount--;
    club.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Successfully left club'
    });

  } catch (error) {
    console.error('Error leaving club:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * Helper function to send club invitations
 * @param {string} clubId - Club ID
 * @param {string[]} userIds - Array of user IDs to invite
 * @param {string} inviterId - ID of user sending invitations
 */
async function sendClubInvitations(clubId, userIds, inviterId) {
  // In production, send notifications/emails to invited users
  userIds.forEach(userId => {
    console.log(`Invitation sent to ${userId} for club ${clubId} from ${inviterId}`);
    // Store invitation in database
    // Send notification/email
  });
}

/**
 * Helper function to check if user has invitation to private club
 * @param {string} userId - User ID
 * @param {string} clubId - Club ID
 * @returns {boolean} True if user has invitation
 */
async function checkInvitation(userId, clubId) {
  // In production, check database for invitation
  // For demo, return true
  return true;
}

module.exports = router;
