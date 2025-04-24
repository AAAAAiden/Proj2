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
  Row,
  Col,
  Select,
  Upload,
  Space,
  Typography,
  Collapse,
  Avatar
} from "antd";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";

const { Title } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

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
  const email = useAppSelector((state) => state.auth.email);
  const [profilePicBlobUrl, setProfilePicBlobUrl] = useState<string | undefined>(undefined);
  const [form] = Form.useForm<PersonalInfo>();

  useEffect(() => {
    form.resetFields();
    setDraft(initialData);

    form.setFieldsValue({
      ...initialData,
      name: { ...initialData.name, email },
      immigration: {
        ...initialData.immigration,
        isUSResident: initialData.immigration.isUSResident ? 'yes' : 'no', 
      },
    });
  }, [initialData, form, email]);
  
  useEffect(() => {
    const profilePic = draft.documents.find(doc => doc.type === 'profile_picture');
    if (!profilePic || !token) return;
  
    const fetchBlob = async () => {
      try {
        const res = await axios.get(profilePic.url, {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        });
        const blobUrl = URL.createObjectURL(res.data);
        setProfilePicBlobUrl(blobUrl);
      } catch (err) {
        console.error('Failed to load profile picture preview:', err);
      }
    };
  
    fetchBlob();
  }, [draft.documents, token]);


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
    console.log("Final formData being submitted:", draft);
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
    <Form form={form} layout="vertical" onFinish={saveEdit} style={{ background: "#fff", padding: 24, borderRadius: 8 }}>
      <Form.Item>
        <Row justify="space-between" align="middle">
          <Col>
          {(() => {
            const profilePicUrl = draft.documents.find(doc => doc.type === 'profile_picture')?.url;
            console.log("Resolved profilePicUrl:", profilePicUrl);
            return ( <Avatar
                size={80}
                src={profilePicBlobUrl}
                icon={!profilePicBlobUrl && <UserOutlined />}
              /> );})()}
          </Col>

          <Col>
            <Space>
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
          </Col>
        </Row>
      </Form.Item>

      <Collapse defaultActiveKey={['1']}>
        <Panel header="Name & Contact" key="1">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Form.Item label="First Name"
              name={['name','firstName']} 
               rules={[{ required: true, message: 'First name is required' }]}
              >
                <Input
                  value={draft.name.firstName}
                  disabled={!isEditing || disabled}
                  onChange={handleChange("name", "firstName")}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Last Name"
              name={['name','lastName']} 
                rules={[{ required: true, message: 'Last name is required' }]}
              >
                <Input
                  value={draft.name.lastName}
                  disabled={!isEditing || disabled}
                  onChange={handleChange("name", "lastName")}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Preferred Name">
                <Input
                  value={draft.name.preferredName}
                  disabled={!isEditing || disabled}
                  onChange={handleChange("name", "preferredName")}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Cell Phone"
              name={['contact','cell']} 
                rules={[{ required: true, message: 'Cell phone is required' }]}
              >
                <Input
                  value={draft.contact.cell}
                  disabled={!isEditing || disabled}
                  onChange={handleChange("contact", "cell")}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Work Phone"
              name={['contact', 'work']}>
                <Input
                  value={draft.contact.work}
                  disabled={!isEditing || disabled}
                  onChange={handleChange("contact", "work")}
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="Email"
              name={['name','email']} 
                rules={[{ required: true, message: 'Email is required' }]}
              >
                <Input value={email} disabled readOnly />
              </Form.Item>
            </Col>
          </Row>
        </Panel>

        <Panel header="Address" key="2"> 
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item label="Building/Apt #">
              <Input
                value={draft.address.building}
                disabled={!isEditing}
                onChange={handleChange("address", "building")}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Street Name"
            name={['address','street']} 
              rules={[{ required: true, message: 'Street name is required' }]}
            >
              <Input
                value={draft.address.street}
                disabled={!isEditing}
                onChange={handleChange("address", "street")}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item label="City"
            name={['address','city']} 
              rules={[{ required: true, message: 'City is required' }]}>
              <Input
                value={draft.address.city}
                disabled={!isEditing}
                onChange={handleChange("address", "city")}
              />
            </Form.Item>
          </Col>
          <Col xs={12} sm={8}>
            <Form.Item label="State"
            name={['address','state']} 
              rules={[{ required: true, message: 'State is required' }]}
            >
              <Input
                value={draft.address.state}
                disabled={!isEditing}
                onChange={handleChange("address", "state")}
              />
            </Form.Item>
          </Col>
          <Col xs={12} sm={8}>
            <Form.Item label="Zip Code"
            name={['address','zip']} 
              rules={[{ required: true, message: 'Zip code is required' }]}
            >
              <Input
                value={draft.address.zip}
                disabled={!isEditing}
                onChange={handleChange("address", "zip")}
              />
            </Form.Item>
          </Col>
        </Row>
        </Panel>

        <Panel header="Personal Info" key='3'>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24}>
            <Form.Item label="SSN"
            name={['name','ssn']} 
              rules={[{ required: true, message: 'SSN is required' },
                {
                  pattern: /^\d{3}-\d{2}-\d{4}$/,
                  message: 'wrong SSN format',
                },
                
              ]}

              normalize={(value: string) => {
                if (!value) return value;
                const digits = value.replace(/\D/g, '').slice(0, 9);
            
                if (digits.length <= 3) {
                  return digits;
                } else if (digits.length <= 5) {
                  return `${digits.slice(0,3)}-${digits.slice(3)}`;
                } else {
                  return `${digits.slice(0,3)}-${digits.slice(3,5)}-${digits.slice(5)}`;
                }
              }}
            >
              <Input
                value={draft.name.ssn}
                disabled={!isEditing}
                onChange={handleChange("name", "ssn")}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={8}>
            <Form.Item label="Date of Birth"
            name={['name','dob']} 
              rules={[{ required: true, message: 'Date of birth is required' }]}
            >
              <Input
                type="date"
                value={draft.name.dob}
                disabled={!isEditing}
                onChange={handleChange("name", "dob")}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={8}>
            <Form.Item label="Gender"
            name={['name','gender']} 
              rules={[{ required: true, message: 'gender is required' }]}
            >
              <Select
                value={draft.name.gender}
                disabled={!isEditing}
                onChange={(value) =>
                  setDraft((prev) => ({
                    ...prev,
                    name: { ...prev.name, gender: value },
                  }))
                }
              >
                <Option value="male">Male</Option>
                <Option value="female">Female</Option>
                <Option value="prefer_not_to_say">I do not wish to answer</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        </Panel>


      <Panel header="U.S. Status & Work Authorization" key='4'>
      <Row gutter={[16,16]}>
        <Col xs={24} sm={12}>
          <Form.Item label="Resident Status"
          name={['immigration','isUSResident']} 
            rules={[{ required: true, message: 'Resident status is required' }]}
          >
          <Select
            value={draft.immigration.isUSResident ? 'yes' : 'no'}
            disabled={!isEditing}
            onChange={(value: 'yes' | 'no') => {
              const isUS = value === 'yes';
              setDraft(prev => ({
                ...prev,
                immigration: {
                  ...prev.immigration,
                  isUSResident: isUS, 
                },
              }));

              form.setFieldsValue({
                immigration: {
                  ...form.getFieldValue('immigration'),
                  isUSResident: value,
                },
              });
            }}
          >              
              <Option value="yes">Yes</Option>
              <Option value="no">No</Option>
            </Select>
          </Form.Item>
        </Col>
        {!draft.immigration.isUSResident && (
          <Col xs={24} sm={12}>
            <Form.Item label="Work Authorization"
            name={['immigration','workAuthType']} 
              rules={[{ required: true, message: 'Work authorization is required' }]}
            >
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
      </Panel>

      <Panel header="References" key="5">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Form.Item label="First Name"
              name={['references', 'firstName']}
                rules={[{ required: true, message: 'First name is required' }]}
              >
                <Input value={draft.references.firstName} disabled={!isEditing} onChange={handleChange("references", "firstName")} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Last Name"
              name={['references', 'lastName']}>
                <Input value={draft.references.lastName} disabled={!isEditing} onChange={handleChange("references", "lastName")} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Phone"
              name={['references', 'phone']}>
                <Input value={draft.references.phone} disabled={!isEditing} onChange={handleChange("references", "phone")} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Email"
              name={['references', 'email']}
                rules={[{type: 'email', message: 'Please enter a valid email address'}]}
              >
                <Input value={draft.references.email} disabled={!isEditing} onChange={handleChange("references", "email")} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Relationship"
              name={['references', 'relationship']}>
                <Input value={draft.references.relationship} disabled={!isEditing} onChange={handleChange("references", "relationship")} />
              </Form.Item>
            </Col>
          </Row>
        </Panel>
      
        <Panel header="Emergency Contact" key="6">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Form.Item label="First Name"
              name={['emergency','firstName']} 
                rules={[{ required: true, message: 'First name is required' }]}
              >
                <Input
                  value={draft.emergency.firstName}
                  disabled={!isEditing}
                  onChange={handleChange("emergency", "firstName")}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Last Name"
              name={['emergency','lastName']} 
                rules={[{ required: true, message: 'Last name is required' }]}
              >
                <Input
                  value={draft.emergency.lastName}
                  disabled={!isEditing}
                  onChange={handleChange("emergency", "lastName")}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Phone"
              name={['emergency','phone']} 
                rules={[{ required: true, message: 'Phone number is required' }]}
              >
                <Input
                  value={draft.emergency.phone}
                  disabled={!isEditing}
                  onChange={handleChange("emergency", "phone")}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Email"
              name={['emergency','email']} 
                rules={[{ required: true, message: 'Email is required' },
               {type: 'email', message: 'Please enter a valid email address'}
                ]}

              >
                <Input
                  value={draft.emergency.email}
                  disabled={!isEditing}
                  onChange={handleChange("emergency", "email")}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Relationship"
              name={['emergency','relationship']} 
                rules={[{ required: true, message: 'Relationship is required' }]}
              >
                <Input
                  value={draft.emergency.relationship}
                  disabled={!isEditing}
                  onChange={handleChange("emergency", "relationship")}
                />
              </Form.Item>
            </Col>
          </Row>
        </Panel>

      <Panel header="Documents" key='7'>
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
      </Panel>
      </Collapse>
    </Form>
  );
}
