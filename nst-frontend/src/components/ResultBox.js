import {Box, Flex, useMediaQuery} from "@chakra-ui/react";


export const ResultBox = ({url}) => {
    const [isMobile] = useMediaQuery("(max-width: 1100px)")
    return <Box
        // minW={'320px'}
        borderRadius={'8px'}
        marginBottom={isMobile ? '0px' : '170px'}
        outline={"4px dashed"}
        outlineColor={'rgba(0,0,0,0.3)'}
    >
        <Flex
            w={isMobile ? '400px' : '500px'}
            h={isMobile ? '400px' : '500px'}
            // borderRadius={'8px'}
            backgroundImage={`url("${url}")`}
            backgroundPosition={'center center'}
            backgroundSize={'contain'}
            backgroundRepeat={'no-repeat'}
        >

        </Flex>
    </Box>
}