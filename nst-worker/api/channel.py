import grpc

from config import GRPC_URL
import job_request_pb2_grpc as job_request_pb2_grpc

channel = grpc.insecure_channel(GRPC_URL)
stub = job_request_pb2_grpc.JobServiceStub(channel)
