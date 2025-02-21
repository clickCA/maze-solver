import { motion } from "framer-motion";
import { Maze } from "./components/Maze";
import "./App.css";

function App() {
    return (
        <motion.div
            className="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            <motion.h1
                initial={{ y: -50 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, type: "spring" }}
            >
                Maze Solver
            </motion.h1>
            <Maze />
        </motion.div>
    );
}

export default App;
