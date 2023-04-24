package serverToServer

import (
	"context"
	"google.golang.org/grpc"
	"log"
	"net"
	grpc2 "nst-backend/grpc"
)

type grpcServer struct {
	server      *grpc.Server
	grpcAddress string
}

func NewGrpcServer(server *grpc.Server, grpcAddress string, jobService grpc2.JobServiceServer) *grpcServer {
	grpc2.RegisterJobServiceServer(server, jobService)
	return &grpcServer{server: server, grpcAddress: grpcAddress}
}

func (g grpcServer) StartListening(ctx context.Context) {
	defer g.server.GracefulStop()
	log.Println("grpc server start listening on ", g.grpcAddress)
	var c net.ListenConfig
	lis, err := c.Listen(ctx, "tcp", g.grpcAddress)
	if err != nil {
		log.Fatal("error create network listener", err)
	}
	err = g.server.Serve(lis)
	if err != nil {
		log.Fatal("error grpc serving", err)
	}
}
