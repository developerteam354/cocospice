export default function AboutPage() {
  return (
    <main style={{ padding: '40px 20px', maxWidth: 800, margin: '0 auto' }}>
      <h1>About Cocospice Indians Cuisine</h1>
      <p>Authentic Indian cuisine delivered to your doorstep.</p>

      <section style={{ marginTop: '2rem' }}>
        <h2>Find Us</h2>
        <address style={{ fontStyle: 'normal', lineHeight: 1.8 }}>
          <strong>Cocospice Indians Cuisine</strong><br />
          370 High Street<br />
          Lincoln, LN5 7RU<br />
          United Kingdom
        </address>
        <p style={{ marginTop: '1rem' }}>
          <a
            href="https://maps.app.goo.gl/YbpzoqBS73ckfJfS7"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Google Maps
          </a>
        </p>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>Delivery</h2>
        <p>We deliver within an 11 km radius of our Lincoln restaurant.</p>
      </section>
    </main>
  );
}
