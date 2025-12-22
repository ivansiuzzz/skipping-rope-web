import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  container: {
    padding: "3rem 2rem",
    textAlign: "center",
    maxWidth: "800px",
    margin: "0 auto",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
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
  },
});

export const HomePage = () => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <h1 className={classes.title}>歡迎使用跳繩應用! 🏃‍♂️</h1>
      <p className={classes.subtitle}>您已成功登入，開始您的健康之旅吧！</p>
    </div>
  );
};
