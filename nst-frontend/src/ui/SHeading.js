import {Flex, Heading} from "@chakra-ui/react";


export const SHeading = ({color, text, size}) => {
    return <Flex
        alignItems={'center'}
        w={'100%'}
    >
        <Heading
            textAlign={'center'}
            fontWeight={size}
            color={color}
            w={'100%'}
        >
            {text}
        </Heading>
    </Flex>

}