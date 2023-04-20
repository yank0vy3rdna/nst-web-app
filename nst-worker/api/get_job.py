from api.channel import stub
from job_request_pb2 import GetJobRequest, JobStatus


def api_get_job(worker_id: str, request_id: str, progress_percent: float):
    return stub.GetJob(GetJobRequest(worker_id, JobStatus(request_id != "", request_id, progress_percent)))
