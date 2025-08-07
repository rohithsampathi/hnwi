import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Heir {
  id: string;
  name: string;
  relationship: string;
  email?: string;
  phone?: string;
  notes?: string;
  created_at: string;
}

interface HeirsTabProps {
  heirs: Heir[];
  onAddHeir: () => void;
}

export function HeirsTab({ heirs, onAddHeir }: HeirsTabProps) {
  return (
    <div className="space-y-6">
      
      {/* Heirs Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Designated Heirs</h2>
          <p className="text-muted-foreground">Manage your legacy beneficiaries</p>
        </div>
        <Button onClick={onAddHeir} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Heir
        </Button>
      </div>

      {/* Heirs List */}
      <div className="grid gap-4">
        {heirs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No heirs designated yet</p>
            <Button onClick={onAddHeir} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Heir
            </Button>
          </div>
        ) : (
          heirs.map((heir) => (
            <div key={heir.id} className="border rounded-lg p-4 bg-background/50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{heir.name}</h3>
                  <p className="text-sm text-muted-foreground">{heir.relationship}</p>
                  {heir.email && (
                    <p className="text-sm text-muted-foreground mt-1">{heir.email}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Edit</Button>
                  <Button variant="destructive" size="sm">Delete</Button>
                </div>
              </div>
              {heir.notes && (
                <p className="text-sm mt-3 text-muted-foreground">{heir.notes}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}