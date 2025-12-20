/**
 * Sports Psycho - Events API Module
 * Provides CRUD operations for event scheduling and management
 * Supports one-time events, tournament events, RSVP system, and calendar sync
 * 
 * @module api/events
 * @author Sports Psycho Development Team
 * @description Backend API endpoints for event operations
 * 
 * Mobile Integration Support: All endpoints return JSON formatted for web and mobile apps
 * Authentication: Uses JWT tokens passed in Authorization header
 */

const express = require('express');
const router = express.Router();

// In-memory storage (replace with actual database in production)
let events = [];
let rsvps = [];

/**
 * @route POST /api/events/create
 * @description Create a new event
 * @access Private (requires authentication)
 * @body {
 *   name: string,
 *   clubId: string,
 *   date: string (ISO date),
 *   time: string (HH:MM),
 *   location: string,
 *   maxParticipants: number,
 *   type: 'one-time' | 'tournament',
 *   description: string,
 *   calendarSync: boolean,
 *   rsvpRequired: boolean,
 *   hostId: string
 * }
 */
router.post('/create', async (req, res) => {
  try {
    const {
      name,
      clubId,
      date,
      time,
      location,
      maxParticipants,
      type,
      description,
      calendarSync,
      rsvpRequired,
      hostId
    } = req.body;

    // Validation
    if (!name || !clubId || !date || !time || !location || !maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate date is in future
    const eventDateTime = new Date(`${date}T${time}`);
    if (eventDateTime < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Event date and time must be in the future'
      });
    }

    // Validate max participants
    if (maxParticipants < 2 || maxParticipants > 100) {
      return res.status(400).json({
        success: false,
        message: 'Max participants must be between 2 and 100'
      });
    }

    // Generate unique event ID
    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create event object
    const newEvent = {
      id: eventId,
      name,
      clubId,
      date,
      time,
      dateTime: eventDateTime.toISOString(),
      location,
      maxParticipants,
      currentParticipants: 0,
      type: type || 'one-time',
      description,
      calendarSync: calendarSync || false,
      rsvpRequired: rsvpRequired || false,
      hostId,
      participants: [],
      waitlist: [],
      status: 'upcoming', // upcoming, active, completed, cancelled
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store event
    events.push(newEvent);

    // Generate calendar file if sync enabled
    let calendarFileUrl = null;
    if (calendarSync) {
      calendarFileUrl = await generateCalendarFile(newEvent);
    }

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      eventId: eventId,
      event: newEvent,
      calendarFileUrl: calendarFileUrl
    });

  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route GET /api/events/:id
 * @description Get event details by ID
 * @access Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const event = events.find(e => e.id === id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      event: event
    });

  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route PUT /api/events/:id
 * @description Update event details
 * @access Private (host only)
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user?.id;

    const eventIndex = events.findIndex(e => e.id === id);
    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Verify user is host
    if (events[eventIndex].hostId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only event host can update event details'
      });
    }

    // Update event
    events[eventIndex] = {
      ...events[eventIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Event updated successfully',
      event: events[eventIndex]
    });

  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route DELETE /api/events/:id
 * @description Delete/cancel an event
 * @access Private (host only)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const eventIndex = events.findIndex(e => e.id === id);
    if (eventIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Verify user is host
    if (events[eventIndex].hostId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only event host can cancel the event'
      });
    }

    // Mark as cancelled instead of deleting
    events[eventIndex].status = 'cancelled';
    events[eventIndex].updatedAt = new Date().toISOString();

    // Notify all participants
    await notifyEventCancellation(events[eventIndex]);

    res.json({
      success: true,
      message: 'Event cancelled successfully'
    });

  } catch (error) {
    console.error('Error cancelling event:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route POST /api/events/:id/rsvp
 * @description RSVP to an event
 * @access Private (requires authentication)
 * @body { status: 'attending' | 'declined' | 'maybe' }
 */
router.post('/:id/rsvp', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    const event = events.find(e => e.id === id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if event is full
    if (status === 'attending' && event.currentParticipants >= event.maxParticipants) {
      // Add to waitlist
      if (!event.waitlist.includes(userId)) {
        event.waitlist.push(userId);
      }
      return res.status(200).json({
        success: true,
        message: 'Event is full. Added to waitlist.',
        onWaitlist: true
      });
    }

    // Create or update RSVP
    const existingRsvpIndex = rsvps.findIndex(r => r.eventId === id && r.userId === userId);
    
    const rsvpData = {
      eventId: id,
      userId: userId,
      status: status,
      respondedAt: new Date().toISOString()
    };

    if (existingRsvpIndex !== -1) {
      // Update existing RSVP
      const oldStatus = rsvps[existingRsvpIndex].status;
      rsvps[existingRsvpIndex] = rsvpData;
      
      // Update participant count
      if (oldStatus === 'attending' && status !== 'attending') {
        event.currentParticipants--;
        event.participants = event.participants.filter(p => p !== userId);
      } else if (oldStatus !== 'attending' && status === 'attending') {
        event.currentParticipants++;
        event.participants.push(userId);
      }
    } else {
      // Create new RSVP
      rsvps.push(rsvpData);
      
      if (status === 'attending') {
        event.currentParticipants++;
        event.participants.push(userId);
      }
    }

    event.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'RSVP recorded successfully',
      rsvp: rsvpData,
      event: event
    });

  } catch (error) {
    console.error('Error processing RSVP:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route GET /api/events/:id/rsvps
 * @description Get all RSVPs for an event
 * @access Private (host and participants only)
 */
router.get('/:id/rsvps', async (req, res) => {
  try {
    const { id } = req.params;

    const event = events.find(e => e.id === id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const eventRsvps = rsvps.filter(r => r.eventId === id);

    res.json({
      success: true,
      rsvps: eventRsvps,
      summary: {
        attending: eventRsvps.filter(r => r.status === 'attending').length,
        declined: eventRsvps.filter(r => r.status === 'declined').length,
        maybe: eventRsvps.filter(r => r.status === 'maybe').length
      }
    });

  } catch (error) {
    console.error('Error fetching RSVPs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route GET /api/events/club/:clubId
 * @description Get all events for a club
 * @access Public
 */
router.get('/club/:clubId', async (req, res) => {
  try {
    const { clubId } = req.params;
    const { status } = req.query;

    let clubEvents = events.filter(e => e.clubId === clubId);

    if (status) {
      clubEvents = clubEvents.filter(e => e.status === status);
    }

    // Sort by date
    clubEvents.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

    res.json({
      success: true,
      count: clubEvents.length,
      events: clubEvents
    });

  } catch (error) {
    console.error('Error fetching club events:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * @route GET /api/events/calendar/:userId
 * @description Get calendar view of events for a user
 * @access Private (requires authentication)
 */
router.get('/calendar/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    // Get events user is participating in
    const userRsvps = rsvps.filter(r => r.userId === userId && r.status === 'attending');
    const eventIds = userRsvps.map(r => r.eventId);
    
    let userEvents = events.filter(e => eventIds.includes(e.id));

    // Filter by date range if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      userEvents = userEvents.filter(e => {
        const eventDate = new Date(e.dateTime);
        return eventDate >= start && eventDate <= end;
      });
    }

    // Sort by date
    userEvents.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

    res.json({
      success: true,
      count: userEvents.length,
      events: userEvents
    });

  } catch (error) {
    console.error('Error fetching calendar:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * Generate iCalendar file for event
 * @param {Object} event - Event object
 * @returns {string} URL to calendar file
 */
async function generateCalendarFile(event) {
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Sports Psycho//Event//EN
BEGIN:VEVENT
UID:${event.id}@sportspsycho.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${event.dateTime.replace(/[-:]/g, '').split('.')[0]}Z
SUMMARY:${event.name}
DESCRIPTION:${event.description}
LOCATION:${event.location}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

  // In production, save to cloud storage and return URL
  console.log('Calendar file generated for event:', event.id);
  return `/downloads/calendar/${event.id}.ics`;
}

/**
 * Notify participants of event cancellation
 * @param {Object} event - Event object
 */
async function notifyEventCancellation(event) {
  event.participants.forEach(participantId => {
    console.log(`Notification sent to ${participantId}: Event ${event.name} has been cancelled`);
    // In production, send push notification/email
  });
}

module.exports = router;
