import { useState, ChangeEvent, useEffect, useCallback } from "react";
import axios from "axios";
import { useAppSelector } from "../hooks";
import {
  PersonalInfo,
  Document,
  ImmigrationInfo
} from "../types";
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
  Typography
} from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;

interface Props {
  initialData: PersonalInfo;
  onSubmit: (data: PersonalInfo) => void;
  disabled?: boolean;
}

export default function PersonalInfoForm({ initialData, onSubmit, disabled = false }: Props) {
  const [draft, setDraft] = useState<PersonalInfo>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const token = useAppSelector((state) => state.auth.token);
  const userId = useAppSelector((state) => state.auth.id);

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

  const handleImmigrationChange = (field: keyof ImmigrationInfo) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value;
      setDraft(prev => ({
        ...prev,
        immigration: {
          ...prev.immigration,
          [field]: value,
        } as any,
      }));
    };

  const handleIsResidentChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const isUS = e.target.value === "yes";
    setDraft(prev => ({
      ...prev,
      immigration: {
        isUSResident: isUS,
        residentStatus: isUS ? prev.immigration.residentStatus : undefined,
        workAuthType: isUS ? undefined : prev.immigration.workAuthType,
        otherVisaTitle: "",
        optReceiptUrl: "",
        authStartDate: "",
        authEndDate: "",
      }
    }));
  };

  const handleOptUpload = async (file: File) => {
    if (!file || !userId || !token) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('type', 'opt_receipt');

    try {
      const res = await axios.post('http://localhost:5001/api/documents/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploaded = res.data.document;
      setDraft(prev => ({
        ...prev,
        immigration: {
          ...prev.immigration,
          optReceiptUrl: uploaded.url,
        },
      }));
    } catch (err) {
      console.error('OPT Upload failed', err);
    }
  };

  const handleDocUpload = (type: 'profile_picture' | 'driver_license' | 'work_auth') => async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId || !token) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('type', type);

    try {
      const res = await axios.post('http://localhost:5001/api/documents/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const newDoc = res.data.document;
      setDraft(prev => ({
        ...prev,
        documents: [...prev.documents, newDoc],
      }));
    } catch (err) {
      console.error('Upload failed', err);
    }
  };

  const deleteDoc = async (docId: string) => {
    if (!token || !userId) return;
    if (!window.confirm("Are you sure you want to delete this document?")) return;

    try {
      await axios.delete(`http://localhost:5001/api/documents/${docId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setDraft((prev) => ({
        ...prev,
        documents: prev.documents.filter((doc) => doc.id !== docId),
      }));
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const previewDoc = useCallback(async (docId: string) => {
    try {
      const res = await axios.get(`http://localhost:5001/api/documents/preview/${docId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const blobUrl = window.URL.createObjectURL(res.data);
      window.open(blobUrl, '_blank');
    } catch (err) {
      console.error('Preview failed', err);
    }
  }, [token]);

  const downloadDoc = useCallback(async (docId: string, filename: string) => {
    try {
      const res = await axios.get(`http://localhost:5001/api/documents/download/${docId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Download failed', err);
    }
  }, [token]);

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
              <Button type="primary" htmlType="submit">Save</Button>
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
            <Select value={draft.immigration.isUSResident ? 'yes' : 'no'} onChange={(v) => handleIsResidentChange({ target: { value: v } } as any)} disabled={!isEditing}>
              <Option value="yes">Yes</Option>
              <Option value="no">No</Option>
            </Select>
          </Form.Item>
        </Col>
        {!draft.immigration.isUSResident && (
          <Col span={12}>
            <Form.Item label="Work Authorization">
              <Select value={draft.immigration.workAuthType} onChange={(v) => handleImmigrationChange("workAuthType")({ target: { value: v } } as any)} disabled={!isEditing}>
                <Option value="H1-B">H1-B</Option>
                <Option value="L2">L2</Option>
                <Option value="F1">F1</Option>
                <Option value="H4">H4</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>
          </Col>
        )}
      </Row>

      {draft.immigration.workAuthType === 'F1' && (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="OPT Receipt">
              <Upload beforeUpload={(file) => { handleOptUpload(file); return false; }} showUploadList={false}>
                <Button icon={<UploadOutlined />} disabled={!isEditing}>Upload PDF</Button>
              </Upload>
            </Form.Item>
          </Col>
          {draft.immigration.optReceiptUrl && (
            <Col span={12}>
              <a href={draft.immigration.optReceiptUrl} target="_blank" rel="noopener noreferrer">Preview OPT Receipt</a>
            </Col>
          )}
        </Row>
      )}

      <Divider orientation="left">Documents</Divider>
      <Row>
        <Col span={24}>
          <Space direction="vertical" style={{ width: '100%' }}>
            {['profile_picture', 'driver_license', 'work_auth'].map((category) => (
              <div key={category}>
                <strong>{category.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</strong>
                {draft.documents.filter(doc => doc.type === category).map((doc) => (
                  <Space key={doc.id} style={{ justifyContent: 'space-between', width: '100%' }}>
                    <span>{doc.name}</span>
                    {isEditing && (
                      <Space>
                        <a onClick={() => previewDoc(doc.id)}>Preview</a>
                        <a onClick={() => downloadDoc(doc.id, doc.name)}>Download</a>
                        <a onClick={() => deleteDoc(doc.id)} style={{ color: 'red' }}>Delete</a>
                      </Space>
                    )}
                  </Space>
                ))}
                {isEditing && (
                  <Upload
                    beforeUpload={(file) => { handleDocUpload(category as any)({ target: { files: [file] } } as any); return false; }}
                    showUploadList={false}
                  >
                    <Button icon={<UploadOutlined />}>Upload</Button>
                  </Upload>
                )}
              </div>
            ))}
          </Space>
        </Col>
      </Row>
    </Form>
  );
}
