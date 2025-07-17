# Age Verification Client Library

This library provides a client-side (JavaScript) and server-side (Python) solution for integrating an age verification service into your application.

## Installation

### Python (Server-side)

Place the `age_verifier` directory into your Python project. Then, install the required dependencies:

```bash
pip install -r requirements.txt
```

### JavaScript (Client-side)

You can use the library in your project by installing it directly from the subdirectory in the Git repository:

```bash
npm install git+https://github.com/hooligapps/howoldareyou-client.git#master:lib/age-verifier/js
```

Or by adding the following to your `package.json`:

```json
"dependencies": {
    "age-verifier": "git+https://github.com/hooligapps/howoldareyou-client.git#master:lib/age-verifier/js"
}
```

The library can also be available as a UMD bundle. Include it in your HTML file:

```html
<script src="/path/to/lib/age-verifier/js/dist/bundle.umd.js"></script>
```

## Usage

### Python

Here's an example of how you might use the Python client in a Flask application.

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
```

### JavaScript

This example shows how to import and initialize the `AgeVerifier` and handle the verification flow.

```javascript
import AgeVerifier from "age-verifier";

const ageVerifier = new AgeVerifier({
    // The domain of the verification service iframe
    verificationApiDomain: "https://verification.service.com",

    // Endpoints on your backend that use the Python client
    backendEndpoints: {
        checkNeeded: "/api/age-verification/check-needed",
        startVerification: "/api/age-verification/start",
        checkResult: "/api/age-verification/check-result",
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
//    call startVerification with the element to host the iframe.
// document.getElementById('my-button').addEventListener('click', () => {
//     const host = document.getElementById('iframe-container');
//     ageVerifier.startVerification(host);
// });
```
