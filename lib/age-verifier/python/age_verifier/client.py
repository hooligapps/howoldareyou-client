import hashlib
import hmac
import time
import requests
from typing import Dict, Any, Optional


class AgeVerifierClient:
    def __init__(self, api_url: str, api_id: str, api_key: str, timeout: int = 2):
        if not api_url:
            raise ValueError("api_url is required")
        self.api_url = api_url.rstrip("/")
        self.api_id = api_id
        self.api_key = api_key
        self.timeout = timeout

    def _generate_signature(self, params: Dict[str, Any]) -> str:
        """Генерирует подпись HMAC-SHA256 для параметров запроса."""
        sorted_params = sorted(params.items())
        message = "".join([f"{k}{v}" for k, v in sorted_params])
        return hmac.new(
            self.api_key.encode("utf-8"), message.encode("utf-8"), hashlib.sha256
        ).hexdigest()

    def _make_request(self, endpoint: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Отправляет подписанный POST-запрос."""
        url = f"{self.api_url}/{endpoint}"
        nonce = str(int(time.time()))

        # Добавляем общие параметры и подпись
        full_params = {"apiId": self.api_id, "nonce": nonce, **params}

        signature = self._generate_signature(full_params)
        full_params["signature"] = signature

        response = requests.post(url, json=full_params, timeout=self.timeout)
        response.raise_for_status()
        return response.json()

    def need_verification(self, client_ip: str, user_id: str) -> Dict[str, Any]:
        """Проверяет, требуется ли верификация для пользователя."""
        params = {"clientIp": client_ip, "userId": user_id}
        return self._make_request("api/need-verification", params)

    def start_check_age_verification(
        self, session_id: str, client_ip: str, user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Начинает процедуру проверки возраста."""
        params = {"sessionId": session_id, "clientIp": client_ip}
        if user_id:
            params["userId"] = user_id
        return self._make_request("api/check-age-verification", params)

    def check_age_verification_result(self, session_id: str) -> Dict[str, Any]:
        """Проверяет результат проверки возраста."""
        params = {"sessionId": session_id}
        return self._make_request("api/check-age-verification-result", params)

    def update_verification_result(
        self, session_id: str, user_id: str
    ) -> Dict[str, Any]:
        """Привязывает userId к сессии верификации после регистрации."""
        params = {"sessionId": session_id, "userId": user_id}
        return self._make_request("api/update-verification-result", params)
