import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, Input, Button, Card, Typography } from "antd";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  UserOutlined,
  LockOutlined,
  TrophyFilled,
} from "@ant-design/icons";
import { createUseStyles } from "react-jss";
import { loginSchema, type LoginFormData } from "./schemas/login.schema";
import { useLogin } from "./hooks/useLogin";

const { Title, Text } = Typography;

const useStyles = createUseStyles({
  "@keyframes float": {
    "0%": { transform: "translateY(0px)" },
    "50%": { transform: "translateY(-10px)" },
    "100%": { transform: "translateY(0px)" },
  },
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "#f0f2f5",
    position: "relative",
    overflow: "hidden",
    "&::before": {
      content: '""',
      position: "absolute",
      top: "-50%",
      left: "-50%",
      width: "200%",
      height: "200%",
      background:
        "radial-gradient(circle at center, rgba(0, 120, 212, 0.05) 0%, transparent 50%)",
      animation: "$float 15s infinite ease-in-out",
      zIndex: 0,
    },
    "&::after": {
      content: '""',
      position: "absolute",
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      background: `
        radial-gradient(circle at 80% 10%, rgba(0, 188, 242, 0.1) 0%, transparent 30%),
        radial-gradient(circle at 20% 90%, rgba(0, 120, 212, 0.1) 0%, transparent 30%)
      `,
      zIndex: 0,
    },
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    borderRadius: "24px",
    background: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.8)",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.05)",
    zIndex: 1,
    "& .ant-card-body": {
      padding: "48px 32px",
    },
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  logoWrapper: {
    width: "64px",
    height: "64px",
    background: "linear-gradient(135deg, #0078d4 0%, #00bcf2 100%)",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 24px",
    boxShadow: "0 10px 20px rgba(0, 120, 212, 0.2)",
  },
  logoIcon: {
    fontSize: "32px",
    color: "#ffffff",
  },
  title: {
    margin: "0 !important",
    fontSize: "24px !important",
    fontWeight: "700 !important",
    color: "#1f1f1f",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    color: "#8c8c8c",
    fontSize: "15px",
    marginTop: "8px",
    display: "block",
  },
  formItem: {
    marginBottom: "24px",
    "& .ant-form-item-label > label": {
      fontSize: "14px",
      fontWeight: 600,
      color: "#434343",
    },
  },
  input: {
    height: "50px",
    borderRadius: "12px",
    fontSize: "15px",
    background: "#f5f7fa",
    border: "1px solid transparent",
    transition: "all 0.3s ease",
    padding: "0 16px",
    "& input": {
      background: "transparent",
    },
    "&:hover": {
      background: "#eef0f5",
    },
    "&:focus, &:focus-within": {
      background: "#ffffff",
      borderColor: "#0078d4",
      boxShadow: "0 0 0 4px rgba(0, 120, 212, 0.1)",
    },
    "& .ant-input-prefix": {
      marginRight: "12px",
    },
  },
  submitButton: {
    height: "50px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: 600,
    marginTop: "12px",
    background: "linear-gradient(135deg, #0078d4 0%, #00bcf2 100%)",
    border: "none",
    boxShadow: "0 8px 20px rgba(0, 120, 212, 0.25)",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 12px 24px rgba(0, 120, 212, 0.35) !important",
    },
    "&:active": {
      transform: "translateY(0)",
    },
  },
});

export const LoginPage = () => {
  const classes = useStyles();
  const loginMutation = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className={classes.container}>
      <Card className={classes.card} bordered={false}>
        <div className={classes.header}>
          <div className={classes.logoWrapper}>
            <TrophyFilled className={classes.logoIcon} />
          </div>
          <Title level={2} className={classes.title}>
            跳繩競賽系統
          </Title>
          <Text className={classes.subtitle}>歡迎回來，請登入您的帳號</Text>
        </div>

        <Form onFinish={handleSubmit(onSubmit)} layout="vertical" size="large">
          <Form.Item
            label="Email"
            validateStatus={errors.email ? "error" : ""}
            help={errors.email?.message}
            className={classes.formItem}
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
                  placeholder="Enter your email"
                  type="email"
                  status={errors.email ? "error" : ""}
                  className={classes.input}
                />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Password"
            validateStatus={errors.password ? "error" : ""}
            help={errors.password?.message}
            className={classes.formItem}
          >
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
                  placeholder="Enter your password"
                  iconRender={(visible) =>
                    visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                  }
                  status={errors.password ? "error" : ""}
                  className={classes.input}
                />
              )}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loginMutation.isPending}
              className={classes.submitButton}
            >
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
