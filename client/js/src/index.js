const STATUS = {
    NOT_NEEDED: 0,
    NEEDED: 1,
    SUCCESS: 2,
    FAIL: 3,
    IN_PROGRESS: 4,
    ERROR: 5,
};

export default class AgeVerifier {
    constructor(config) {
        if (!config || !config.backendEndpoints) {
            throw new Error(
                "AgeVerifier configuration is invalid. Please provide backendEndpoints."
            );
        }
        this.endpoints = config.backendEndpoints;
        this.callbacks = {
            onVerificationNeeded: config.onVerificationNeeded || (() => {}),
            onVerificationNotNeeded:
                config.onVerificationNotNeeded || (() => {}),
            onSuccess: config.onSuccess || (() => {}),
            onFail: config.onFail || (() => {}),
            onError: config.onError || (() => {}),
        };
        this.verificationApiDomain = config.verificationApiDomain;
        this.verificationWindow = null;
        this.pollingInterval = null;
        this._handlePostMessage = this._handlePostMessage.bind(this);
    }

    async checkVerificationNeeded() {
        try {
            const response = await fetch(this.endpoints.checkNeeded);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // В соответствии с PRD, маршрутизируем ответ по колбэкам
            if (data.result) {
                switch (data.result.status) {
                    case STATUS.NOT_NEEDED:
                        this.callbacks.onVerificationNotNeeded(data);
                        break;
                    case STATUS.SUCCESS:
                        this.callbacks.onSuccess(data);
                        break;
                    case STATUS.NEEDED:
                        this.callbacks.onVerificationNeeded(data);
                        break;
                    case STATUS.FAIL:
                        this.callbacks.onFail(data);
                        break;
                    case STATUS.IN_PROGRESS:
                        this.callbacks.onVerificationInProgress(data);
                        break;
                    case STATUS.ERROR:
                        this.callbacks.onError(data);
                        break;
                    default:
                        this.callbacks.onError(
                            new Error(`Unknown status: ${data.result.status}`)
                        );
                }
            } else {
                this.callbacks.onError(
                    new Error("Invalid response structure from server")
                );
            }
        } catch (error) {
            this.callbacks.onError(error);
        }
    }

    async startVerification() {
        if (this.verificationWindow && !this.verificationWindow.closed) {
            this.verificationWindow.focus();
            return;
        }

        if (this.verificationWindow && this.verificationWindow.closed) {
            this._cleanup();
        }

        try {
            const response = await fetch(this.endpoints.startVerification);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data.url) {
                this.verificationWindow = window.open(data.url);

                if (!this.verificationWindow) {
                    const error = new Error(
                        "Failed to open verification window. Please disable your popup blocker and try again."
                    );
                    this.callbacks.onError(error);
                    return;
                }

                window.addEventListener("message", this._handlePostMessage);

                this.pollingInterval = setInterval(() => {
                    if (
                        this.verificationWindow &&
                        this.verificationWindow.closed
                    ) {
                        this._cleanup();
                    }
                }, 500);
            } else if (data.result === STATUS.SUCCESS) {
                this.callbacks.onSuccess(data);
            } else if (data.result === STATUS.FAIL) {
                this.callbacks.onFail(data);
            } else if (data.result === STATUS.ERROR) {
                this.callbacks.onError(data);
            } else {
                this.callbacks.onError(
                    new Error("Invalid response structure from server")
                );
            }
        } catch (error) {
            this.callbacks.onError(error);
        }
    }

    _handlePostMessage = (event) => {
        if (
            event.origin !== this.verificationApiDomain ||
            event.source !== this.verificationWindow
        ) {
            return;
        }

        if (event.data) {
            switch (event.data.result) {
                case STATUS.SUCCESS:
                    this.callbacks.onSuccess(event.data);
                    break;
                case STATUS.IN_PROGRESS:
                    this.pollingInterval = setInterval(() => {
                        this.fetchResult();
                    }, 1000);
                    break;
                case STATUS.FAIL:
                    this.callbacks.onFail(event.data);
                    break;
                case STATUS.ERROR:
                    this.callbacks.onError(event.data);
                    break;
                default:
                    this.callbacks.onError(
                        new Error(`Unknown status: ${event.data.result}`)
                    );
            }
        }
    };

    async fetchResult() {
        try {
            const response = await fetch(this.endpoints.checkResult);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (
                data.result &&
                (data.result.status === 1 || data.result.status === 2)
            ) {
                this.callbacks.onSuccess(data);
            } else {
                this.callbacks.onFail(data);
            }
        } catch (error) {
            this.callbacks.onError(error);
        } finally {
            this._cleanup();
        }
    }

    async updateVerificationResult() {
        const response = await fetch(this.endpoints.updateResult, {
            method: "POST",
        });
    }

    _cleanup = () => {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }

        window.removeEventListener("message", this._handlePostMessage);

        if (this.verificationWindow) {
            if (!this.verificationWindow.closed) {
                this.verificationWindow.close();
            }
            this.verificationWindow = null;
        }
    };
}
