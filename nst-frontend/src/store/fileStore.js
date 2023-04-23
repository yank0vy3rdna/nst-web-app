import {create} from "zustand";
import {devtools} from "zustand/middleware";

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
export const useFileStore = create(
    devtools(
        (set) => (
            {
                contentImage: null,
                styleImage: null,
                resultImage: {},

                isContentImageUploaded: false,
                isStyleImageUploaded: false,
                isResultImageGenerated: false,

                baseUrl: "/api",

                generationInProgress: false,
                progressPercent: 0,

                setContentImage: setImageFromFile((resolve, result) => {
                    resolve(set({contentImage: result, isContentImageUploaded: true}));
                }),
                setStyleImage: setImageFromFile((resolve, result) => {
                    resolve(set({styleImage: result, isStyleImageUploaded: true}));
                }),
                setResultImage: setImageFromFile((resolve, result) => {
                    resolve(set({resultImage: result, isResultImageGenerated: true}));
                }),

                startGeneration: () => {
                    set({
                        generationInProgress: true,
                        progressPercent: 0.2
                    })
                }
            }
        )
    )
)