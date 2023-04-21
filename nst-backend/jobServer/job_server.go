package jobServer

import (
	grpc2 "nst-backend/grpc"
)

type jobServer struct {
	grpc2.UnimplementedJobServiceServer
}

func (j jobServer) GiveJob(request *grpc2.GiveJobRequest, server grpc2.JobService_GiveJobServer) error {
	//TODO implement me
	panic("implement me")
}

func (j jobServer) JobProgress(server grpc2.JobService_JobProgressServer) error {
	//TODO implement me
	panic("implement me")
}

func (j jobServer) JobEnd(server grpc2.JobService_JobEndServer) error {
	//TODO implement me
	panic("implement me")
}

func (j jobServer) mustEmbedUnimplementedJobServiceServer() {
	//TODO implement me
	panic("implement me")
}

func NewJobServer() *jobServer {
	return &jobServer{}
}
