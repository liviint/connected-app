'use client'

import { useEffect, useState } from "react";
import { useRouter , useParams} from "expo-router";
import { api } from "../../../api";

export default function AddEdit() {
  const { id } = useParams();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    frequency: "daily",
    reminder_time: "",
    color: "#FF6B6B",
    icon: "🔥",
  });

  const [errors, setErrors] = useState({
    title: "",
    reminder_time: "",
  });

  const [loading, setLoading] = useState(false);

  // --------------------------
  // Handlers
  // --------------------------
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validate = () => {
    let ok = true;

    if (!form.title.trim()) {
      ok = false;
      setErrors((prev) => ({ ...prev, title: "Please write something in your title." }));
    }

    if (!form.reminder_time) {
      ok = false;
      setErrors((prev) => ({ ...prev, reminder_time: "Please select a reminder time." }));
    }

    return ok;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      const url = id ? `habits/${id}/` : "habits/";
      const method = id ? "PUT" : "POST";

      await api({
        url,
        method,
        data: form,
      });

      // Important: small delay prevents push warning in some cases
      setTimeout(() => {
        router.push("/habits");
      }, 10);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------
  // Fetch habit on edit
  // --------------------------
  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    const fetchHabit = async () => {
      try {
        const res = await api.get(`habits/${id}/`);
        if (isMounted) setForm(res.data);
      } catch (err) {
        console.log("Fetch error:", err);
      }
    };

    fetchHabit();
    return () => (isMounted = false);
  }, [id]);

  // --------------------------
  // UI
  // --------------------------
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="page-title">{id ? "Edit Habit" : "Create a Habit"}</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow border border-[#F4E1D2] grid gap-4"
      >
        <div>
          <label className="block font-semibold mb-1 text-[#2E8B8B]">Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl"
            placeholder="e.g., Drink Water"
          />
          {errors.title && <p className="error">{errors.title}</p>}
        </div>

        <div>
          <label className="block font-semibold mb-1 text-[#2E8B8B]">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl"
            placeholder="Optional details..."
          />
        </div>

        <div>
          <label className="block font-semibold mb-1 text-[#2E8B8B]">Frequency</label>
          <select
            name="frequency"
            value={form.frequency}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold mb-1 text-[#2E8B8B]">Reminder Time</label>
          <input
            type="time"
            name="reminder_time"
            value={form.reminder_time}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl"
          />
          {errors.reminder_time && <p className="error">{errors.reminder_time}</p>}
        </div>

        <div>
          <label className="block font-semibold mb-1 text-[#2E8B8B]">Color</label>
          <input
            type="color"
            name="color"
            value={form.color}
            onChange={handleChange}
            className="h-12 w-full border rounded-xl cursor-pointer"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1 text-[#2E8B8B]">Icon</label>
          <input
            name="icon"
            value={form.icon}
            onChange={handleChange}
            className="w-full p-3 border rounded-xl"
            placeholder="e.g., 🔥 💧 🌱"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#2E8B8B] text-white font-bold p-4 rounded-xl hover:bg-[#247070] transition"
          disabled={loading}
        >
          {loading ? (id ? "Updating..." : "Creating...") : id ? "Edit Habit" : "Create Habit"}
        </button>
      </form>
    </div>
  );
}
