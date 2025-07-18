const AgeVerifierClient = require("./age_verifier/client");
const assert = require("assert");

const API_URL = "https://fake-api.com";
const API_ID = "test_api_id";
const API_KEY = "test_api_key";

async function runTests() {
  const client = new AgeVerifierClient(API_URL, API_ID, API_KEY);

  try {
    const needVerif = await client.needVerification("81.2.69.160", "user123");
    console.log("needVerification response:", needVerif);

    const expected = { result: 1 };
    assert.deepStrictEqual(needVerif, expected, "Result does not match expected");

  } catch (err) {
    console.error("Error during API calls:", err.message);
  }
}

runTests();