export default function buildPrompt(
  ability: string,
  weeks: number,
  frequency: number,
  distance: string,
  unavailableDays: string[],
  injuries?: string
) {
  const unavailableDaysText = unavailableDays.length > 0
    ? `\nIMPORTANT: Do NOT schedule training on: ${unavailableDays.join(', ')}. Choose other days of the week instead.`
    : '';

  const injuriesText = injuries
    ? `\nIMPORTANT: User has the following condition: "${injuries}". Adjust intensity appropriately and include relevant cautions or modifications in the instructions.`
    : '';

  return `

Return ONLY valid JSON.
Do NOT include explanations, markdown, or extra text.

The JSON must follow this exact schema:


{
  "weeks": [
    {
      "id": number,
      "days": [
        {
          "id": number,
          "day": string,
          "distance": number,
          "jogging-interval-time": number,
          "walking-intervals-time": number,
          "number-of-intervals": number,
          "instructions": string[]
        }
      ]
    }
  ]
}

Generate a training plan for a ${ability} runner to complete ${distance} within ${weeks} weeks.
Include exactly ${frequency} training days each week.${unavailableDaysText}${injuriesText}
`;
}
