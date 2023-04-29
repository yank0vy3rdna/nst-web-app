package main

import (
	"context"
	"github.com/redis/go-redis/v9"
	"google.golang.org/grpc"
	"nst-backend/serverToServer"
	"nst-backend/serverToServer/jobServer"
	"nst-backend/web"
	"os"
	"os/signal"
	"syscall"
)

const grpcAddress = "0.0.0.0:50051"
const httpAddress = "0.0.0.0:8080"

func main() {
	ctx, ctxCancel := context.WithCancel(context.Background())
	rdb := redis.NewClient(&redis.Options{
		Addr: "redis:6379",
	})
	grpcServer := grpc.NewServer()
	jobService := jobServer.NewJobServer(ctx, rdb)
	server := serverToServer.NewGrpcServer(grpcServer, grpcAddress, jobService)
	webServer := web.NewWebServer(httpAddress, jobService)
	go server.StartListening(ctx)
	go webServer.StartListening()
	c := make(chan os.Signal, 2)
	signal.Notify(c, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)
	<-c
	ctxCancel()
}
