import {CSSReset, ThemeProvider} from "@chakra-ui/react";
import {StartPage} from "./pages/StartPage";
import {theme} from "./ui/theme";

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CSSReset/>
            <StartPage/>
        </ThemeProvider>
    );
}

export default App;
