
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase-browser";

type Address = {
  id: string;
  label: "Home" | "Work" | "Other";
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
};

type AddressForm = Omit<Address, "id">;

const emptyForm: AddressForm = {
  label: "Home",
  recipient_name: "",
  phone: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "India",
  is_default: false,
};

const inputClass =
  "w-full border border-[#BFDBFE] bg-white px-4 py-3 text-sm outline-none focus:border-[#3B82F6]";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;

  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }

  return "An unexpected error occurred. Please try again.";
}

export default function AccountAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState<AddressForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadAddresses = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      const { data, error: fetchError } = await supabase
        .from("customer_addresses")
        .select(
          "id,label,recipient_name,phone,address_line1,address_line2,city,state,postal_code,country,is_default,created_at"
        )
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setAddresses((data ?? []) as Address[]);
    } catch (err) {
      console.error("Could not load addresses:", err);
      setError(`Unable to load addresses: ${getErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAddresses();
  }, [loadAddresses]);

  function updateField<K extends keyof AddressForm>(
    field: K,
    value: AddressForm[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function startNewAddress() {
    setEditingId(null);
    setForm({
      ...emptyForm,
      is_default: addresses.length === 0,
    });
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function startEditing(address: Address) {
    setEditingId(address.id);

    const {
      id: _id,
      ...addressForm
    } = address;

    setForm(addressForm);
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function cancelEditing() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
  }

  function validateForm(): string | null {
    if (
      form.recipient_name.trim().length < 2 ||
      form.recipient_name.trim().length > 100
    ) {
      return "Recipient name must contain 2–100 characters.";
    }

    if (!/^[0-9]{10}$/.test(form.phone)) {
      return "Enter a valid 10-digit Indian mobile number.";
    }

    if (
      form.address_line1.trim().length < 3 ||
      form.address_line1.trim().length > 150
    ) {
      return "Address line 1 must contain 3–150 characters.";
    }

    if (form.address_line2.trim().length > 150) {
      return "Address line 2 cannot exceed 150 characters.";
    }

    if (
      form.city.trim().length < 2 ||
      form.city.trim().length > 80
    ) {
      return "City must contain 2–80 characters.";
    }

    if (
      form.state.trim().length < 2 ||
      form.state.trim().length > 80
    ) {
      return "State must contain 2–80 characters.";
    }

    if (!/^[0-9]{6}$/.test(form.postal_code)) {
      return "Enter a valid six-digit Indian PIN code.";
    }

    if (
      form.country.trim().length < 2 ||
      form.country.trim().length > 56
    ) {
      return "Country must contain 2–56 characters.";
    }

    return null;
  }

  async function saveAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();

      // Identify the authenticated customer.
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        throw new Error("Please sign in again before saving an address.");
      }

      const cleanForm: AddressForm = {
        ...form,
        recipient_name: form.recipient_name.trim(),
        phone: form.phone.trim(),
        address_line1: form.address_line1.trim(),
        address_line2: form.address_line2.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        postal_code: form.postal_code.trim(),
        country: form.country.trim(),
      };

      // The first address must be the default.
      if (!editingId && addresses.length === 0) {
        cleanForm.is_default = true;
      }

      // Clear the previous default if the customer selected this address
      // as their new default. RLS restricts this update to their own rows.
      if (cleanForm.is_default) {
        const { error: clearError } = await supabase
          .from("customer_addresses")
          .update({ is_default: false })
          .eq("is_default", true);

        if (clearError) throw clearError;
      }

      if (editingId) {
        const { error: updateError } = await supabase
          .from("customer_addresses")
          .update(cleanForm)
          .eq("id", editingId);

        if (updateError) throw updateError;
      } else {
        // user_id is required by the database and must match auth.uid().
        const { error: insertError } = await supabase
          .from("customer_addresses")
          .insert({
            ...cleanForm,
            user_id: user.id,
          });

        if (insertError) throw insertError;
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      setMessage("Your address has been saved.");

      await loadAddresses();
    } catch (err) {
      console.error("Could not save address:", err);
      setError(`Could not save address: ${getErrorMessage(err)}`);
    } finally {
      setSaving(false);
    }
  }

  async function deleteAddress(id: string) {
    if (!window.confirm("Delete this saved address?")) return;

    setError("");
    setMessage("");

    try {
      const supabase = createClient();

      const { error: deleteError } = await supabase
        .from("customer_addresses")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      setMessage("Address deleted.");
      await loadAddresses();
    } catch (err) {
      console.error("Could not delete address:", err);
      setError(`Could not delete address: ${getErrorMessage(err)}`);
    }
  }

  async function makeDefault(id: string) {
    setError("");
    setMessage("");

    try {
      const supabase = createClient();

      const { error: clearError } = await supabase
        .from("customer_addresses")
        .update({ is_default: false })
        .eq("is_default", true);

      if (clearError) throw clearError;

      const { error: setDefaultError } = await supabase
        .from("customer_addresses")
        .update({ is_default: true })
        .eq("id", id);

      if (setDefaultError) throw setDefaultError;

      setMessage("Default delivery address updated.");
      await loadAddresses();
    } catch (err) {
      console.error("Could not update default address:", err);
      setError(`Could not update default address: ${getErrorMessage(err)}`);
    }
  }

  return (
    <section className="mt-8 border border-[#BFDBFE] bg-white p-6 sm:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold">Saved addresses</h2>
          <p className="mt-2 text-sm text-[#627D98]">
            Save your delivery details for faster checkout.
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={startNewAddress}
            className="bg-[#3B82F6] px-5 py-3 text-xs font-semibold tracking-wide text-white hover:bg-[#1D4ED8]"
          >
            + ADD ADDRESS
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-5 break-words text-sm text-red-600">
          {error}
        </p>
      )}

      {message && (
        <p role="status" className="mt-5 text-sm text-green-700">
          {message}
        </p>
      )}

      {showForm && (
        <form onSubmit={saveAddress} className="mt-7 space-y-5">
          <div>
            <label htmlFor="address_label" className="mb-2 block text-xs font-semibold">
              Address type
            </label>
            <select
              id="address_label"
              value={form.label}
              onChange={(event) =>
                updateField("label", event.target.value as AddressForm["label"])
              }
              className={inputClass}
            >
              <option value="Home">Home</option>
              <option value="Work">Work</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="recipient_name" className="mb-2 block text-xs font-semibold">
              Recipient name
            </label>
            <input
              id="recipient_name"
              required
              minLength={2}
              maxLength={100}
              autoComplete="name"
              value={form.recipient_name}
              onChange={(event) => updateField("recipient_name", event.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="address_phone" className="mb-2 block text-xs font-semibold">
              Mobile number
            </label>
            <input
              id="address_phone"
              required
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={10}
              pattern="[0-9]{10}"
              value={form.phone}
              onChange={(event) =>
                updateField(
                  "phone",
                  event.target.value.replace(/\D/g, "").slice(0, 10)
                )
              }
              placeholder="10-digit mobile number"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="address_line1" className="mb-2 block text-xs font-semibold">
              Address line 1
            </label>
            <input
              id="address_line1"
              required
              minLength={3}
              maxLength={150}
              autoComplete="address-line1"
              value={form.address_line1}
              onChange={(event) => updateField("address_line1", event.target.value)}
              placeholder="Flat, house number, street"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="address_line2" className="mb-2 block text-xs font-semibold">
              Address line 2 (optional)
            </label>
            <input
              id="address_line2"
              maxLength={150}
              autoComplete="address-line2"
              value={form.address_line2}
              onChange={(event) => updateField("address_line2", event.target.value)}
              placeholder="Area, landmark"
              className={inputClass}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="address_city" className="mb-2 block text-xs font-semibold">
                City
              </label>
              <input
                id="address_city"
                required
                minLength={2}
                maxLength={80}
                autoComplete="address-level2"
                value={form.city}
                onChange={(event) => updateField("city", event.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="address_state" className="mb-2 block text-xs font-semibold">
                State
              </label>
              <input
                id="address_state"
                required
                minLength={2}
                maxLength={80}
                autoComplete="address-level1"
                value={form.state}
                onChange={(event) => updateField("state", event.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="address_pin" className="mb-2 block text-xs font-semibold">
                PIN code
              </label>
              <input
                id="address_pin"
                required
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={6}
                pattern="[0-9]{6}"
                value={form.postal_code}
                onChange={(event) =>
                  updateField(
                    "postal_code",
                    event.target.value.replace(/\D/g, "").slice(0, 6)
                  )
                }
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="address_country" className="mb-2 block text-xs font-semibold">
                Country
              </label>
              <input
                id="address_country"
                required
                minLength={2}
                maxLength={56}
                autoComplete="country-name"
                value={form.country}
                onChange={(event) => updateField("country", event.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(event) => updateField("is_default", event.target.checked)}
              className="h-4 w-4 accent-[#3B82F6]"
            />
            Make this my default delivery address
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#3B82F6] px-6 py-3 text-xs font-semibold text-white hover:bg-[#1D4ED8] disabled:opacity-60"
            >
              {saving ? "SAVING..." : "SAVE ADDRESS"}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={cancelEditing}
              className="border border-[#BFDBFE] px-6 py-3 text-xs font-semibold hover:border-[#3B82F6]"
            >
              CANCEL
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-[#627D98]">
          Loading saved addresses...
        </p>
      ) : addresses.length === 0 && !showForm ? (
        <p className="mt-6 text-sm text-[#627D98]">
          No saved addresses yet. Add one to make checkout faster.
        </p>
      ) : (
        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <article key={address.id} className="border border-[#DBEAFE] p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold">{address.label}</h3>
                {address.is_default && (
                  <span className="bg-[#DBEAFE] px-2 py-1 text-[10px] font-semibold text-[#1D4ED8]">
                    DEFAULT
                  </span>
                )}
              </div>

              <p className="mt-3 text-sm font-medium">
                {address.recipient_name}
              </p>
              <p className="mt-1 text-sm text-[#627D98]">{address.phone}</p>

              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#486581]">
                {address.address_line1}
                {address.address_line2 ? `, ${address.address_line2}` : ""}
                {`\n${address.city}, ${address.state} ${address.postal_code}`}
                {`\n${address.country}`}
              </p>

              <div className="mt-5 flex flex-wrap gap-4 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => startEditing(address)}
                  className="text-[#2563EB] underline underline-offset-4"
                >
                  EDIT
                </button>

                {!address.is_default && (
                  <button
                    type="button"
                    onClick={() => makeDefault(address.id)}
                    className="text-[#2563EB] underline underline-offset-4"
                  >
                    MAKE DEFAULT
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => deleteAddress(address.id)}
                  className="text-red-600 underline underline-offset-4"
                >
                  DELETE
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
