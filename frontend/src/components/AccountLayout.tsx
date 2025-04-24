import React, { useState } from "react";
import { Layout, Menu, Row, Col, Card, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../hooks";
import { clearAuth } from "../store/authSlice";
import PersonalInfoForm from "./PersonalInfoForm";
import VisaStatusPage from "./VisaStatus";
import type { PersonalInfo } from "../types";

const { Header, Content } = Layout;

type ViewMode = "personal" | "visa";

interface Props {
  initialData: PersonalInfo;
  onSubmit: (data: PersonalInfo) => void;
}

const AccountLayout: React.FC<Props> = ({ initialData, onSubmit }) => {
  const [viewMode, setViewMode] = useState<ViewMode>("personal");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    sessionStorage.clear();
    dispatch(clearAuth());
    navigate("/signin");
  };

  const menuItems = [
    { key: "personal", label: "Personal Info" },
    { key: "visa", label: "Visa Status" },
  ];

  return (
    <Layout style={{ minHeight: "100vh", minWidth: "100vw" }}>
      <Header style={{ display: "flex", alignItems: "center", padding: "0 24px" }}>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[viewMode]}
          items={menuItems}
          onClick={({ key }) => setViewMode(key as ViewMode)}
          style={{ flex: 1, background: "transparent" }}
        />
        <Button type="primary" danger onClick={handleLogout}>
          Logout
        </Button>
      </Header>

      <Content style={{ padding: "24px", background: "#f0f2f5" }}>
        <Row justify="center">
          <Col xs={24} sm={22} md={20} lg={16} xl={12}>
            <Card bordered={false} style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              {viewMode === "personal" ? (
                <PersonalInfoForm
                  initialData={initialData}
                  onSubmit={onSubmit}
                  disabled={false}
                />
              ) : (
                <VisaStatusPage />
              )}
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default AccountLayout;
