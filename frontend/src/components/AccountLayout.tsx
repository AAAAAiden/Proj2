import React, { useState } from "react";
import { Layout, Menu, Row, Col, Card, Button } from "antd";
import { useNavigate } from "react-router-dom";
import PersonalInfoForm from "./PersonalInfoForm";
import VisaStatusPage from "./VisaStatus";
import type { PersonalInfo } from "../types";

const { Header, Content } = Layout;

type ViewMode = "personal" | "visa";

interface Props {
  initialData: PersonalInfo;
  onSubmit: (data: PersonalInfo) => void;
}

export default function AccountLayout({ initialData, onSubmit }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("personal");
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: your logout logic (e.g. clear tokens)...
    navigate("/login");
  };

  const menuItems = [
    { key: 'personal', label: 'Personal Info' },
    { key: 'visa', label: 'Visa Status' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' , minWidth: '100vw'}}>
      <Header style={{ display: 'flex', alignItems: 'center', padding: '0 24px' }}>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[viewMode]}
          items={menuItems}
          onClick={({ key }) => setViewMode(key as ViewMode)}
          style={{ flex: 1, background: 'transparent' }}
        />
        <Button type="primary" danger onClick={handleLogout}>
          Logout
        </Button>
      </Header>

      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        {viewMode === 'personal' ? (
          <Row justify="center" style={{ marginTop: 24 }}>
            <Col xs={24} sm={20} md={16} lg={12} xl={10}>
              <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <PersonalInfoForm
                  initialData={initialData}
                  onSubmit={onSubmit}
                  disabled={false}
                />
              </Card>
            </Col>
          </Row>
        ) : (
          <Row justify="center" style={{ marginTop: 24 }}>
            <Col xs={24} sm={20} md={16} lg={12} xl={10}>
              <Card bordered={false} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <VisaStatusPage />
              </Card>
            </Col>
          </Row>
        )}
      </Content>
    </Layout>
  );
}
