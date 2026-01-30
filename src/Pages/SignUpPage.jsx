import React, { useState } from 'react';
import axios from 'axios';
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBInput, MDBIcon } from 'mdb-react-ui-kit';
import '../styles/LoginPage.css';
import { useNavigate } from "react-router-dom";

function SignUpPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: ""
    });
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const res = await axios.post("http://localhost:5000/api/auth/signup", {
                FirstName: formData.firstName,
                LastName: formData.lastName,
                email: formData.email,
                password: formData.password
            });

            setMessage("Account created successfully ✓");
            const token = res.data.token;
            localStorage.setItem("authToken", token);
            
            // Dispatch custom event for extension (more reliable than storage event)
            window.dispatchEvent(new CustomEvent('applysync-token-saved', {
              detail: { token: token }
            }));
            
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
            
            // Redirect to dashboard after successful signup
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
        } catch (err) {
            setMessage(err.response?.data?.message || "Signup failed ❌");
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
                            <h3 className='login-card-title'>Sign Up</h3>
                            
                            {message && (
                                <div className={`alert ${message.includes('failed') || message.includes('❌') ? 'alert-error' : 'alert-success'}`}>
                                    {message}
                                </div>
                            )}

                            <form onSubmit={handleSignUp}>
                                <MDBRow className='form-name-row'>
                                    <MDBCol className='form-name-col'>
                                        <MDBInput 
                                            wrapperClass='mb-4' 
                                            id='firstName' 
                                            name='firstName'
                                            type='text' 
                                            placeholder='First Name'
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </MDBCol>
                                    <MDBCol className='form-name-col'>
                                        <MDBInput 
                                            wrapperClass='mb-4' 
                                            placeholder='Last Name' 
                                            id='lastName'
                                            name='lastName'
                                            type='text'
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </MDBCol>
                                </MDBRow>

                                <MDBInput 
                                    wrapperClass='mb-4' 
                                    placeholder='Email address' 
                                    id='email'
                                    name='email'
                                    type='email'
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                                
                                <MDBInput 
                                    wrapperClass='mb-4' 
                                    placeholder='Password' 
                                    id='password'
                                    name='password'
                                    type='password'
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />

                                <button 
                                    type='submit'
                                    disabled={loading}
                                    className='login-btn'
                                >
                                    {loading ? 'Creating Account...' : 'SIGN UP'}
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

export default SignUpPage;