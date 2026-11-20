import StatCard from "./StatCard";
import Footer from "./Footer";
import DashboardCharts from "./DashboardCharts";
import { 
    Package,
     Tag,
      AlertTriangle,
       RefreshCw,
        ArrowDownToLine,
         ArrowUpFromLine,
          Bell
        } from "lucide-react";
import { Skeleton, Badge, Tooltip } from "@mui/material";
import '../css/Dashboard.css';
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Transition from "./Transition";
import api from "../api/axios";
import { format } from "date-fns";

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        stats: { totalProducts: 0, totalCategories: 0, lowStock: 0, movementsToday: 0 },
        recent_movements: [],
        low_stock_alerts: []
    });

    const dashboard = "Dashboard Overview";

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get("/api/dashboard-stats"); 
                setData(res.data);
            } catch (err) {
                console.error("Error fetching dashboard stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);
    
    return (
        <div className="dashboard">
        <div style={{margin: 0, padding: 0}}>
            <span className="notification">
            <h1>
                {dashboard.split("").map((char, index) => (
                    <motion.span
                        key={index}
                        initial={{opacity:0, x:-18, letterSpacing:"0px"}}
                        animate={{opacity:1, x:0, letterSpacing:"2px"}}
                        transition={{
                            delay: index * 0.04,
                            duration: 0.4,
                            ease: "easeOut"
                        }}
                        style={{fontWeight: 'bold'}}
                    >
                        {char === " " ? <span>&nbsp;</span> : char}
                    </motion.span>
                ))}
            </h1>
            <Tooltip title="Notifications" slotProps={{
                popper: {
                    modifiers: [
                        {
                            name: 'offset',
                            options: {
                                offset: [0, -12]
                            }
                        }
                    ]
                },
                tooltip: {
                    sx: {
                        bgcolor: 'rgba(0, 0, 0, 0.6)',
                        color: '#fff',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        border: '1px solid rgb(161, 155, 155)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        fontFamily: 'Outfit',
                        boxShadow: '3px 4px 16px rgba(0, 0, 0, 0.5)',
                        zIndex: 1000
                    }
                }
            }}>
                <span className="bell-wrapper">
                    <Badge 
                        badgeContent={data.low_stock_alerts.length} 
                        color="error"
                        overlap="circular"
                        anchorOrigin={{vertical: "top",
                            horizontal: "right"}}
                            >
                            <Bell className="bell"/>
                    </Badge>
                </span>
            </Tooltip>
            </span>
            {!loading ? <div className="tables">
                {/* ── ACTIVITY FEED ── */}
                <div className="mv-feed">
                    {/* Header */}
                    <div className="mv-feed__header">
                        <div className="mv-feed__title-group">
                            <span className="mv-feed__live-dot" />
                            <span className="mv-feed__title">Derniers mouvements de stock</span>
                        </div>
                        <span className="mv-feed__count">{data.recent_movements.length} entrées</span>
                    </div>

                    {/* Feed list */}
                    <div className="mv-feed__list">
                        {data.recent_movements.length > 0 ? data.recent_movements.map((m, i) => (
                            <motion.div
                                key={i}
                                className={`mv-item mv-item--${m.type}`}
                                initial={{ opacity: 0, x: -18 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.06, duration: 0.35, ease: "easeOut" }}
                            >
                                {/* Left accent */}
                                <div className="mv-item__accent" />

                                {/* Icon bubble */}
                                <div className={`mv-item__icon mv-item__icon--${m.type}`}>
                                    {m.type === 'in'
                                        ? <ArrowDownToLine size={16} />
                                        : <ArrowUpFromLine size={16} />
                                    }
                                </div>

                                {/* Body */}
                                <div className="mv-item__body">
                                    <span className="mv-item__name">{m.product_name}</span>
                                    <span className="mv-item__time">
                                        {format(new Date(m.date), "MMM dd · hh:mm aa")}
                                    </span>
                                </div>

                                {/* Quantity chip */}
                                <div className={`mv-item__qty mv-item__qty--${m.type}`}>
                                    {m.type === 'in' ? '+' : '−'}{m.quantity}
                                </div>

                                {/* Type badge */}
                                <span className={`mv-item__badge mv-item__badge--${m.type}`}>
                                    {m.type === 'in' ? 'Entrée' : 'Sortie'}
                                </span>
                            </motion.div>
                        )) : (
                            <div className="mv-feed__empty">
                                <RefreshCw size={28} strokeWidth={1.4} />
                                <p>Aucun mouvement récent</p>
                            </div>
                        )}
                    </div>
                </div>
                <table className="alerts">
                    <thead>
                        <tr>
                            <th><AlertTriangle style={{color:"orangered"}}/></th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.low_stock_alerts.length > 0 ? data.low_stock_alerts.map((p, i) => (
                            <tr key={i} style={{display: "flex", justifyContent: "space-between"}}>
                                <p>{p.name}</p>
                                <p className="alert">{p.stock} left</p>
                            </tr>
                        )) : <tr><td>Stock is healthy!</td></tr>}
                    </tbody>
                </table>
            </div> : <Skeleton variant="rectangular" width="100%" height={350} style={{ marginTop: 20, borderRadius: 20}} animation="wave" />
            }
            <DashboardCharts data={data} loading={loading} />
        </div>
            <Footer />
        </div>
    );
}

export default Transition(Dashboard);