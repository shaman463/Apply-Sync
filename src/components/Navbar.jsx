import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import '../styles/Navbar.css';

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navigation = [
        { name: 'Home', href: '/' },
        { name: 'About', href: '/about' },
        { name: 'Services', href: '/services' },
        { name: 'Contact', href: '/contact' },
    ];

    return (
        <nav className="navbar">
            <div className="navbar-wrapper">
                <div className="navbar-inner">
                    {/* Logo */}
                    <div>
                        <span className="navbar-logo">ApplySync</span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="navbar-nav">{navigation.map((item) => (
                            <a key={item.name} href={item.href} className="navbar-link">{item.name}</a>
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
                                <img src="https://via.placeholder.com/32"alt="Profile"className="navbar-profile-img" />
                            </MenuButton>
                            <MenuItems className="navbar-menu-items">
                                <MenuItem>
                                    {({ focus }) => (
                                        <a href="/profile" className={`navbar-menu-item ${focus ? 'hover' : ''}`}> Profile </a>
                                    )}
                                </MenuItem>
                                <MenuItem>
                                    {({ focus }) => (
                                        <a href="/settings" className={`navbar-menu-item ${focus ? 'hover' : ''}`}> Settings </a>
                                    )}
                                </MenuItem>
                                <MenuItem>
                                    {({ focus }) => (
                                        <button className={`navbar-menu-item ${focus ? 'hover' : ''}`}> Logout </button>
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
                        <a key={item.name} href={item.href} className="navbar-mobile-link">{item.name}</a>
                    ))}
                </div>
            )}
        </nav>
    );
}
