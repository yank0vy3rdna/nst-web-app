import {Box, Flex, Heading, useMediaQuery} from "@chakra-ui/react";
import React, {useState} from "react";
import {SHeading} from "../ui/SHeading";
import {ProgressBar} from "../components/ProgressBar";
import {DropZoneWrapper} from "../components/dropzone/DropZoneWrapper";
import {Chudik} from "../components/Chudik";
import {colorBackground, colorText} from "../styles/colors";
import {useFileStore} from "../store/fileStore";
import {GenerateButton} from "../components/GenerateButton";

export const StartPage = () => {
    const generationInProgress = useFileStore(state => state.generationInProgress);
    const isResultImageGenerated = useFileStore(state => state.isResultImageGenerated);

    const [isMobile] = useMediaQuery("(max-width: 1100px)")

    return <Flex
        w={'100%'}
        h={'100vh'}
        flexDirection={'column'}
        paddingTop={'50px'}
        alignItems={"center"}
        bgColor={colorBackground}
    >
        <SHeading color={colorText} text={'Neural Style Transfer Web App'} fontWeight={'bold'} size={'48px'}/>
        {!generationInProgress && !isResultImageGenerated
            ? <DropZoneWrapper/>
            : <Box h={isMobile?'20vh':'30vh'}></Box>}
        {generationInProgress ? <ProgressBar/> : <></>}
        {!isResultImageGenerated ? <GenerateButton/> : <></>}
        <Chudik num={1} x={14} y={10} size={180}/>
        <Chudik num={2} x={78} y={5} size={130}/>
        <Chudik num={3} x={2} y={80} size={200}/>
        <Chudik num={4} x={87} y={50} size={200}/>
        <Chudik num={5} x={75} y={84} size={200}/>
        <Chudik num={6} x={60} y={76} xFrom={40} size={120}/>
        <Chudik num={7} x={2} y={30}/>
        <Chudik num={8} x={17} y={80}/>

    </Flex>
}