import React from "react";
import { Layout, Menu, Row, Col, Card, Button, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../hooks";
import { clearAuth } from "../store/authSlice";

const { Header, Content } = Layout;

interface MenuItem {
  key: string;
  label: string;
}

interface MainLayoutProps {
  title: string;
  children: React.ReactNode;
  navItems?: MenuItem[];
  selectedKey?: string;
  onNavClick?: (key: string) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  title,
  children,
  navItems,
  selectedKey,
  onNavClick,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    sessionStorage.clear();
    dispatch(clearAuth());
    navigate("/signin");
  };
  console.log("Current selected nav key:", selectedKey);
  return (
    <Layout style={{ minHeight: "100vh", minWidth: "100vw" }}>
      <Header style={{ padding: "0 24px", background: "#001529" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "64px",
          }}
        >
          <Typography.Title level={4} style={{ color: "#fff", margin: 0 }}>
            {title}
          </Typography.Title>
          <Button type="primary" danger onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </Header>

      {navItems && (
        <div style={{ background: "#002140" }}>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[selectedKey || ""]}
            items={navItems}
            onClick={({ key }) => onNavClick?.(key)}
            style={{
              borderBottom: "none",
              paddingLeft: "24px",
              background: "#002140",
            }}
          />
        </div>
      )}

      <Content style={{ padding: "24px", background: "#f0f2f5" }}>
        <Row justify="center">
          <Col xs={24} sm={24} md={22} lg={20} xl={18}>
            <Card style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              {children}
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default MainLayout;
