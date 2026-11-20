import React from 'react';
import { Copyright } from "lucide-react";
import { motion } from 'framer-motion';
const Footer = () => {
  return (
    <footer className='footer'>
          <motion.span 
            initial={{filter: 'blur(20px)', opacity: 0}}
            animate={{filter: 'blur(0px)', opacity: 1}}
            transition={{duration:1.4}}
            style={{padding:0, margin:0}}><Copyright style={{marginRight: 10}}/>
          </motion.span>
          <motion.p
            initial={{filter: 'blur(20px)', opacity: 0}}
            animate={{filter: 'blur(0px)', opacity: 1}}
            transition={{duration:1.4}}>
              {new Date().getFullYear()} Stock Manager. All rights reserved.
          </motion.p>
    </footer>
  )
}

export default Footer