import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import {
  Form,
  Input,
  Button,
  Divider,
  Row,
  Col,
  Select,
  Upload,
  Space,
  Typography,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { PersonalInfo, ImmigrationInfo, Document } from "../types";

const { Option } = Select;
const { Title } = Typography;

interface Props {
  initialData: PersonalInfo;
  onSubmit: (data: PersonalInfo) => void;
  disabled?: boolean;
}

export default function PersonalInfoForm({
  initialData,
  onSubmit,
  disabled = false,
}: Props) {
  // const [draft, setDraft] = useState<PersonalInfo>(initialData);
  const [isEditing, setIsEditing] = useState(false);

  const docSlots = [
    { id: "driversLicense", label: "Driver's License" },
    { id: "passport",       label: "Passport"       },
    { id: "resume",         label: "Resume"         },
  ] as const;
  // useEffect(() => {
  //   setDraft(initialData);
  // }, [initialData]);

  const [draft, setDraft] = useState<PersonalInfo>(() => ({
    ...initialData,
    documents: docSlots.map(slot => {
      const existing = initialData.documents.find(d => d.id === slot.id);
      return existing ?? { id: slot.id, name: slot.label, url: "" };
    }),
  }));

  useEffect(() => {
    setDraft(prev => {
      // copy existing docs
      const docs = [...prev.documents];
      for (const { id, label } of docSlots) {
        if (!docs.some(d => d.id === id)) {
          docs.push({ id, name: label, url: "" });
        }
      }
      return { ...prev, documents: docs };
    });
  }, [initialData]);


  const startEdit = () => {
    if (disabled) return;
    setDraft(initialData);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    if (window.confirm("Discard all changes?")) {
      setDraft(initialData);
      setIsEditing(false);
    }
  };

  const saveEdit = () => {
    onSubmit(draft);
    setIsEditing(false);
  };

  const handleChange =
    <K extends keyof PersonalInfo>(section: K, field: string) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setDraft((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: (e.target as any).value,
        } as any,
      }));
    };

  const handlePicUpload = (file: File) => {
    setDraft((prev) => ({
      ...prev,
      name: { ...prev.name, profilePicUrl: URL.createObjectURL(file) },
    }));
    return false;
  };

  const handleOptUpload = (file: File) => {
    setDraft((prev) => ({
      ...prev,
      immigration: { ...prev.immigration, optReceiptUrl: URL.createObjectURL(file) },
    }));
    return false;
  };

  const handleImmigrationSelect = (value: string, field: keyof ImmigrationInfo) => {
    setDraft((prev) => ({
      ...prev,
      immigration: { ...prev.immigration, [field]: value } as any,
    }));
  };

  const addDocument = (file: File) => {
    const newDoc: Document = {
      id: `${Date.now()}`,
      name: file.name,
      url: URL.createObjectURL(file),
    };
    setDraft((prev) => ({ ...prev, documents: [...prev.documents, newDoc] }));
    return false;
  };

  const handleDocUpload = (file: File, slotId: string) => {
    const url = URL.createObjectURL(file);
    setDraft(prev => ({
      ...prev,
      documents: prev.documents.map(d =>
        d.id === slotId
          ? { ...d, name: file.name, url }
          : d
      )
    }));
    return false;
  };

  return (
    <Form layout="vertical" onFinish={saveEdit} style={{ background: "#fff", padding: 24, borderRadius: 8 }}>
      <Form.Item>
        <Space style={{ float: "right" }}>
          {!isEditing ? (
            <Button type="primary" onClick={startEdit} disabled={disabled}>
              Edit
            </Button>
          ) : (
            <>
              <Button onClick={cancelEdit}>Cancel</Button>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
            </>
          )}
        </Space>
      </Form.Item>

      <Divider orientation="left">Name</Divider>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="First Name">
            <Input value={draft.name.firstName} disabled={!isEditing || disabled} onChange={handleChange("name", "firstName")} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Last Name">
            <Input value={draft.name.lastName} disabled={!isEditing || disabled} onChange={handleChange("name", "lastName")} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Preferred Name">
            <Input value={draft.name.preferredName} disabled={!isEditing || disabled} onChange={handleChange("name", "preferredName")} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Profile Picture">
            {isEditing ? (
              <Upload beforeUpload={(f) => handlePicUpload(f)} showUploadList={false}>
                <Button icon={<UploadOutlined />} disabled={!isEditing}>Upload</Button>
              </Upload>
            ) : (
              draft.name.profilePicUrl && <img src={draft.name.profilePicUrl} alt="Profile" style={{ width: 96, height: 96, borderRadius: '50%' }} />
            )}
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">Contact Info</Divider>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Cell Phone">
            <Input value={draft.contact.cell} disabled={!isEditing || disabled} onChange={handleChange("contact", "cell")} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Work Phone">
            <Input value={draft.contact.work} disabled={!isEditing || disabled} onChange={handleChange("contact", "work")} />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">U.S. Status & Work Authorization</Divider>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Resident Status">
            <Select value={draft.immigration.isUSResident ? 'yes' : 'no'} onChange={(v) => handleImmigrationSelect(v, 'isUSResident')} disabled={!isEditing}>
              <Option value="yes">Yes</Option>
              <Option value="no">No</Option>
            </Select>
          </Form.Item>
        </Col>
        {!draft.immigration.isUSResident ? (
          <Col span={12}>
            <Form.Item label="Work Authorization">
              <Select value={draft.immigration.workAuthType} onChange={(v) => handleImmigrationSelect(v, 'workAuthType')} disabled={!isEditing}>
                <Option value="H1-B">H1-B</Option>
                <Option value="L2">L2</Option>
                <Option value="F1">F1</Option>
                <Option value="H4">H4</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>
          </Col>
        ) : null}
      </Row>

      {draft.immigration.workAuthType === 'F1' && (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="OPT Receipt">
              <Upload beforeUpload={(f) => handleOptUpload(f)} showUploadList={false}>
                <Button icon={<UploadOutlined />} disabled={!isEditing}>Upload PDF</Button>
              </Upload>
            </Form.Item>
          </Col>
          {draft.immigration.optReceiptUrl && (
            <Col span={12}>
              <a href={draft.immigration.optReceiptUrl} target="_blank" rel="noopener noreferrer">
                Preview OPT Receipt
              </a>
            </Col>
          )}
        </Row>
      )}

      {/* <Divider orientation="left">Documents</Divider>
      <Row>
        <Col span={24}>
          <Space direction="vertical" style={{ width: '100%' }}>
            {draft.documents.map((doc) => (
              <Space key={doc.id} style={{ justifyContent: 'space-between', width: '100%' }}>
                <span>{doc.name}</span>
                <Space>
                  <a href={doc.url} download>
                    Download
                  </a>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer">
                    Preview
                  </a>
                </Space>
              </Space>
            ))}
            {isEditing && (
              <Upload beforeUpload={(f) => addDocument(f)} showUploadList={false}>
                <Button icon={<UploadOutlined />} disabled={!isEditing}>
                  Add Document
                </Button>
              </Upload>
            )}
          </Space>
        </Col>
      </Row> */}





<Divider orientation="left">Documents</Divider>
<Row gutter={16}>
  {docSlots.map(({ id, label }) => {
    const doc = draft.documents.find(d => d.id === id)!;
    return (
      <Col span={8} key={id}>
        <Form.Item label={label}>
          {isEditing ? (
            <Upload
              beforeUpload={file => handleDocUpload(file, id)}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />} disabled={!isEditing}>
                Upload
              </Button>
            </Upload>
          ) : doc.url ? (
            <Space>
              <a href={doc.url} download>{doc.name}</a>
              <a href={doc.url} target="_blank" rel="noopener noreferrer">
                Preview
              </a>
            </Space>
          ) : (
            <Typography.Text type="secondary">
              No file uploaded
            </Typography.Text>
          )}
        </Form.Item>
      </Col>
    );
  })}
</Row>
    </Form>
  );
}
