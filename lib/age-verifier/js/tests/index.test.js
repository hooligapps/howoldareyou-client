import AgeVerifier from "../src/index";

describe("AgeVerifier", () => {
    const mockEndpoints = {
        checkNeeded: "/api/check-needed",
        startVerification: "/api/start",
        checkResult: "/api/result"
    };

    beforeEach(() => {
        global.fetch = jest.fn();
    });

    it("should initialize correctly", () => {
        const verifier = new AgeVerifier({ backendEndpoints: mockEndpoints });
        expect(verifier.endpoints).toEqual(mockEndpoints);
    });

    it("should call onSuccess when checkNeeded returns status 2", async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ result: { status: 2 } })
        });

        const onSuccess = jest.fn();
        const verifier = new AgeVerifier({
            backendEndpoints: mockEndpoints,
            onSuccess
        });

        await verifier.checkVerificationNeeded();

        expect(onSuccess).toHaveBeenCalledWith({ result: { status: 2 } });
    });
});
