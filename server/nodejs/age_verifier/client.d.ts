// client.d.ts
export class AgeVerifierClient {
    constructor(apiUrl: string, appId: string, apiKey: string, timeout?: number);

    getSignature(data: { [key: string]: any }): string;

    needVerification(clientIp: string, userId: string): Promise<{ result: number }>;

    startCheckAgeVerification(sessionId: string, clientIp: string, userId?: string): Promise<{
        result: number,
        url?: string
    }>;

    checkAgeVerificationResult(sessionId: string): Promise<{ result: number }>;

    updateVerificationResult(sessionId: string, userId: string): Promise<void>;
}