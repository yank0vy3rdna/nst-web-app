import './styles/colors.css'
import DropZone from "./components/dropzone/DropZone";
import {CSSReset, Flex, theme, ThemeProvider} from "@chakra-ui/react";
import {StartPage} from "./pages/StartPage";

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CSSReset/>
            <StartPage/>
        </ThemeProvider>
    );
}

export default App;
