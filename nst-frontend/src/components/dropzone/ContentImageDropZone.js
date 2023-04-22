import DropZone from "./DropZone";
import {useFileStore} from "../../store/fileStore";
import {Flex, Heading} from "@chakra-ui/react";
import {SHeading} from "../../ui/SHeading";
import {colorText} from "../../styles/colors";

export const ContentImageDropZone = () => {
    const contentImage = useFileStore(state => state.contentImage);
    const setContentImage = useFileStore(state => state.setContentImage);
    const isContentImageUploaded = useFileStore(state => state.isContentImageUploaded);
    return <Flex flexDir={"column"} alignItems={'center'}>
        <SHeading text={'Content'} color={colorText}/>
        <DropZone
            onDropFile={acceptedFiles => {
                setContentImage(acceptedFiles[0])
            }}
            image={contentImage}
            isImageUploaded={isContentImageUploaded}
        />
    </Flex>
}