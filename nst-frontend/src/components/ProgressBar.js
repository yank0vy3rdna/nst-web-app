import {Button, Flex} from "@chakra-ui/react";
import {buttonColorText, colorBackground, hoverButtonColorText} from "../styles/colors";

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
            background={colorBackground}
            color={buttonColorText}
            fontSize={'20px'}
            fontWeight={'bold'}
            outline={"4px dashed"}
            outlineColor={'rgba(0,0,0,0.5)'}
            transition={'0.5s'}
            _hover={{
                background: 'rgba(0,0,0,0.1)',
                color: hoverButtonColorText,
                outline: "4px solid",
                outlineColor: 'rgba(0,0,0,0.5)',
                transition: '0.5s'
            }}
        >
            Generate
        </Button>

    </Flex>
}