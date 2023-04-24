package web

import (
	"github.com/labstack/echo/v4"
	"golang.org/x/net/websocket"
	"log"
	"mime/multipart"
	"net/http"
	"time"
)

type webServer struct {
	e           *echo.Echo
	httpAddress string
	handler     RouteHandler
}
type RouteHandler interface {
	UploadImage(file multipart.File) (string, error)
	CreateTask(contentImageId string, styleImageId string) (string, error)
	CheckForNewMessages(requestId string) (WsMessage, bool, error)
	ImageById(id string) ([]byte, error)
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
		return c.Blob(http.StatusOK, "application/png", bytes)
	})
	s.e.PUT("/image", func(c echo.Context) error {
		formFile, err := c.FormFile("image")
		if err != nil {
			return c.JSON(
				http.StatusInternalServerError,
				&echo.Map{
					"StatusCode": http.StatusInternalServerError,
					"Message":    "error",
					"Data":       &echo.Map{"data": "Error fetching file from request: " + err.Error()},
				})
		}
		file, err := formFile.Open()
		if err != nil {
			return c.JSON(
				http.StatusInternalServerError,
				&echo.Map{
					"StatusCode": http.StatusInternalServerError,
					"Message":    "error",
					"Data":       &echo.Map{"data": "Error opening file from request: " + err.Error()},
				})
		}
		imageId, err := s.handler.UploadImage(file)
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
		requestId := c.QueryParam("requestId")
		websocket.Handler(func(conn *websocket.Conn) {
			defer conn.Close()

			for {
				wsMessage, exists, err := s.handler.CheckForNewMessages(requestId)
				if err != nil {
					log.Println("error checking for new messages", requestId, err)
					return
				}
				if !exists {
					<-time.After(time.Second / 2)
					continue
				}
				err = websocket.Message.Send(conn, wsMessage)
				if err != nil {
					log.Println("ws message sending error", err)
					return
				}
			}

		}).ServeHTTP(c.Response(), c.Request())
		return nil
	})
}
