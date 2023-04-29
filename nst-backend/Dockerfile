FROM golang:1.20
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
ADD . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /nstbackend
CMD ["/nstbackend"]