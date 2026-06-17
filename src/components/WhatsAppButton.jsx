import { useLocation } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";

export default function WhatsAppChatButton() {
  const location = useLocation();

  const hiddenPages = ["/cart", "/checkout"];

  if (hiddenPages.includes(location.pathname)) {
    return null;
  }

  return (
    <a
      href="https://wa.me/447424715150?text=Hello%20SARA%20Wholesale,%20I%20need%20help%20with%20an%20order."
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp Chat"
      className="fixed bottom-5 right-5 z-[9999] flex items-center justify-center
                 w-14 h-14 md:w-16 md:h-16
                 bg-[#25D366] text-white rounded-full
                 shadow-xl hover:scale-110 transition"
    >
      <FaWhatsapp size={34} />
    </a>
  );
}