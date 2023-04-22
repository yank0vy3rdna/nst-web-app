import {Flex, Heading} from "@chakra-ui/react";
import {textShadow} from "../styles/colors";


export const SHeading = ({color, text, fontWeight, size}) => {
    return <Flex
        alignItems={'center'}
        w={'100%'}
        mb={'10px'}
        mt={'50px'}
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