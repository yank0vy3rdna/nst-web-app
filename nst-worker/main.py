import io
import multiprocessing
import time
import uuid

from api.channel import stub
import job_request_pb2 as job_request_pb2
from nst import NST

worker_id = str(uuid.uuid4())

print(f"Worker {worker_id} started")

subprocess: multiprocessing.Process
parent_conn, child_conn = multiprocessing.Pipe()

model = NST()


def try_to_work():
    global subprocess
    give_job_response: job_request_pb2.GiveJobResponse = stub.GiveJob(
        job_request_pb2.GiveJobRequest(workerId=worker_id))
    if not give_job_response.jobGiven:
        return

    content_image = io.BytesIO(give_job_response.contentImage)
    style_image = io.BytesIO(give_job_response.styleImage)
    out = io.BytesIO()
    nst_gen = model.run_nst(content_image, style_image, out)

    def progress_generator():
        for progress in nst_gen:
            yield job_request_pb2.JobProgressData(workerId=worker_id, requestId=give_job_response.requestId,
                                                  progressPercent=progress)

    stub.JobProgress(progress_generator())
    stub.JobEnd(
        job_request_pb2.JobEndRequest(image=out.read(), requestId=give_job_response.requestId, workerId=worker_id))


while True:
    try_to_work()
    time.sleep(3)
