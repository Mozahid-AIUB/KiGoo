"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import {
  createTrip,
  updateTrip,
  cancelTrip,
  addVehicle,
  fetchPassengers,
  type ActionState,
  type PassengerRow,
} from "./actions";
import type { TripRow, VehicleRow } from "./page";

const DIRECTIONS = [
  { value: "to_varsity", label: "Mohammadpur → Varsity" },
  { value: "from_varsity", label: "Varsity → Mohammadpur" },
];

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export default function TripsClient({
  initialTrips,
  vehicles,
}: {
  initialTrips: TripRow[];
  vehicles: VehicleRow[];
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [editingTrip, setEditingTrip] = useState<TripRow | null>(null);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [viewingPassengers, setViewingPassengers] = useState<TripRow | null>(null);

  return (
    <div className="min-h-screen bg-[#F7F6FB] text-[#3D3170]">
      <header className="border-b border-[#E4E1F5] bg-white px-8 py-5">
        <p className="text-[11px] font-semibold tracking-wide text-[#6B5FD9]">KIGOO ADMIN</p>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#221B3D]">Trip Management</h1>
          <nav className="flex gap-4 text-sm font-semibold text-[#7A7590]">
            <span className="text-[#221B3D]">Trips</span>
            <Link href="/routes" className="hover:text-[#221B3D]">
              Routes
            </Link>
            <Link href="/verifications" className="hover:text-[#221B3D]">
              Verifications
            </Link>
            <Link href="/checkin" className="hover:text-[#221B3D]">
              Check-in
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-[#7A7590]">
            {initialTrips.length} trip{initialTrips.length === 1 ? "" : "s"} scheduled
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddVehicle(true)}
              className="rounded-lg border border-[#221B3D] px-4 py-2 text-sm font-semibold text-[#221B3D] hover:bg-[#221B3D] hover:text-white transition-colors"
            >
              + Add Vehicle
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="rounded-lg bg-[#221B3D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3D3170] transition-colors"
            >
              + Create Trip
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-[#E4E1F5] bg-white">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#E4E1F5] bg-[#FAFAFC] text-[11px] uppercase tracking-wide text-[#7A7590]">
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Time</th>
                <th className="px-5 py-3 font-semibold">Direction</th>
                <th className="px-5 py-3 font-semibold">Vehicle</th>
                <th className="px-5 py-3 font-semibold">Seats</th>
                <th className="px-5 py-3 font-semibold">Passengers</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {initialTrips.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-[#7A7590]">
                    No trips yet. Create the first one.
                  </td>
                </tr>
              ) : (
                initialTrips.map((trip) => (
                  <tr key={trip.id} className="border-b border-[#EDEBF7] last:border-0">
                    <td className="px-5 py-3">{trip.trip_date}</td>
                    <td className="px-5 py-3">{formatTime(trip.departure_time)}</td>
                    <td className="px-5 py-3">
                      {DIRECTIONS.find((d) => d.value === trip.direction)?.label ?? trip.direction}
                    </td>
                    <td className="px-5 py-3">{trip.vehicle?.plate_no ?? "—"}</td>
                    <td className="px-5 py-3">
                      {trip.available_seats}/{trip.total_seats}
                    </td>
                    <td className="px-5 py-3">
                      {trip.booked_count > 0 ? (
                        <button
                          onClick={() => setViewingPassengers(trip)}
                          className="font-semibold text-[#6B5FD9] hover:underline"
                        >
                          {trip.booked_count} booked
                        </button>
                      ) : (
                        <span className="text-[#7A7590]">None yet</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          trip.status === "scheduled"
                            ? "bg-[#E4F5EC] text-[#1B9C6E]"
                            : trip.status === "cancelled"
                            ? "bg-[#FBE9E7] text-[#D64545]"
                            : "bg-[#E9E7F5] text-[#221B3D]"
                        }`}
                      >
                        {trip.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingTrip(trip)}
                          className="text-xs font-semibold text-[#221B3D] hover:underline"
                        >
                          Edit
                        </button>
                        {trip.status === "scheduled" && (
                          <form action={cancelTrip.bind(null, trip.id)}>
                            <button className="text-xs font-semibold text-[#D64545] hover:underline">
                              Cancel
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {showCreate && (
        <TripFormModal
          vehicles={vehicles}
          onClose={() => setShowCreate(false)}
        />
      )}
      {editingTrip && (
        <TripFormModal
          vehicles={vehicles}
          trip={editingTrip}
          onClose={() => setEditingTrip(null)}
        />
      )}
      {showAddVehicle && <AddVehicleModal onClose={() => setShowAddVehicle(false)} />}
      {viewingPassengers && (
        <PassengersModal trip={viewingPassengers} onClose={() => setViewingPassengers(null)} />
      )}
    </div>
  );
}

function PassengersModal({ trip, onClose }: { trip: TripRow; onClose: () => void }) {
  const [passengers, setPassengers] = useState<PassengerRow[] | null>(null);

  useEffect(() => {
    fetchPassengers(trip.id).then(setPassengers);
  }, [trip.id]);

  return (
    <Modal title={`Passengers · ${formatTime(trip.departure_time)}, ${trip.trip_date}`} onClose={onClose}>
      {passengers === null ? (
        <p className="py-6 text-center text-sm text-[#7A7590]">Loading…</p>
      ) : passengers.length === 0 ? (
        <p className="py-6 text-center text-sm text-[#7A7590]">No one has booked this trip yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {passengers.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg border border-[#E4E1F5] px-3 py-2"
            >
              <div>
                <p className="text-sm font-semibold text-[#221B3D]">
                  {p.profile ? `${p.profile.first_name} ${p.profile.last_name}` : "Unknown"}
                </p>
                <p className="text-xs text-[#7A7590]">
                  {p.profile?.phone ?? "—"} · {p.booking_code}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#221B3D]">Seat {p.seat}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    p.status === "boarded"
                      ? "bg-[#E4F5EC] text-[#1B9C6E]"
                      : "bg-[#FBF0DD] text-[#B8862E]"
                  }`}
                >
                  {p.status === "boarded" ? "Boarded" : "Booked"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#221B3D]/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#221B3D]">{title}</h2>
          <button onClick={onClose} className="text-[#7A7590] hover:text-[#221B3D]" aria-label="Close">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function fieldClass() {
  return "w-full rounded-lg border border-[#E4E1F5] bg-white px-3 py-2 text-sm text-[#3D3170] focus:outline-none focus:ring-2 focus:ring-[#6B5FD9]";
}

function labelClass() {
  return "mb-1 block text-xs font-semibold text-[#7A7590]";
}

function TripFormModal({
  vehicles,
  trip,
  onClose,
}: {
  vehicles: VehicleRow[];
  trip?: TripRow;
  onClose: () => void;
}) {
  const action = trip ? updateTrip : createTrip;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null);

  return (
    <Modal title={trip ? "Edit Trip" : "Create Trip"} onClose={onClose}>
      <form
        action={async (formData) => {
          const result = await formAction(formData);
          if (!state?.error) onClose();
          return result;
        }}
        className="flex flex-col gap-3"
      >
        {trip && <input type="hidden" name="id" value={trip.id} />}

        <div>
          <label className={labelClass()}>Date</label>
          <input
            type="date"
            name="trip_date"
            defaultValue={trip?.trip_date}
            required
            className={fieldClass()}
          />
        </div>

        <div>
          <label className={labelClass()}>Departure time</label>
          <input
            type="time"
            name="departure_time"
            defaultValue={trip?.departure_time}
            required
            className={fieldClass()}
          />
        </div>

        <div>
          <label className={labelClass()}>Direction</label>
          <select
            name="direction"
            defaultValue={trip?.direction ?? ""}
            required
            className={fieldClass()}
          >
            <option value="" disabled>
              Select direction
            </option>
            {DIRECTIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass()}>Vehicle</label>
          <select
            name="vehicle_id"
            defaultValue={trip?.vehicle_id ?? ""}
            required
            className={fieldClass()}
          >
            <option value="" disabled>
              Select vehicle
            </option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.plate_no} ({v.capacity} seats)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass()}>Total seats</label>
          <input
            type="number"
            name="total_seats"
            min={1}
            defaultValue={trip?.total_seats}
            required
            className={fieldClass()}
          />
        </div>

        {state?.error && <p className="text-sm text-[#D64545]">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-lg bg-[#221B3D] py-2.5 text-sm font-semibold text-white hover:bg-[#3D3170] disabled:opacity-50"
        >
          {pending ? "Saving…" : trip ? "Save Changes" : "Create Trip"}
        </button>
      </form>
    </Modal>
  );
}

function AddVehicleModal({ onClose }: { onClose: () => void }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(addVehicle, null);

  return (
    <Modal title="Add Vehicle" onClose={onClose}>
      <form
        action={async (formData) => {
          const result = await formAction(formData);
          if (!state?.error) onClose();
          return result;
        }}
        className="flex flex-col gap-3"
      >
        <div>
          <label className={labelClass()}>Plate number</label>
          <input type="text" name="plate_no" required className={fieldClass()} />
        </div>
        <div>
          <label className={labelClass()}>Capacity</label>
          <input type="number" name="capacity" min={1} required className={fieldClass()} />
        </div>
        <div>
          <label className={labelClass()}>Driver name</label>
          <input type="text" name="driver_name" className={fieldClass()} />
        </div>
        <div>
          <label className={labelClass()}>Driver phone</label>
          <input type="text" name="driver_phone" className={fieldClass()} />
        </div>

        {state?.error && <p className="text-sm text-[#D64545]">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-lg bg-[#221B3D] py-2.5 text-sm font-semibold text-white hover:bg-[#3D3170] disabled:opacity-50"
        >
          {pending ? "Saving…" : "Add Vehicle"}
        </button>
      </form>
    </Modal>
  );
}
