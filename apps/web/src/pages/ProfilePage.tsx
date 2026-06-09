import { LogOut, Mail, MapPin, Phone, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api";
import type { ApiResponse } from "../types";

interface Profile {
  name: string;
  email: string;
  phone: string;
  birthday: string;
  memberSince: string;
  preferences: {
    categories: string[];
    metalColors: string[];
    occasions: string[];
  };
  address: {
    label: string;
    line1: string;
    city: string;
    state: string;
    pincode: string;
  };
  stats: {
    wishlistCount: number;
    cartCount: number;
    appointmentCount: number;
  };
}

export function ProfilePage() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Profile | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api<Profile>("/profile"),
    refetchInterval: 5000
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Omit<Profile, "stats" | "memberSince">) =>
      api<Profile>("/profile", { method: "PATCH", body: JSON.stringify(payload) }),
    onSuccess: (result) => {
      queryClient.setQueryData(["profile"], result);
      setFormData(null);
      setIsEditing(false);
    }
  });

  const profile = formData || data?.data;

  if (isLoading) {
    return (
      <div className="page-shell py-12">
        <div className="h-96 animate-pulse rounded-3xl bg-blush-100" />
      </div>
    );
  }

  if (!profile) return null;

  const memberDate = new Date(profile.memberSince);
  const memberYears = new Date().getFullYear() - memberDate.getFullYear();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData) return;

    const { stats, memberSince, ...submitData } = formData;
    updateMutation.mutate(submitData);
  };

  const handleInputChange = (path: string, value: string) => {
    if (!formData) return;

    const keys = path.split(".");
    const newData = structuredClone(formData);
    let current: any = newData;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setFormData(newData);
  };

  const handleArrayChange = (path: string, index: number, value: string) => {
    if (!formData) return;

    const keys = path.split(".");
    const newData = structuredClone(formData);
    let current: any = newData;

    for (let i = 0; i < keys.length; i++) {
      current = current[keys[i]];
    }

    current[index] = value;
    setFormData(newData);
  };

  return (
    <div className="page-shell py-12">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[.22em] text-gold-500">Your account</p>
          <h1 className="mt-3 font-display text-5xl text-plum-950">My profile</h1>
          <p className="mt-3 text-sm text-stone-500">
            Member since {memberDate.toLocaleDateString("en-IN", { year: "numeric", month: "long" })}
            {memberYears > 0 && ` • ${memberYears} ${memberYears === 1 ? "year" : "years"}`}
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setFormData(structuredClone(profile))}
            className="rounded-full bg-plum-900 px-6 py-3.5 text-sm font-semibold text-white"
          >
            Edit profile
          </button>
        )}
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_390px]">
        {isEditing && formData ? (
          <form onSubmit={handleSubmit} className="rounded-[2rem] bg-ivory-50 p-8 soft-shadow">
            <h2 className="font-display text-2xl">Edit your details</h2>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <Field
                label="Full name"
                value={formData.name}
                onChange={(value) => handleInputChange("name", value)}
              />
              <Field
                label="Email"
                type="email"
                value={formData.email}
                onChange={(value) => handleInputChange("email", value)}
              />
              <Field
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={(value) => handleInputChange("phone", value)}
              />
              <Field
                label="Birthday"
                type="date"
                value={formData.birthday}
                onChange={(value) => handleInputChange("birthday", value)}
              />
            </div>

            <h3 className="mt-8 font-display text-lg">Preferences</h3>
            <div className="mt-4 grid gap-5 sm:grid-cols-3">
              <MultiSelect
                label="Favorite categories"
                values={formData.preferences.categories}
                options={["rings", "earrings", "necklaces", "bracelets", "mangalsutras"]}
                onChange={(values) => {
                  const newData = structuredClone(formData);
                  newData.preferences.categories = values;
                  setFormData(newData);
                }}
              />
              <MultiSelect
                label="Preferred metals"
                values={formData.preferences.metalColors}
                options={["Yellow Gold", "Rose Gold", "White Gold"]}
                onChange={(values) => {
                  const newData = structuredClone(formData);
                  newData.preferences.metalColors = values;
                  setFormData(newData);
                }}
              />
              <MultiSelect
                label="Occasions"
                values={formData.preferences.occasions}
                options={["Everyday", "Gift", "Wedding", "Festive", "Engagement"]}
                onChange={(values) => {
                  const newData = structuredClone(formData);
                  newData.preferences.occasions = values;
                  setFormData(newData);
                }}
              />
            </div>

            <h3 className="mt-8 font-display text-lg">Address</h3>
            <div className="mt-4 grid gap-5">
              <Field
                label="Label"
                value={formData.address.label}
                onChange={(value) => handleInputChange("address.label", value)}
              />
              <Field
                label="Address line"
                value={formData.address.line1}
                onChange={(value) => handleInputChange("address.line1", value)}
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="City"
                  value={formData.address.city}
                  onChange={(value) => handleInputChange("address.city", value)}
                />
                <Field
                  label="State"
                  value={formData.address.state}
                  onChange={(value) => handleInputChange("address.state", value)}
                />
              </div>
              <Field
                label="Pincode"
                value={formData.address.pincode}
                onChange={(value) => handleInputChange("address.pincode", value)}
              />
            </div>

            <div className="mt-8 flex gap-3">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1 rounded-full bg-plum-900 py-4 text-sm font-semibold text-white disabled:opacity-40"
              >
                {updateMutation.isPending ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData(null);
                  setIsEditing(false);
                }}
                className="flex-1 rounded-full border border-stone-300 bg-white py-4 text-sm font-semibold text-plum-900"
              >
                Cancel
              </button>
            </div>

            {updateMutation.isError && (
              <p className="mt-4 text-sm text-red-700">{updateMutation.error.message}</p>
            )}
          </form>
        ) : (
          <div className="space-y-8">
            <Section title="Personal information">
              <DetailRow icon={<span className="font-display text-2xl">👤</span>} label="Full name" value={profile.name} />
              <DetailRow icon={<Mail size={18} />} label="Email" value={profile.email} />
              <DetailRow icon={<Phone size={18} />} label="Phone" value={profile.phone} />
              <DetailRow
                icon={<span className="font-display text-2xl">🎂</span>}
                label="Birthday"
                value={new Date(profile.birthday).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long"
                })}
              />
            </Section>

            <Section title="Your preferences">
              {profile.preferences.categories.length > 0 && (
                <DetailRow
                  icon={<Sparkles size={18} />}
                  label="Favorite categories"
                  value={profile.preferences.categories.join(", ")}
                />
              )}
              {profile.preferences.metalColors.length > 0 && (
                <DetailRow
                  icon={<span>✨</span>}
                  label="Preferred metals"
                  value={profile.preferences.metalColors.join(", ")}
                />
              )}
              {profile.preferences.occasions.length > 0 && (
                <DetailRow
                  icon={<span>🎉</span>}
                  label="Favorite occasions"
                  value={profile.preferences.occasions.join(", ")}
                />
              )}
            </Section>

            <Section title="Delivery address">
              <DetailRow icon={<MapPin size={18} />} label={profile.address.label} value={profile.address.line1} />
              <DetailRow
                icon={<span />}
                label="City"
                value={`${profile.address.city}, ${profile.address.state} ${profile.address.pincode}`}
              />
            </Section>
          </div>
        )}

        <aside className="h-fit rounded-3xl bg-blush-100 p-7 lg:sticky lg:top-28">
          <h3 className="font-display text-xl">Your activity</h3>
          <div className="mt-6 space-y-4">
            <StatItem label="Wishlisted items" value={profile.stats.wishlistCount} />
            <StatItem label="Items in bag" value={profile.stats.cartCount} />
            <StatItem label="Appointments booked" value={profile.stats.appointmentCount} />
          </div>
          <button className="mt-8 flex w-full items-center justify-center gap-2 rounded-full border border-stone-300 bg-white py-3.5 text-sm font-semibold text-plum-900 transition hover:bg-plum-50">
            <LogOut size={16} />
            Sign out
          </button>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[2rem] bg-ivory-50 p-8">
      <h2 className="font-display text-2xl text-plum-950">{title}</h2>
      <div className="mt-6 space-y-4">{children}</div>
    </section>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1 text-stone-400">{icon}</div>
      <div className="flex-1">
        <p className="text-xs uppercase tracking-widest text-stone-400">{label}</p>
        <p className="mt-1 font-medium text-plum-950">{value}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <input
        required
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl border border-stone-200 bg-transparent p-3 font-normal outline-none"
      />
    </label>
  );
}

function MultiSelect({
  label,
  values,
  options,
  onChange
}: {
  label: string;
  values: string[];
  options: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => {
              if (values.includes(option)) {
                onChange(values.filter((v) => v !== option));
              } else {
                onChange([...values, option]);
              }
            }}
            className={`rounded-full px-4 py-2 text-xs font-medium transition ${
              values.includes(option)
                ? "bg-plum-900 text-white"
                : "border border-stone-300 bg-white text-plum-900 hover:border-plum-900"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-stone-600">{label}</span>
      <strong className="text-2xl text-plum-900">{value}</strong>
    </div>
  );
}
