const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-4">
            <div className="container mx-auto text-center">
                <p className="text-sm text-gray-500">
                    &copy; {new Date().getFullYear()} Developed by Krishna Singha. All rights reserved.
                </p>
            </div>
        </footer>
    );
}

export default Footer;