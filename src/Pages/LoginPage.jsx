import React, { useState } from 'react';
import axios from 'axios';
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBInput, MDBIcon } from 'mdb-react-ui-kit';
import '../styles/LoginPage.css';
import { useNavigate } from "react-router-dom";


const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const res = await axios.post("http://localhost:5000/api/auth/login", {
                email,
                password,
            });

            setMessage("Login successful ✓");
            const token = res.data.token;
            localStorage.setItem("authToken", token);
            localStorage.setItem("userData", JSON.stringify(res.data.user));
            
            // Store token in Chrome extension storage
            if (typeof chrome !== 'undefined' && chrome.runtime) {
                chrome.runtime.sendMessage(
                  { action: "saveToken", token: token },
                  (response) => {
                    if (response?.success) {
                      console.log("Token saved to extension");
                    }
                  }
                );
            }
            
            // Redirect to dashboard after successful login
             setTimeout(() => navigate("/dashboard"), 800);
        } catch (err) {
            setMessage(err.response?.data?.message || "Login failed ❌");
        } finally {
            setLoading(false);
        }
    };

    return (
        <MDBContainer fluid className='background-radial-gradient'>
            <MDBRow className='login-row'>
                <MDBCol md='5' className='login-text-section'>
                    <h1 className="login-heading">
                        Check All your Jobs <br />
                        <span>At One Place</span>
                    </h1>

                    <p className='login-subtext'>
                        ApplySync simplifies the entire job application process by allowing
                        users to manage, monitor, and organize applications from multiple platforms
                        in one place. It helps track statuses, deadlines, recruiter responses, and
                        follow-ups, ensuring no opportunity is missed. With intelligent insights,
                        reminders, and seamless data syncing, the system provides a smooth and
                        efficient way to stay on top of every job application.
                    </p>
                </MDBCol>

                <MDBCol md='7' className='login-form-section'>
                    <div id="radius-shape-1"></div>
                    <div id="radius-shape-2"></div>

                    <MDBCard className='bg-glass'>
                        <MDBCardBody className='login-card-body'>
                            <h3 className='login-card-title'>Login</h3>
                            
                            {message && (
                                <div className={`alert ${message.includes('failed') || message.includes('❌') ? 'alert-error' : 'alert-success'}`}>
                                    {message}
                                </div>
                            )}

                            <form onSubmit={handleLogin}>
                                <MDBInput 
                                    wrapperClass='mb-4' 
                                    id='email' 
                                    type='email' 
                                    placeholder='Email'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                
                                <MDBInput 
                                    wrapperClass='mb-4' 
                                    placeholder='Password' 
                                    id='password' 
                                    type='password'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />

                                <button 
                                    type='submit'
                                    disabled={loading}
                                    className='login-btn'
                                >
                                    {loading ? 'Logging in...' : 'Login'}
                                </button>
                            </form>

                            <div className="social-login-section">
                                <p>or sign up with:</p>

                                <button className='social-btn facebook'>
                                    <MDBIcon fab icon='facebook-f' />
                                </button>

                                <button className='social-btn google'>
                                    <MDBIcon fab icon='google' />
                                </button>

                                <button className='social-btn twitter'>
                                    <MDBIcon fab icon='twitter' />
                                </button>

                                <button className='social-btn github'>
                                    <MDBIcon fab icon='github' />
                                </button>
                            </div>
                        </MDBCardBody>
                    </MDBCard>
                </MDBCol>
            </MDBRow>
        </MDBContainer>
    );
}

export default LoginPage;