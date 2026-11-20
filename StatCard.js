import React from "react";
import { Skeleton, Card, CardContent } from "@mui/material";
import { motion } from "framer-motion";
const StatCard = ({ title, value, icon: Icon, loading, color, bg, border}) => {
  const container = {
    initial: {},
    hover: {
      transition: {
        staggerChildren: 0.03,
      },
    },
  };

  const letter = {
    initial: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
    },
    hover: {
      opacity: [0, 1],
      y: [20, 0],
      filter: ["blur(6px)", "blur(0px)"],
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
  };

  const Motioncard = motion(Card);
  return (
    <Motioncard 
    style={{ width: "100%", maxWidth: 300, border: border}}
    initial="initial"
    whileHover="hover"
    >
    <CardContent
      className="stat-card"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px",
        minWidth: "220px",
        background: "white",
        borderRadius: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <div className="stat-info" style={{ flex: 1 }}>
        {loading ? (
          <>
            <Skeleton variant="text" width="70%" height={25} />
            <Skeleton variant="text" width="40%" height={25} />
          </>
        ) : (
          <>
            <motion.p
            variants={container}
            className="stat-title"
            style={{ margin: 0, color: "#65758B", fontSize: "0.8rem", display: "flex", overflow: "hidden"}}
            >
              {title.split("").map((char, index) => (
                <motion.span
                  key={index}
                  variants={letter}
                  style={{fontWeight: '500'}}
                >
                   {char === " " ? <span>&nbsp;</span> : char}
                </motion.span>
              ))}
            </motion.p>
            <p className="stat-value" style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700 }}>
              {value}
            </p>
          </>
        )}
      </div>

      <div className="stat-icon">
        {loading ? (
          <Skeleton variant="circular" width={40} height={40} />
        ) : (
          <Icon size={40} style={{ color: color, backgroundColor: bg, borderRadius: "12px", padding: "8px",border:"1.5px solid"}} />
        )}
      </div>
    </CardContent>
    </Motioncard>
  );
};

export default StatCard;