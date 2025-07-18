const crypto = require("crypto");
const { URL, URLSearchParams } = require("url");

class AgeVerifierClient {
  constructor(apiUrl, appId, apiKey, timeout = 2000) {
    if (!apiUrl)
      throw new Error("apiUrl is required");

    this.apiUrl = apiUrl.replace("/", "");
    this.appId = appId;
    this.apiKey = apiKey;
    this.timeout = timeout;
  }

  getSignature(data) {
    const keys = Object.keys(data)
      .filter((k) => k !== "signature")
      .sort();

    const signStr =
      keys.map((k) => String(data[k])).join("").toLowerCase() + this.apiKey;

    return crypto.createHash("sha1").update(signStr).digest("hex");
  }

  async _makeRequest(endpoint, params, method = "GET") {
    const fullParams = { appId: this.appId, ...params };

    fullParams.signature = this.getSignature(fullParams);

    const url = new URL(`${this.apiUrl}/${endpoint}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const options = {
      method,
      signal: controller.signal,
    };

    if (method === "GET") {
      url.search = new URLSearchParams(fullParams).toString();
    } else {
      options.headers = {
        "Content-Type": "application/json",
      };
      options.body = JSON.stringify(fullParams);
    }

    try {

      console.log(url.toString());
      const response = await fetch(url.toString(), options);
      clearTimeout(timeoutId);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          `Request failed: ${response.status} ${JSON.stringify(data)}`,
        );
      }
      return data;
    } catch (err) {
      if (err.name === "AbortError") {
        throw new Error("Request timed out");
      }
      throw err;
    }
  }

  needVerification(clientIp, userId) {
    return this._makeRequest("api/need-verification", { clientIp, userId });
  }

  startCheckAgeVerification(sessionId, clientIp, userId = null) {
    const params = { sessionId, clientIp };
    if (userId)
      params.userId = userId;
    return this._makeRequest("api/check-age-verification", params);
  }

  checkAgeVerificationResult(sessionId) {
    return this._makeRequest("api/check-age-verification-result", {
      sessionId,
    });
  }

  updateVerificationResult(sessionId, userId) {
    return this._makeRequest("api/update-verification-result", {
      sessionId,
      userId,
    });
  }
}

module.exports = AgeVerifierClient;