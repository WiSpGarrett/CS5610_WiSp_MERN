import React, { useEffect, useState } from 'react';
import { Container, Alert, Spinner, Carousel, Row, Col, Image, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Homepage() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/photos`);
        setPhotos(Array.isArray(res.data?.photos) ? res.data.photos : []);
      } catch (e) {
        setError('Failed to load photos');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <Container className="mt-4">
      <h1>Featured Photos</h1>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="d-flex align-items-center gap-2">
          <Spinner animation="border" size="sm" />
          <span>Loading…</span>
        </div>
      ) : photos.length === 0 ? (
        <p>No photos yet.</p>
      ) : (
        <Carousel interval={null} indicators={false} variant="dark">
          {photos.map((p) => {
            const owner = p.userId && typeof p.userId === 'object' ? p.userId : null;
            const lat = p?.location?.latitude;
            const lng = p?.location?.longitude;
            return (
              <Carousel.Item key={p._id}>
                <Row className="align-items-center">
                  <Col md={8} className="mb-3 mb-md-0">
                    <Image src={p.gcsUrl} alt={p.title} fluid rounded />
                  </Col>
                  <Col md={4}>
                    <h3 className="mb-2" title={p.title}>{p.title}</h3>
                    {owner && (
                      <div className="mb-2">
                        <div><strong>By:</strong> {owner.name || 'Unknown'}</div>
                        {owner.email && <div className="text-muted" style={{ fontSize: '0.9rem' }}>{owner.email}</div>}
                      </div>
                    )}
                    <div className="mb-2">
                      <strong>Location:</strong>{' '}
                      {Number.isFinite(Number(lat)) && Number.isFinite(Number(lng)) ? (
                        <div className="d-flex align-items-center gap-2">
                          <Link to={`/map?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`}>
                            {lat}, {lng}
                          </Link>
                          <Button
                            as={Link}
                            to={`/map?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`}
                            size="sm"
                            variant="primary"
                            aria-label="View on Map"
                          >
                            View on Map
                          </Button>
                        </div>
                      ) : (
                        <span>Unknown</span>
                      )}
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                      Taken: {new Date(p.createdAt).toLocaleString()}
                    </div>
                  </Col>
                </Row>
              </Carousel.Item>
            );
          })}
        </Carousel>
      )}
    </Container>
  );
}

export default Homepage; 