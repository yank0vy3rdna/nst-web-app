import {Box, keyframes, useMediaQuery} from "@chakra-ui/react";
import {useEffect} from "react";

export const Chudik = ({num, x, y, size = 150, xFrom = null, ...props}) => {
    const [isMobile] = useMediaQuery("(max-width: 1100px)")
    const spin = keyframes`
      from {
        transform: translateX(${xFrom}vw);
      }
      // to {
      //   transform: translateX(${x}vw);
      // }
    `
    return isMobile ?
        <></> :
        <Box
            position={"absolute"}
            zIndex={0}
            left={`${x}vw`}
            top={`${y}vh`}
            animation={`${spin} 2s linear`}

        ><img style={{
            opacity: 0.7,
            filter: 'alpha(opacity=40)'
        }} src={`/svg/${num}.svg`} width={`${size}px`} height={`${size}px`} alt={""}/></Box>
}