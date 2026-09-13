"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import {
  createRoute,
  updateRoute,
  toggleRouteActive,
  createSlot,
  updateSlot,
  toggleSlotActive,
  deleteSlot,
  generateUpcomingTrips,
  createLocation,
  toggleLocationActive,
  type ActionState,
} from "./actions";
import type { LocationRow, RouteRow, SlotRow, VehicleRow } from "./page";

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function fieldClass() {
  return "w-full rounded-lg border border-[#E4E1F5] bg-white px-3 py-2 text-sm text-[#3D3170] focus:outline-none focus:ring-2 focus:ring-[#6B5FD9]";
}

function labelClass() {
  return "mb-1 block text-xs font-semibold text-[#7A7590]";
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#221B3D]/40 px-4 py-8">
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

export default function RoutesClient({
  initialRoutes,
  vehicles,
  locations,
}: {
  initialRoutes: RouteRow[];
  vehicles: VehicleRow[];
  locations: LocationRow[];
}) {
  const [showCreateRoute, setShowCreateRoute] = useState(false);
  const [editingRoute, setEditingRoute] = useState<RouteRow | null>(null);
  const [slotModal, setSlotModal] = useState<{ routeId: string; slot?: SlotRow } | null>(null);
  const [showLocations, setShowLocations] = useState(false);
  const [isGenerating, startGenerate] = useTransition();
  const [generateResult, setGenerateResult] = useState<string | null>(null);

  const locationName = (id: string) => locations.find((l) => l.id === id)?.name ?? "—";

  const handleGenerate = () => {
    setGenerateResult(null);
    startGenerate(async () => {
      const result = await generateUpcomingTrips();
      setGenerateResult(
        result.created > 0
          ? `Created ${result.created} trip${result.created === 1 ? "" : "s"} for the next 7 days.`
          : "Everything is already up to date — no new trips needed."
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F6FB] text-[#3D3170]">
      <header className="border-b border-[#E4E1F5] bg-white px-8 py-5">
        <p className="text-[11px] font-semibold tracking-wide text-[#6B5FD9]">KIGOO ADMIN</p>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#221B3D]">Routes & Schedules</h1>
          <nav className="flex gap-4 text-sm font-semibold text-[#7A7590]">
            <Link href="/trips" className="hover:text-[#221B3D]">
              Trips
            </Link>
            <span className="text-[#221B3D]">Routes</span>
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
        <div className="mb-6 flex items-center justify-between rounded-xl border border-[#E4E1F5] bg-white p-5">
          <div>
            <p className="text-sm font-semibold text-[#221B3D]">Generate upcoming trips</p>
            <p className="mt-0.5 text-xs text-[#7A7590]">
              Creates bookable trips for the next 7 days from every active time slot below.
            </p>
            {generateResult && <p className="mt-2 text-xs font-medium text-[#1B9C6E]">{generateResult}</p>}
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="rounded-lg bg-[#221B3D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3D3170] disabled:opacity-50"
          >
            {isGenerating ? "Generating…" : "Generate Trips"}
          </button>
        </div>

        <div className="mb-6 flex justify-end gap-3">
          <button
            onClick={() => setShowLocations(true)}
            className="rounded-lg border border-[#221B3D] px-4 py-2 text-sm font-semibold text-[#221B3D] hover:bg-[#221B3D] hover:text-white transition-colors"
          >
            Manage Locations
          </button>
          <button
            onClick={() => setShowCreateRoute(true)}
            className="rounded-lg bg-[#221B3D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#3D3170] transition-colors"
          >
            + Add Route
          </button>
        </div>

        {initialRoutes.length === 0 ? (
          <div className="rounded-xl border border-[#E4E1F5] bg-white px-5 py-10 text-center text-[#7A7590]">
            No routes yet. Add the first one.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {initialRoutes.map((route) => (
              <div key={route.id} className="overflow-hidden rounded-xl border border-[#E4E1F5] bg-white">
                <div className="flex items-center justify-between border-b border-[#E4E1F5] bg-[#FAFAFC] px-5 py-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-[#221B3D]">
                        {locationName(route.origin_id)}
                      </span>
                      <span className="text-[#6B5FD9]" aria-hidden>
                        →
                      </span>
                      <span className="text-base font-bold text-[#221B3D]">
                        {locationName(route.destination_id)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        route.active ? "bg-[#E4F5EC] text-[#1B9C6E]" : "bg-[#EDEBF7] text-[#7A7590]"
                      }`}
                    >
                      {route.active ? "Active" : "Inactive"}
                    </span>
                    <button
                      onClick={() => toggleRouteActive(route.id, !route.active)}
                      className="text-xs font-semibold text-[#221B3D] hover:underline"
                    >
                      {route.active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => setEditingRoute(route)}
                      className="text-xs font-semibold text-[#221B3D] hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                <div className="px-5 py-4">
                  {route.slots.length === 0 ? (
                    <p className="text-sm text-[#7A7590]">No time slots yet.</p>
                  ) : (
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="text-[11px] uppercase tracking-wide text-[#7A7590]">
                          <th className="pb-2 font-semibold">Trip</th>
                          <th className="pb-2 font-semibold">Vehicle</th>
                          <th className="pb-2 font-semibold">Seats</th>
                          <th className="pb-2 font-semibold">Fare</th>
                          <th className="pb-2 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {route.slots.map((slot) => {
                          const vehicle = vehicles.find((v) => v.id === slot.vehicle_id);
                          const fromLabel =
                            slot.direction === "to_varsity"
                              ? locationName(route.origin_id)
                              : locationName(route.destination_id);
                          const toLabel =
                            slot.direction === "to_varsity"
                              ? locationName(route.destination_id)
                              : locationName(route.origin_id);
                          return (
                            <tr key={slot.id} className="border-t border-[#EDEBF7]">
                              <td className="py-3">
                                <div className="flex items-center gap-1.5 text-xs font-medium text-[#7A7590]">
                                  <span>{fromLabel}</span>
                                  <span className="text-[#6B5FD9]" aria-hidden>
                                    →
                                  </span>
                                  <span>{toLabel}</span>
                                </div>
                                <div className="mt-1 flex items-center gap-1.5">
                                  <span className="font-semibold text-[#221B3D]">
                                    {formatTime(slot.departure_time)}
                                  </span>
                                  <span className="text-[#7A7590]" aria-hidden>
                                    →
                                  </span>
                                  <span className="text-[#7A7590]">{formatTime(slot.arrival_time)}</span>
                                </div>
                              </td>
                              <td className="py-3">
                                {vehicle ? (
                                  vehicle.plate_no
                                ) : (
                                  <span className="text-[#D64545]">Not assigned</span>
                                )}
                              </td>
                              <td className="py-3">{slot.total_seats}</td>
                              <td className="py-3">৳{slot.fare}</td>
                              <td className="py-3 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => setSlotModal({ routeId: route.id, slot })}
                                    className="text-xs font-semibold text-[#221B3D] hover:underline"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => toggleSlotActive(slot.id, !slot.active)}
                                    className="text-xs font-semibold text-[#7A7590] hover:underline"
                                  >
                                    {slot.active ? "Pause" : "Resume"}
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm("Delete this time slot?")) deleteSlot(slot.id);
                                    }}
                                    className="text-xs font-semibold text-[#D64545] hover:underline"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}

                  <button
                    onClick={() => setSlotModal({ routeId: route.id })}
                    className="mt-4 text-xs font-semibold text-[#6B5FD9] hover:underline"
                  >
                    + Add Time Slot
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showCreateRoute && (
        <RouteFormModal locations={locations} onClose={() => setShowCreateRoute(false)} />
      )}
      {editingRoute && (
        <RouteFormModal route={editingRoute} locations={locations} onClose={() => setEditingRoute(null)} />
      )}
      {slotModal && (
        <SlotFormModal
          route={initialRoutes.find((r) => r.id === slotModal.routeId)!}
          slot={slotModal.slot}
          vehicles={vehicles}
          locationName={locationName}
          onClose={() => setSlotModal(null)}
        />
      )}
      {showLocations && (
        <LocationsModal locations={locations} onClose={() => setShowLocations(false)} />
      )}
    </div>
  );
}

function RouteFormModal({
  route,
  locations,
  onClose,
}: {
  route?: RouteRow;
  locations: LocationRow[];
  onClose: () => void;
}) {
  const action = route ? updateRoute : createRoute;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null);
  const activeLocations = locations.filter((l) => l.active);

  return (
    <Modal title={route ? "Edit Route" : "Add Route"} onClose={onClose}>
      <form
        action={async (formData) => {
          const result = await formAction(formData);
          if (!state?.error) onClose();
          return result;
        }}
        className="flex flex-col gap-3"
      >
        {route && <input type="hidden" name="id" value={route.id} />}

        <p className="text-xs text-[#7A7590]">
          Origin and destination set the direction shown throughout the app — origin is where the
          shuttle starts, destination is where it ends up. Need a new place?{" "}
          <span className="font-semibold text-[#6B5FD9]">Manage Locations</span> first.
        </p>

        {activeLocations.length < 2 ? (
          <p className="rounded-lg bg-[#FBF0DD] px-3 py-2 text-sm text-[#B8862E]">
            Add at least two locations before creating a route.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass()}>Origin</label>
              <select
                name="origin_id"
                defaultValue={route?.origin_id ?? ""}
                required
                className={fieldClass()}
              >
                <option value="" disabled>
                  Select origin
                </option>
                {activeLocations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass()}>Destination</label>
              <select
                name="destination_id"
                defaultValue={route?.destination_id ?? ""}
                required
                className={fieldClass()}
              >
                <option value="" disabled>
                  Select destination
                </option>
                {activeLocations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        {state?.error && <p className="text-sm text-[#D64545]">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-lg bg-[#221B3D] py-2.5 text-sm font-semibold text-white hover:bg-[#3D3170] disabled:opacity-50"
        >
          {pending ? "Saving…" : route ? "Save Changes" : "Add Route"}
        </button>
      </form>
    </Modal>
  );
}

function SlotFormModal({
  route,
  slot,
  vehicles,
  locationName,
  onClose,
}: {
  route: RouteRow;
  slot?: SlotRow;
  vehicles: VehicleRow[];
  locationName: (id: string) => string;
  onClose: () => void;
}) {
  const action = slot ? updateSlot : createSlot;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null);
  const origin = locationName(route.origin_id);
  const destination = locationName(route.destination_id);

  return (
    <Modal title={slot ? "Edit Time Slot" : "Add Time Slot"} onClose={onClose}>
      <form
        action={async (formData) => {
          const result = await formAction(formData);
          if (!state?.error) onClose();
          return result;
        }}
        className="flex flex-col gap-3"
      >
        {slot ? (
          <input type="hidden" name="id" value={slot.id} />
        ) : (
          <input type="hidden" name="route_id" value={route.id} />
        )}

        <div>
          <label className={labelClass()}>Direction</label>
          <select name="direction" defaultValue={slot?.direction ?? ""} required className={fieldClass()}>
            <option value="" disabled>
              Select direction
            </option>
            <option value="to_varsity">
              {origin} → {destination}
            </option>
            <option value="from_varsity">
              {destination} → {origin}
            </option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass()}>Departure time</label>
            <input
              type="time"
              name="departure_time"
              defaultValue={slot?.departure_time?.slice(0, 5)}
              required
              className={fieldClass()}
            />
          </div>
          <div>
            <label className={labelClass()}>Arrival time</label>
            <input
              type="time"
              name="arrival_time"
              defaultValue={slot?.arrival_time?.slice(0, 5)}
              required
              className={fieldClass()}
            />
          </div>
        </div>

        <div>
          <label className={labelClass()}>Vehicle</label>
          <select name="vehicle_id" defaultValue={slot?.vehicle_id ?? ""} className={fieldClass()}>
            <option value="">No vehicle assigned yet</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.plate_no} ({v.capacity} seats)
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass()}>Total seats</label>
            <input
              type="number"
              name="total_seats"
              min={1}
              defaultValue={slot?.total_seats}
              required
              className={fieldClass()}
            />
          </div>
          <div>
            <label className={labelClass()}>Fare (৳)</label>
            <input type="number" name="fare" min={0} defaultValue={slot?.fare ?? 0} className={fieldClass()} />
          </div>
        </div>

        {state?.error && <p className="text-sm text-[#D64545]">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-lg bg-[#221B3D] py-2.5 text-sm font-semibold text-white hover:bg-[#3D3170] disabled:opacity-50"
        >
          {pending ? "Saving…" : slot ? "Save Changes" : "Add Time Slot"}
        </button>
      </form>
    </Modal>
  );
}

function LocationsModal({ locations, onClose }: { locations: LocationRow[]; onClose: () => void }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createLocation, null);

  return (
    <Modal title="Manage Locations" onClose={onClose}>
      <p className="mb-4 text-xs text-[#7A7590]">
        Locations are the reusable places routes connect — bus stands, neighborhoods, or campuses.
        Add one here, then pick it as an origin or destination when building a route.
      </p>

      <div className="mb-4 max-h-56 overflow-y-auto rounded-lg border border-[#E4E1F5]">
        {locations.length === 0 ? (
          <p className="px-3 py-4 text-center text-sm text-[#7A7590]">No locations yet.</p>
        ) : (
          locations.map((loc) => (
            <div
              key={loc.id}
              className="flex items-center justify-between border-b border-[#EDEBF7] px-3 py-2 text-sm last:border-0"
            >
              <div>
                <span className="font-medium text-[#221B3D]">{loc.name}</span>
                <span className="ml-2 text-xs text-[#7A7590]">
                  {loc.type === "campus" ? "Campus" : "Pickup point"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    loc.active ? "bg-[#E4F5EC] text-[#1B9C6E]" : "bg-[#EDEBF7] text-[#7A7590]"
                  }`}
                >
                  {loc.active ? "Active" : "Inactive"}
                </span>
                <button
                  onClick={() => toggleLocationActive(loc.id, !loc.active)}
                  className="text-xs font-semibold text-[#221B3D] hover:underline"
                >
                  {loc.active ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <form action={formAction} className="flex flex-col gap-3 border-t border-[#EDEBF7] pt-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass()}>Name</label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Mohammadpur Bus Stand"
              required
              className={fieldClass()}
            />
          </div>
          <div>
            <label className={labelClass()}>Type</label>
            <select name="type" defaultValue="pickup_point" required className={fieldClass()}>
              <option value="pickup_point">Pickup point</option>
              <option value="campus">Campus</option>
            </select>
          </div>
        </div>

        {state?.error && <p className="text-sm text-[#D64545]">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#221B3D] py-2.5 text-sm font-semibold text-white hover:bg-[#3D3170] disabled:opacity-50"
        >
          {pending ? "Adding…" : "Add Location"}
        </button>
      </form>
    </Modal>
  );
}
