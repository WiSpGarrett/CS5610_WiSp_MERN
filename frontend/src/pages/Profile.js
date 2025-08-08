import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Form } from 'react-bootstrap';
import axios from 'axios';

function Profile() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deletingSelected, setDeletingSelected] = useState(false);

  const getUserId = () => {
    const saved = localStorage.getItem('login');
    const user = saved ? JSON.parse(saved) : null;
    return user?.dbId || null;
  };

  const loadPhotos = async () => {
    setLoading(true);
    setError(null);
    const userId = getUserId();
    if (!userId) {
      setError('You must be logged in to view your photos.');
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/photos`, {
        params: { userId }
      });
      setPhotos(res.data?.photos || []);
    } catch (e) {
      setError('Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (photoId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) next.delete(photoId);
      else next.add(photoId);
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    const userId = getUserId();
    if (!userId) {
      setError('Missing user id');
      return;
    }
    if (selectedIds.size === 0) return;

    setDeletingSelected(true);
    setError(null);
    try {
      const idsToDelete = Array.from(selectedIds);
      const results = await Promise.allSettled(
        idsToDelete.map((id) =>
          axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/photos/${id}`, {
            headers: { 'x-user-id': userId }
          })
        )
      );

      const successfulIds = idsToDelete.filter((_, idx) => results[idx].status === 'fulfilled');
      const failedCount = idsToDelete.length - successfulIds.length;

      if (successfulIds.length > 0) {
        setPhotos((prev) => prev.filter((p) => !successfulIds.includes(p._id)));
      }
      setSelectedIds(new Set());

      if (failedCount > 0) {
        setError(`Failed to delete ${failedCount} photo(s).`);
      }
    } catch (e) {
      setError('Failed to delete selected photos');
    } finally {
      setDeletingSelected(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  return (
    <Container className="mt-4">
      <h1>My Photos</h1>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="d-flex align-items-center gap-2">
          <Spinner animation="border" size="sm" />
          <span>Loading...</span>
        </div>
      ) : photos.length === 0 ? (
        <p>You don’t have any photos yet.</p>
      ) : (
        <>
          <Row xs={1} sm={2} md={3} lg={4} className="g-3">
            {photos.map((p) => (
              <Col key={p._id}>
                <Card className="position-relative">
                  <Form.Check
                    type="checkbox"
                    className="position-absolute top-0 end-0 m-2 p-2 bg-white rounded"
                    checked={selectedIds.has(p._id)}
                    onChange={() => toggleSelect(p._id)}
                    disabled={deletingSelected}
                    aria-label={`Select ${p.title}`}
                  />
                  <Card.Img variant="top" src={p.gcsUrl} alt={p.title} />
                  <Card.Body>
                    <Card.Title className="fs-6 text-truncate" title={p.title}>{p.title}</Card.Title>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <div className="d-flex justify-content-end mt-3">
            <Button
              variant="danger"
              onClick={handleDeleteSelected}
              disabled={selectedIds.size === 0 || deletingSelected}
            >
              {deletingSelected ? 'Deleting…' : `Delete selected (${selectedIds.size})`}
            </Button>
          </div>
        </>
      )}
    </Container>
  );
}

export default Profile; 