import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, Input, Button, Card, Typography } from "antd";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  UserOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { createUseStyles } from "react-jss";
import { loginSchema, type LoginFormData } from "./schemas/login.schema";
import { useLogin } from "./hooks/useLogin";

const { Title, Text } = Typography;

const useStyles = createUseStyles({
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
    backgroundImage: `
      radial-gradient(circle at 20% 20%, rgba(0, 120, 212, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(0, 188, 242, 0.08) 0%, transparent 50%)
    `,
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    borderRadius: "20px",
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.8)",
    boxShadow: `
      0 8px 32px rgba(0, 0, 0, 0.08),
      0 2px 8px rgba(0, 0, 0, 0.04),
      inset 0 1px 0 rgba(255, 255, 255, 1)
    `,
    overflow: "hidden",
    "& .ant-card-body": {
      padding: "48px 40px",
    },
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  title: {
    margin: 0,
    marginBottom: "8px",
    fontSize: "28px",
    fontWeight: 600,
    background: "linear-gradient(135deg, #0078d4 0%, #00bcf2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  subtitle: {
    color: "#8c8c8c",
    fontSize: "14px",
  },
  formItem: {
    marginBottom: "24px",
    "& .ant-form-item-label > label": {
      fontSize: "14px",
      fontWeight: 500,
      color: "#262626",
    },
  },
  input: {
    height: "48px",
    borderRadius: "12px",
    fontSize: "15px",
    background: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(0, 120, 212, 0.15)",
    transition: "all 0.3s ease",
    "& input": {
      background: "transparent",
    },
    "&:hover": {
      background: "rgba(255, 255, 255, 0.9)",
      borderColor: "rgba(0, 120, 212, 0.3)",
    },
    "&:focus, &:focus-within": {
      background: "rgba(255, 255, 255, 1)",
      borderColor: "#0078d4",
      boxShadow: "0 0 0 3px rgba(0, 120, 212, 0.1)",
    },
  },
  submitButton: {
    height: "48px",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: 500,
    marginTop: "8px",
    background: "linear-gradient(135deg, #0078d4 0%, #00bcf2 100%)",
    border: "none",
    boxShadow: "0 4px 15px rgba(0, 120, 212, 0.3)",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 6px 20px rgba(0, 120, 212, 0.4) !important",
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
          <Title level={2} className={classes.title}>
            Welcome Back
          </Title>
          <Text className={classes.subtitle}>Please login to your account</Text>
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
