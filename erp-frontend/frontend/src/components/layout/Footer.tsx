const Footer = () => {
  return (
    <footer className="mt-8 border-t bg-white px-6 py-4 text-center text-sm text-gray-500">
      <p>
        © {new Date().getFullYear()} School ERP System. All Rights Reserved.
      </p>

      <p className="mt-1 text-xs text-gray-400">
        Developed for School Management Portal
      </p>
    </footer>
  );
};

export default Footer;