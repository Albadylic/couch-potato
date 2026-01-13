import { WeekType } from "@/types/week";
import Day from "./Day";

export default function Week({ week }: { week: WeekType }) {
  return (
    <section className="border p-4 my-4 mx-2 rounded">
      <h2>Week {week.id}</h2>
      {week.days.map((day) => (
        <Day key={day.id} day={day} />
      ))}
    </section>
  );
}
