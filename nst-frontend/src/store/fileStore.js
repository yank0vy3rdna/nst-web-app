import {create} from "zustand";
import {devtools, persist} from "zustand/middleware";

const setImageFromFile = (onLoad) => {
    return (image) => {
        return new Promise((resolve, reject) => {
                const fr = new FileReader()
                fr.onload = (event) => {
                    onLoad(resolve, event.target.result)
                };
                fr.onerror = reject;
                fr.readAsDataURL(image);
            }
        )
    }
}

const baseUrl = "localhost:8080"

async function dataURLtoBlob(dataURL) {
    const response = await fetch(dataURL);
    return await response.blob();
}

const initialState = {
    contentImage: null,
    styleImage: null,
    resultImageUrl: "",

    isContentImageUploaded: false,
    isStyleImageUploaded: false,
    isResultImageGenerated: false,

    requestId: "",
    generationInProgress: false,
    progressPercent: 0,
}
export const useFileStore = create(
    devtools(persist(
            (set, get) => (
                {
                    ...initialState,

                    setContentImage: setImageFromFile((resolve, result) => {
                        resolve(set({contentImage: result, isContentImageUploaded: true}));
                    }),
                    setStyleImage: setImageFromFile((resolve, result) => {
                        resolve(set({styleImage: result, isStyleImageUploaded: true}));
                    }),
                    setResultImage: setImageFromFile((resolve, result) => {
                        resolve(set({resultImage: result, isResultImageGenerated: true}));
                    }),
                    reset: () => {
                        set(initialState)
                    },
                    openWebSocketConnection: (requestId) => {
                        const socket = new WebSocket(`ws://${baseUrl}/ws?requestId=${requestId.RequestId}`);
                        socket.addEventListener('open', () => {
                            set({socket: socket});
                        });
                        socket.addEventListener('message', (event) => {
                            const data = JSON.parse(event.data)
                            switch (data.message_type) {
                                case 0:
                                    set({progressPercent: data.progress_percent > 1 ? 1 : data.progress_percent})
                                    break
                                case 1:
                                    socket.close()
                                    set({
                                        socket: null,
                                        generationInProgress: false,
                                        progressPercent: 1,
                                        isResultImageGenerated: true,
                                        resultImageUrl: `http://${baseUrl}/image?id=${requestId.RequestId}`
                                    });
                                    break
                                default:
                                    console.error("bad message type", data)
                            }
                        });
                        socket.addEventListener('close', () => {
                            set({socket: null, generationInProgress: false, progressPercent: 1});
                        });
                        socket.onerror = (event) => {
                            console.error(event)
                        }
                    },

                    startGeneration: async () => {
                        const contentImageResp = await fetch(`http://${baseUrl}/image`, {
                            method: "PUT",
                            body: await dataURLtoBlob(get().contentImage)
                        })
                        const contentImage = await contentImageResp.json()
                        const styleImageResp = await fetch(`http://${baseUrl}/image`, {
                            method: "PUT",
                            body: await dataURLtoBlob(get().styleImage)
                        })
                        const styleImage = await styleImageResp.json()

                        const generateResp = await fetch(`http://${baseUrl}/generate`, {
                            method: "POST",
                            headers: {
                                'content-type': 'application/json'
                            },
                            body: JSON.stringify({
                                "ContentImageId": contentImage.ImageId,
                                "StyleImageId": styleImage.ImageId
                            })
                        })
                        const requestId = await generateResp.json()
                        get().openWebSocketConnection(requestId)
                        set({
                            generationInProgress: true,
                            progressPercent: 0,
                            requestId: requestId
                        })
                    }
                }
            ), {
                partialize: (state) => ({
                    requestId: state.requestId,
                    generationInProgress: state.generationInProgress,
                    resultImageUrl: state.resultImageUrl,
                    progressPercent: state.progressPercent,
                    isResultImageGenerated: state.isResultImageGenerated,
                })
            }
        )
    )
)