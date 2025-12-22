import { createUseStyles } from "react-jss";
import {
  TrophyOutlined,
  BarChartOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const useStyles = createUseStyles({
  container: {
    textAlign: "center",
  },

  title: {
    fontSize: "2.5rem",
    fontWeight: 700,
    marginBottom: "1rem",
    color: "#1a1a1a",
    letterSpacing: "-0.02em",
  },

  subtitle: {
    fontSize: "1.2rem",
    color: "#666",
    fontWeight: 400,
    marginBottom: "2rem",
  },

  features: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "1.5rem",
    marginTop: "3rem",
  },

  featureCard: {
    padding: "1.5rem",
    borderRadius: "12px",
    background:
      "linear-gradient(135deg, rgba(0, 120, 212, 0.05) 0%, rgba(0, 188, 242, 0.05) 100%)",
    border: "1px solid rgba(0, 120, 212, 0.1)",
    textAlign: "center",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 8px 25px rgba(0, 120, 212, 0.15)",
    },
  },

  featureIcon: {
    fontSize: "2rem",
    color: "#0078d4",
    marginBottom: "1rem",
  },

  featureTitle: {
    fontSize: "1.2rem",
    fontWeight: 600,
    color: "#1a1a1a",
    marginBottom: "0.5rem",
  },

  featureDesc: {
    color: "#666",
    fontSize: "0.9rem",
  },
});

export const HomePage = () => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <h1 className={classes.title}>歡迎使用跳繩應用! 🏃‍♂️</h1>
      <p className={classes.subtitle}>您已成功登入，開始您的健康之旅吧！</p>

      <div className={classes.features}>
        <div className={classes.featureCard}>
          <TrophyOutlined className={classes.featureIcon} />
          <h3 className={classes.featureTitle}>訓練記錄</h3>
          <p className={classes.featureDesc}>
            記錄您的跳繩訓練成果，追蹤每日進度
          </p>
        </div>

        <div className={classes.featureCard}>
          <BarChartOutlined className={classes.featureIcon} />
          <h3 className={classes.featureTitle}>數據分析</h3>
          <p className={classes.featureDesc}>分析您的運動數據，優化訓練計畫</p>
        </div>

        <div className={classes.featureCard}>
          <CalendarOutlined className={classes.featureIcon} />
          <h3 className={classes.featureTitle}>賽事管理</h3>
          <p className={classes.featureDesc}>參與跳繩比賽，挑戰更高目標</p>
        </div>
      </div>
    </div>
  );
};
