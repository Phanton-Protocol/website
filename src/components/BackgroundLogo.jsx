import { motion } from 'framer-motion';

const BackgroundLogo = () => {
    return (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-[0.02] mix-blend-screen z-[-1] overflow-hidden">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 3, ease: "easeOut" }}
                className="w-[120vw] h-[120vh] border border-white rounded-full flex items-center justify-center animate-pulse"
                style={{ animationDuration: '10s' }}
            >
                <div className="w-[80vw] h-[80vh] border border-dashed border-white rounded-full flex items-center justify-center">
                    <div className="w-[40vw] h-[40vh] border border-white rounded-full" />
                </div>
            </motion.div>
        </div>
    );
};

export default BackgroundLogo;
