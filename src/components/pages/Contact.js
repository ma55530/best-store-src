import React from 'react';

export default function Contact() {
    const [formStatus, setFormStatus] = React.useState(null);
    const [showCopy, setShowCopy] = React.useState(false);

    function handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const data = new FormData(form);
        fetch('https://formspree.io/f/mvgajqwv', {
            method: 'POST',
            body: data,
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                setFormStatus('success');
                form.reset();
            } else {
                setFormStatus('error');
            }
        })
        .catch(() => setFormStatus('error'));
    }

    function handleCopyEmail(e) {
        e.preventDefault();
        navigator.clipboard.writeText('matija.akrap@gmail.com');
        setShowCopy(true);
        setTimeout(() => setShowCopy(false), 2000);
    }

    return(
        <div className="container my-5">
            <div className="row justify-content-center">
                <div className="col-md-8">
                    <div className="card shadow-lg border-0">
                        <div className="row g-0 align-items-center">
                            <div className="col-md-4 text-center p-4">
                                <img src={process.env.PUBLIC_URL + "/icon.png"} alt="Profile" className="img-fluid rounded-circle mb-3" style={{width:120, height:120, objectFit:'cover', border:'4px solid #0d6efd'}} />
                                <h4 className="fw-bold mb-0">Matija Akrap</h4>
                                <div className="text-muted mb-2">CS Student</div>
                                <div className="mb-3 position-relative">
                                    <button
                                        className="btn btn-outline-primary btn-sm m-1"
                                        onClick={handleCopyEmail}
                                        type="button"
                                    >
                                        <i className="bi bi-envelope"></i> Email
                                    </button>
                                    <a href="https://www.linkedin.com/in/matija-akrap-0837ab176/" target="_blank" rel="noopener noreferrer" className="btn btn-outline-info btn-sm m-1"><i className="bi bi-linkedin"></i> LinkedIn</a>
                                    <a href="https://github.com/ma55530" target="_blank" rel="noopener noreferrer" className="btn btn-outline-dark btn-sm m-1"><i className="bi bi-github"></i> GitHub</a>
                                    {/* Notification below the buttons, centered and floating */}
                                    {showCopy && (
                                        <div className="d-flex justify-content-center w-100" style={{position:'absolute', left:0, top:'100%', marginTop:8, zIndex:1000}}>
                                            <div className="alert alert-success py-1 px-3 mb-0 shadow-sm" style={{fontSize:'0.95rem', borderRadius:8}}>
                                                Copied to clipboard!
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="col-md-8 p-4">
                                <h2 className="mb-3">About Me</h2>
                                <p>
                                    I’m Matija Akrap, a computer science student at FER, University of Zagreb 
                                    with a passion in learning modern technologies and building cool stuff.
                                </p>
                                <h5 className="mt-4">Skills</h5>
                                <ul className="list-inline mb-3">
                                    <li className="list-inline-item badge bg-primary m-1">C/C++</li>
                                    <li className="list-inline-item badge bg-primary m-1">Python</li>
                                    <li className="list-inline-item badge bg-primary m-1">Java</li>
                                    <li className="list-inline-item badge bg-primary m-1">JavaScript</li>
                                    <li className="list-inline-item badge bg-primary m-1">React</li>
                                    <li className="list-inline-item badge bg-primary m-1">Node.js</li>
                                    <li className="list-inline-item badge bg-primary m-1">SQL</li>
                                    <li className="list-inline-item badge bg-primary m-1">Git</li>
                                    
                                </ul>
                                <h5 className="mt-4">Portfolio</h5>
                                <ul>
                                    <li><a href="https://github.com/ma55530/best-store-src" target="_blank" rel="noopener noreferrer">Best Store (this project)</a></li>
                                    <li><a href="https://github.com/ma55530" target="_blank" rel="noopener noreferrer">See more on my GitHub</a></li>
                                </ul>
                                <h5 className="mt-4">Location</h5>
                                <p className="mb-0">Zagreb, Croatia</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Contact form as a separate card below */}
            <div className="row justify-content-center mt-4">
                <div className="col-md-8">
                    <div className="card shadow border-0">
                        <div className="card-body">
                            <h4 className="mb-3">Contact Me</h4>
                            {formStatus === 'success' ? (
                                <div className="alert alert-success">Hvala Vam! Vaša je poruka poslana.</div>
                            ) : (
                                <form onSubmit={handleFormSubmit} className="mb-3" autoComplete="off" noValidate>
                                    <div className="mb-2">
                                        <label htmlFor="name" className="form-label">Your Name</label>
                                        <input type="text" className="form-control" id="name" name="name" required />
                                    </div>
                                    <div className="mb-2">
                                        <label htmlFor="email" className="form-label">Your Email</label>
                                        <input type="email" className="form-control" id="email" name="email" required />
                                    </div>
                                    <div className="mb-2">
                                        <label htmlFor="message" className="form-label">Message</label>
                                        <textarea className="form-control" id="message" name="message" rows="4" required></textarea>
                                    </div>
                                    <button type="submit" className="btn btn-primary">Send Message</button>
                                    {formStatus === 'error' && (
                                        <div className="alert alert-danger mt-2">Sorry, there was a problem. Please try again later.</div>
                                    )}
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}