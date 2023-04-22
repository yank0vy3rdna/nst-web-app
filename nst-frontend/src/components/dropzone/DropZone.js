import React, {useCallback} from 'react';
import {useDropzone} from "react-dropzone";
import {background, Box, Flex, Icon, useMediaQuery} from "@chakra-ui/react";
import {AiOutlineUpload} from "react-icons/ai";


const DropZone = ({onDropFile, isImageUploaded, image}) => {

    const onDrop = useCallback(onDropFile, [])
    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

    const [isMobile] = useMediaQuery("(max-width: 1100px)")

    return <Box
        background={isDragActive ? "rgba(0,0,0,0.3)" : (isImageUploaded ? "rgba(0,0,0,0.05)" : "rgba(0,0,0,0.2)")}
        borderRadius={'8px'}
        m={isMobile ? '10px' : '20px'}
        outline={"4px dashed"}
        outlineColor={'rgba(0,0,0,0.3)'}
        transition={'0.5s'}
        _hover={
            {
                background: "rgba(0,0,0,0.3)",
                outline: "4px solid",
                outlineColor: 'rgba(0,0,0,0.4)',
                transition: '0.5s'
            }
        }
    >
        <Flex
            {...getRootProps()}
            w={isMobile ? '300px' : '500px'}
            h={isMobile ? '300px' : '500px'}
            // borderRadius={'8px'}
            backgroundImage={isImageUploaded ? image : ''}
            backgroundPosition={'center center'}
            backgroundSize={'contain'}
            backgroundRepeat={'no-repeat'}
        >
            <input {...getInputProps()}/>
            {
                (isDragActive || !isImageUploaded) ?
                    <Flex w={'100%'} justifyContent={"center"} alignItems={'center'}><Icon as={AiOutlineUpload} color={'#c0725b'}
                                                                                           boxSize={20}/></Flex> : <></> //
            }
        </Flex>
    </Box>

}
export default DropZone