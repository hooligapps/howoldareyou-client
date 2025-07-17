from age_verifier.client import AgeVerifierClient


def test_need_verification_success(mocker):
    """
    Тест успешного вызова need_verification.
    """
    # Мокируем requests.post
    mock_post = mocker.patch("requests.post")
    mock_post.return_value.status_code = 200
    mock_post.return_value.json.return_value = {"result": {"status": 1}}

    # Создаем экземпляр клиента
    client = AgeVerifierClient(
        api_url="https://fake-api.com",
        api_id="test_api_id",
        api_key="test_api_key",
    )

    # Вызываем тестируемый метод
    client_ip = "127.0.0.1"
    user_id = "test_user_id"
    result = client.need_verification(client_ip, user_id)

    # Проверяем, что requests.post был вызван
    mock_post.assert_called_once()
    # Проверяем, что результат соответствует мокированному ответу
    assert result == {"result": {"status": 1}}
