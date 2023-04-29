import {Box, Flex, Image, useMediaQuery} from "@chakra-ui/react";


export const ResultBox = ({url}) => {
    const [isMobile] = useMediaQuery("(max-width: 1100px)")
    return <Box
        borderRadius={'8px'}
        outline={"4px dashed"}
        outlineColor={'rgba(0,0,0,0.3)'}
    >
        <Flex
            w={isMobile ? '400px' : '500px'}
            h={isMobile ? '400px' : '500px'}
        >
            <Image
                borderRadius={'8px'}
                src={url}
            />
        </Flex>
    </Box>
}