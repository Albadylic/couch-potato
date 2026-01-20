export default function buildPrompt(
  ability: string,
  weeks: number,
  frequency: number
) {
  return `

Return ONLY valid JSON.
Do NOT include explanations, markdown, or extra text.

The JSON must follow this exact schema:


{
  "weeks": [
    {
      "id": number,
      "days": [
        "id": number,
        "day": string,
        "distance": number,
        "jogging-interval-time": number,
        "walking-intervals-time": number,
        "number-of-intervals": number,
        "instructions": string[]
      ]
    }
  ]
}

Generate a couch to 5K plan for a ${ability} runner to complete within ${weeks} weeks. Include a maximum of ${frequency} days each week.
`;
}
