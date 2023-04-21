package main

import (
	"google.golang.org/grpc"
	"log"
	"net"
	grpc2 "nst-backend/grpc"
	"nst-backend/jobServer"
)

const address = "0.0.0.0:50051"

func main() {
	lis, err := net.Listen("tcp", address)
	if err != nil {
		log.Fatal("error create network listener", err)
	}
	grpcServer := grpc.NewServer()
	defer grpcServer.GracefulStop()

	grpc2.RegisterJobServiceServer(grpcServer, jobServer.NewJobServer())
	log.Println("start listening on ", address)
	err = grpcServer.Serve(lis)
	if err != nil {
		log.Fatal("error grpc serving", err)
	}
}
