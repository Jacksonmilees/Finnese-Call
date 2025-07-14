const fetch = require('node-fetch');

class CRMIntegration {
  constructor(config) {
    this.config = config;
  }

  async handleClickToCall({ phoneNumber, agentId, contactId, crmType }) {
    switch (crmType) {
      case 'salesforce':
        return await this.createSalesforceTask(phoneNumber, contactId);
      case 'hubspot':
        return await this.createHubSpotCall(phoneNumber, contactId);
      case 'zoho':
        return await this.createZohoCall(phoneNumber, contactId);
      case 'pipedrive':
        return await this.createPipedriveActivity(phoneNumber, contactId);
      default:
        return { success: false, error: 'Unsupported CRM' };
    }
  }

  async createSalesforceTask(phoneNumber, contactId) {
    // Replace with your Salesforce API endpoint and field mapping
    const url = 'https://your-instance.salesforce.com/services/data/vXX.X/sobjects/Task';
    const body = {
      WhoId: contactId,
      Subject: `Call to ${phoneNumber}`,
      Status: 'Not Started',
      Type: 'Call',
      Description: `Outbound call to ${phoneNumber}`
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.salesforce}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    return { success: res.ok, status: res.status };
  }

  async createHubSpotCall(phoneNumber, contactId) {
    // Replace with your HubSpot API endpoint and field mapping
    const url = 'https://api.hubapi.com/engagements/v1/engagements';
    const body = {
      engagement: { active: true, type: 'CALL', timestamp: Date.now() },
      associations: { contactIds: [contactId] },
      metadata: { toNumber: phoneNumber, fromNumber: '', status: 'COMPLETED' }
    };
    const res = await fetch(url + `?hapikey=${this.config.hubspot}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return { success: res.ok, status: res.status };
  }

  async createZohoCall(phoneNumber, contactId) {
    // Replace with your Zoho API endpoint and field mapping
    const url = 'https://www.zohoapis.com/crm/v2/Calls';
    const body = {
      data: [{
        Who_Id: contactId,
        Call_Type: 'Outbound',
        Subject: `Call to ${phoneNumber}`,
        Call_Start_Time: new Date().toISOString(),
        Call_Duration: '00:01',
        Phone: phoneNumber
      }]
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Zoho-oauthtoken ${this.config.zoho}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    return { success: res.ok, status: res.status };
  }

  async createPipedriveActivity(phoneNumber, contactId) {
    // Replace with your Pipedrive API endpoint and field mapping
    const url = `https://api.pipedrive.com/v1/activities?api_token=${this.config.pipedrive}`;
    const body = {
      subject: `Call to ${phoneNumber}`,
      type: 'call',
      person_id: contactId,
      done: 1
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return { success: res.ok, status: res.status };
  }

  async handleWebhook(crmType, data) {
    // Handle webhook events from CRM
    return { success: true, crmType, data };
  }
}

module.exports = CRMIntegration; 