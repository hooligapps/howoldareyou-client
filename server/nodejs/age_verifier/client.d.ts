// client.d.ts
export class AgeVerifierClient {
  constructor(apiUrl: string, appId: string, apiKey: string,  timeout?: number);
  getSignature(data: {[key: string]: any}): string;
  async needVerification(clientIp: string, userId: string): Promise<{ result: number }>;
  async startCheckAgeVerification(sessionId: string, clientIp: string, userId?: string): Promise<{
    result: number,
    url?: string
  }>;
  async checkAgeVerificationResult(sessionId: string): Promise<{ result: number }>;
  async updateVerificationResult(sessionId: string, userId: string);
}