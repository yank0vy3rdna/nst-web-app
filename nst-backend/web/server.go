package web

import (
	"context"
	"encoding/json"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"golang.org/x/net/websocket"
	"io"
	"log"
	"net/http"
	"time"
)

type webServer struct {
	e           *echo.Echo
	httpAddress string
	handler     RouteHandler
}
type RouteHandler interface {
	UploadImage(file io.ReadCloser) (string, error)
	CreateTask(contentImageId string, styleImageId string) (string, error)
	CheckForNewMessages(requestId string) (WsMessage, bool, error)
	ImageById(id string) ([]byte, error)
	CheckIfJobFinished(ctx context.Context, id string) bool
}
type MessageType int

const (
	PercentMessageType MessageType = 0
	DoneMessageType    MessageType = 1
)

type WsMessage struct {
	ProgressPercent float32     `json:"progress_percent"`
	MessageType     MessageType `json:"message_type"`
}

func NewWebServer(httpAddress string, handler RouteHandler) *webServer {
	e := echo.New()
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOriginFunc: func(origin string) (bool, error) {
			return true, nil
		},
		AllowMethods: []string{http.MethodGet, http.MethodPut, http.MethodPost, http.MethodDelete},
	}))
	w := &webServer{e: e, httpAddress: httpAddress, handler: handler}
	w.registerRoutes()
	return w
}
func (s webServer) StartListening() {
	http.NewServeMux()
	log.Fatal(s.e.Start(s.httpAddress))
}

type generateRequest struct {
	ContentImageId string `json:"ContentImageId"`
	StyleImageId   string `json:"StyleImageId"`
}

func (s webServer) registerRoutes() {
	s.e.GET("/image", func(c echo.Context) error {
		id := c.QueryParam("id")
		bytes, err := s.handler.ImageById(id)
		if err != nil {
			return c.JSON(
				http.StatusInternalServerError,
				&echo.Map{
					"StatusCode": http.StatusInternalServerError,
					"Message":    "error",
					"Data":       &echo.Map{"data": "Error fetching file by id: " + err.Error()},
				})
		}
		return c.Blob(http.StatusOK, "image/png", bytes)
	})
	s.e.PUT("/image", func(c echo.Context) error {
		fileIO := c.Request().Body
		imageId, err := s.handler.UploadImage(fileIO)
		if err != nil {
			return c.JSON(
				http.StatusInternalServerError,
				&echo.Map{
					"StatusCode": http.StatusInternalServerError,
					"Message":    "error",
					"Data":       &echo.Map{"data": "Error uploading file: " + err.Error()},
				})
		}

		return c.JSON(http.StatusOK, &echo.Map{
			"ImageId": imageId,
		})
	})
	s.e.POST("/generate", func(c echo.Context) error {
		var req generateRequest
		err := c.Bind(&req)
		if err != nil {
			return c.JSON(http.StatusBadRequest, &echo.Map{
				"StatusCode": http.StatusBadRequest,
				"Message":    "error",
				"Data":       &echo.Map{"data": "Binding error: " + err.Error()},
			})
		}
		requestId, err := s.handler.CreateTask(req.ContentImageId, req.StyleImageId)
		if err != nil {
			return c.JSON(
				http.StatusInternalServerError,
				&echo.Map{
					"StatusCode": http.StatusInternalServerError,
					"Message":    "error",
					"Data":       &echo.Map{"data": "Error creating task: " + err.Error()},
				})
		}
		return c.JSON(http.StatusOK, &echo.Map{"RequestId": requestId})
	})
	s.e.GET("/ws", func(c echo.Context) error {
		server := websocket.Server{
			Handler: websocket.Handler(func(conn *websocket.Conn) {
				requestId := c.QueryParam("requestId")
				defer conn.Close()
				ctx := context.Background()
				ctx, cancel := context.WithDeadline(ctx, time.Now().Add(time.Second*30))
				for {
					select {
					case <-ctx.Done():
						cancel()
						return
					default:

					}
					if s.handler.CheckIfJobFinished(ctx, requestId) {
						marshal, err := json.Marshal(WsMessage{MessageType: DoneMessageType})
						if err != nil {
							return
						}
						websocket.Message.Send(conn, string(marshal))
						cancel()
						return
					}
					wsMessage, exists, err := s.handler.CheckForNewMessages(requestId)
					if err != nil {
						log.Println("error checking for new messages", requestId, err)
						cancel()
						return
					}
					if !exists {
						<-time.After(time.Second / 2)
						continue
					}
					ctx, cancel = context.WithDeadline(context.Background(), time.Now().Add(time.Second*30))
					marshal, err := json.Marshal(wsMessage)
					if err != nil {
						log.Println("marshal error", err)
						cancel()
						return
					}
					err = websocket.Message.Send(conn, string(marshal))
					if err != nil {
						log.Println("ws message sending error", err)
						cancel()
						return
					}
					if wsMessage.MessageType == DoneMessageType {
						cancel()
						return
					}
				}
			}),
		}
		server.ServeHTTP(c.Response(), c.Request())
		return nil
	})
}
