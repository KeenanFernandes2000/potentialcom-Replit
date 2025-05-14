import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="py-8 bg-gray-900 text-gray-400">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p>© {new Date().getFullYear()} Potential.com. All rights reserved.</p>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-[#14B6B8] transition-colors">
              <Linkedin size={20} />
            </a>
            <a href="#" className="hover:text-[#14B6B8] transition-colors">
              <Twitter size={20} />
            </a>
            <a href="#" className="hover:text-[#14B6B8] transition-colors">
              <Facebook size={20} />
            </a>
            <a href="#" className="hover:text-[#14B6B8] transition-colors">
              <Instagram size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
