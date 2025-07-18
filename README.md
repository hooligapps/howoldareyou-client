# Age Verification Client Library

For using the verification service, both client-side and server-side solutions required. Client-side part is to be integrated in your client code, it should work with server-side part on your server, which sends s2s requests to the verification service (it acts as a proxy for the client side, and handles all the communication with the verification service).
This library provides a client-side (JavaScript) and server-side (Python) solution for integrating our verification service into your application.

## Installation

### Python (Server-side)

Place the contents of the `server/python` directory into your Python project (e.g. as `age_verifier`). Then, install the required dependencies:

```bash
pip install -r requirements.txt
```

### JavaScript (Client-side)

You can use the library in your project by installing it directly from the Git repository by adding the following to your `package.json`:

```json
"dependencies": {
    "age-verifier": "git+https://github.com/hooligapps/howoldareyou-client.git"
}
```

The library can also be available as a UMD bundle. Include it in your HTML file:

```html
<script src="/path/to/lib/age-verifier/js/dist/bundle.umd.js"></script>
```

## Usage

### Python

Here's an example of how you might use the Python module in a Flask application.

```python
from flask import Flask, request, jsonify
from age_verifier.client import AgeVerifierClient

app = Flask(__name__)

# Your credentials and client instance
API_URL = "https://verification.service.com" # The verification service URL
API_ID = "your_api_id"
API_KEY = "your_api_key"

age_verifier_client = AgeVerifierClient(
    api_url=API_URL,
    api_id=API_ID,
    api_key=API_KEY,
    timeout=5 # Optional: request timeout in seconds (default is 2)
)


@app.route("/api/age-verification/check-needed", methods=["POST"])
def check_needed():
    # In a real app, you'd get these from the user's session
    user_id = "user123"
    client_ip = request.remote_addr

    try:
        result = age_verifier_client.need_verification(client_ip, user_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/age-verification/start", methods=["POST"])
def start_verification():
    session_id = "session_abc" # Should be unique per-verification
    client_ip = request.remote_addr
    user_id = "user123"

    try:
        result = age_verifier_client.start_check_age_verification(session_id, client_ip, user_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/age-verification/check-result", methods=["POST"])
def check_result():
    session_id = "session_abc" # Should be the same as in /start

    try:
        result = age_verifier_client.check_age_verification_result(session_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/age-verification/update-result", methods=["POST"])
def update_result():
    session_id = "session_abc" # Should be the same as in /start
    user_id = "user123"

    try:
        result = age_verifier_client.update_verification_result(session_id, user_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
```

### JavaScript

This example shows how to import and initialize the `AgeVerifier` and handle the verification flow.

```javascript
import AgeVerifier from "age-verifier/client/js";

const ageVerifier = new AgeVerifier({
    // The domain of the verification service iframe
    verificationApiDomain: "https://verification.service.com",

    // Endpoints on your backend that use the Python client
    backendEndpoints: {
        checkNeeded: "/api/age-verification/check-needed",
        startVerification: "/api/age-verification/start",
        checkResult: "/api/age-verification/check-result",
        updateResult: "/api/age-verification/update-result",
    },

    // Called when verification is required.
    // This is your chance to show a button or modal to the user.
    onVerificationNeeded: (response) => {
        console.log("Verification is required.", response);
        // e.g., showVerificationButton();
    },

    // Called when verification is not required
    onVerificationNotNeeded: (response) => {
        console.log("Verification is not required.", response);
    },

    // Called on final success (e.g. user already passed verification)
    onSuccess: (response) => {
        console.log("Verification successful!", response);
        alert("You are verified!");
    },

    // Called on final failure
    onFail: (response) => {
        console.error("Verification failed.", response);
        alert("You could not be verified.");
    },

    // Called on any network or unexpected error
    onError: (error) => {
        console.error("An error occurred:", error);
    },
});

// 1. Check if verification is needed when the page loads
ageVerifier.checkVerificationNeeded();

// 2. When the user clicks your "Start Verification" button,
//    call startVerification.
document.getElementById("my-button").addEventListener("click", () => {
    ageVerifier.startVerification();
});

// 3. When you verify a new user that is to be created after verification, notify our service after he is created by calling updateVerificationResult
// if you fail to do this, the user might be asked for verification again
ageVerifier.updateVerificationResult();
```
