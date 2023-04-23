import {Box, Button, Flex, Progress} from "@chakra-ui/react";
import {buttonColorText, colorBackground, hoverButtonColorText} from "../styles/colors";
import {useFileStore} from "../store/fileStore";

export const GenerateButton = () => {
    const isContentImageUploaded = useFileStore(state => state.isContentImageUploaded);
    const isStyleImageUploaded = useFileStore(state => state.isStyleImageUploaded);
    const generationInProgress = useFileStore(state => state.generationInProgress);
    const startGeneration = useFileStore(state => state.startGeneration);
    const imagesNotUploadedYet = !(isContentImageUploaded && isStyleImageUploaded)
    const onClick = () => {
        if (imagesNotUploadedYet) {
            console.error("generate button clicked but images does not uploaded")
            window.location.reload();
        }
        startGeneration()
    }
    return <Flex
        justifyContent={'center'}
        alignItems={'center'}
        flexDir={'column'}
        w={'100%'}
        h={'130px'}
    >
        <Button
            w={'170px'}
            h={'42px'}
            borderRadius={'8px'}
            background={colorBackground}
            color={buttonColorText}
            fontSize={'20px'}
            fontWeight={'bold'}
            outline={"4px dashed"}
            outlineColor={'rgba(0,0,0,0.5)'}
            transition={'0.5s'}
            isDisabled={imagesNotUploadedYet}
            isLoading={generationInProgress}
            _hover={imagesNotUploadedYet || generationInProgress ? {} : {
                background: 'rgba(0,0,0,0.1)',
                color: hoverButtonColorText,
                outline: "4px solid",
                outlineColor: 'rgba(0,0,0,0.5)',
                transition: '0.5s'
            }}
            onClick={onClick}
        >
            {imagesNotUploadedYet ? 'Upload images' : 'Generate'}
        </Button>
    </Flex>
}