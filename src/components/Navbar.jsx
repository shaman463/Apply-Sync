import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import '../styles/Navbar.css';
import { Link, useNavigate } from "react-router-dom";


export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const navigation = [
        { name: 'Home', href: '/' },
        { name: 'About', href: '/about' },
        { name: 'Services', href: '/services' },
        { name: 'Contact', href: '/contact' },
    ];

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        navigate("/");
    };

    return (
        <nav className="navbar">
            <div className="navbar-wrapper">
                <div className="navbar-inner">
                    {/* Logo */}
                    <div>
                        <Link to="/" className="navbar-logo">ApplySync</Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="navbar-nav">{navigation.map((item) => (
                            <Link key={item.name} to={item.href} className="navbar-link">{item.name}</Link>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="navbar-right">
                        {/* Notifications */}
                        <button className="navbar-btn">
                            <BellIcon className="navbar-icon" />
                        </button>

                        {/* Profile Menu */}
                        <Menu as="div" className="navbar-menu">
                            <MenuButton className="navbar-profile-btn">
                                <img src="https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaGAtaA3AW1KSnjsdMt7-U_3EZElZ0="
                                alt="Profile"className="navbar-profile-img" />
                            </MenuButton>
                            <MenuItems className="navbar-menu-items">
                                <MenuItem>
                                    {({ focus }) => (
                                        <Link to="/profile" className={`navbar-menu-item ${focus ? 'hover' : ''}`}> Profile </Link>
                                    )}
                                </MenuItem>
                                <MenuItem>
                                    {({ focus }) => (
                                        <Link to="/settings" className={`navbar-menu-item ${focus ? 'hover' : ''}`}> Settings </Link>
                                    )}
                                </MenuItem>
                                <MenuItem>
                                    {({ focus }) => (
                                        <button onClick={handleLogout} className={`navbar-menu-item ${focus ? 'hover' : ''}`}> Logout </button>
                                    )}
                                </MenuItem>
                            </MenuItems>
                        </Menu>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="navbar-mobile-btn"
                        >
                            {mobileMenuOpen ? (
                                <XMarkIcon className="navbar-icon" />
                            ) : (
                                <Bars3Icon className="navbar-icon" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {mobileMenuOpen && (
                <div className="navbar-mobile-menu">
                    {navigation.map((item) => (
                        <Link key={item.name} to={item.href} className="navbar-mobile-link">{item.name}</Link>
                    ))}
                </div>
            )}
        </nav>
    );
}
