// client.d.ts
export declare class AgeVerifierClient {
  constructor(apiUrl: string, appId: string, apiKey: string,  timeout?: number);
  getSignature(data: {[key: string]: any}): string;
  needVerification(clientIp: string, userId: string): { result: number };
  startCheckAgeVerification(sessionId: string, clientIp: string, userId?: string): { result: number, url?: string };
  checkAgeVerificationResult(sessionId: string): { result: number };
  updateVerificationResult(sessionId: string, userId: string);
}