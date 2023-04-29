import {Box, Flex, Progress, Text, useMediaQuery} from "@chakra-ui/react";
import {buttonColorText} from "../styles/colors";
import {useFileStore} from "../store/fileStore";

export const ProgressBar = () => {
    const progressPercent = useFileStore(state => state.progressPercent);
    const [isMobile] = useMediaQuery("(max-width: 1100px)")

    return <Flex
        justifyContent={'center'}
        alignItems={'center'}
        flexDir={'column'}
        w={'100%'}
        h={'50px'}
    >
        <Text fontFamily={'text'} color={buttonColorText} fontWeight={'bold'}>Generation in progress...</Text>
        <Text fontFamily={'text'} fontSize={15} color={buttonColorText} fontWeight={'bold'}>It usually lasts no more
            than a few minutes</Text>
        <Box
            marginTop={'20px'}
            marginBottom={'10px'}
            w={isMobile ? '300px' : '400px'}
            h={'12px'}
        >
            <Progress
                outline={"4px dashed"}
                outlineColor={'rgba(0,0,0,0.5)'}
                value={progressPercent * 100} colorScheme={'orange'}
                background={'rgba(0,0,0,0)'}
                borderRadius={'8px'}
            />
        </Box>
    </Flex>
}