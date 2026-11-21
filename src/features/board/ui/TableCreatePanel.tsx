import { TABLE_DEFAULTS, TABLE_LIMITS } from "../domain/tables";

export function TableCreatePanel({ onCreate }: { onCreate: (rows: number, columns: number) => void }) {
  return (
    <form className="flex flex-col gap-3 p-3" onSubmit={(event) => {
      event.preventDefault();
      const fields = new FormData(event.currentTarget);
      onCreate(Number(fields.get("rows")), Number(fields.get("columns")));
    }}>
      {(["rows", "columns"] as const).map((axis) => (
        <label key={axis} className="flex items-center justify-between gap-3 text-sm capitalize">
          {axis}
          <input
            type="number"
            name={axis}
            inputMode="numeric"
            min={1}
            max={TABLE_LIMITS.tracks}
            defaultValue={TABLE_DEFAULTS[axis]}
            required
            className="h-9 w-16 rounded-md border border-stone-300 bg-white px-2"
          />
        </label>
      ))}
      <button type="submit" className="h-9 rounded-md bg-stone-900 px-3 text-sm font-medium text-white">Create table</button>
    </form>
  );
}
