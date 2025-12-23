import React, { useState } from "react";
import { Layout, Menu, Button, Dropdown } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  SettingOutlined,
  TrophyOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { createUseStyles } from "react-jss";
import { useLocation } from "react-router-dom";
import { useLogout } from "../../modules/auth/login/hooks/useLogout";

const { Header, Sider, Content } = Layout;

const useStyles = createUseStyles({
  layout: {
    minHeight: "100vh",
  },

  header: {
    display: "flex",
    padding: "0 24px",
    background: "#ffffff",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    height: "65px",
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flex: 1,
  },

  headerRight: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
  },

  logo: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#0078d4",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginLeft: "8px",
  },

  trigger: {
    fontSize: "18px",
    padding: "4px",
    cursor: "pointer",
  },

  sider: {
    background: "#ffffff",
    boxShadow: "2px 0 8px rgba(0, 0, 0, 0.06)",
  },

  menu: {
    border: "none",
    "& .ant-menu-item": {
      margin: "4px 8px",
      borderRadius: "8px",
      height: "40px",
      lineHeight: "40px",
      "&:hover": {
        background:
          "linear-gradient(135deg, rgba(0, 120, 212, 0.08) 0%, rgba(0, 188, 242, 0.08) 100%)",
        color: "#0078d4",
      },
      "&.ant-menu-item-selected": {
        background: "linear-gradient(135deg, #0078d4 0%, #00bcf2 100%)",
        color: "#ffffff",
        "&:hover": {
          background: "linear-gradient(135deg, #106ebe 0%, #00a8d6 100%)",
          color: "#ffffff",
        },
      },
    },
    "& .ant-menu-item-icon": {
      fontSize: "16px",
    },
  },

  content: {
    background: "#ffffff",
  },
});

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const classes = useStyles();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { mutate: logout } = useLogout();

  const userMenuItems = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "登出",
      onClick: () => logout(),
    },
  ];

  const menuItems = [
    {
      key: "/",
      icon: <HomeOutlined />,
      label: "首頁",
    },
    {
      key: "/training",
      icon: <TrophyOutlined />,
      label: "訓練記錄",
    },
    {
      key: "/statistics",
      icon: <BarChartOutlined />,
      label: "統計分析",
    },
    {
      key: "/settings",
      icon: <SettingOutlined />,
      label: "設定",
    },
  ];

  return (
    <Layout className={classes.layout}>
      <Header className={classes.header}>
        <div className={classes.headerLeft}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className={classes.trigger}
          />
          <div className={classes.logo}>
            <TrophyOutlined />
            跳繩競賽
          </div>
        </div>
        <div className={classes.headerRight}>
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            arrow
          >
            <Button type="text" icon={<UserOutlined />} size="large" />
          </Dropdown>
        </div>
      </Header>

      <Layout>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          className={classes.sider}
          width={240}
          collapsedWidth={80}
        >
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            className={classes.menu}
            items={menuItems}
          />
        </Sider>

        <Layout>
          <Content className={classes.content}>{children}</Content>
        </Layout>
      </Layout>
    </Layout>
  );
};
