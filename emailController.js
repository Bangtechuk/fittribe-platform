require('dotenv').config();
const nodemailer = require('nodemailer');
const express = require('express');

// Email service configuration
const EMAIL_SERVICE = process.env.EMAIL_SERVICE || 'gmail';
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@fittribe.fitness';

// Create email transporter
const transporter = nodemailer.createTransport({
  service: EMAIL_SERVICE,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD
  }
});

// Send booking confirmation email
const sendBookingConfirmation = async (req, res) => {
  try {
    const { 
      recipientEmail, 
      recipientName,
      trainerName,
      serviceName,
      startTime,
      endTime,
      price,
      zoomLink,
      bookingId
    } = req.body;
    
    if (!recipientEmail || !recipientName || !trainerName || !serviceName || !startTime || !endTime) {
      return res.status(400).json({
        error: true,
        message: 'Missing required fields'
      });
    }
    
    const formattedDate = new Date(startTime).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const formattedStartTime = new Date(startTime).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const formattedEndTime = new Date(endTime).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const mailOptions = {
      from: EMAIL_FROM,
      to: recipientEmail,
      subject: 'Your FitTribe Session Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #6366F1; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">FitTribe.fitness</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
            <h2>Hello ${recipientName},</h2>
            <p>Your fitness session has been confirmed!</p>
            
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Session Details</h3>
              <p><strong>Service:</strong> ${serviceName}</p>
              <p><strong>Trainer:</strong> ${trainerName}</p>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Time:</strong> ${formattedStartTime} - ${formattedEndTime}</p>
              ${price ? `<p><strong>Price:</strong> $${price}</p>` : ''}
              ${bookingId ? `<p><strong>Booking ID:</strong> ${bookingId}</p>` : ''}
            </div>
            
            ${zoomLink ? `
            <div style="margin: 20px 0;">
              <p>Join your session using the Zoom link below:</p>
              <a href="${zoomLink}" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Join Zoom Meeting</a>
            </div>
            ` : ''}
            
            <p>If you need to reschedule or cancel your session, please do so at least 24 hours in advance.</p>
            
            <p>Thank you for choosing FitTribe!</p>
            
            <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </div>
      `
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    return res.status(200).json({
      error: false,
      message: 'Booking confirmation email sent successfully'
    });
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to send booking confirmation email'
    });
  }
};

// Send booking reminder email
const sendBookingReminder = async (req, res) => {
  try {
    const { 
      recipientEmail, 
      recipientName,
      trainerName,
      serviceName,
      startTime,
      endTime,
      zoomLink,
      bookingId
    } = req.body;
    
    if (!recipientEmail || !recipientName || !trainerName || !serviceName || !startTime || !endTime) {
      return res.status(400).json({
        error: true,
        message: 'Missing required fields'
      });
    }
    
    const formattedDate = new Date(startTime).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const formattedStartTime = new Date(startTime).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const formattedEndTime = new Date(endTime).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const mailOptions = {
      from: EMAIL_FROM,
      to: recipientEmail,
      subject: 'Reminder: Your FitTribe Session is Coming Up',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #6366F1; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">FitTribe.fitness</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
            <h2>Hello ${recipientName},</h2>
            <p>This is a friendly reminder that your fitness session is coming up soon!</p>
            
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Session Details</h3>
              <p><strong>Service:</strong> ${serviceName}</p>
              <p><strong>Trainer:</strong> ${trainerName}</p>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Time:</strong> ${formattedStartTime} - ${formattedEndTime}</p>
              ${bookingId ? `<p><strong>Booking ID:</strong> ${bookingId}</p>` : ''}
            </div>
            
            ${zoomLink ? `
            <div style="margin: 20px 0;">
              <p>Join your session using the Zoom link below:</p>
              <a href="${zoomLink}" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Join Zoom Meeting</a>
            </div>
            ` : ''}
            
            <p>Please make sure you're prepared for your session:</p>
            <ul>
              <li>Wear comfortable workout clothes</li>
              <li>Have water nearby</li>
              <li>Find a quiet space with enough room to move</li>
              <li>Test your camera and microphone before the session</li>
            </ul>
            
            <p>We look forward to seeing you soon!</p>
            
            <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </div>
      `
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    return res.status(200).json({
      error: false,
      message: 'Booking reminder email sent successfully'
    });
  } catch (error) {
    console.error('Error sending booking reminder email:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to send booking reminder email'
    });
  }
};

// Send payment receipt email
const sendPaymentReceipt = async (req, res) => {
  try {
    const { 
      recipientEmail, 
      recipientName,
      trainerName,
      serviceName,
      sessionDate,
      amount,
      paymentId,
      bookingId
    } = req.body;
    
    if (!recipientEmail || !recipientName || !trainerName || !serviceName || !sessionDate || !amount) {
      return res.status(400).json({
        error: true,
        message: 'Missing required fields'
      });
    }
    
    const formattedDate = new Date(sessionDate).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const mailOptions = {
      from: EMAIL_FROM,
      to: recipientEmail,
      subject: 'Your FitTribe Payment Receipt',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #6366F1; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">FitTribe.fitness</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
            <h2>Hello ${recipientName},</h2>
            <p>Thank you for your payment. Here's your receipt:</p>
            
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Payment Details</h3>
              <p><strong>Service:</strong> ${serviceName}</p>
              <p><strong>Trainer:</strong> ${trainerName}</p>
              <p><strong>Session Date:</strong> ${formattedDate}</p>
              <p><strong>Amount:</strong> $${amount}</p>
              ${paymentId ? `<p><strong>Payment ID:</strong> ${paymentId}</p>` : ''}
              ${bookingId ? `<p><strong>Booking ID:</strong> ${bookingId}</p>` : ''}
              <p><strong>Date Paid:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <p>If you have any questions about this payment, please contact our support team.</p>
            
            <p>Thank you for choosing FitTribe!</p>
            
            <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </div>
      `
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    return res.status(200).json({
      error: false,
      message: 'Payment receipt email sent successfully'
    });
  } catch (error) {
    console.error('Error sending payment receipt email:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to send payment receipt email'
    });
  }
};

// Send admin notification email
const sendAdminNotification = async (req, res) => {
  try {
    const { 
      notificationType,
      subject,
      details
    } = req.body;
    
    if (!notificationType || !subject || !details) {
      return res.status(400).json({
        error: true,
        message: 'Missing required fields'
      });
    }
    
    // In a real implementation, you would retrieve admin email addresses from your database
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : ['admin@fittribe.fitness'];
    
    const mailOptions = {
      from: EMAIL_FROM,
      to: adminEmails,
      subject: `FitTribe Admin Alert: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #6366F1; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">FitTribe.fitness</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
            <h2>Admin Notification: ${notificationType}</h2>
            
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Details</h3>
              <pre style="white-space: pre-wrap;">${JSON.stringify(details, null, 2)}</pre>
            </div>
            
            <p>Please take appropriate action as needed.</p>
            
            <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
              This is an automated email. Please do not reply to this message.
            </p>
          </div>
        </div>
      `
    };
    
    // Send email
    await transporter.sendMail(mailOptions);
    
    return res.status(200).json({
      error: false,
      message: 'Admin notification email sent successfully'
    });
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to send admin notification email'
    });
  }
};

module.exports = {
  sendBookingConfirmation,
  sendBookingReminder,
  sendPaymentReceipt,
  sendAdminNotification
};
