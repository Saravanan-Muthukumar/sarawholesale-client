import { useState } from "react";
import { Mail, Phone, Send } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:9000";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send message");
      }

      setSuccess("Your message has been sent successfully.");
      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-white px-4 py-8">
      <section className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#071b3a]">
            Contact Us
          </h1>
          <p className="text-gray-600 mt-2">
            Have a question about products, delivery or bulk orders? Send us a
            message.
          </p>
        </div>

        <div className="grid md:grid-cols-[1fr_320px] gap-6">
          <form
            onSubmit={handleSubmit}
            className="border border-gray-200 rounded-xl p-5 shadow-sm"
          >
            {success && (
              <div className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                {success}
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Name *"
                name="name"
                value={form.name}
                onChange={handleChange}
              />

              <Input
                label="Email *"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
              />

              <Input
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />

              <Input
                label="Subject *"
                name="subject"
                value={form.subject}
                onChange={handleChange}
              />

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-[#071b3a] mb-1.5">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows="5"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-green-600"
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="mt-5 w-full h-11 bg-green-700 text-white rounded-lg font-bold hover:bg-green-800 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <Send size={17} />
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>

          <aside className="border border-gray-200 rounded-xl p-5 bg-green-50">
            <h2 className="font-bold text-[#071b3a] mb-4">Get in Touch</h2>

            <p className="flex items-center gap-2 text-sm text-[#071b3a] mb-3">
              <Phone size={17} className="text-green-700" />
              07424715150
            </p>

            <p className="flex items-center gap-2 text-sm text-[#071b3a] mb-3">
              <Mail size={17} className="text-green-700" />
              info@sarawholesalesupplies.co.uk
            </p>

            <p className="text-sm text-[#071b3a]/80 leading-6 mt-4">
              Monday - Friday
              <br />
              9:00am - 5:00pm
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Input({ label, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-sm font-bold text-[#071b3a] mb-1.5">
        {label}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={label.includes("*")}
        className="w-full h-10 border border-gray-300 rounded-lg px-3 outline-none focus:border-green-600"
      />
    </div>
  );
}