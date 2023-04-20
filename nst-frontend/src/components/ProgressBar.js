import {Button, Flex} from "@chakra-ui/react";

export const ProgressBar = () => {
    return <Flex
        justifyContent={'center'}
        alignItems={'center'}
        w={'100%'}
        h={'100px'}
    >
        <Button
            w={'170px'}
            h={'42px'}
            borderRadius={'8px'}
            border={'1px solid orange'}
            bg={'white'}
            color={'orange'}
            _hover={{
                background: 'orange',
                color: 'white',
            }}
        >
            Generate
        </Button>

    </Flex>
}