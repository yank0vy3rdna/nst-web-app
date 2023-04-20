import DropZone from "./DropZone";
import React from "react";
import {Flex, useMediaQuery} from "@chakra-ui/react";
import {StyleImageDropZone} from "./StyleImageDropZone";


export const DropZoneWrapper = () => {
    const [isMobile] = useMediaQuery("(max-width: 1100px)")
    return <Flex
        w={'100%'}
        flexDirection={isMobile ? 'column' : ''}
        justifyContent={'center'}
        alignItems={'center'}
    >
       <StyleImageDropZone/>
        <DropZone/>
    </Flex>
}