import DropZone from "./DropZone";
import {useFileStore} from "../../store/fileStore";

export const StyleImageDropZone = () => {
    const styleImage = useFileStore(state => state.styleImage);
    const setStyleImage = useFileStore(state => state.setStyleImage);
    const isStyleImageUploaded = useFileStore(state => state.isStyleImageUploaded);
    return <DropZone
        onDropFile={acceptedFiles => {
            setStyleImage(acceptedFiles[0])
        }}
        header={"Style"}
        image={styleImage}
        isImageUploaded={isStyleImageUploaded}
    />
}