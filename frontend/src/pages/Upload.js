import React, { useCallback, useMemo, useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

function Upload() {
  // Local form state
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // Handle file selection via drag-and-drop.
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { 'image/*': [] },
    maxFiles: 1,
  });

  // Themed dropzone styling.
  const dropzoneStyle = useMemo(() => ({
    border: '2px dashed var(--color-border)',
    borderRadius: '12px',
    padding: '40px',
    minHeight: '360px',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: isDragActive ? 'rgba(255,255,255,0.05)' : 'var(--color-surface)',
    cursor: 'pointer',
    color: 'var(--color-text)',
    fontSize: '1.1rem'
  }), [isDragActive]);

  // Submit the form to the backend as multipart/form-data.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!file || !title || !latitude || !longitude) {
      setMessage({ variant: 'warning', text: 'Please provide file, title, latitude and longitude.' });
      return;
    }

    const saved = localStorage.getItem('login');
    const user = saved ? JSON.parse(saved) : null;
    const userId = user?.dbId;

    if (!userId) {
      setMessage({ variant: 'danger', text: 'You must be logged in to upload.' });
      return;
    }

    const form = new FormData();
    form.append('photo', file);
    form.append('title', title);
    form.append('latitude', latitude);
    form.append('longitude', longitude);

    setSubmitting(true);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/photos`,
        form,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-user-id': userId,
          }
        }
      );
      setMessage({ variant: 'success', text: `Uploaded: ${res.data?.photo?.title || 'Photo'}` });
      setFile(null);
      setTitle('');
      setLatitude('');
      setLongitude('');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Upload failed';
      setMessage({ variant: 'danger', text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="mt-4">
      <h1>Upload Photos</h1>

      {message && (
        <Alert variant={message.variant} onClose={() => setMessage(null)} dismissible>
          {message.text}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={8}>
            <div {...getRootProps({ style: dropzoneStyle })}>
              <input {...getInputProps()} />
              {file ? (
                <div>
                  <div>Selected: {file.name} ({Math.round(file.size / 1024)} KB)</div>
                  <div>Drag another file here to replace</div>
                </div>
              ) : (
                <div>{isDragActive ? 'Drop the file here…' : 'Drag & drop a photo here, or click to choose a file'}</div>
              )}
            </div>
          </Col>
          <Col md={4}>
            <Card body>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control value={title} onChange={(e) => setTitle(e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Latitude</Form.Label>
                <Form.Control value={latitude} onChange={(e) => setLatitude(e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Longitude</Form.Label>
                <Form.Control value={longitude} onChange={(e) => setLongitude(e.target.value)} />
              </Form.Group>
              <div className="d-grid">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Uploading…' : 'Upload'}
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
}

export default Upload; 