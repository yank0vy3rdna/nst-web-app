import React, {useCallback, useState} from 'react';
import {useDropzone} from "react-dropzone";
import {Flex, useMediaQuery} from "@chakra-ui/react";


const DropZone = ({onDropFile, header, isImageUploaded, image}) => {

    const onDrop = useCallback(onDropFile, [])
    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

    const [isMobile] = useMediaQuery("(max-width: 1100px)")

    return <Flex
        {...getRootProps()}
        w={isMobile ? '300px': '500px'}
        h={isMobile ? '300px': '500px'}
        border={'1px solid orange'}
        m={isMobile ? '10px': '20px'}
        borderRadius={'8px'}
        backgroundImage={isImageUploaded ? image  : ''}
        backgroundPosition={'center center'}
        backgroundSize={'contain'}

        backgroundRepeat={'no-repeat'}
    >
        <input {...getInputProps()}/>
        {
            isDragActive ?
                <p>Drop files here...</p> : <>{header}</>
        }
    </Flex>

}
export default DropZone