import {create} from "zustand";
import {devtools} from "zustand/middleware";

export const useFileStore = create(
    devtools(
        (set) => (
            {
                contentImage: {},
                styleImage: {},
                isStyleImageUploaded: false,
                isContentImageUploaded: false,
                baseUrl: "/api",
                setContentImage: (image) => set(() => ({
                    contentImage: image, isContentImageUploaded: true
                })),
                setStyleImage: (image) =>  new Promise((resolve, reject) => {
                    const fr = new FileReader()

                    fr.onload = (event) => {
                        resolve(set({styleImage: event.target.result, isStyleImageUploaded: true}));
                    };

                    fr.onerror = reject;
                    fr.readAsDataURL(image);

                })
                // setStyleImage: (image) => set(() => ({styleImage: image, isStyleImageUploaded: true})),
                // startGeneration: async () => {
                //     const response = await fetch()
                //     set({ fishies: await response.json() })
                // },
            }
        )
    )
)