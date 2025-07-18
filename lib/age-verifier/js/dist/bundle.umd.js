(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.AgeVerifier = factory());
})(this, (function () { 'use strict';

    class AgeVerifier {
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
                        case 0: // Не требуется
                            this.callbacks.onVerificationNotNeeded(data);
                            break;
                        case 2: // Уже пройдена
                            this.callbacks.onSuccess(data);
                            break;
                        case 1: // Требуется
                            this.callbacks.onVerificationNeeded(data);
                            break;
                        case 3: // Провалена
                            this.callbacks.onFail(data);
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
                } else {
                    this.callbacks.onSuccess(data);
                }
            } catch (error) {
                this.callbacks.onError(error);
            }
        }

        _handlePostMessage(event) {
            if (
                event.origin !== this.verificationApiDomain ||
                event.source !== this.verificationWindow
            ) {
                return;
            }

            if (event.data && event.data.result === "finished") {
                this.fetchResult();
            }
        }

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
            await fetch(this.endpoints.updateVerificationResult, {
                method: "POST",
            });
        }

        _cleanup() {
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
        }
    }

    return AgeVerifier;

}));
//# sourceMappingURL=bundle.umd.js.map
