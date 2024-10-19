import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer style={styles.footer}>
            <div style={styles.container}>
                <p>&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
                <nav>
                    <a href="/privacy-policy" style={styles.link}>Privacy Policy</a> |
                    <a href="/terms-of-service" style={styles.link}>Terms of Service</a> |
                    <a href="/contact" style={styles.link}>Contact</a>
                </nav>
            </div>
        </footer>
    );
};

const styles = {
    footer: {
        backgroundColor: '#333',
        color: '#fff',
        padding: '1rem 0',
        textAlign: 'center' as const,
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1rem',
    },
    link: {
        color: '#fff',
        margin: '0 0.5rem',
        textDecoration: 'none',
    },
};

export default Footer;
