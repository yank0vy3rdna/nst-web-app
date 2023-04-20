import requests
from requests import RequestException, JSONDecodeError

from api import BackendAPIRequestException
from config import BASE_URL


def api_send_result(worker_id, request_id, result_image):
    try:
        resp = requests.post(
            f"{BASE_URL}/api/result",
            params={"worker_id": worker_id, "request_id": request_id},
            data=result_image
        )
        if not resp.ok:
            print(f"Get status request failed with status code {resp.status_code}, {resp.text}")
            raise BackendAPIRequestException()
        return resp.json()
    except RequestException or JSONDecodeError as e:
        print("Get status request failed with exception", e)
        raise BackendAPIRequestException()
