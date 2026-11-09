import { prisma } from "@/lib/db";
import { createBuilding, createRoom } from "@/lib/actions/housing";
import { requireAdmin } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default async function AdminRoomsPage() {
  await requireAdmin();

  const buildings = await prisma.building.findMany({
    include: {
      rooms: {
        include: {
          beds: {
            include: {
              allocations: {
                where: { active: true },
                include: { resident: { include: { user: true } } },
              },
            },
          },
        },
        orderBy: [{ floor: "asc" }, { number: "asc" }],
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl text-[var(--brand-dark)]"
          style={{ fontFamily: "var(--font-display), Georgia, serif" }}
        >
          Rooms & beds
        </h1>
        <p className="text-[var(--muted)]">Buildings, room inventory, and occupancy.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add building</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createBuilding} className="grid gap-3 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input id="code" name="code" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="floors">Floors</Label>
                <Input id="floors" name="floors" type="number" defaultValue={2} min={1} />
              </div>
              <Button type="submit" className="md:col-span-3">
                Create building
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add room</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createRoom} className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="buildingId">Building</Label>
                <Select id="buildingId" name="buildingId" required defaultValue={buildings[0]?.id}>
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="number">Number</Label>
                <Input id="number" name="number" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="floor">Floor</Label>
                <Input id="floor" name="floor" type="number" defaultValue={1} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roomType">Type</Label>
                <Select id="roomType" name="roomType" defaultValue="SINGLE">
                  <option value="SINGLE">Single</option>
                  <option value="DOUBLE">Double</option>
                  <option value="TWIN">Twin</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input id="capacity" name="capacity" type="number" defaultValue={1} min={1} max={4} />
              </div>
              <Button type="submit" className="md:col-span-2">
                Create room + beds
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {buildings.map((building) => (
        <Card key={building.id}>
          <CardHeader>
            <CardTitle>
              {building.name}{" "}
              <span className="text-sm font-normal text-[var(--muted)]">({building.code})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Type</th>
                  <th>Beds</th>
                  <th>Occupancy</th>
                </tr>
              </thead>
              <tbody>
                {building.rooms.map((room) => {
                  const occupied = room.beds.filter((b) => b.allocations.length > 0).length;
                  return (
                    <tr key={room.id}>
                      <td>
                        {room.number}
                        <div className="text-xs text-[var(--muted)]">Floor {room.floor}</div>
                      </td>
                      <td>{room.roomType}</td>
                      <td>
                        <div className="flex flex-wrap gap-2">
                          {room.beds.map((bed) => {
                            const alloc = bed.allocations[0];
                            return (
                              <Badge
                                key={bed.id}
                                tone={alloc ? "success" : "default"}
                                title={alloc?.resident.user.name}
                              >
                                {bed.label}
                                {alloc ? `: ${alloc.resident.user.name.split(" ")[0]}` : ": vacant"}
                              </Badge>
                            );
                          })}
                        </div>
                      </td>
                      <td>
                        {occupied}/{room.beds.length}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
