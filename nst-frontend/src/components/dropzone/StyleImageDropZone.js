import DropZone from "./DropZone";
import {useFileStore} from "../../store/fileStore";
import {Flex, Heading} from "@chakra-ui/react";
import {SHeading} from "../../ui/SHeading";
import {colorText} from "../../styles/colors";

export const StyleImageDropZone = () => {
    const styleImage = useFileStore(state => state.styleImage);
    const setStyleImage = useFileStore(state => state.setStyleImage);
    const isStyleImageUploaded = useFileStore(state => state.isStyleImageUploaded);
    return <Flex flexDir={"column"} alignItems={'center'}>
        <SHeading text={'Style'} color={colorText}/>
        <DropZone
            onDropFile={acceptedFiles => {
                setStyleImage(acceptedFiles[0])
            }}
            image={styleImage}
            isImageUploaded={isStyleImageUploaded}
        />
    </Flex>
}