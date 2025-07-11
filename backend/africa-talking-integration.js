const AfricasTalking = require('africastalking');
const db = require('./db');

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
      const options = {
        callTo: to,
        callFrom: from || callerId,
        clientRequestId: `call_${Date.now()}`,
      };
      const result = await this.voice.call(options);
      return result;
    } catch (error) {
      console.error('Error making call:', error);
      throw error;
    }
  }

  async handleIncomingCall(req, res) {
    const { isActive, callerNumber, dtmfDigits, recordingUrl } = req.body;
    if (isActive === '1') {
      await this.routeCall(callerNumber, res);
    } else {
      // Call ended
      // Optionally handle recordingUrl
      res.status(200).send('OK');
    }
  }

  async routeCall(callerNumber, res) {
    try {
      const agent = await this.findAvailableAgent();
      if (agent) {
        const response = `
          <Response>
            <Say voice="woman">Please hold while we connect you to an agent.</Say>
            <Dial timeout="30" record="true">
              <Number>${agent.extension}</Number>
            </Dial>
          </Response>
        `;
        res.set('Content-Type', 'application/xml');
        res.send(response);
      } else {
        const response = `
          <Response>
            <Say voice="woman">All our agents are busy. Please leave a message after the beep.</Say>
            <Record timeout="60" finishOnKey="#" />
          </Response>
        `;
        res.set('Content-Type', 'application/xml');
        res.send(response);
      }
    } catch (error) {
      res.status(500).send('Error processing call');
    }
  }

  async findAvailableAgent() {
    const query = `
      SELECT * FROM agents
      WHERE status = 'available'
      AND current_call_count < max_concurrent_calls
      ORDER BY last_call_time ASC
      LIMIT 1
    `;
    const result = await db.query(query);
    return result.rows[0];
  }
}

module.exports = AfricaTalkingIntegration; 