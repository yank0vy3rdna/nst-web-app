package jobServer

import (
	"context"
	"encoding/json"
	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"io"
	"log"
	grpc2 "nst-backend/grpc"
	"nst-backend/web"
	"time"
)

type jobServer struct {
	grpc2.UnimplementedJobServiceServer
	rdb      *redis.Client
	ctx      context.Context
	channels map[string]chan float32
}

func imageKey(imageId string) string {
	return "image:" + imageId
}
func (j jobServer) ImageById(id string) ([]byte, error) {
	bytes, err := j.rdb.Get(j.ctx, imageKey(id)).Bytes()
	if err != nil {
		return nil, err
	}
	return bytes, nil
}
func (j jobServer) UploadImage(file io.ReadCloser) (string, error) {
	bytesFile, err := io.ReadAll(file)
	if err != nil {
		log.Println("error reading image", err)
		return "", err
	}
	imageId := uuid.New().String()

	err = j.rdb.Set(j.ctx, imageKey(imageId), bytesFile, time.Hour*24).Err()
	if err != nil {
		log.Println("error saving image", err)
		return "", err
	}
	return imageId, nil
}

type task struct {
	RequestId      string `json:"request_id"`
	ContentImageId string `json:"content_image_id"`
	StyleImageId   string `json:"style_image_id"`
}

const tasksKey = "tasks"

func (j jobServer) CreateTask(contentImageId string, styleImageId string) (string, error) {
	requestId := uuid.New().String()
	t := task{
		RequestId:      requestId,
		ContentImageId: contentImageId,
		StyleImageId:   styleImageId,
	}
	marshal, err := json.Marshal(t)
	if err != nil {
		log.Println("error marshal to json", err)
		return "", err
	}
	err = j.rdb.RPush(j.ctx, tasksKey, marshal).Err()
	if err != nil {
		log.Println("error pushing task", err)
		return "", err
	}
	return requestId, nil
}

func (j jobServer) CheckForNewMessages(requestId string) (web.WsMessage, bool, error) {
	var msg web.WsMessage
	bytes, err := j.rdb.LPop(j.ctx, wsQueueKey(requestId)).Bytes()
	if err == redis.Nil {
		return msg, false, nil
	}
	if err != nil {
		log.Println("error pop from ws queue", err)
		return msg, false, err
	}
	err = json.Unmarshal(bytes, &msg)
	if err != nil {
		log.Println("error unmarshal ws msg", err)
		return msg, false, err
	}
	return msg, true, nil
}

func chunkBy[T any](items []T, chunkSize int) (chunks [][]T) {
	for chunkSize < len(items) {
		items, chunks = items[chunkSize:], append(chunks, items[0:chunkSize:chunkSize])
	}
	return append(chunks, items)
}

func sendImageByChunks(requestId, workerId string, imageType grpc2.ImageType, image []byte, server grpc2.JobService_GiveJobServer) error {
	chunks := chunkBy(image, 1024)
	for _, chunk := range chunks {
		err := server.Send(&grpc2.GiveJobResponse{
			ImageChunk: chunk,
			ImageType:  imageType,
			RequestId:  requestId,
			WorkerId:   workerId,
			JobGiven:   true,
		})
		if err != nil {
			log.Println("error sending chunk", err)
			return err
		}
	}
	return nil
}

func (j jobServer) GiveJob(request *grpc2.GiveJobRequest, server grpc2.JobService_GiveJobServer) error {
	for {
		result, err := j.rdb.LPop(j.ctx, tasksKey).Bytes()
		if err == redis.Nil {
			err := server.Send(&grpc2.GiveJobResponse{JobGiven: false})
			if err != nil {
				log.Println("error sending job given", err)
				return err
			}
			return nil
		}
		if err != nil {
			log.Println("error pop from tasks", err)
			return err
		}
		var t task
		err = json.Unmarshal(result, &t)
		if err != nil {
			log.Println("error unmarshal task", err)
			continue
		}
		contentImageBytes, err := j.rdb.Get(j.ctx, imageKey(t.ContentImageId)).Bytes()
		if err != nil {
			log.Println("error fetching content image", err)
			continue
		}
		styleImageBytes, err := j.rdb.Get(j.ctx, imageKey(t.StyleImageId)).Bytes()
		if err != nil {
			log.Println("error fetching style image", err)
			continue
		}
		err = sendImageByChunks(t.RequestId, request.WorkerId, grpc2.ImageType_CONTENT, contentImageBytes, server)
		if err != nil {
			log.Println("error sending image chunks", err)
			return err
		}
		err = sendImageByChunks(t.RequestId, request.WorkerId, grpc2.ImageType_STYLE, styleImageBytes, server)
		if err != nil {
			log.Println("error sending image chunks", err)
			return err
		}
		return nil
	}
}

func wsQueueKey(requestId string) string {
	return "wsqueue:" + requestId
}

func (j jobServer) JobProgress(server grpc2.JobService_JobProgressServer) error {

	for {
		if server.Context().Err() != nil {
			return nil
		}
		jobProgressData, err := server.Recv()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Println("error recv progress data", err)
			return err
		}
		marshalMsg, err := json.Marshal(web.WsMessage{
			ProgressPercent: jobProgressData.ProgressPercent,
			MessageType:     web.PercentMessageType,
		})
		if err != nil {
			log.Println("error marshal ws msg", err)
			return err
		}
		err = j.rdb.RPush(j.ctx, wsQueueKey(jobProgressData.RequestId), marshalMsg).Err()
		if err != nil {
			log.Println("error pushing to ws queue", err)
			return err
		}
	}
	return nil
}

func (j jobServer) JobEnd(server grpc2.JobService_JobEndServer) error {
	imageB := make([]byte, 0, 1024*32)
	requestId := ""
	for {
		if server.Context().Err() != nil {
			break
		}
		jobEndRequest, err := server.Recv()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Println("error recv progress data", err)
			return err
		}
		imageB = append(imageB, jobEndRequest.ImageChunk...)
		requestId = jobEndRequest.RequestId
	}
	err := j.rdb.Set(j.ctx, imageKey(requestId), imageB, time.Hour*24).Err()
	if err != nil {
		log.Println("error saving result image")
		return err
	}
	marshalMsg, err := json.Marshal(web.WsMessage{
		MessageType: web.DoneMessageType,
	})
	if err != nil {
		log.Println("error marshal ws msg", err)
		return err
	}
	err = j.rdb.RPush(j.ctx, wsQueueKey(requestId), marshalMsg).Err()
	if err != nil {
		log.Println("error pushing to ws queue", err)
		return err
	}
	return nil
}

func (j jobServer) mustEmbedUnimplementedJobServiceServer() {
	//TODO implement me
	panic("implement me")
}

func NewJobServer(ctx context.Context, rdb *redis.Client) *jobServer {
	return &jobServer{rdb: rdb, ctx: ctx}
}
