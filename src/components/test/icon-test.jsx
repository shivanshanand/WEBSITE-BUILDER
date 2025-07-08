// Test file to verify icon imports work correctly
import { Plus, Robot, Trash, List, X } from "@phosphor-icons/react";

export default function IconTest() {
  return (
    <div className="flex gap-4 p-4">
      <Plus size={24} />
      <Robot size={24} />
      <Trash size={24} />
      <List size={24} />
      <X size={24} />
    </div>
  );
}
