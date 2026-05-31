import Twilio from 'twilio';

export default class TwilioClient {
    static client = null;
    
    constructor(accountSid, authToken, twilioNumber) {
        this.client = new Twilio(accountSid, authToken);
        this.twilioNumber = twilioNumber;
        this.hasCalled = false;
        this.lastPhoneCallAt = null;

        TwilioClient.client = this;
    }

    async call(number, log, checkAlreadyCalled = true) {
        if(this.hasCalled && checkAlreadyCalled) return null;

        const call = await this.client.calls.create({
            url: "http://demo.twilio.com/docs/voice.xml",
            to: number,
            from: this.twilioNumber,
        });

        if(call) {
            console.log(`[INFO] ${log} (Call SID: ${call.sid})`);
            this.hasCalled = true;
            this.lastPhoneCallAt = new Date();
        }

        return call;
    }
}