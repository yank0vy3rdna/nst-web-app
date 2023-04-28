import io
import time
import uuid

import job_request_pb2 as job_request_pb2
from api.channel import stub
from nst import NST

worker_id = str(uuid.uuid4())

print(f"Worker {worker_id} started")

model = NST(gpu=True, num_steps=150)


def try_to_work():
    content_image = io.BytesIO()
    style_image = io.BytesIO()
    request_id = ""
    for give_job_response in stub.GiveJob(
            job_request_pb2.GiveJobRequest(workerId=worker_id)
    ):
        give_job_response: job_request_pb2.GiveJobResponse
        if not give_job_response.jobGiven:
            return
        {
            job_request_pb2.STYLE: style_image,
            job_request_pb2.CONTENT: content_image
        }[give_job_response.imageType].write(give_job_response.imageChunk)
        request_id = give_job_response.requestId
    out = io.BytesIO()
    print("Processing...")
    nst_gen = model.run_nst(content_image, style_image, out)

    def progress_generator():
        try:
            for progress in nst_gen:
                yield job_request_pb2.JobProgressData(workerId=worker_id, requestId=request_id,
                                                      progressPercent=progress)
        except Exception as e:
            print(e)

    stub.JobProgress(progress_generator())
    chunkBuf = io.BytesIO(out.getvalue())

    def result_generator():
        while True:
            chunk = chunkBuf.read(1024)
            if not chunk:
                break
            yield job_request_pb2.JobEndRequest(
                imageChunk=chunk,
                requestId=request_id,
                workerId=worker_id
            )

    stub.JobEnd(result_generator())


while True:
    try:
        try_to_work()
    except Exception as e:
        print(e)
    time.sleep(3)
