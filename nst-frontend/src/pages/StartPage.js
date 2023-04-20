import {Flex, Heading} from "@chakra-ui/react";
import DropZone from "../components/dropzone/DropZone";
import React, {useState} from "react";
import {ResultBox} from "../components/ResultBox";
import {SHeading} from "../ui/SHeading";
import {ProgressBar} from "../components/ProgressBar";
import {DropZoneWrapper} from "../components/dropzone/DropZoneWrapper";

export const StartPage = () => {
    const [isContentReady, setIsContentReady] = useState(false)


    return <Flex
        w={'100%'}
        flexDirection={'column'}
    >
        <SHeading color={'orange'} text={'Govno App'} size={'28px'}/>
        {!isContentReady
            ? <DropZoneWrapper/>
            : <></>}

        <ProgressBar/>


    </Flex>
}