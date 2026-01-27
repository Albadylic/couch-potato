import { DayType } from "@/types/week";

export default function Day({ day }: { day: DayType }) {
  return (
    <section className="border p-4 my-4 rounded flex flex-col items-center">
      <h3 className="p-2 text-xl">{day.day}</h3>
      <p>Distance: {day.distance}km</p>
      <div className="flex justify-between m-2 border rounded">
        <p className="p-2">jog: {day["jogging-interval-time"]}</p>
        <p className="p-2">walk: {day["walking-intervals-time"]}</p>
        <p className="p-2">intervals: {day["number-of-intervals"]}</p>
      </div>
      <ul>
        {day.instructions.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
