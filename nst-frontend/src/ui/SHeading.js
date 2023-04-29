import {Flex, Heading, useMediaQuery} from "@chakra-ui/react";
import {textShadow} from "../styles/colors";


export const SHeading = ({color, text, fontWeight, size}) => {
    const [isMobile] = useMediaQuery("(max-width: 1100px)")
    return <Flex
        alignItems={'center'}
        w={'100%'}
        m={'10px'}
        zIndex={200}
    >
        <Heading
            textAlign={'center'}
            fontWeight={fontWeight}
            fontSize={size}
            color={color}
            w={'100%'}
            textShadow={textShadow(2)}
        >
                {text}
        </Heading>
    </Flex>

}