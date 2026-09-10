export default function Welcome() {
  return (
    <section className="welcome-section">
      <div className="welcome-container">

        <div className="welcome-content">

          <span className="welcome-badge">
            Welcome to Next.js
          </span>

          <h1>
            Build Something
            <span> Amazing</span>
          </h1>

          <p>
            Welcome to your new Next.js project. Start building
            beautiful, fast and modern web experiences.
          </p>

          <div className="welcome-buttons">
            <a href="#start" className="primary-button">
              Get Started
            </a>

            <a href="#learn" className="secondary-button">
              Learn More
            </a>
          </div>

        </div>

        <div className="welcome-card">

          <div className="card-icon">
            ⚡
          </div>

          <h2>
            Next.js
          </h2>

          <p>
            Fast, modern and scalable React framework.
          </p>

          <div className="card-line"></div>

          <div className="card-features">
            <div>
              <strong>01</strong>
              <span>Fast</span>
            </div>

            <div>
              <strong>02</strong>
              <span>Modern</span>
            </div>

            <div>
              <strong>03</strong>
              <span>Scalable</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}