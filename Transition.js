import React from 'react';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import "../css/Transition.css";

const Transition = (OgComponent) => {
  return function TransitionComponent() {
    return (
      <>
        <OgComponent />
        <motion.div
          className="slide-in"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 0 }}
          exit={{ scaleY: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          style={{ originY: 0 }}
        />

        <motion.div
          className="slide-out"
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          exit={{ scaleY: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          style={{ originY: 1 }}
        />

        <div className="transition-overlay">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0, scale: 0.5 }}
            exit={{ 
              opacity: [0, 1, 0], 
              scale: [0.8, 1.5, 0.8] 
            }}
            transition={{ 
              duration: 1.5, 
              ease: "easeInOut",
              times: [0, 0.5, 1]
            }}
          >
            <Package size={80} color="white" />
          </motion.div>
        </div>
      </>
    );
  };
};

export default Transition;