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
        this.iframe = null;
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

    async startVerification(hostElement) {
        if (!hostElement || typeof hostElement.appendChild !== "function") {
            const error = new Error(
                "A valid hostElement must be provided to startVerification."
            );
            this.callbacks.onError(error);
            return;
        }

        try {
            const response = await fetch(this.endpoints.startVerification);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (data.href) {
                const iframe = document.createElement("iframe");
                iframe.src = data.href;
                iframe.style.width = "100%";
                iframe.style.height = "100%";
                iframe.style.border = "none";

                // Очищаем хост-элемент и добавляем iframe
                hostElement.innerHTML = "";
                hostElement.appendChild(iframe);
                this.iframe = iframe;

                window.addEventListener("message", this._handlePostMessage);
            } else {
                // Если URL не пришел, считаем это успехом без верификации (согласно PRD)
                this.callbacks.onSuccess(data);
            }
        } catch (error) {
            this.callbacks.onError(error);
        }
    }

    _handlePostMessage(event) {
        if (event.origin !== this.verificationApiDomain) {
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

    _cleanup() {
        if (this.iframe && this.iframe.parentNode) {
            this.iframe.parentNode.removeChild(this.iframe);
        }
        this.iframe = null;
        window.removeEventListener("message", this._handlePostMessage);
    }
}
