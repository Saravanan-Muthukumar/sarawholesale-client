import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, Send, CheckCircle } from "lucide-react";

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
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      setSuccess(true);

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
    <main className="bg-white px-4 py-8 mb-16 md:mb-24">
      <section className="max-w-5xl mx-auto">
        {success ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border border-green-200 rounded-2xl shadow-sm p-8 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-5">
                <CheckCircle size={34} className="text-green-700" />
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-[#071b3a] mb-3">
                Message Sent Successfully
              </h1>

              <p className="text-gray-600 leading-7 mb-6">
                Thank you for contacting SARA Wholesale Supplies.
                <br />
                We have received your enquiry and a member of our team will
                respond as soon as possible.
              </p>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-green-800">
                  A confirmation email has been sent to your email address.
                </p>
              </div>

              <Link
                to="/"
                className="inline-flex items-center justify-center h-11 px-6 bg-green-700 text-white rounded-lg font-medium hover:bg-green-800"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-[#071b3a]">
                Contact Us
              </h1>

              <p className="text-gray-600 mt-2">
                Have a question about products, delivery or bulk orders? Send us
                a message.
              </p>
            </div>

            <div className="grid md:grid-cols-[1fr_320px] gap-6">
              <form
                onSubmit={handleSubmit}
                className="border border-gray-200 rounded-xl p-5 shadow-sm"
              >
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
                  type="submit"
                  disabled={loading}
                  className="mt-5 w-full h-11 bg-green-700 text-white rounded-lg font-bold hover:bg-green-800 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <Send size={17} />
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>

              <aside className="border border-gray-200 rounded-xl p-5 bg-green-50">
                <h2 className="font-bold text-[#071b3a] mb-4">
                  Get in Touch
                </h2>

                <p className="flex items-center gap-2 text-sm text-[#071b3a] mb-3">
                  <Phone size={17} className="text-green-700" />
                  07424 715150
                </p>

                <p className="flex items-center gap-2 text-sm text-[#071b3a] mb-3">
                  <Mail size={17} className="text-green-700" />
                  sales@sarawholesale.co.uk
                </p>

                <p className="text-sm text-[#071b3a]/80 leading-6 mt-4">
                  Monday - Friday
                  <br />
                  9:00am - 5:00pm
                </p>
              </aside>
            </div>
          </>
        )}
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