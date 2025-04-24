import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Spin, Collapse, Divider } from 'antd';
import axios from 'axios';
import { useAppSelector } from '../../hooks';

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

const ViewEmployeeProfilePage: React.FC = () => {
  const { id } = useParams();
  const token = useAppSelector(state => state.auth.token);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !token) return;
    axios.get(`http://localhost:5001/api/hr/employees/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setProfile(res.data);
    }).catch(err => {
      console.error('Failed to fetch employee:', err);
    }).finally(() => {
      setLoading(false);
    });
  }, [id, token]);

  if (loading) return <Spin style={{ marginTop: '40px' }} />;
  if (!profile) return <div style={{ padding: 40 }}>Employee not found</div>;

  return (
    <div style={{ padding: 40, maxWidth: 900, margin: 'auto' }}>
      <Title level={2}>Employee Profile</Title>
      <Divider />
      <Collapse defaultActiveKey={['1', '2', '3', '4']}>
        <Panel header="Name & Contact Info" key="1">
          <Paragraph><b>First Name:</b> {profile.name.firstName}</Paragraph>
          <Paragraph><b>Last Name:</b> {profile.name.lastName}</Paragraph>
          <Paragraph><b>Preferred Name:</b> {profile.name.preferredName}</Paragraph>
          <Paragraph><b>Email:</b> {profile.name.email}</Paragraph>
          <Paragraph><b>Cell Phone:</b> {profile.contactInfo?.cellPhone}</Paragraph>
          <Paragraph><b>Work Phone:</b> {profile.contactInfo?.workPhone}</Paragraph>
        </Panel>

        <Panel header="Address" key="2">
          <Paragraph><b>Building:</b> {profile.address?.building}</Paragraph>
          <Paragraph><b>Street:</b> {profile.address?.street}</Paragraph>
          <Paragraph><b>City:</b> {profile.address?.city}</Paragraph>
          <Paragraph><b>State:</b> {profile.address?.state}</Paragraph>
          <Paragraph><b>Zip:</b> {profile.address?.zip}</Paragraph>
        </Panel>

        <Panel header="Personal Info" key="3">
          <Paragraph><b>SSN:</b> {profile.ssn}</Paragraph>
          <Paragraph><b>Date of Birth:</b> {profile.dateOfBirth}</Paragraph>
          <Paragraph><b>Gender:</b> {profile.gender}</Paragraph>
        </Panel>

        <Panel header="Immigration Info" key="4">
          <Paragraph><b>Citizenship:</b> {profile.workAuth?.citizenshipStatus}</Paragraph>
          <Paragraph><b>Visa Type:</b> {profile.workAuth?.visaType}</Paragraph>
          <Paragraph><b>Visa Title:</b> {profile.workAuth?.visaTitle}</Paragraph>
          <Paragraph><b>Other Title:</b> {profile.workAuth?.otherTitle}</Paragraph>
          <Paragraph><b>Authorization Start:</b> {profile.workAuth?.startDate}</Paragraph>
          <Paragraph><b>Authorization End:</b> {profile.workAuth?.endDate}</Paragraph>
          <Paragraph><b>OPT Receipt Path:</b> {profile.workAuth?.optReceiptPath}</Paragraph>
        </Panel>

        <Panel header="Reference Contact" key="5">
          <Paragraph><b>Name:</b> {profile.reference?.firstName} {profile.reference?.lastName}</Paragraph>
          <Paragraph><b>Email:</b> {profile.reference?.email}</Paragraph>
          <Paragraph><b>Phone:</b> {profile.reference?.phone}</Paragraph>
          <Paragraph><b>Relationship:</b> {profile.reference?.relationship}</Paragraph>
        </Panel>

        <Panel header="Emergency Contact(s)" key="6">
          {profile.emergencyContacts?.map((contact: any, idx: number) => (
            <div key={idx} style={{ marginBottom: 16 }}>
              <Paragraph><b>Name:</b> {contact.firstName} {contact.lastName}</Paragraph>
              <Paragraph><b>Email:</b> {contact.email}</Paragraph>
              <Paragraph><b>Phone:</b> {contact.phone}</Paragraph>
              <Paragraph><b>Relationship:</b> {contact.relationship}</Paragraph>
              {idx !== profile.emergencyContacts.length - 1 && <Divider />}
            </div>
          ))}
        </Panel>

        <Panel header="Uploaded Documents" key="7">
          {profile.documents?.length > 0 ? (
            profile.documents.map((doc: any, idx: number) => (
              <Paragraph key={idx}>
                <b>{doc.type.replace('_', ' ').toUpperCase()}:</b>{' '}
                <a href={doc.path} target="_blank" rel="noopener noreferrer">{doc.filename}</a>
              </Paragraph>
            ))
          ) : (
            <Paragraph>No documents uploaded.</Paragraph>
          )}
        </Panel>
      </Collapse>
    </div>
  );
};

export default ViewEmployeeProfilePage;
