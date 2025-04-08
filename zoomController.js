require('dotenv').config();
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

// Zoom API credentials
const ZOOM_API_KEY = process.env.ZOOM_API_KEY;
const ZOOM_API_SECRET = process.env.ZOOM_API_SECRET;
const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID;

// Generate a JWT token for Zoom API authentication
const generateZoomJWT = () => {
  const payload = {
    iss: ZOOM_API_KEY,
    exp: new Date().getTime() + 5000
  };
  
  const base64Header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = crypto
    .createHmac('sha256', ZOOM_API_SECRET)
    .update(`${base64Header}.${base64Payload}`)
    .digest('base64');
  
  return `${base64Header}.${base64Payload}.${signature}`;
};

// Create a Zoom meeting
const createZoomMeeting = async (req, res) => {
  try {
    const { bookingId, startTime, endTime, trainerName, clientName, serviceName } = req.body;
    
    if (!bookingId || !startTime || !endTime || !trainerName || !clientName || !serviceName) {
      return res.status(400).json({
        error: true,
        message: 'Missing required fields'
      });
    }
    
    // Calculate duration in minutes
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMinutes = Math.round((end - start) / 60000);
    
    // Format the meeting topic and agenda
    const topic = `FitTribe: ${serviceName} with ${trainerName}`;
    const agenda = `Fitness session booked by ${clientName}. Booking ID: ${bookingId}`;
    
    // Prepare the request to Zoom API
    const zoomMeetingPayload = {
      topic,
      type: 2, // Scheduled meeting
      start_time: start.toISOString(),
      duration: durationMinutes,
      timezone: 'UTC',
      agenda,
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        waiting_room: true,
        meeting_authentication: false
      }
    };
    
    // Make the request to Zoom API
    const response = await axios.post(
      'https://api.zoom.us/v2/users/me/meetings',
      zoomMeetingPayload,
      {
        headers: {
          'Authorization': `Bearer ${generateZoomJWT()}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Extract the relevant meeting details
    const { id, join_url, password } = response.data;
    
    // Return the meeting details
    return res.status(200).json({
      error: false,
      data: {
        meetingId: id,
        joinUrl: join_url,
        password
      }
    });
  } catch (error) {
    console.error('Error creating Zoom meeting:', error.response?.data || error.message);
    return res.status(500).json({
      error: true,
      message: 'Failed to create Zoom meeting'
    });
  }
};

// Update a Zoom meeting
const updateZoomMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { startTime, endTime, trainerName, clientName, serviceName } = req.body;
    
    if (!meetingId || !startTime || !endTime) {
      return res.status(400).json({
        error: true,
        message: 'Missing required fields'
      });
    }
    
    // Calculate duration in minutes
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMinutes = Math.round((end - start) / 60000);
    
    // Format the meeting topic and agenda if provided
    const topic = serviceName && trainerName ? `FitTribe: ${serviceName} with ${trainerName}` : undefined;
    const agenda = clientName ? `Fitness session booked by ${clientName}` : undefined;
    
    // Prepare the request to Zoom API
    const zoomMeetingPayload = {
      start_time: start.toISOString(),
      duration: durationMinutes,
      timezone: 'UTC'
    };
    
    if (topic) zoomMeetingPayload.topic = topic;
    if (agenda) zoomMeetingPayload.agenda = agenda;
    
    // Make the request to Zoom API
    const response = await axios.patch(
      `https://api.zoom.us/v2/meetings/${meetingId}`,
      zoomMeetingPayload,
      {
        headers: {
          'Authorization': `Bearer ${generateZoomJWT()}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Return success
    return res.status(200).json({
      error: false,
      message: 'Zoom meeting updated successfully'
    });
  } catch (error) {
    console.error('Error updating Zoom meeting:', error.response?.data || error.message);
    return res.status(500).json({
      error: true,
      message: 'Failed to update Zoom meeting'
    });
  }
};

// Delete a Zoom meeting
const deleteZoomMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    
    if (!meetingId) {
      return res.status(400).json({
        error: true,
        message: 'Meeting ID is required'
      });
    }
    
    // Make the request to Zoom API
    await axios.delete(
      `https://api.zoom.us/v2/meetings/${meetingId}`,
      {
        headers: {
          'Authorization': `Bearer ${generateZoomJWT()}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Return success
    return res.status(200).json({
      error: false,
      message: 'Zoom meeting deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting Zoom meeting:', error.response?.data || error.message);
    return res.status(500).json({
      error: true,
      message: 'Failed to delete Zoom meeting'
    });
  }
};

// Get Zoom meeting details
const getZoomMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    
    if (!meetingId) {
      return res.status(400).json({
        error: true,
        message: 'Meeting ID is required'
      });
    }
    
    // Make the request to Zoom API
    const response = await axios.get(
      `https://api.zoom.us/v2/meetings/${meetingId}`,
      {
        headers: {
          'Authorization': `Bearer ${generateZoomJWT()}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Extract the relevant meeting details
    const { id, topic, start_time, duration, join_url, password } = response.data;
    
    // Return the meeting details
    return res.status(200).json({
      error: false,
      data: {
        meetingId: id,
        topic,
        startTime: start_time,
        duration,
        joinUrl: join_url,
        password
      }
    });
  } catch (error) {
    console.error('Error getting Zoom meeting:', error.response?.data || error.message);
    return res.status(500).json({
      error: true,
      message: 'Failed to get Zoom meeting details'
    });
  }
};

module.exports = {
  createZoomMeeting,
  updateZoomMeeting,
  deleteZoomMeeting,
  getZoomMeeting
};
