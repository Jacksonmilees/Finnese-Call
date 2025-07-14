const AfricasTalking = require('africastalking');

class AfricaTalkingIntegration {
  constructor(config) {
    this.client = AfricasTalking({
      apiKey: config.apiKey,
      username: config.username,
    });
    this.voice = this.client.VOICE;
  }

  async makeCall(to, from, callerId) {
    try {
      console.log(`Making call from ${from} to ${to}`);
      const options = {
        callTo: to,
        callFrom: from || callerId,
        clientRequestId: `call_${Date.now()}`,
      };
      const result = await this.voice.call(options);
      console.log('Call initiated:', result);
      return result;
    } catch (error) {
      console.error('Error making call:', error);
      throw error;
    }
  }

  async handleIncomingCall(req, res) {
    try {
      const { isActive, callerNumber, dtmfDigits, recordingUrl, sessionId, callSessionState } = req.body;
      console.log('Incoming call webhook:', { 
        isActive, 
        callerNumber, 
        dtmfDigits, 
        recordingUrl, 
        sessionId, 
        callSessionState 
      });
      
      if (isActive === '1') {
        console.log(`Call started from ${callerNumber}`);
        // Save call to database
        await this.saveIncomingCall(callerNumber, sessionId);
        await this.routeCall(callerNumber, res);
      } else {
        // Call ended
        console.log(`Call ended from ${callerNumber}`);
        await this.updateCallStatus(sessionId, 'completed');
        res.status(200).send('OK');
      }
    } catch (error) {
      console.error('Error handling incoming call:', error);
      res.status(500).send('Error processing call');
    }
  }

  async saveIncomingCall(callerNumber, sessionId) {
    try {
      const Call = require('./models/Call');
      const Organization = require('./models/Organization');
      
      // Get default organization (you might want to make this configurable)
      const organization = await Organization.findOne();
      const organizationId = organization ? organization.id : 1;
      
      const call = await Call.create({
        callId: sessionId || `call_${Date.now()}`,
        from: callerNumber,
        to: process.env.CALLER_ID || '+254711082321',
        direction: 'inbound',
        status: 'ringing',
        duration: 0,
        sessionId: sessionId,
        organizationId: organizationId,
        disposition: 'pending',
        notes: 'Incoming call from Africa\'s Talking'
      });
      
      console.log(`Call saved to database with ID: ${call.id}`);
      
      // Broadcast new call to frontend via WebSocket
      const { broadcastToOrganization } = require('./websocket');
      const callData = {
        id: call.id.toString(),
        phoneNumber: call.from,
        participants: [],
        direction: call.direction,
        status: call.status,
        duration: call.duration || 0,
        timestamp: call.createdAt,
        recordingUrl: call.recordingUrl,
        screenRecordingUrl: null,
        contactId: call.contactId,
        disposition: call.disposition,
        transcript: null,
        liveTranscript: null,
        notes: call.notes
      };
      
      console.log('🔔 Broadcasting new call to frontend:', callData);
      broadcastToOrganization(organizationId, 'new_call', callData);
      
      // Auto-update call status to 'missed' after 30 seconds if still ringing
      setTimeout(async () => {
        try {
          const currentCall = await Call.findByPk(call.id);
          if (currentCall && currentCall.status === 'ringing') {
            await currentCall.update({ status: 'missed' });
            console.log(`Call ${call.id} auto-updated to missed`);
            
            // Broadcast call status update
            broadcastToOrganization(organizationId, 'call_update', {
              callId: call.id.toString(),
              status: 'missed'
            });
          }
        } catch (error) {
          console.error('Error auto-updating call status:', error);
        }
      }, 30000); // 30 seconds
      
      return call;
    } catch (error) {
      console.error('Error saving incoming call:', error);
      throw error;
    }
  }

  async updateCallStatus(sessionId, status) {
    try {
      const Call = require('./models/Call');
      
      const call = await Call.findOne({ where: { sessionId } });
      if (call) {
        await call.update({ 
          status: status,
          duration: status === 'completed' ? 30 : 0 // You might want to calculate actual duration
        });
        console.log(`Call status updated to: ${status}`);
      }
    } catch (error) {
      console.error('Error updating call status:', error);
    }
  }

  async routeCall(callerNumber, res) {
    try {
      console.log(`Routing call from ${callerNumber}`);
      
      // For testing purposes, just play a message and hang up
      // This prevents the call loop issue
        const response = `
          <Response>
          <Say voice="woman">Welcome to FinesseCall. Thank you for calling. This is a test call. Goodbye!</Say>
          <Hangup/>
          </Response>
        `;
        res.set('Content-Type', 'application/xml');
        res.send(response);
      
      // Update call status to completed after a short delay
      setTimeout(async () => {
        try {
          const Call = require('./models/Call');
          const call = await Call.findOne({ 
            where: { 
              from: callerNumber,
              status: 'ringing'
            },
            order: [['createdAt', 'DESC']]
          });
          if (call) {
            await call.update({ status: 'completed', duration: 5 });
            console.log(`Call from ${callerNumber} marked as completed`);
          }
        } catch (error) {
          console.error('Error updating call status:', error);
        }
      }, 5000); // 5 seconds
      
    } catch (error) {
      console.error('Error routing call:', error);
      res.status(500).send('Error processing call');
    }
  }

  async findAvailableAgent() {
    try {
      // Import the Agent model dynamically to avoid circular dependencies
      const Agent = require('./models/Agent');
      const { Op } = require('sequelize');
      const agent = await Agent.findOne({ 
        where: { 
          status: 'available',
          role: { [Op.in]: ['agent', 'admin'] }
        }
      });
      return agent;
    } catch (error) {
      console.error('Error finding available agent:', error);
      return null;
    }
  }
}

module.exports = AfricaTalkingIntegration; 