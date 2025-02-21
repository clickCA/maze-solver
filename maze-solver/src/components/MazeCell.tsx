import { motion } from "framer-motion";

interface MazeCellProps {
    type: "w" | "c" | "v" | "p"; // Added "p" for path
    size: number;
}

export const MazeCell = ({ type, size }: MazeCellProps) => {
    const getStyles = () => {
        const baseStyle = {
            width: size,
            height: size,
            borderRadius: 4,
            transition: "all 0.3s ease",
        };

        switch (type) {
            case "w":
                return {
                    ...baseStyle,
                    background: "#1e293b",
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)",
                };
            case "c":
                return {
                    ...baseStyle,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                };
            case "v":
                return {
                    ...baseStyle,
                    background: "#6366f1",
                    boxShadow: "0 0 16px rgba(99,102,241,0.5)",
                };
            case "p":
                return {
                    ...baseStyle,
                    background: "#22c55e",
                    boxShadow: "0 0 16px rgba(34,197,94,0.5)",
                };
            default:
                return baseStyle;
        }
    };

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
                scale: 1,
                opacity: 1,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={getStyles()}
        />
    );
};
