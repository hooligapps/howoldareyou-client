"""Client for the Age Verification API."""

import hashlib
from typing import Any, Optional
import requests


class AgeVerifierClient:
    """Client for the Age Verification API."""

    def __init__(self, api_url: str, api_id: str, api_key: str, timeout: int = 2):
        if not api_url:
            raise ValueError("api_url is required")
        self.api_url = api_url.rstrip("/")
        self.api_id = api_id
        self.api_key = api_key
        self.timeout = timeout

    def get_signature(self, data: dict[str, Any]):
        """Generates signature for the request parameters."""
        keys = sorted([k for k in data.keys() if k != "signature"])
        sign_str = "".join([str(data[k]) for k in keys]).lower() + self.api_key
        return hashlib.sha1(sign_str.encode()).hexdigest()

    def _make_request(
        self,
        endpoint: str,
        params: dict[str, Any],
        method: str = "GET",
    ) -> dict[str, Any]:
        """Sends a signed request."""
        url = f"{self.api_url}/{endpoint}"

        # Добавляем общие параметры и подпись
        full_params = {"apiId": self.api_id, **params}

        signature = self.get_signature(full_params)
        full_params["signature"] = signature

        if method == "GET":
            response = requests.get(url, params=full_params, timeout=self.timeout)
        else:
            response = requests.post(url, json=full_params, timeout=self.timeout)
        response.raise_for_status()
        return response.json()

    def need_verification(self, client_ip: str, user_id: str) -> dict[str, Any]:
        """Checks if verification is needed for the user."""
        params = {"clientIp": client_ip, "userId": user_id}
        return self._make_request("api/need-verification", params)

    def start_check_age_verification(
        self, session_id: str, client_ip: str, user_id: Optional[str] = None
    ) -> dict[str, Any]:
        """Starts the age verification process."""
        params = {"sessionId": session_id, "clientIp": client_ip}
        if user_id:
            params["userId"] = user_id
        return self._make_request("api/check-age-verification", params)

    def check_age_verification_result(self, session_id: str) -> dict[str, Any]:
        """Checks the result of the age verification."""
        params = {"sessionId": session_id}
        return self._make_request("api/check-age-verification-result", params)

    def update_verification_result(
        self, session_id: str, user_id: str
    ) -> dict[str, Any]:
        """Binds userId to the verification session after registration."""
        params = {"sessionId": session_id, "userId": user_id}
        return self._make_request("api/update-verification-result", params)
